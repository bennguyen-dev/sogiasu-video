import { staticFile } from "remotion";
import type { StudentReport } from "@/features/report/types";
import fixtures from "./report-fixtures.json";

// Gia Hân's public report as the demo account serves it, frozen at the evening of 05/10
// (October) and for September, whose 21/09 lesson carries every kind of attachment;
// the video lends those files to 05/10 so the latest lesson shows them without leaving the month
const withLocalFiles = (
  month: keyof typeof fixtures,
): StudentReport["sessions"] =>
  fixtures[month].sessions.map((s) => ({
    ...s,
    files: Object.fromEntries(
      Object.entries(s.files).map(([field, files]) => [
        field,
        files.map((f: { url: string }) => ({
          ...f,
          url: f.url.startsWith("demo/") ? staticFile(f.url) : f.url,
        })),
      ]),
    ),
  })) as StudentReport["sessions"];

const base = { studentName: "Gia Hân", tutorName: "Nguyễn Thu Hương" };

export const octoberReport: StudentReport = {
  ...base,
  month: "2026-10",
  prevMonth: "2026-09",
  nextMonth: "2026-11",
  isCurrentMonth: true,
  lessons: fixtures["2026-10"].lessons as StudentReport["lessons"],
  sessions: withLocalFiles("2026-10").map((s) =>
    s.date === "2026-10-05"
      ? { ...s, files: withLocalFiles("2026-09").find((x) => x.date === "2026-09-21")!.files }
      : s,
  ),
};

export const septemberReport: StudentReport = {
  ...base,
  month: "2026-09",
  prevMonth: "2026-08",
  nextMonth: "2026-10",
  isCurrentMonth: false,
  lessons: fixtures["2026-09"].lessons as StudentReport["lessons"],
  sessions: withLocalFiles("2026-09"),
};

export const REPORT_URL = "https://sogiasu.com/report/nguyen-thu-huong/gia-han";

// the app's own share message (report i18n share.classMessage), as ShareClassMessageButton composes it
export const SHARE_MESSAGE = [
  "Tổng hợp link nhận báo cáo, nhận xét và bài tập về nhà sau mỗi buổi học của học sinh:",
  "",
  `- Gia Hân: ${REPORT_URL}`,
  "",
  "Phụ huynh/học sinh lưu ý lưu lại đường link này để tiện theo dõi báo cáo mỗi buổi học",
];
