import {
  AttendanceStatus,
  BillingMode,
  EnrollmentStatus,
  FeeKind,
  FeeStatus,
  LessonStatus,
  type Lesson,
} from "@prisma/client";
import type { RosterResult } from "@/features/attendance/types";
import type { ClassWithCounts } from "@/features/class/types";
import type {
  EnrollmentCourseFee,
  EnrollmentDetail,
  EnrollmentListItem,
} from "@/features/enrollment/types";
import type {
  StudentFeeSummary,
  StudentOtherFee,
  StudentSessionFee,
} from "@/features/fee/types";
import type { VoucherOptionsInput } from "@/features/payment/types";
import {
  buildTransferReference,
  ddmm,
} from "@/features/payment/lib/transfer-ref";
import { CLASS_ID, STUDENT_IDS } from "../attendance/data";
import {
  CLASS_COLOR,
  CLASS_NAME,
  CREATED_API,
  LESSON_DATES,
  STUDENTS,
} from "../create-class/data";
import { BANK, buildVoucher, PRO } from "../fees/data";

// tutorial 9: the same Thu 12/11 as tutorial 6, after its raise. October is paid by both;
// Gia Hân's November gets a 10% discount, then 07/11 a hand-set price, then the class a textbook fee
export const TODAY_9 = new Date("2026-11-12T15:30:00+07:00").getTime();
export const TODAY_DATE = "2026-11-12";
const [MA, GH] = STUDENTS;
const MA_PRICE = 350_000;
export const GH_PRICE = GH.price;
export const DISCOUNT = 10;
export const DISCOUNT_FROM = "2026-11-01";
export const NOVEMBER = ["2026-11-03", "2026-11-07", "2026-11-10"];
export const OVERRIDE_DATE = "2026-11-07";
export const OVERRIDE_AMOUNT = 125_000;
export const OVERRIDE_REASON = "Buổi học kết thúc sớm";
export const OTHER_LABEL = "Giáo trình";
export const OTHER_AMOUNT = 150_000;
export const LESSON_ID_9 = "lesson-ielts-0711";

// 0 nothing yet · 1 discounted · 2 + 07/11 overridden · 3 + the textbook fee
export type Stage = 0 | 1 | 2 | 3;
type Key = "ma" | "gh";
const nameOf = (key: Key) => (key === "ma" ? MA.name : GH.name);

const at = (date: string, time: string) =>
  new Date(`${date}T${time}:00+07:00`).toISOString();
const day = (date: string) => new Date(`${date}T00:00:00.000Z`).toISOString();

const discounted = (key: Key, stage: Stage) => key === "gh" && stage >= 1;
const overridden = (key: Key, date: string, stage: Stage) =>
  key === "gh" && date === OVERRIDE_DATE && stage >= 2;
const net = (gross: number) => Math.round((gross * (100 - DISCOUNT)) / 100);

const sessionFee = (
  key: Key,
  date: string,
  stage: Stage,
): StudentSessionFee => {
  const gross = key === "ma" ? MA_PRICE : GH_PRICE;
  const base = {
    id: `fee-${key}-${date}`,
    date,
    startTime: at(date, "18:00"),
    endTime: at(date, "19:30"),
    className: CLASS_NAME,
    classColor: CLASS_COLOR,
    classDeleted: false,
  };
  if (overridden(key, date, stage))
    return {
      ...base,
      amount: OVERRIDE_AMOUNT,
      discountPercent: null,
      discountAmount: 0,
      overrideReason: OVERRIDE_REASON,
    };
  if (discounted(key, stage))
    return {
      ...base,
      amount: net(gross),
      discountPercent: DISCOUNT,
      discountAmount: gross - net(gross),
      overrideReason: null,
    };
  return {
    ...base,
    amount: gross,
    discountPercent: null,
    discountAmount: 0,
    overrideReason: null,
  };
};

const otherFee = (key: Key): StudentOtherFee => ({
  id: `fee-${key}-giao-trinh`,
  className: CLASS_NAME,
  classColor: CLASS_COLOR,
  classDeleted: false,
  amount: OTHER_AMOUNT,
  label: OTHER_LABEL,
});

const summary = (key: Key, stage: Stage): StudentFeeSummary => {
  const sessions = NOVEMBER.map((date) => sessionFee(key, date, stage));
  const otherFees = stage >= 3 ? [otherFee(key)] : [];
  return {
    studentId: STUDENT_IDS[key],
    fullName: nameOf(key),
    isDeleted: false,
    sessions,
    hourFees: [],
    courseFees: [],
    otherFees,
    pendingAmount: [...sessions, ...otherFees].reduce(
      (sum, f) => sum + f.amount,
      0,
    ),
  };
};

const pendingResponse = (stage: Stage) => {
  const data = [summary("ma", stage), summary("gh", stage)];
  return {
    success: true,
    data,
    pagination: { page: 1, limit: 15, total: data.length, totalPages: 1 },
    summary: {
      totalAmount: data.reduce((sum, s) => sum + s.pendingAmount, 0),
      studentCount: data.length,
    },
  };
};

const rate = (
  id: string,
  price: number,
  discountPercent: number | null,
  from: string | null,
  to: string | null,
) =>
  ({
    id,
    price,
    discountPercent,
    effectiveFrom: from && day(from),
    effectiveTo: to && day(to),
  }) as unknown as EnrollmentDetail["priceHistory"][number];

// newest first, as the repository returns them
const maHistory = [
  rate("ph-ma-2", MA_PRICE, null, "2026-11-01", null),
  rate("ph-ma-1", MA.price, null, null, "2026-10-31"),
];
export const ghHistory = (stage: Stage) =>
  stage >= 1
    ? [
        rate("ph-gh-2", GH_PRICE, DISCOUNT, DISCOUNT_FROM, null),
        rate("ph-gh-1", GH_PRICE, null, null, "2026-10-31"),
      ]
    : [rate("ph-gh-1", GH_PRICE, null, null, null)];

const ledgerOther = (key: Key) =>
  ({
    id: `fee-${key}-giao-trinh`,
    kind: FeeKind.OTHER,
    amount: OTHER_AMOUNT,
    discountPercent: null,
    discountAmount: 0,
    periodStart: null,
    periodEnd: null,
    label: OTHER_LABEL,
    status: FeeStatus.PENDING,
  }) as EnrollmentCourseFee;

const enrollment = (key: Key, stage: Stage): EnrollmentListItem =>
  ({
    id: `enrollment-${key}`,
    classId: CLASS_ID,
    studentId: STUDENT_IDS[key],
    status: EnrollmentStatus.ACTIVE,
    joinedAt: new Date("2026-10-01T00:00:00+07:00"),
    pausedAt: null,
    student: { id: STUDENT_IDS[key], fullName: nameOf(key), deletedAt: null },
    priceHistory: key === "ma" ? maHistory : ghHistory(stage),
    studentFees: stage >= 3 ? [ledgerOther(key)] : [],
  }) as unknown as EnrollmentListItem;

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
  _count: { lessons: LESSON_DATES.length + 5, enrollments: 2 },
} as unknown as ClassWithCounts;

// Saturday 07/11, the make-up lesson: taught and closed
const lesson = {
  id: LESSON_ID_9,
  classId: CLASS_ID,
  userId: "demo-user",
  date: OVERRIDE_DATE,
  startTime: new Date(at(OVERRIDE_DATE, "18:00")),
  endTime: new Date(at(OVERRIDE_DATE, "19:30")),
  isOnline: true,
  location: null,
  meetLink: null,
  linkSource: "NONE",
  googleCalendarEventId: null,
  status: LessonStatus.COMPLETED,
  content: "Reading: dạng True / False / Not Given",
  generalNote: null,
  nextPlan: null,
  homework: "Làm 2 bài Reading trong sách",
  createdAt: new Date("2026-11-01T08:00:00.000Z"),
  updatedAt: new Date("2026-11-07T12:00:00.000Z"),
} as Lesson;

const rosterItem = (key: Key, stage: Stage) => {
  const fee = sessionFee(key, OVERRIDE_DATE, stage);
  return {
    id: `attendance-${key}-0711`,
    studentId: STUDENT_IDS[key],
    student: { fullName: nameOf(key), isShared: true, deletedAt: null },
    status: AttendanceStatus.PRESENT,
    reason: null,
    studentNote: null,
    homeworkPercent: null,
    score: null,
    studentFee: {
      id: fee.id,
      kind: FeeKind.SESSION,
      status: FeeStatus.PENDING,
      amount: fee.amount,
      discountPercent: fee.discountPercent,
      discountAmount: fee.discountAmount,
      overrideReason: fee.overrideReason,
    },
    departed: false,
  };
};
const roster = (stage: Stage) =>
  ({
    roster: [rosterItem("ma", stage), rosterItem("gh", stage)],
    excludedByJoinDateCount: 0,
  }) as unknown as RosterResult;

export const GH_ID = STUDENT_IDS.gh;
export const GH_NAME = GH.name;
// the fee Gia Hân's 07/11 row edits, as the dialog opens on it
export const OVERRIDE_FEE_BEFORE = sessionFee("gh", OVERRIDE_DATE, 1);

export const ISSUE_9 = TODAY_DATE;
const TRANSFER_9 = buildTransferReference([GH.name], ddmm(ISSUE_9));
export const VOUCHER_OPTIONS_9: VoucherOptionsInput = {
  templateId: "autumn",
  useQr: true,
  transferRef: TRANSFER_9,
  hideSessionDetails: false,
  showComments: false,
  comment: "",
  includeReport: false,
  reportFrom: "2026-11-01",
  reportTo: ISSUE_9,
};
export const voucher9 = (
  o: Pick<
    VoucherOptionsInput,
    "hideSessionDetails" | "showComments" | "comment"
  >,
) => {
  const s = summary("gh", 3);
  return buildVoucher(
    {
      name: GH.name,
      sessions: s.sessions,
      hourFees: [],
      courseFees: [],
      otherFees: s.otherFees,
    },
    ISSUE_9,
    TRANSFER_9,
    o,
  );
};
export const STUDENT_REF_9 = { id: GH_ID, name: GH.name };

const ok = (data: unknown) => ({ success: true, data });
const page = (data: unknown[]) => ({
  success: true,
  data,
  pagination: { page: 1, limit: 15, total: data.length, totalPages: 1 },
});

export const FEE_ADJUST_API = (stage: () => Stage) => ({
  ...CREATED_API,
  "/api/billing/overview": () => ok(PRO),
  "/api/bank-account": () => ok(BANK),
  [`/api/classes/${CLASS_ID}/enrollments`]: () =>
    page([enrollment("ma", stage()), enrollment("gh", stage())]),
  [`/api/classes/${CLASS_ID}`]: () => ok(klass),
  [`/api/lessons/${LESSON_ID_9}/attendance`]: () => ok(roster(stage())),
  [`/api/lessons/${LESSON_ID_9}/previous-notes`]: () => ok(null),
  [`/api/lessons/${LESSON_ID_9}`]: () => ok(lesson),
  "/api/fees/pending": () => pendingResponse(stage()),
  "/api/fees/history": () => ok({ data: [], totalAmount: 0 }),
});
