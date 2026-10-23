import { BillingMode, EnrollmentStatus } from "@prisma/client";
import type { ClassWithCounts } from "@/features/class/types";
import type { EnrollmentDetail, EnrollmentListItem, EnrollmentPrice } from "@/features/enrollment/types";
import type { StudentFeeSummary, StudentSessionFee } from "@/features/fee/types";
import { CLASS_COLOR, CLASS_NAME, CREATED_API, LESSON_DATES, STUDENTS } from "../create-class/data";
import { CLASS_ID, STUDENT_IDS } from "../attendance/data";
import type { VoucherOptionsInput } from "@/features/payment/types";
import { buildTransferReference, ddmm } from "@/features/payment/lib/transfer-ref";
import { BANK, buildVoucher, historyResponse, PRO } from "../fees/data";

// tutorial 6: Thu 12/11 afternoon. October is paid (tutorial 4); November so far is 03/11, the 07/11 make-up and 10/11
export const TODAY_6 = new Date("2026-11-12T15:30:00+07:00").getTime();
const [MA, GH] = STUDENTS;
export const NEW_PRICE = 350_000;
export const RAISE_FROM = "2026-11-01";
const GH_NEXT = 280_000;
export const NOVEMBER = ["2026-11-03", "2026-11-07", "2026-11-10"];
export const ABSENT_DATE = "2026-11-10";

const at = (date: string, time: string) => new Date(`${date}T${time}:00+07:00`).toISOString();
const day = (date: string) => new Date(`${date}T00:00:00.000Z`).toISOString();

const sessions = (key: "ma" | "gh", dates: string[], price: number): StudentSessionFee[] =>
  dates.map((date) => ({
    id: `fee-${key}-${date}`,
    date,
    startTime: at(date, "18:00"),
    endTime: at(date, "19:30"),
    className: CLASS_NAME,
    classColor: CLASS_COLOR,
    classDeleted: false,
    amount: price,
    discountPercent: null,
    discountAmount: 0,
    overrideReason: null,
  }));

const summary = (key: "ma" | "gh", s: StudentSessionFee[]): StudentFeeSummary => ({
  studentId: STUDENT_IDS[key],
  fullName: key === "ma" ? MA.name : GH.name,
  isDeleted: false,
  sessions: s,
  hourFees: [],
  courseFees: [],
  otherFees: [],
  pendingAmount: s.reduce((sum, f) => sum + f.amount, 0),
});

// Gia Hân still owes October (excused 01/10 aside) plus November
export const pendingResponse = (raised: boolean) => {
  const data = [
    summary("ma", sessions("ma", NOVEMBER, raised ? NEW_PRICE : MA.price)),
    summary("gh", sessions("gh", [...LESSON_DATES.slice(1), ...NOVEMBER], GH.price)),
  ];
  return {
    success: true,
    data,
    pagination: { page: 1, limit: 15, total: data.length, totalPages: 1 },
    summary: { totalAmount: data.reduce((sum, s) => sum + s.pendingAmount, 0), studentCount: data.length },
  };
};

const rate = (id: string, price: number, from: string | null, to: string | null) =>
  ({ id, price, discountPercent: null, effectiveFrom: from && day(from), effectiveTo: to && day(to) }) as unknown as EnrollmentDetail["priceHistory"][number];

// newest first, as the repository returns them
export const maHistory = (raised: boolean) =>
  raised ? [rate("ph-ma-2", NEW_PRICE, RAISE_FROM, null), rate("ph-ma-1", MA.price, null, "2026-10-31")] : [rate("ph-ma-1", MA.price, null, null)];
const ghHistory = [rate("ph-gh-2", GH_NEXT, "2026-12-01", null), rate("ph-gh-1", GH.price, null, "2026-11-30")];

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

const enrollment = (key: "ma" | "gh", priceHistory: EnrollmentPrice[]): EnrollmentListItem =>
  ({
    id: `enrollment-${key}`,
    classId: CLASS_ID,
    studentId: STUDENT_IDS[key],
    status: EnrollmentStatus.ACTIVE,
    joinedAt: new Date("2026-10-01T00:00:00+07:00"),
    pausedAt: null,
    student: { id: STUDENT_IDS[key], fullName: key === "ma" ? MA.name : GH.name, deletedAt: null },
    priceHistory,
    studentFees: [],
  }) as unknown as EnrollmentListItem;

const ok = (data: unknown) => ({ success: true, data });
const page = (data: unknown[]) => ({ success: true, data, pagination: { page: 1, limit: 15, total: data.length, totalPages: 1 } });

// the history tab asks for a month as a UTC range starting the evening before the 1st
const monthOf = (url: string) => {
  const from = new URL(url, "https://sogiasu.com").searchParams.get("from");
  return from ? new Date(Date.parse(from) + 86_400_000).toISOString().slice(0, 7) : "";
};

export const ISSUE_6 = "2026-11-12";
export const TRANSFER_6 = buildTransferReference([MA.name], ddmm(ISSUE_6));
export const VOUCHER_OPTIONS_6: VoucherOptionsInput = {
  templateId: "autumn",
  useQr: true,
  transferRef: TRANSFER_6,
  hideSessionDetails: false,
  showComments: false,
  comment: "",
  includeReport: false,
  reportFrom: "2026-11-01",
  reportTo: ISSUE_6,
};
// Minh Anh's November at the new price, as the voucher lists it
export const voucher6 = (o: Pick<VoucherOptionsInput, "hideSessionDetails" | "showComments" | "comment">) =>
  buildVoucher({ name: MA.name, sessions: sessions("ma", NOVEMBER, NEW_PRICE), hourFees: [], courseFees: [], otherFees: [] }, ISSUE_6, TRANSFER_6, o);

export const SESSION_FEE_API = (raised: () => boolean) => ({
  ...CREATED_API,
  "/api/billing/overview": () => ok(PRO),
  "/api/bank-account": () => ok(BANK),
  "/api/classes/new-class/enrollments": () => page([enrollment("ma", maHistory(raised())), enrollment("gh", ghHistory)]),
  "/api/classes/new-class": () => ok(klass),
  "/api/fees/pending": () => pendingResponse(raised()),
  "/api/fees/history": (url: string) => (monthOf(url) === "2026-10" ? historyResponse() : ok({ data: [], totalAmount: 0 })),
});
