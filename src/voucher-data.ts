import {
  buildTransferReference,
  ddmm,
} from "@/features/payment/lib/transfer-ref";
import { QR_TEMPLATES } from "@/features/payment/lib/voucher-v2/registry";
import { toVoucherView } from "@/features/payment/lib/voucher-v2/to-view";
import { giaHanFees } from "./app-ui/september-data";

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
