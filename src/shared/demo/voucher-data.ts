import {
  buildTransferReference,
  ddmm,
} from "@/features/payment/lib/transfer-ref";
import { QR_TEMPLATES, type QrTemplateId } from "@/features/payment/lib/voucher-v2/registry";
import { toVoucherView } from "@/features/payment/lib/voucher-v2/to-view";
import {
  getReportAccent,
  renderReportCard,
  toReportStudents,
} from "@/features/payment/lib/report-table";
import fixtures from "./report-fixtures.json";
import { giaHanFees } from "./september-data";

// Gia Hân's September fees (same data as the fee scene), with an obviously-fake bank number
const STUDENT_NAME = "Gia Hân";
const ISSUE_DATE = "2026-09-30";

const view = toVoucherView({
  students: [
    {
      name: STUDENT_NAME,
      sessions: giaHanFees().sessions.map(({ date, startTime, endTime, className, amount, overrideReason }) => ({ date, startTime, endTime, className, amount, overrideReason })),
      hourFees: [],
      courseFees: [],
      otherFees: [],
    },
  ],
  options: {
    issueDate: ISSUE_DATE,
    payment: {
      bankBin: "970407",
      bankName: "Techcombank",
      accountNumber: "0123456789",
      accountName: "NGUYEN THU HUONG",
      transferRef: buildTransferReference([STUDENT_NAME], ddmm(ISSUE_DATE)),
    },
  },
});

export const VOUCHER_W = 440;

export const VOUCHERS = QR_TEMPLATES.map((tpl) => ({
  id: tpl.id,
  html: tpl.render(view),
}));

// the "Kèm phiếu báo cáo" image the QR dialog shares next to the voucher: the same fees, with each
// lesson's notes, its header coloured to match the voucher template it is sent with
const notes = new Map(fixtures["2026-09"].sessions.map((s) => [s.date, s]));

export const reportHtml = (templateId: QrTemplateId) => renderReportCard(
  toReportStudents(
    [
      {
        studentId: STUDENT_NAME,
        items: giaHanFees().sessions.map((f) => {
          const n = notes.get(f.date);
          return {
            id: f.id,
            amount: f.amount,
            overrideReason: f.overrideReason,
            date: f.date,
            startTime: f.startTime,
            endTime: f.endTime,
            content: n?.content ?? null,
            homework: n?.homework ?? null,
            generalNote: n?.generalNote ?? null,
            studentNote: n?.studentNote ?? null,
            homeworkPercent: n?.homeworkPercent ?? null,
            score: n?.score ?? null,
          };
        }),
      },
    ],
    [STUDENT_NAME],
    { [STUDENT_NAME]: STUDENT_NAME },
  )[0],
  getReportAccent(templateId),
);

export const voucherHtml = (templateId: QrTemplateId) => VOUCHERS.find((v) => v.id === templateId)!.html;
