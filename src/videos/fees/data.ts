import { FeeKind } from "@prisma/client";
import type {
  SessionNoteGroup,
  SessionNoteItem,
} from "@/features/attendance/types";
import type {
  PaidFeeRow,
  StudentFeeSummary,
  StudentSessionFee,
} from "@/features/fee/types";
import {
  renderReportCard,
  getReportAccent,
  toReportStudents,
} from "@/features/payment/lib/report-table";
import {
  buildTransferReference,
  ddmm,
} from "@/features/payment/lib/transfer-ref";
import { normalizeAddInfo } from "@/features/payment/lib/vietqr-payload";
import type { QrTemplateId } from "@/features/payment/lib/voucher-v2/registry";
import { toVoucherView } from "@/features/payment/lib/voucher-v2/to-view";
import type { VoucherOptionsInput } from "@/features/payment/types";
import {
  CLASS_COLOR,
  CLASS_NAME,
  CREATED_API,
  LESSON_DATES,
  STUDENTS,
} from "../create-class/data";
import { CLASS_ID, STUDENT_IDS } from "../attendance/data";

// tutorial 4 jumps to the end of October: all 9 lessons are taught; Gia Hân's excused 01/10 is not charged
export const MONTH_END = new Date("2026-10-31T20:00:00+07:00").getTime();
export const ISSUE_DATE = "2026-10-31";
const [MA, GH] = STUDENTS;

const at = (date: string, time: string) =>
  new Date(`${date}T${time}:00+07:00`).toISOString();

const sessions = (key: "ma" | "gh", price: number): StudentSessionFee[] =>
  LESSON_DATES.filter((d) => key === "ma" || d !== LESSON_DATES[0]).map(
    (date) => ({
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
    }),
  );

const summary = (key: "ma" | "gh"): StudentFeeSummary => {
  const price = key === "ma" ? MA.price : GH.price;
  const s = sessions(key, price);
  return {
    studentId: STUDENT_IDS[key],
    fullName: key === "ma" ? MA.name : GH.name,
    isDeleted: false,
    sessions: s,
    hourFees: [],
    courseFees: [],
    otherFees: [],
    pendingAmount: s.reduce((sum, f) => sum + f.amount, 0),
  };
};

export const MINH_ANH = summary("ma");

// the Fees page's pending list, before and after Minh Anh's fees are marked collected
export const pendingResponse = (maCollected: boolean) => {
  const data = maCollected ? [summary("gh")] : [summary("ma"), summary("gh")];
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

const paidRows = (): PaidFeeRow[] =>
  MINH_ANH.sessions.map((f) => ({
    id: f.id,
    kind: FeeKind.SESSION,
    paidAt: "2026-10-31T13:05:00.000Z",
    amount: f.amount,
    studentId: STUDENT_IDS.ma,
    studentName: MA.name,
    studentDeleted: false,
    classId: CLASS_ID,
    className: CLASS_NAME,
    classColor: CLASS_COLOR,
    classDeleted: false,
    label: null,
    lessonDate: f.date,
    lessonStart: f.startTime,
    lessonEnd: f.endTime,
  }));

export const historyResponse = () => ({
  success: true,
  data: { data: paidRows(), totalAmount: MINH_ANH.pendingAmount },
});

// Minh Anh's October, lesson by lesson: what the review-notes dialog and the report image read
const NOTES: [string, string, number, number, string][] = [
  [
    "Writing Task 2 - Opinion essay",
    "Viết 1 bài Task 2 (250 từ)",
    80,
    6.5,
    "Hiểu bài, nắm được nội dung. Cần luyện tập thêm ở nhà.",
  ],
  [
    "Chữa bài Task 2, cấu trúc đoạn thân bài",
    "Viết lại 2 đoạn thân bài",
    90,
    6.5,
    "Đoạn văn rõ ý hơn, còn sai số nhiều.",
  ],
  [
    "Reading - True / False / Not Given",
    "Làm Test 3 Cambridge 15",
    80,
    6,
    "Làm nhanh nhưng cần đọc kỹ câu hỏi.",
  ],
  ["Listening Section 3", "Nghe 2 bài Section 3", 100, 6.5, "Bắt từ khoá tốt."],
  [
    "Writing Task 1 - Line graph",
    "Viết 1 bài Task 1 (150 từ)",
    90,
    6.5,
    "Mô tả số liệu chính xác hơn.",
  ],
  [
    "Speaking Part 2",
    "Chuẩn bị 3 đề Part 2",
    100,
    7,
    "Nói trôi chảy, tự tin hơn.",
  ],
  [
    "Writing Task 2 - Discussion essay",
    "Viết 1 bài Task 2 (250 từ)",
    100,
    7,
    "Bài viết mạch lạc, ít lỗi số nhiều và trạng từ.",
  ],
  [
    "Từ vựng chủ đề Education",
    "Học 20 từ chủ đề Education",
    80,
    7,
    "Dùng từ đa dạng hơn.",
  ],
  [
    "Thi thử Writing",
    "Xem lại lỗi trong bài thi thử",
    100,
    7,
    "Tiến bộ rõ so với đầu tháng.",
  ],
];

const noteItems = (): SessionNoteItem[] =>
  MINH_ANH.sessions.map((f, i) => {
    const [content, homework, homeworkPercent, score, studentNote] = NOTES[i];
    return {
      id: `attendance-ma-${f.date}`,
      amount: f.amount,
      discountPercent: null,
      overrideReason: null,
      date: f.date,
      startTime: f.startTime,
      endTime: f.endTime,
      content,
      homework,
      generalNote: null,
      studentNote,
      homeworkPercent,
      score,
    };
  });

export const NOTE_GROUPS: SessionNoteGroup[] = [
  { studentId: STUDENT_IDS.ma, items: noteItems() },
];
export const REPORT_FROM = LESSON_DATES[0];
export const REPORT_TO = LESSON_DATES[LESSON_DATES.length - 1];
export const reportStudents = () =>
  toReportStudents(NOTE_GROUPS, [STUDENT_IDS.ma], {
    [STUDENT_IDS.ma]: MA.name,
  });

export const COMMENT =
  "Tháng 10 Minh Anh tiến bộ rõ ở phần Writing: bài viết mạch lạc hơn, ít sai số nhiều và trạng từ. Tháng 11 cô sẽ cho em luyện thêm từ vựng theo chủ đề ạ.";
export const TRANSFER_REF = buildTransferReference([MA.name], ddmm(ISSUE_DATE));

export const BANK = {
  id: "demo-bank",
  userId: "demo-user",
  bankBin: "970407",
  bankName: "Techcombank",
  accountNumber: "0123456789",
  accountName: "NGUYEN THU HUONG",
  verifiedAt: "2026-10-01T00:00:00.000Z",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
};

// the demo account is on Pro: every template exports, no brand line on the voucher
const PRO = {
  plan: "PRO",
  reason: "PAID",
  source: "SUBSCRIPTION",
  isActive: true,
  validUntil: "2027-10-01T00:00:00.000Z",
  giftUntil: "2026-10-15T00:00:00.000Z",
  signupAt: "2026-10-01T00:00:00.000Z",
  usage: {},
  qrTemplateIds: null,
};

export const voucherView = (
  o: Pick<
    VoucherOptionsInput,
    "hideSessionDetails" | "showComments" | "comment"
  >,
) =>
  toVoucherView({
    students: [
      {
        name: MA.name,
        sessions: MINH_ANH.sessions,
        hourFees: [],
        courseFees: [],
        otherFees: [],
      },
    ],
    options: {
      issueDate: ISSUE_DATE,
      hideSessionDetails: o.hideSessionDetails,
      comment:
        o.showComments && o.comment.trim() ? o.comment.trim() : undefined,
      showBrand: false,
      payment: {
        bankBin: BANK.bankBin,
        bankName: BANK.bankName,
        accountNumber: BANK.accountNumber,
        accountName: BANK.accountName,
        transferRef: normalizeAddInfo(TRANSFER_REF),
      },
    },
  });

export const reportImageHtml = (templateId: QrTemplateId) =>
  renderReportCard(reportStudents()[0], getReportAccent(templateId));

const ok = (data: unknown) => ({ success: true, data });

export const FEES_API = (maCollected: () => boolean) => ({
  ...CREATED_API,
  "/api/billing/overview": () => ok(PRO),
  "/api/bank-account": () => ok(BANK),
  "/api/fees/pending": () => pendingResponse(maCollected()),
  "/api/fees/history": () => historyResponse(),
  "/api/attendance/session-notes/range": () => ok(NOTE_GROUPS),
});
