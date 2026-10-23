import { BillingMode, EnrollmentStatus, FeeKind, FeeStatus } from "@prisma/client";
import type { ClassWithCounts } from "@/features/class/types";
import type { EnrollmentCourseFee, EnrollmentListItem } from "@/features/enrollment/types";
import type { StudentCourseFee, StudentFeeSummary } from "@/features/fee/types";
import type { VoucherOptionsInput } from "@/features/payment/types";
import { buildTransferReference, ddmm } from "@/features/payment/lib/transfer-ref";
import { CREATED_API } from "../create-class/data";
import { BANK, buildVoucher, PRO } from "../fees/data";

// tutorial 8: the same Thu 12/11 as tutorials 6 and 7, on the demo school's monthly-course class (intro data)
export const TODAY_8 = new Date("2026-11-12T15:30:00+07:00").getTime();
export const CLASS_NAME_8 = "IELTS Foundation (khóa tháng)";
export const CLASS_COLOR_8 = "#e67c73";
export const CLASS_ID_8 = "foundation";
export const NEW_LABEL = "Khóa tháng 11";
export const NEW_AMOUNT = 2_800_000;
export const NEW_START = "2026-11-01";
export const NEW_END = "2026-11-30";
const OLD_AMOUNT = 2_500_000;

type Student = { id: string; name: string; octoberPaid: boolean };
// Thu Trang still owes October; the other two paid it
export const STUDENTS_8: Student[] = [
  { id: "student-thu-trang", name: "Bùi Thu Trang", octoberPaid: false },
  { id: "student-quang-huy", name: "Lê Quang Huy", octoberPaid: true },
  { id: "student-ngoc-anh", name: "Phạm Ngọc Ánh", octoberPaid: true },
];
const TRANG = STUDENTS_8[0];

type Term = { key: string; label: string; amount: number; start: string; end: string };
const OCTOBER: Term = { key: "10", label: "Khóa tháng 10", amount: OLD_AMOUNT, start: "2026-10-01", end: "2026-10-31" };
const NOVEMBER: Term = { key: "11", label: NEW_LABEL, amount: NEW_AMOUNT, start: NEW_START, end: NEW_END };

const ledgerFee = (s: Student, term: Term, status: FeeStatus) =>
  ({
    id: `fee-${s.id}-${term.key}`,
    kind: FeeKind.COURSE,
    amount: term.amount,
    discountPercent: null,
    discountAmount: 0,
    periodStart: term.start,
    periodEnd: term.end,
    label: term.label,
    status,
  }) as EnrollmentCourseFee;

const pendingFee = (s: Student, term: Term): StudentCourseFee => ({
  id: `fee-${s.id}-${term.key}`,
  className: CLASS_NAME_8,
  classColor: CLASS_COLOR_8,
  classDeleted: false,
  amount: term.amount,
  discountPercent: null,
  discountAmount: 0,
  periodStart: term.start,
  periodEnd: term.end,
  label: term.label,
});

const termsOwed = (s: Student, added: boolean) => [...(s.octoberPaid ? [] : [OCTOBER]), ...(added ? [NOVEMBER] : [])];

// newest term first, as the repository sorts it
const enrollment = (s: Student, added: boolean): EnrollmentListItem =>
  ({
    id: `enrollment-${s.id}`,
    classId: CLASS_ID_8,
    studentId: s.id,
    status: EnrollmentStatus.ACTIVE,
    joinedAt: new Date("2026-09-01T00:00:00+07:00"),
    pausedAt: null,
    student: { id: s.id, fullName: s.name, deletedAt: null },
    priceHistory: [],
    studentFees: [
      ...(added ? [ledgerFee(s, NOVEMBER, FeeStatus.PENDING)] : []),
      ledgerFee(s, OCTOBER, s.octoberPaid ? FeeStatus.PAID : FeeStatus.PENDING),
    ],
  }) as unknown as EnrollmentListItem;

const pendingResponse = (added: boolean) => {
  const data: StudentFeeSummary[] = STUDENTS_8.map((s) => {
    const courseFees = termsOwed(s, added).map((term) => pendingFee(s, term));
    return {
      studentId: s.id,
      fullName: s.name,
      isDeleted: false,
      sessions: [],
      hourFees: [],
      courseFees,
      otherFees: [],
      pendingAmount: courseFees.reduce((sum, f) => sum + f.amount, 0),
    };
  }).filter((s) => s.courseFees.length > 0);
  return {
    success: true,
    data,
    pagination: { page: 1, limit: 15, total: data.length, totalPages: 1 },
    summary: { totalAmount: data.reduce((sum, s) => sum + s.pendingAmount, 0), studentCount: data.length },
  };
};

const klass = {
  id: CLASS_ID_8,
  userId: "demo-user",
  name: CLASS_NAME_8,
  description: null,
  color: CLASS_COLOR_8,
  onlineLink: null,
  billingMode: BillingMode.PER_COURSE,
  deletedAt: null,
  createdAt: new Date("2026-09-01T00:00:00.000Z"),
  updatedAt: new Date("2026-09-01T00:00:00.000Z"),
  _count: { lessons: 18, enrollments: STUDENTS_8.length },
} as unknown as ClassWithCounts;

export const ISSUE_8 = "2026-11-12";
const TRANSFER_8 = buildTransferReference([TRANG.name], ddmm(ISSUE_8));
export const VOUCHER_OPTIONS_8: VoucherOptionsInput = {
  templateId: "autumn",
  useQr: true,
  transferRef: TRANSFER_8,
  hideSessionDetails: false,
  showComments: false,
  comment: "",
  includeReport: false,
  reportFrom: "2026-11-01",
  reportTo: ISSUE_8,
};
export const voucher8 = (o: Pick<VoucherOptionsInput, "hideSessionDetails" | "showComments" | "comment">) =>
  buildVoucher(
    { name: TRANG.name, sessions: [], hourFees: [], courseFees: termsOwed(TRANG, true).map((term) => pendingFee(TRANG, term)), otherFees: [] },
    ISSUE_8,
    TRANSFER_8,
    o,
  );
export const STUDENT_REF_8 = { id: TRANG.id, name: TRANG.name };

const ok = (data: unknown) => ({ success: true, data });
const page = (data: unknown[]) => ({ success: true, data, pagination: { page: 1, limit: 15, total: data.length, totalPages: 1 } });

export const COURSE_FEE_API = (added: () => boolean) => ({
  ...CREATED_API,
  "/api/billing/overview": () => ok(PRO),
  "/api/bank-account": () => ok(BANK),
  [`/api/classes/${CLASS_ID_8}/enrollments`]: () => page(STUDENTS_8.map((s) => enrollment(s, added()))),
  [`/api/classes/${CLASS_ID_8}`]: () => ok(klass),
  "/api/fees/pending": () => pendingResponse(added()),
  "/api/fees/history": () => ok({ data: [], totalAmount: 0 }),
});
