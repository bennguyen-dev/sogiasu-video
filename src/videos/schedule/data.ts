import { addDays, format, parseISO } from "date-fns";
import { BillingMode, LessonStatus, type Lesson } from "@prisma/client";
import type { CalendarLesson } from "@/features/calendar/types";
import type { RosterResult } from "@/features/attendance/types";
import { CLASSES, type DemoClass } from "../../shared/demo/calendar-data";
import { CLASS_COLOR, CLASS_NAME, CREATED_API, STUDENTS } from "../create-class/data";

// tutorial 5: Thursday 05/11 afternoon, the IELTS class plus the demo school's other classes
export const NOW_5 = new Date("2026-11-05T15:40:00+07:00").getTime();
export const TODAY = "2026-11-05";
export const WEEK_START = "2026-11-02";
export const THREE_DAY_START = "2026-11-04";
export const MAKEUP_DATE = "2026-11-07";

const IELTS: DemoClass = { name: CLASS_NAME, color: CLASS_COLOR, students: STUDENTS.length, online: false, start: "18:00", end: "19:30", days: [1, 3] };
// Cún's lesson runs 2 hours here: a card only shows its address past 90 minutes, and this one is on screen
const ALL: DemoClass[] = [...CLASSES.map((c) => (c.name.startsWith("Cún") ? { ...c, end: "19:30" } : c)), IELTS];
export const IELTS_ID = `class-${ALL.length - 1}`;
export const GIA_HAN_ID = `class-${ALL.findIndex((c) => c.name.startsWith("Gia Hân"))}`;
export const classId = (c: DemoClass) => `class-${ALL.indexOf(c)}`;

const lessonId = (ci: number, date: string) => `lesson-${ci}-${date}`;
export const IELTS_THU = lessonId(ALL.length - 1, "2026-11-05");
export const MAKEUP_ID = "lesson-makeup-0711";

// the status each lesson shows, so the three days on screen (04-06/11) carry every kind of card
const named = (name: string) => ALL.findIndex((c) => c.name.startsWith(name));
const OVERDUE = lessonId(named("Mít"), "2026-11-04");
const CANCELLED_ALREADY = lessonId(named("IELTS Speaking"), "2026-11-05");
const NO_STUDENTS = lessonId(named("Giao tiếp công sở"), "2026-11-06");

// a week-day index (0 = Monday) of every week from late October to early December
const weeks = ["2026-10-26", "2026-11-02", "2026-11-09", "2026-11-16", "2026-11-23", "2026-11-30"];

export type ScheduleState = { ieltsThuCancelled: boolean; makeup: boolean };

const lesson = (c: DemoClass, ci: number, date: string, s: ScheduleState): CalendarLesson => {
  const start = new Date(`${date}T${c.start}:00+07:00`);
  const end = new Date(`${date}T${c.end}:00+07:00`);
  const id = lessonId(ci, date);
  const past = end.getTime() < NOW_5;
  const cancelled = id === CANCELLED_ALREADY || (id === IELTS_THU && s.ieltsThuCancelled);
  const status: LessonStatus = cancelled ? "CANCELLED" : past && id !== OVERDUE ? "COMPLETED" : "SCHEDULED";
  const noStudents = id === NO_STUDENTS;
  return {
    id,
    date,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    status,
    isOnline: c.online,
    location: c.location ?? null,
    meetLink: c.online ? "https://meet.google.com/abc-defg-hij" : null,
    synced: c.online,
    studentCount: noStudents ? 0 : c.students,
    presentCount: status === "COMPLETED" ? c.students : 0,
    absentCount: 0,
    excusedCount: 0,
    noStudents,
    className: c.name,
    classColor: c.color,
    matchedStudentIds: [],
  };
};

const makeup = (): CalendarLesson => ({
  ...lesson(IELTS, ALL.length - 1, MAKEUP_DATE, { ieltsThuCancelled: false, makeup: false }),
  id: MAKEUP_ID,
});

export const lessonsAt = (s: ScheduleState): CalendarLesson[] => [
  ...ALL.flatMap((c, ci) => weeks.flatMap((w) => c.days.map((d) => lesson(c, ci, format(addDays(parseISO(w), d), "yyyy-MM-dd"), s)))),
  ...(s.makeup ? [makeup()] : []),
];

// what the calendar api answers for a range and a class filter, like the server does
export const calendarAnswer = (url: string, s: ScheduleState) => {
  const q = new URL(url, "https://x").searchParams;
  const start = q.get("start") ?? "0000";
  const end = q.get("end") ?? "9999";
  const classIds = (q.get("classIds") ?? "").split(",").filter(Boolean);
  return lessonsAt(s).filter((l) => l.date >= start && l.date < end && (classIds.length === 0 || classIds.includes(classOf(l))));
};

const classOf = (l: CalendarLesson) => `class-${ALL.findIndex((c) => c.name === l.className)}`;
export const filterLessons = (lessons: CalendarLesson[], classIds: string[]) => (classIds.length ? lessons.filter((l) => classIds.includes(classOf(l))) : lessons);

// the classes list the filter dialog and the create-lesson combobox read
const classesList = () =>
  ALL.map((c, ci) => ({
    id: `class-${ci}`,
    userId: "demo-user",
    name: c.name,
    description: null,
    color: c.color,
    onlineLink: null,
    billingMode: BillingMode.PER_SESSION,
    deletedAt: null,
    createdAt: new Date("2026-09-01T00:00:00.000Z"),
    updatedAt: new Date("2026-09-01T00:00:00.000Z"),
    _count: { lessons: 8, enrollments: c.students },
  }));

export const CLASS_LIST = classesList();

// the IELTS Thursday lesson as its detail dialog reads it
const ieltsThu = (s: ScheduleState) =>
  ({
    id: IELTS_THU,
    classId: IELTS_ID,
    userId: "demo-user",
    date: TODAY,
    startTime: new Date(`${TODAY}T18:00:00+07:00`),
    endTime: new Date(`${TODAY}T19:30:00+07:00`),
    isOnline: false,
    location: null,
    meetLink: null,
    linkSource: "NONE",
    googleCalendarEventId: null,
    status: s.ieltsThuCancelled ? LessonStatus.CANCELLED : LessonStatus.SCHEDULED,
    content: null,
    generalNote: null,
    nextPlan: null,
    homework: null,
    createdAt: new Date("2026-10-05T08:00:00.000Z"),
    updatedAt: new Date("2026-10-05T08:00:00.000Z"),
  }) as Lesson;

const roster = (): RosterResult => ({
  roster: STUDENTS.map((st, i) => ({
    id: null,
    studentId: `student-${i}`,
    student: { fullName: st.name, isShared: true, deletedAt: null },
    status: null,
    reason: null,
    studentNote: null,
    homeworkPercent: null,
    score: null,
    studentFee: null,
    departed: false,
  })),
  excludedByJoinDateCount: 0,
});

const ok = (data: unknown) => ({ success: true, data });
const page = (data: unknown[]) => ({ success: true, data, pagination: { page: 1, limit: 100, total: data.length, totalPages: 1 } });

export const scheduleApi = (state: () => ScheduleState) => ({
  ...CREATED_API,
  "/api/calendar?": (url: string) => ok(calendarAnswer(url, state())),
  "/api/classes/class-": () => ok(classesList().find((c) => c.id === IELTS_ID)),
  "/api/classes?": () => page(classesList()),
  "/api/students?": () => page([]),
  [`/api/lessons/${IELTS_THU}/attendance`]: () => ok(roster()),
  [`/api/lessons/${IELTS_THU}/previous-notes`]: () => ok(null),
  [`/api/lessons/${IELTS_THU}`]: () => ok(ieltsThu(state())),
  "/api/lessons/conflicts": () => ok([]),
  "/api/storage?": () => ok([]),
});

