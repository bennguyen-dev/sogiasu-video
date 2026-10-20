import type { QrTemplateId } from "@/features/payment/lib/voucher-v2/registry";
import { octoberReport, septemberReport } from "../../shared/demo/report-data";
import { reportHtml, voucherHtml } from "../../shared/demo/voucher-data";

// the colourful, compact templates the voucher carousel flips through; the grid after it shows all of them
export const SHOWCASE: QrTemplateId[] = ["summer", "kid", "autumn", "midautumn", "dark"];

// the template the Zalo scene sends (paid voucher from the Sept fees, sent just after Mid-Autumn)
const ZALO_TEMPLATE: QrTemplateId = "midautumn";
export const ZALO_VOUCHER_HTML = voucherHtml(ZALO_TEMPLATE);
export const ZALO_REPORT_HTML = reportHtml(ZALO_TEMPLATE);

// 05/10 borrows 21/09's attachments, so the latest lesson shows them without leaving the month
const SEPT_21_FILES = septemberReport.sessions.find((s) => s.date === "2026-09-21")!.files;
export const reportScreen = {
  ...octoberReport,
  sessions: octoberReport.sessions.map((s) => (s.date === "2026-10-05" ? { ...s, files: SEPT_21_FILES } : s)),
};
