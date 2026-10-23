import { staticFile } from "remotion";
import { AttendanceStatus, FeeKind, FeeStatus, LessonStatus, StorageProvider, type Lesson, type StudentFee } from "@prisma/client";
import type { CalendarLesson } from "@/features/calendar/types";
import type { ClassWithCounts } from "@/features/class/types";
import type { AttendanceStudentFormValues, RosterItem, RosterResult } from "@/features/attendance/types";
import type { StorageFileItem } from "@/features/storage/types";
import { attendanceKeys } from "@/features/attendance/hooks/attendance-keys";
import { classKeys } from "@/features/class/hooks/class-keys";
import { lessonKeys } from "@/features/lesson/hooks/lesson-keys";
import { storageKeys } from "@/features/storage/hooks/storage-keys";
import { CLASS_COLOR, CLASS_NAME, classLessons, CREATED_API, STUDENTS } from "../create-class/data";

// tutorial 2 picks up where tutorial 1 left off: same class, same Monday 05/10, its first lesson (Thu 01/10) still open
export const CLASS_ID = "new-class";
export const LESSON_ID = "new-class-0";
const [MA, GH] = STUDENTS;
export const STUDENT_IDS = { ma: "student-minh-anh", gh: "student-gia-han" } as const;
const ATTENDANCE_IDS = { ma: "attendance-minh-anh-0110", gh: "attendance-gia-han-0110" } as const;

export const CONTENT = "Writing Task 2 - Opinion essay";
export const HOMEWORK = "Viết 1 bài Task 2 (250 từ)";
export const REASON = "Em bị sốt, gia đình xin cho nghỉ buổi này";
export const QUICK_NOTES = ["Hiểu bài, nắm được nội dung.", "Cần luyện tập thêm ở nhà."] as const;
export const ESSAY_NAME = "bai-lam-minh-anh.jpg";
export const SAMPLE_NAME = "task2-sample-essay.pdf";

export type Row = AttendanceStudentFormValues;
export const UNMARKED: Row = { status: AttendanceStatus.PRESENT, reason: null, studentNote: null, homeworkPercent: null, score: null };

// everything the lesson-detail screen shows at one frame: what is saved, and what the two rows' forms hold
export type DetailState = {
  status: LessonStatus;
  content: string | null;
  homework: string | null;
  // saved rows; `marked` = the row exists (a status was saved), else it shows as PRESENT
  ma: Row & { marked: boolean };
  gh: Row & { marked: boolean };
  // the forms, which run ahead of the saved rows while the tutor is typing
  maForm: Row;
  ghForm: Row;
  essay: boolean;
  sample: boolean;
};

const START = "2026-10-01T18:00:00+07:00";
const END = "2026-10-01T19:30:00+07:00";

export const lessonAt = (s: DetailState): Lesson => ({
  id: LESSON_ID,
  classId: CLASS_ID,
  userId: "demo-user",
  date: "2026-10-01",
  startTime: new Date(START),
  endTime: new Date(END),
  isOnline: false,
  location: null,
  meetLink: null,
  linkSource: "NONE",
  googleCalendarEventId: null,
  status: s.status,
  content: s.content,
  generalNote: null,
  nextPlan: null,
  homework: s.homework,
  createdAt: new Date("2026-10-05T08:00:00.000Z"),
  updatedAt: new Date("2026-10-05T08:00:00.000Z"),
}) as Lesson;

const klass = {
  id: CLASS_ID,
  name: CLASS_NAME,
  color: CLASS_COLOR,
  _count: { lessons: 9, enrollments: 2 },
} as unknown as ClassWithCounts;

// completing a lesson charges each chargeable student their own price; EXCUSED is waived (no fee row)
const fee = (key: "ma" | "gh", amount: number): StudentFee =>
  ({
    id: `fee-${key}-0110`,
    kind: FeeKind.SESSION,
    userId: "demo-user",
    studentId: STUDENT_IDS[key],
    attendanceId: ATTENDANCE_IDS[key],
    enrollmentId: null,
    amount,
    periodStart: null,
    periodEnd: null,
    label: null,
    overrideReason: null,
    discountPercent: null,
    discountAmount: 0,
    status: FeeStatus.PENDING,
    paidAt: null,
    createdAt: new Date("2026-10-05T08:00:00.000Z"),
  }) as StudentFee;

const rosterItem = (key: "ma" | "gh", name: string, price: number, row: DetailState["ma"], completed: boolean): RosterItem => ({
  id: row.marked || completed ? ATTENDANCE_IDS[key] : null,
  studentId: STUDENT_IDS[key],
  student: { fullName: name, isShared: true, deletedAt: null },
  status: row.marked || completed ? row.status : null,
  reason: row.reason,
  studentNote: row.studentNote,
  homeworkPercent: row.homeworkPercent,
  score: row.score,
  studentFee: completed && row.status !== AttendanceStatus.EXCUSED ? fee(key, price) : null,
  departed: false,
});

export const rosterAt = (s: DetailState): RosterResult => {
  const done = s.status === LessonStatus.COMPLETED;
  return {
    roster: [rosterItem("ma", MA.name, MA.price, s.ma, done), rosterItem("gh", GH.name, GH.price, s.gh, done)],
    excludedByJoinDateCount: 0,
  };
};

const file = (name: string, mimeType: string, size: number, url: string, targetId: string, field: StorageFileItem["field"]): StorageFileItem => ({
  originalName: name,
  mimeType,
  size,
  createdAt: "2026-10-05T08:40:00.000Z",
  linkId: `link-${name}`,
  targetId,
  field,
  url,
  provider: StorageProvider.R2,
});

export const attendanceFiles = (s: DetailState) =>
  s.essay ? [file(ESSAY_NAME, "image/jpeg", 412_000, staticFile("demo/minh-anh-essay.jpg"), ATTENDANCE_IDS.ma, "studentNote")] : [];
export const lessonFiles = (s: DetailState) =>
  s.sample ? [file(SAMPLE_NAME, "application/pdf", 186_000, staticFile("demo/homework.pdf"), LESSON_ID, "homework")] : [];

const ok = (data: unknown) => ({ success: true, data });

// the detail screen's queries, keyed as the app keys them
export const detailCache = (s: DetailState): [readonly unknown[], unknown][] => {
  const roster = rosterAt(s);
  const ids = roster.roster.map((r) => r.id).filter((id): id is string => !!id).sort();
  return [
    [lessonKeys.detail(LESSON_ID), ok(lessonAt(s))],
    [classKeys.detail(CLASS_ID), ok(klass)],
    [attendanceKeys.list({ lessonId: LESSON_ID }), ok(roster)],
    [storageKeys.list({ targetType: "ATTENDANCE", ids }), ok(attendanceFiles(s))],
    [storageKeys.list({ targetType: "LESSON", ids: [LESSON_ID] }), ok(lessonFiles(s))],
  ];
};

// the month calendar: 01/10 is still open (overdue) until the lesson is completed
export const calendarAt = (completed: boolean): CalendarLesson[] =>
  classLessons().map((l, i) =>
    i === 0 && completed ? { ...l, status: "COMPLETED", presentCount: 1, excusedCount: 1 } : l,
  );

export const calendarApi = (completed: boolean) => ({
  ...CREATED_API,
  "/api/calendar?": () => ok(calendarAt(completed)),
});

export const DETAIL_API = {
  "/api/profile": CREATED_API["/api/profile"],
  "/api/billing/overview": CREATED_API["/api/billing/overview"],
};
