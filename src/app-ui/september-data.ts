import type { MonthlyAttendanceGrid } from "@/features/attendance/types";
import type { PendingFeesSummary, StudentFeeSummary } from "@/features/fee/types";
import type { ClassPotentialPoint, LessonActivityPoint } from "@/features/analytics/types";
import { absenceOn, CLASSES, hoursOf, septemberLessons } from "./demo-school";

// the evening of 30/09: every September session fee is still PENDING (the seed collects them in October)
export const SEPT_END = new Date("2026-09-30T20:00:00+07:00").getTime();

export const septemberGrid = (): MonthlyAttendanceGrid => ({
  month: "2026-09",
  classes: CLASSES.map((c) => {
    const lessons = septemberLessons(c);
    return {
      class: { id: c.id, name: c.name, color: c.color, deletedAt: null, createdAt: new Date("2026-08-28T00:00:00+07:00") },
      lessons: lessons.map((l) => ({
        id: l.id,
        date: l.date,
        startTime: new Date(l.startTime),
        endTime: new Date(l.endTime),
        status: l.cancelled ? "CANCELLED" : "COMPLETED",
        noStudents: false,
      })),
      rows: c.students.map((s) => ({
        student: { id: s.id, fullName: s.name, deletedAt: null },
        attendances: lessons
          .filter((l) => !l.cancelled)
          .map((l) => {
            const a = absenceOn(s.name, l.date);
            const status = a?.status ?? "PRESENT";
            const charged = status !== "EXCUSED" && c.billing !== "PER_COURSE";
            return { lessonId: l.id, status, reason: a?.reason ?? null, studentFee: charged ? { status: "PENDING" as const } : null };
          }),
      })),
    };
  }),
});

const studentFees = (): StudentFeeSummary[] => {
  const byStudent = new Map<string, StudentFeeSummary>();
  for (const c of CLASSES) {
    for (const s of c.students) {
      const row: StudentFeeSummary = byStudent.get(s.id) ?? {
        studentId: s.id,
        fullName: s.name,
        isDeleted: false,
        sessions: [],
        hourFees: [],
        courseFees: [],
        otherFees: [],
        pendingAmount: 0,
      };
      const common = { className: c.name, classColor: c.color, classDeleted: false, overrideReason: null };
      if (c.billing === "PER_COURSE") {
        row.courseFees.push({ id: `${c.id}-course-09`, className: c.name, classColor: c.color, classDeleted: false, amount: s.price, periodStart: "2026-09-01", periodEnd: "2026-09-30", label: "Học phí tháng 9" });
        row.otherFees.push({ id: `${c.id}-book`, className: c.name, classColor: c.color, classDeleted: false, amount: 180_000, label: "Sách" });
      }
      for (const l of septemberLessons(c)) {
        if (l.cancelled || absenceOn(s.name, l.date)?.status === "EXCUSED" || c.billing === "PER_COURSE") continue;
        const base = { id: `${l.id}-${s.id}`, date: l.date, startTime: l.startTime, endTime: l.endTime, ...common };
        if (c.billing === "PER_HOUR") {
          const hours = hoursOf(c);
          row.hourFees.push({ ...base, amount: s.price * hours, hours, rate: s.price });
        } else row.sessions.push({ ...base, amount: s.price });
      }
      row.pendingAmount = [...row.sessions, ...row.hourFees, ...row.courseFees, ...row.otherFees].reduce((sum, f) => sum + f.amount, 0);
      byStudent.set(s.id, row);
    }
  }
  return [...byStudent.values()].sort((a, b) => a.fullName.localeCompare(b.fullName, "vi"));
};

export const pendingFeesResponse = () => {
  const data = studentFees();
  const summary: PendingFeesSummary = { totalAmount: data.reduce((sum, s) => sum + s.pendingAmount, 0), studentCount: data.length };
  return { success: true, data: data.slice(0, 15), pagination: { page: 1, limit: 15, total: data.length, totalPages: Math.ceil(data.length / 15) }, summary };
};

export const classesList = () =>
  CLASSES.map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
    billingMode: c.billing,
    deletedAt: null,
    onlineLink: null,
    _count: { enrollments: c.students.length, lessons: septemberLessons(c).length },
  }));

export const giaHanFees = () => studentFees().find((s) => s.fullName === "Gia Hân")!;

// paid on 02/10 per the seed — the state the analytics scene grows into
const PAID_BY_0210 = new Set(["Mít", "Cún", "Bơ", "Minh Quân", "Nguyễn Hoàng Anh", "Trần Quỳnh Chi", "Vũ Tuấn Kiệt"]);

const classTotals = () =>
  CLASSES.map((c) => {
    const fees = studentFees();
    const ofClass = (s: StudentFeeSummary) =>
      [...s.sessions, ...s.hourFees, ...s.courseFees, ...s.otherFees].filter((f) => f.className === c.name).reduce((sum, f) => sum + f.amount, 0);
    const total = fees.reduce((sum, s) => sum + ofClass(s), 0);
    const paid = fees.filter((s) => PAID_BY_0210.has(s.fullName)).reduce((sum, s) => sum + ofClass(s), 0);
    return { c, total, paid };
  });

export const septemberClassIds = () => CLASSES.map((c) => c.id).sort().join(",");

// progress 0 → 1 replays the collections of early October onto the September chart
export const potentialByClass = (progress: number): ClassPotentialPoint[] =>
  classTotals()
    .map(({ c, total, paid }) => {
      const collected = Math.round((paid * progress) / 1000) * 1000;
      return {
        classId: c.id,
        className: c.name,
        classColor: c.color,
        classDeleted: false,
        billingMode: c.billing,
        collected,
        pending: total - collected,
        forecast: 0,
        potential: total,
      };
    })
    .sort((a, b) => b.potential - a.potential);

export const lessonActivity = (): LessonActivityPoint[] =>
  CLASSES.map((c) => {
    const lessons = septemberLessons(c);
    const completed = lessons.filter((l) => !l.cancelled).length;
    return {
      classId: c.id,
      className: c.name,
      classColor: c.color,
      classDeleted: false,
      completedCount: completed,
      scheduledCount: 0,
      cancelledCount: lessons.length - completed,
      totalCount: lessons.length,
      completedHours: completed * hoursOf(c),
      scheduledHours: 0,
    };
  });
