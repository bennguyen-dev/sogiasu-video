import { AttendanceStatus, BillingMode, EnrollmentStatus, FeeKind, LessonStatus, type Lesson } from "@prisma/client";
import type { RosterResult } from "@/features/attendance/types";
import type { ClassWithCounts } from "@/features/class/types";
import type { EnrollmentDetail, EnrollmentListItem } from "@/features/enrollment/types";
import type { PaidFeeRow, StudentFeeSummary, StudentHourFee } from "@/features/fee/types";
import type { VoucherOptionsInput } from "@/features/payment/types";
import { buildTransferReference, ddmm } from "@/features/payment/lib/transfer-ref";
import { CREATED_API } from "../create-class/data";
import { BANK, buildVoucher, PRO } from "../fees/data";

// tutorial 7: the same Thu 12/11 as tutorial 6, on the demo school's hourly class (intro data)
export const TODAY_7 = new Date("2026-11-12T15:30:00+07:00").getTime();
export const CLASS_NAME_7 = "IELTS Speaking 1-1";
const CLASS_COLOR_7 = "#00897b";
export const CLASS_ID_7 = "speaking";
export const STUDENT_7 = "Đỗ Khánh Linh";
const STUDENT_ID_7 = "student-khanh-linh";
export const OLD_RATE = 250_000;
export const NEW_RATE = 300_000;
export const RAISE_FROM_7 = "2026-11-01";
export const LESSON_ID_7 = "lesson-speaking-1211";
export const TODAY_DATE = "2026-11-12";

type Slot = [date: string, start: string, end: string];
// lessons are as long as the two sides agree each time: 1 to 2 hours
const OCTOBER: Slot[] = [
  ["2026-10-01", "10:00", "11:30"],
  ["2026-10-05", "10:00", "11:00"],
  ["2026-10-08", "09:30", "11:30"],
  ["2026-10-12", "10:00", "11:30"],
  ["2026-10-15", "10:00", "11:00"],
  ["2026-10-19", "10:00", "11:30"],
  ["2026-10-22", "09:30", "11:30"],
  ["2026-10-26", "10:00", "11:00"],
  ["2026-10-29", "10:00", "11:30"],
];
export const NOVEMBER_7: Slot[] = [
  ["2026-11-02", "10:00", "11:00"],
  ["2026-11-09", "10:00", "11:30"],
  [TODAY_DATE, "09:00", "11:00"],
];

const at = (date: string, time: string) => new Date(`${date}T${time}:00+07:00`).toISOString();
const hoursOf = ([date, start, end]: Slot) => (Date.parse(at(date, end)) - Date.parse(at(date, start))) / 3_600_000;

const hourFee = (slot: Slot, rate: number): StudentHourFee => ({
  id: `fee-kl-${slot[0]}`,
  date: slot[0],
  startTime: at(slot[0], slot[1]),
  endTime: at(slot[0], slot[2]),
  className: CLASS_NAME_7,
  classColor: CLASS_COLOR_7,
  classDeleted: false,
  amount: Math.round(rate * hoursOf(slot)),
  discountPercent: null,
  discountAmount: 0,
  hours: hoursOf(slot),
  rate,
  overrideReason: null,
});

export const novemberFees = (raised: boolean, todayDone: boolean) =>
  NOVEMBER_7.filter(([date]) => todayDone || date !== TODAY_DATE).map((s) => hourFee(s, raised ? NEW_RATE : OLD_RATE));

const pendingResponse = (raised: boolean, todayDone: boolean) => {
  const hourFees = novemberFees(raised, todayDone);
  const data: StudentFeeSummary[] = [
    {
      studentId: STUDENT_ID_7,
      fullName: STUDENT_7,
      isDeleted: false,
      sessions: [],
      hourFees,
      courseFees: [],
      otherFees: [],
      pendingAmount: hourFees.reduce((sum, f) => sum + f.amount, 0),
    },
  ];
  return {
    success: true,
    data,
    pagination: { page: 1, limit: 15, total: 1, totalPages: 1 },
    summary: { totalAmount: data[0].pendingAmount, studentCount: 1 },
  };
};

const paidRows = (): PaidFeeRow[] =>
  OCTOBER.map((slot) => ({
    id: `fee-kl-${slot[0]}`,
    kind: FeeKind.SESSION,
    paidAt: "2026-10-31T13:05:00.000Z",
    amount: Math.round(OLD_RATE * hoursOf(slot)),
    studentId: STUDENT_ID_7,
    studentName: STUDENT_7,
    studentDeleted: false,
    classId: CLASS_ID_7,
    className: CLASS_NAME_7,
    classColor: CLASS_COLOR_7,
    classDeleted: false,
    label: null,
    lessonDate: slot[0],
    lessonStart: at(slot[0], slot[1]),
    lessonEnd: at(slot[0], slot[2]),
  }));

const day = (date: string) => new Date(`${date}T00:00:00.000Z`).toISOString();
const rate = (id: string, price: number, from: string | null, to: string | null) =>
  ({ id, price, discountPercent: null, effectiveFrom: from && day(from), effectiveTo: to && day(to) }) as unknown as EnrollmentDetail["priceHistory"][number];

export const klHistory = (raised: boolean) =>
  raised ? [rate("ph-kl-2", NEW_RATE, RAISE_FROM_7, null), rate("ph-kl-1", OLD_RATE, null, "2026-10-31")] : [rate("ph-kl-1", OLD_RATE, null, null)];

const klass = {
  id: CLASS_ID_7,
  userId: "demo-user",
  name: CLASS_NAME_7,
  description: null,
  color: CLASS_COLOR_7,
  onlineLink: null,
  billingMode: BillingMode.PER_HOUR,
  deletedAt: null,
  createdAt: new Date("2026-09-01T00:00:00.000Z"),
  updatedAt: new Date("2026-09-01T00:00:00.000Z"),
  _count: { lessons: 21, enrollments: 1 },
} as unknown as ClassWithCounts;

const enrollment = (raised: boolean): EnrollmentListItem =>
  ({
    id: "enrollment-kl",
    classId: CLASS_ID_7,
    studentId: STUDENT_ID_7,
    status: EnrollmentStatus.ACTIVE,
    joinedAt: new Date("2026-09-01T00:00:00+07:00"),
    pausedAt: null,
    student: { id: STUDENT_ID_7, fullName: STUDENT_7, deletedAt: null },
    priceHistory: klHistory(raised),
    studentFees: [],
  }) as unknown as EnrollmentListItem;

// this morning's lesson: 2 hours, taught, waiting for "Đã dạy xong"
export const todayLesson = (done: boolean) =>
  ({
    id: LESSON_ID_7,
    classId: CLASS_ID_7,
    userId: "demo-user",
    date: TODAY_DATE,
    startTime: new Date(at(TODAY_DATE, "09:00")),
    endTime: new Date(at(TODAY_DATE, "11:00")),
    isOnline: true,
    location: null,
    meetLink: null,
    linkSource: "NONE",
    googleCalendarEventId: null,
    status: done ? LessonStatus.COMPLETED : LessonStatus.SCHEDULED,
    content: "Luyện đề Speaking Part 2 và Part 3: chủ đề Travel, Technology",
    generalNote: null,
    nextPlan: null,
    homework: "Ghi âm 2 bài Part 2, mỗi bài 2 phút",
    createdAt: new Date("2026-11-01T08:00:00.000Z"),
    updatedAt: new Date("2026-11-01T08:00:00.000Z"),
  }) as Lesson;

// once taught, Khánh Linh has her PRESENT row
const roster = (done: boolean): RosterResult => ({
  roster: [
    {
      id: done ? "attendance-kl-1211" : null,
      studentId: STUDENT_ID_7,
      student: { fullName: STUDENT_7, isShared: true, deletedAt: null },
      status: done ? AttendanceStatus.PRESENT : null,
      reason: null,
      studentNote: null,
      homeworkPercent: null,
      score: null,
      studentFee: null,
      departed: false,
    },
  ],
  excludedByJoinDateCount: 0,
});

export const ISSUE_7 = TODAY_DATE;
const TRANSFER_7 = buildTransferReference([STUDENT_7], ddmm(ISSUE_7));
export const VOUCHER_OPTIONS_7: VoucherOptionsInput = {
  templateId: "autumn",
  useQr: true,
  transferRef: TRANSFER_7,
  hideSessionDetails: false,
  showComments: false,
  comment: "",
  includeReport: false,
  reportFrom: "2026-11-01",
  reportTo: ISSUE_7,
};
export const voucher7 = (o: Pick<VoucherOptionsInput, "hideSessionDetails" | "showComments" | "comment">) =>
  buildVoucher({ name: STUDENT_7, sessions: [], hourFees: novemberFees(true, true), courseFees: [], otherFees: [] }, ISSUE_7, TRANSFER_7, o);
export const STUDENT_REF_7 = { id: STUDENT_ID_7, name: STUDENT_7 };

const ok = (data: unknown) => ({ success: true, data });
const page = (data: unknown[]) => ({ success: true, data, pagination: { page: 1, limit: 15, total: data.length, totalPages: 1 } });
const monthOf = (url: string) => {
  const from = new URL(url, "https://sogiasu.com").searchParams.get("from");
  return from ? new Date(Date.parse(from) + 86_400_000).toISOString().slice(0, 7) : "";
};

export type HourState = { raised: boolean; todayDone: boolean };

export const HOUR_FEE_API = (state: () => HourState) => ({
  ...CREATED_API,
  "/api/billing/overview": () => ok(PRO),
  "/api/bank-account": () => ok(BANK),
  [`/api/classes/${CLASS_ID_7}/enrollments`]: () => page([enrollment(state().raised)]),
  [`/api/classes/${CLASS_ID_7}`]: () => ok(klass),
  [`/api/lessons/${LESSON_ID_7}/attendance`]: () => ok(roster(state().todayDone)),
  [`/api/lessons/${LESSON_ID_7}/previous-notes`]: () => ok(null),
  [`/api/lessons/${LESSON_ID_7}`]: () => ok(todayLesson(state().todayDone)),
  "/api/fees/pending": () => pendingResponse(state().raised, state().todayDone),
  "/api/fees/history": (url: string) =>
    monthOf(url) === "2026-10"
      ? ok({ data: paidRows(), totalAmount: paidRows().reduce((sum, r) => sum + r.amount, 0) })
      : ok({ data: [], totalAmount: 0 }),
});
