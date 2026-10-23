import type { ClassPotentialPoint, LessonActivityPoint, RevenuePoint } from "@/features/analytics/types";
import { CLASSES, type DemoClass, type DemoStudent, hoursOf, septemberLessons } from "../../shared/demo/demo-school";
import { classesList } from "../../shared/demo/september-data";
import { absenceOn as novAbsence, novemberLessons, OPEN_LESSON_ID, TODAY_10 } from "../attendance-grid/data";

// tutorial 11: the demo school's money on Thu 12/11 afternoon, right after tutorial 10 closed IELTS Teens' 11/11.
// a tutor's side income, every month up to October collected within the month: Tết dips, summer peaks, school starting slows it
export { TODAY_10 as TODAY_11 };
// Speaking 1-1 is paid as it goes
const AS_IT_GOES = "Đỗ Khánh Linh";
// January to October, collected
const PAST = [12_000_000, 10_800_000, 13_200_000, 14_500_000, 16_300_000, 18_600_000, 19_200_000, 17_300_000, 15_600_000, 17_100_000];
const PAST_TOTAL = PAST.reduce((t, v) => t + v, 0);
// prices never show in this episode; scaled so a full month stays under 20 million like the past ones
const SCALE = 0.75;
const priceOf = (s: DemoStudent) => Math.round((s.price * SCALE) / 1000) * 1000;

const feeOf = (c: DemoClass, s: DemoStudent) => (c.billing === "PER_HOUR" ? priceOf(s) * hoursOf(c) : priceOf(s));
const weekday = (date: string) => (new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7;
const lessonCount = (c: DemoClass, month: number) => {
  const days = new Date(Date.UTC(2026, month, 0)).getUTCDate();
  const mm = String(month).padStart(2, "0");
  return Array.from({ length: days }, (_, i) => `2026-${mm}-${String(i + 1).padStart(2, "0")}`).filter((d) => c.days.includes(weekday(d))).length;
};
const octoberCount = (c: DemoClass) => lessonCount(c, 10);
const earlyCount = (c: DemoClass) => Array.from({ length: 8 }, (_, i) => lessonCount(c, i + 1)).reduce((t, n) => t + n, 0);
// this morning's Speaking 1-1 was taught but not closed yet: the dashboard's one unfinished lesson
export const UNCHECKED_CLASS = CLASSES.find((c) => c.billing === "PER_HOUR")!;
const UNCHECKED_ID = `${UNCHECKED_CLASS.id}-2026-11-12`;
const taught = (l: { id: string; endTime: string }) =>
  l.id === OPEN_LESSON_ID || (l.id !== UNCHECKED_ID && new Date(l.endTime).getTime() < TODAY_10);

type Money = { oct: number; novPaid: number; novPending: number; forecast: number };

const moneyOf = (c: DemoClass): Money => {
  const m: Money = { oct: 0, novPaid: 0, novPending: 0, forecast: 0 };
  for (const s of c.students) {
    if (c.billing === "PER_COURSE") {
      m.oct += priceOf(s);
      m.novPaid += priceOf(s);
      continue;
    }
    const fee = feeOf(c, s);
    m.oct += octoberCount(c) * fee;
    for (const l of novemberLessons(c)) {
      if (!taught(l)) m.forecast += fee;
      else if (novAbsence(s.name, l.date)?.status === "EXCUSED") continue;
      else if (s.name === AS_IT_GOES) m.novPaid += fee;
      else m.novPending += fee;
    }
  }
  return m;
};

const point = (c: DemoClass) => ({ classId: c.id, className: c.name, classColor: c.color, classDeleted: false });

// January to October, shared out by each class's size of a month
const OCT_TOTAL = CLASSES.reduce((t, c) => t + moneyOf(c).oct, 0);
const pastOf = (c: DemoClass) => Math.round((PAST_TOTAL * moneyOf(c).oct) / OCT_TOTAL / 1000) * 1000;

// November alone (lessons dated in November) or every month so far
const potential = (all: boolean): ClassPotentialPoint[] =>
  CLASSES.map((c) => {
    const m = moneyOf(c);
    const collected = (all ? pastOf(c) : 0) + m.novPaid;
    const forecast = c.billing === "PER_COURSE" ? 0 : m.forecast;
    return { ...point(c), billingMode: c.billing, collected, pending: m.novPending, forecast, potential: collected + m.novPending + forecast };
  }).sort((a, b) => b.potential - a.potential);

const activity = (all: boolean): LessonActivityPoint[] =>
  CLASSES.map((c) => {
    const nov = novemberLessons(c);
    const done = nov.filter(taught).length;
    const sept = septemberLessons(c);
    const septDone = sept.filter((l) => !l.cancelled).length;
    const completedCount = done + (all ? earlyCount(c) + septDone + octoberCount(c) : 0);
    const cancelledCount = all ? sept.length - septDone : 0;
    const scheduledCount = nov.length - done;
    return {
      ...point(c),
      completedCount,
      scheduledCount,
      cancelledCount,
      totalCount: completedCount + scheduledCount + cancelledCount,
      completedHours: completedCount * hoursOf(c),
      scheduledHours: scheduledCount * hoursOf(c),
    };
  });

// collected by the month it was paid in, across 2026
export const revenueByMonth = (): RevenuePoint[] => {
  const ms = CLASSES.map(moneyOf);
  const sum = (f: (m: Money) => number) => ms.reduce((t, m) => t + f(m), 0);
  const past = CLASSES.reduce((t, c) => t + pastOf(c), 0);
  // the rounding of each class's share lands on October, so the bars add up to the "Tất cả" total
  const months = [...PAST.slice(0, 9), PAST[9] + past - PAST_TOTAL, sum((m) => m.novPaid), 0];
  return months.map((collected, i) => ({ bucket: `2026-${String(i + 1).padStart(2, "0")}`, collected }));
};

// the dashboard's cards on the same afternoon: this month's money as the analytics page counts it
const owes = (c: DemoClass, s: DemoStudent) =>
  c.billing !== "PER_COURSE" &&
  s.name !== AS_IT_GOES &&
  novemberLessons(c).some((l) => taught(l) && novAbsence(s.name, l.date)?.status !== "EXCUSED");
const lessonCard = (c: DemoClass, l: ReturnType<typeof novemberLessons>[number]) => ({
  id: l.id,
  classId: c.id,
  date: l.date,
  startTime: new Date(l.startTime),
  endTime: new Date(l.endTime),
  meetLink: null,
  status: taught(l) ? "COMPLETED" : "SCHEDULED",
  isOnline: c.online,
  attendances: taught(l) ? c.students.map(() => ({ status: "PRESENT" })) : [],
  class: { name: c.name, color: c.color, enrollments: c.students.map(() => ({ joinedAt: new Date("2026-08-28T00:00:00+07:00") })) },
});
const lessonsOn = (from: string, to: string) =>
  CLASSES.flatMap((c) => novemberLessons(c).filter((l) => l.date >= from && l.date <= to).map((l) => lessonCard(c, l))).sort(
    (x, y) => x.startTime.getTime() - y.startTime.getTime(),
  );
// IELTS Foundation's November course has its last two lessons left
export const LOW_CLASS = CLASSES.find((c) => c.billing === "PER_COURSE")!;

const dashboardOverview = () => {
  const nov = activity(false);
  const ms = CLASSES.map(moneyOf);
  return {
    stats: {
      totalStudents: CLASSES.reduce((t, c) => t + c.students.length, 0),
      totalClasses: CLASSES.length,
      monthlyScheduledCount: nov.reduce((t, p) => t + p.scheduledCount, 0),
      monthlyCompletedCount: nov.reduce((t, p) => t + p.completedCount, 0),
      monthlyCancelledCount: 0,
    },
    revenue: { monthlyRevenue: ms.reduce((t, m) => t + m.novPaid, 0) },
    pendingFees: {
      pendingFeeTotal: ms.reduce((t, m) => t + m.novPending, 0),
      unpaidStudentsCount: CLASSES.flatMap((c) => c.students.filter((s) => owes(c, s))).length,
    },
  };
};

const ok = (data: unknown) => ({ success: true, data });
const allMonths = (url: string) => !new URL(url, "http://x").searchParams.has("month");

export const REVENUE_API = {
  "/api/analytics/revenue/potential-by-class": (url: string) => ok(potential(allMonths(url))),
  "/api/analytics/lesson-activity": (url: string) => ok(activity(allMonths(url))),
  "/api/analytics/revenue/by-month": () => ok(revenueByMonth()),
  "/api/classes?": () => ok(classesList()),
  "/api/dashboard/overview": () => ok(dashboardOverview()),
  "/api/dashboard/sessions": () => ok({ todaySessions: lessonsOn("2026-11-12", "2026-11-12"), upcomingSessions: lessonsOn("2026-11-13", "2026-11-19") }),
  "/api/dashboard/alerts": () => ({
    success: true,
    data: lessonsOn("2026-11-12", "2026-11-12").filter((l) => l.id === UNCHECKED_ID),
    pagination: { page: 1, limit: 5, total: 1, totalPages: 1 },
  }),
  "/api/dashboard/low-remaining-lessons": () =>
    ok([{ class: { id: LOW_CLASS.id, name: LOW_CLASS.name, color: LOW_CLASS.color }, remainingCount: 2 }]),
  "/api/profile": () =>
    ok({ id: "demo-user", name: "Nguyễn Thu Hương", email: "huong@sogiasu.com", image: null, loginMethods: ["google"], createdAt: "2026-08-28T02:00:00.000Z" }),
};

// the class the potential beat points at: the most still owed this month
export const MOST_OWED = potential(false).reduce((a, b) => (b.pending > a.pending ? b : a));
