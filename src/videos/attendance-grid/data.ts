import { AttendanceStatus, LessonStatus, type Lesson } from "@prisma/client";
import type {
  MonthlyAttendanceGrid,
  RosterResult,
} from "@/features/attendance/types";
import { CLASSES, type DemoClass } from "../../shared/demo/demo-school";
import { classesList } from "../../shared/demo/september-data";

// tutorial 10: the demo school's November on Thu 12/11 afternoon, as tutorials 6-9.
// IELTS Teens' Wednesday 11/11 evening was taught but never closed
export const TODAY_10 = new Date("2026-11-12T15:30:00+07:00").getTime();
const NOW = new Date(TODAY_10);
export const OPEN_CLASS_ID = "demo-class-ielts-teens";
export const OPEN_DATE = "2026-11-11";
export const OPEN_LESSON_ID = `${OPEN_CLASS_ID}-${OPEN_DATE}`;
const OPEN_CLASS = CLASSES.find((c) => c.id === OPEN_CLASS_ID)!;
export const OPEN_CLASS_NAME = OPEN_CLASS.name;
export const MARKED = OPEN_CLASS.students[1];
export const MARKED_REASON = "Em báo bận việc gia đình";

type Absence = { status: "EXCUSED" | "ABSENT"; reason: string | null };
// November so far, by student → day
const ABSENCES: Record<string, Record<number, Absence>> = {
  "Gia Hân": {
    7: { status: "EXCUSED", reason: "Em có lịch thi thử ở trường" },
  },
  "Em Bảo": { 3: { status: "ABSENT", reason: "Gia đình quên lịch học" } },
  Cún: { 4: { status: "EXCUSED", reason: null } },
  Bơ: { 8: { status: "EXCUSED", reason: null } },
  "Nguyễn Hoàng Anh": { 9: { status: "ABSENT", reason: null } },
  "Minh Quân": { 6: { status: "EXCUSED", reason: "Em có lịch thi ở trường" } },
};
const absenceOn = (student: string, date: string) =>
  ABSENCES[student]?.[Number(date.slice(8))] ?? null;

const iso = (date: string, hhmm: string) =>
  new Date(`${date}T${hhmm}:00+07:00`).toISOString();
// 0 = Monday, as the demo school counts
const weekday = (date: string) =>
  (new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7;

type NovLesson = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
};
const novemberLessons = (c: DemoClass): NovLesson[] =>
  Array.from(
    { length: 30 },
    (_, i) => `2026-11-${String(i + 1).padStart(2, "0")}`,
  )
    .filter((date) => c.days.includes(weekday(date)))
    .map((date) => ({
      id: `${c.id}-${date}`,
      date,
      startTime: iso(date, c.start),
      endTime: iso(date, c.end),
    }));

// 0 as it stands · 1 Thảo Vy marked absent on 11/11 · 2 the lesson closed
export type Stage = 0 | 1 | 2;

const closed = (l: NovLesson, stage: Stage) =>
  l.id === OPEN_LESSON_ID ? stage >= 2 : new Date(l.endTime) < NOW;

export const novemberGrid = (stage: Stage): MonthlyAttendanceGrid => ({
  month: "2026-11",
  classes: CLASSES.map((c) => {
    const lessons = novemberLessons(c);
    return {
      class: {
        id: c.id,
        name: c.name,
        color: c.color,
        deletedAt: null,
        createdAt: new Date("2026-08-28T00:00:00+07:00"),
      },
      lessons: lessons.map((l) => ({
        id: l.id,
        date: l.date,
        startTime: new Date(l.startTime),
        endTime: new Date(l.endTime),
        status: closed(l, stage)
          ? LessonStatus.COMPLETED
          : LessonStatus.SCHEDULED,
        noStudents: false,
      })),
      rows: c.students.map((s) => ({
        student: { id: s.id, fullName: s.name, deletedAt: null },
        attendances: lessons.map((l) => {
          if (l.id === OPEN_LESSON_ID) {
            const marked = s.id === MARKED.id && stage >= 1;
            const status = marked
              ? AttendanceStatus.ABSENT
              : stage >= 2
                ? AttendanceStatus.PRESENT
                : null;
            return {
              lessonId: l.id,
              status,
              reason: marked ? MARKED_REASON : null,
              studentFee:
                stage >= 2 && c.billing !== "PER_COURSE"
                  ? { status: "PENDING" as const }
                  : null,
            };
          }
          if (!closed(l, stage))
            return {
              lessonId: l.id,
              status: null,
              reason: null,
              studentFee: null,
            };
          const a = absenceOn(s.name, l.date);
          const status = a?.status ?? AttendanceStatus.PRESENT;
          const charged = status !== "EXCUSED" && c.billing !== "PER_COURSE";
          return {
            lessonId: l.id,
            status,
            reason: a?.reason ?? null,
            studentFee: charged ? { status: "PENDING" as const } : null,
          };
        }),
      })),
    };
  }),
});

// IELTS Teens on Wed 11/11 evening, opened from the grid
const openLesson = (stage: Stage) =>
  ({
    id: OPEN_LESSON_ID,
    classId: OPEN_CLASS_ID,
    userId: "demo-user",
    date: OPEN_DATE,
    startTime: new Date(iso(OPEN_DATE, OPEN_CLASS.start)),
    endTime: new Date(iso(OPEN_DATE, OPEN_CLASS.end)),
    isOnline: true,
    location: null,
    meetLink: null,
    linkSource: "NONE",
    googleCalendarEventId: null,
    status: stage >= 2 ? LessonStatus.COMPLETED : LessonStatus.SCHEDULED,
    content: "Writing Task 2: dạng Opinion",
    generalNote: null,
    nextPlan: null,
    homework: "Viết 1 bài Task 2, 250 từ",
    createdAt: new Date("2026-11-01T08:00:00.000Z"),
    updatedAt: new Date("2026-11-01T08:00:00.000Z"),
  }) as Lesson;

const roster = (stage: Stage) =>
  ({
    roster: OPEN_CLASS.students.map((s) => {
      const marked = s.id === MARKED.id;
      return {
        id: marked || stage >= 2 ? `attendance-${s.id}-1111` : null,
        studentId: s.id,
        student: { fullName: s.name, isShared: true, deletedAt: null },
        status: marked
          ? AttendanceStatus.ABSENT
          : stage >= 2
            ? AttendanceStatus.PRESENT
            : null,
        reason: marked ? MARKED_REASON : null,
        studentNote: null,
        homeworkPercent: null,
        score: null,
        studentFee: null,
        departed: false,
      };
    }),
    excludedByJoinDateCount: 0,
  }) as unknown as RosterResult;

const openClass = {
  id: OPEN_CLASS_ID,
  userId: "demo-user",
  name: OPEN_CLASS.name,
  description: null,
  color: OPEN_CLASS.color,
  onlineLink: null,
  billingMode: OPEN_CLASS.billing,
  deletedAt: null,
  createdAt: new Date("2026-08-28T00:00:00.000Z"),
  updatedAt: new Date("2026-08-28T00:00:00.000Z"),
  _count: { lessons: 20, enrollments: OPEN_CLASS.students.length },
};

const ok = (data: unknown) => ({ success: true, data });

export const GRID_API = (stage: () => Stage) => ({
  "/api/attendance/monthly-grid": () => ok(novemberGrid(stage())),
  "/api/classes?": () => ok(classesList()),
  [`/api/classes/${OPEN_CLASS_ID}`]: () => ok(openClass),
  [`/api/lessons/${OPEN_LESSON_ID}/attendance`]: () => ok(roster(stage())),
  [`/api/lessons/${OPEN_LESSON_ID}/previous-notes`]: () => ok(null),
  [`/api/lessons/${OPEN_LESSON_ID}`]: () => ok(openLesson(stage())),
});
