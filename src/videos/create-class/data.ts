import { BillingMode } from "@prisma/client";
import type { CalendarLesson } from "@/features/calendar/types";
import type { CreateClassInput } from "@/features/class/types";
import type { ClassStudentsValues, EnrollmentDraft } from "@/features/student/validations/class-students-schema";
import type { BulkScheduleValues } from "@/features/lesson/validations/bulk-schedule-schema";
import { buildDefaultBulkSchedule } from "@/features/lesson/lib/bulk-schedule";
import { DEFAULT_COLOR_HEX } from "@/features/google-calendar/lib/gcal-colors";

// a brand-new tutor (the demo account's name, nothing else) creating their first class on Mon 05/10
export const TODAY = "2026-10-05";
export const CLASS_NAME = "Toán 9 - Ôn thi vào 10";
export const CLASS_COLOR = "#33b679";
export const STUDENTS = [
  { name: "Minh Anh", price: 180_000 },
  { name: "Gia Hân", price: 150_000 },
] as const;
// Tue + Thu at the time the app pre-fills for a tapped weekday
export const TUE = 2;
export const THU = 4;
const START = "18:00";
const END = "19:30";

export const classValues = (name: string, color: string): CreateClassInput => ({
  name,
  description: null,
  color,
  onlineLink: null,
  billingMode: BillingMode.PER_SESSION,
});

export const DEFAULT_CLASS = classValues("", DEFAULT_COLOR_HEX);

export const draft = (fullName: string, price: number | null, joinedAt = TODAY): EnrollmentDraft => ({
  studentId: null,
  newStudent: { fullName, email: null, parentName: null, parentPhone: null },
  price,
  courseAmount: null,
  periodStart: null,
  periodEnd: null,
  courseLabel: null,
  joinedAt,
});

export const studentsValues = (enrollments: EnrollmentDraft[]): ClassStudentsValues => ({
  enrollments,
  termPeriodStart: null,
  termPeriodEnd: null,
  termLabel: null,
  otherFees: [],
});

// `days` weekday taps in order (a weekday tapped twice gets a second slot); `from` overrides the start date
export const scheduleValues = (days: number[], from?: string): BulkScheduleValues => {
  const base = buildDefaultBulkSchedule();
  return {
    ...base,
    startDate: from ?? base.startDate,
    schedules: days.map((dayOfWeek) => ({ dayOfWeek, startTime: START, endTime: END })),
  };
};

// a tutor who started the class on the 1st: the custom range backfills from there to the 4-week preset's end
export const MONTH_START = "2026-10-01";
export const LESSON_DATES = ["01", "06", "08", "13", "15", "20", "22", "27", "29"].map((d) => `2026-10-${d}`);

export const classLessons = (): CalendarLesson[] =>
  LESSON_DATES.map((date, i) => {
    const start = new Date(`${date}T${START}:00+07:00`);
    const end = new Date(`${date}T${END}:00+07:00`);
    return {
      id: `new-class-${i}`,
      date,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      status: "SCHEDULED",
      isOnline: false,
      location: null,
      meetLink: null,
      synced: true,
      studentCount: STUDENTS.length,
      presentCount: 0,
      absentCount: 0,
      excusedCount: 0,
      noStudents: false,
      className: CLASS_NAME,
      classColor: CLASS_COLOR,
      matchedStudentIds: [],
    };
  });

const PROFILE = { success: true, data: { name: "Nguyễn Thu Hương", email: "huong@sogiasu.com", image: null } };

// a new account: no classes, no students, nothing on the calendar until the wizard is done
export const NEW_ACCOUNT_API = {
  "/api/profile": () => PROFILE,
  "/api/billing/overview": () => ({ success: true, data: null }),
  "/api/classes?": () => ({ success: true, data: [], pagination: { page: 1, limit: 15, total: 0, totalPages: 0 } }),
};

export const CREATED_API = {
  "/api/profile": () => PROFILE,
  "/api/billing/overview": () => ({ success: true, data: null }),
  "/api/calendar?": () => ({ success: true, data: classLessons() }),
};
