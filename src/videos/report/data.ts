import { AttendanceStatus, BillingMode, EnrollmentStatus, LessonStatus } from "@prisma/client";
import type { ClassWithCounts } from "@/features/class/types";
import type { EnrollmentListItem } from "@/features/enrollment/types";
import type { LessonReportExportData } from "@/features/report/components/LessonReportExport";
import type { StudentReport } from "@/features/report/types";
import type { Student } from "@/features/student/types";
import { CLASS_COLOR, CLASS_NAME, CREATED_API, LESSON_DATES, STUDENTS } from "../create-class/data";
import { attendanceFiles, CLASS_ID, CONTENT, HOMEWORK, lessonFiles, QUICK_NOTES, REASON, STUDENT_IDS } from "../attendance/data";
import { FINAL_STATE } from "../attendance/scenes/DetailScene";

// tutorial 3 picks up on Monday 05/10 evening: 01/10 is the only lesson taught, the rest of October is scheduled
const [MA, GH] = STUDENTS;
export const ORIGIN = "https://sogiasu.com";
export const SLUGS = { ma: "minh-anh", gh: "gia-han" } as const;
// a report link is private to its family, so the video never shows a real path
export const reportUrl = (key: "ma" | "gh") => `${ORIGIN}/report/${key === "ma" ? "••••••••" : "•••••••"}`;
export const PARENTS = { ma: "Mẹ Minh Anh", gh: "Mẹ Gia Hân" } as const;
const NOTE = `${QUICK_NOTES[0]} ${QUICK_NOTES[1]}`;

const at = (date: string, time: string) => new Date(`${date}T${time}:00+07:00`).toISOString();

const lessons = (): StudentReport["lessons"] =>
  LESSON_DATES.map((date, i) => ({
    lessonId: `new-class-${i}`,
    date,
    startTime: at(date, "18:00"),
    endTime: at(date, "19:30"),
    status: i === 0 ? LessonStatus.COMPLETED : LessonStatus.SCHEDULED,
    classColor: CLASS_COLOR,
    isOnline: false,
  }));

const files = (key: "ma" | "gh") => ({
  ...(key === "ma" ? { studentNote: attendanceFiles(FINAL_STATE) } : {}),
  homework: lessonFiles(FINAL_STATE),
});

const session = (key: "ma" | "gh"): StudentReport["sessions"][number] => ({
  lessonId: "new-class-0",
  date: LESSON_DATES[0],
  startTime: at(LESSON_DATES[0], "18:00"),
  endTime: at(LESSON_DATES[0], "19:30"),
  status: key === "ma" ? AttendanceStatus.PRESENT : AttendanceStatus.EXCUSED,
  reason: key === "ma" ? null : REASON,
  studentNote: key === "ma" ? NOTE : null,
  homeworkPercent: key === "ma" ? 80 : null,
  score: key === "ma" ? 6.5 : null,
  classColor: CLASS_COLOR,
  content: CONTENT,
  homework: HOMEWORK,
  generalNote: null,
  nextPlan: null,
  files: files(key),
});

export const report = (key: "ma" | "gh"): StudentReport => ({
  studentName: key === "ma" ? MA.name : GH.name,
  tutorName: "Nguyễn Thu Hương",
  month: "2026-10",
  prevMonth: "2026-09",
  nextMonth: "2026-11",
  isCurrentMonth: true,
  lessons: lessons(),
  sessions: [session(key)],
});

// the "Xuất ảnh" card for one student's lesson, as the attendance row hands it to LessonReportExport
export const exportData = (key: "ma" | "gh", date = LESSON_DATES[0]): LessonReportExportData => ({
  date,
  startTime: at(date, "18:00"),
  endTime: at(date, "19:30"),
  studentName: key === "ma" ? MA.name : GH.name,
  status: key === "ma" ? AttendanceStatus.PRESENT : AttendanceStatus.EXCUSED,
  reason: key === "ma" ? null : REASON,
  homeworkPercent: key === "ma" ? 80 : null,
  score: key === "ma" ? 6.5 : null,
  studentNote: key === "ma" ? NOTE : null,
  content: CONTENT,
  homework: HOMEWORK,
  generalNote: null,
  nextPlan: null,
});

const klass = {
  id: CLASS_ID,
  userId: "demo-user",
  name: CLASS_NAME,
  description: null,
  color: CLASS_COLOR,
  onlineLink: null,
  billingMode: BillingMode.PER_SESSION,
  deletedAt: null,
  createdAt: new Date("2026-10-05T08:00:00.000Z"),
  updatedAt: new Date("2026-10-05T08:00:00.000Z"),
  _count: { lessons: LESSON_DATES.length, enrollments: 2 },
} as unknown as ClassWithCounts;

const enrollment = (key: "ma" | "gh", price: number): EnrollmentListItem =>
  ({
    id: `enrollment-${SLUGS[key]}`,
    classId: CLASS_ID,
    studentId: STUDENT_IDS[key],
    status: EnrollmentStatus.ACTIVE,
    joinedAt: new Date("2026-10-01T00:00:00+07:00"),
    pausedAt: null,
    student: { id: STUDENT_IDS[key], fullName: key === "ma" ? MA.name : GH.name, deletedAt: null },
    priceHistory: [{ price, discountPercent: null, effectiveFrom: null, effectiveTo: null }],
    studentFees: [],
  }) as unknown as EnrollmentListItem;

export const student = (key: "ma" | "gh", isShared: boolean): Student =>
  ({
    id: STUDENT_IDS[key],
    userId: "demo-user",
    fullName: key === "ma" ? MA.name : GH.name,
    dateOfBirth: null,
    address: null,
    phone: null,
    email: null,
    parentName: PARENTS[key],
    parentPhone: null,
    parentEmail: null,
    publicSlug: SLUGS[key],
    isShared,
    deletedAt: null,
    createdAt: new Date("2026-10-05T08:00:00.000Z"),
    updatedAt: new Date("2026-10-05T08:00:00.000Z"),
  }) as unknown as Student;

const ok = (data: unknown) => ({ success: true, data });
const page = (data: unknown[]) => ({ success: true, data, pagination: { page: 1, limit: 15, total: data.length, totalPages: 1 } });

export const CLASS_API = {
  ...CREATED_API,
  "/api/classes/new-class/enrollments": () => page([enrollment("ma", MA.price), enrollment("gh", GH.price)]),
  "/api/classes/new-class": () => ok(klass),
};

// by the students page, the class message has already switched both links on
export const STUDENTS_API = {
  ...CREATED_API,
  "/api/students?": () => page([student("ma", true), student("gh", true)]),
};
