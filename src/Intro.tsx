import { Track } from "remotion";
import { AnalyticsScene } from "./AnalyticsScene";
import { AttendanceScene } from "./AttendanceScene";
import { CalendarScene } from "./CalendarScene";
import { ChapterScene } from "./ChapterScene";
import { CtaScene } from "./CtaScene";
import { FeeScene } from "./FeeScene";
import { GridScene } from "./GridScene";
import { HookScene } from "./HookScene";
import { LogoScene } from "./LogoScene";
import { ReportScene } from "./ReportScene";
import { VoucherScene } from "./VoucherScene";

export const Intro = () => (
  <Track name="Scenes">
    <HookScene name="Hook" from={0} durationInFrames={120} style={{ backgroundColor: "#f8fafc" }} />
    <LogoScene name="Logo" from={120} durationInFrames={90} style={{ backgroundColor: "#f8fafc" }} />
    <CalendarScene name="Calendar" from={210} durationInFrames={150} style={{ backgroundColor: "#f1f5f9" }} />
    <AttendanceScene name="Attendance" from={360} durationInFrames={240} style={{ backgroundColor: "#f1f5f9" }} />
    <ReportScene name="Report" from={600} durationInFrames={300} style={{ backgroundColor: "#f1f5f9" }} />
    <ChapterScene name="Chapter" from={900} durationInFrames={36} style={{ backgroundColor: "#f8fafc" }} />
    <GridScene name="Grid" from={936} durationInFrames={135} style={{ backgroundColor: "#f1f5f9" }} />
    <FeeScene name="Fee" from={1071} durationInFrames={150} style={{ backgroundColor: "#f1f5f9" }} />
    <VoucherScene name="Voucher" from={1221} durationInFrames={270} style={{ backgroundColor: "#f1f5f9" }} />
    <AnalyticsScene name="Analytics" from={1491} durationInFrames={150} style={{ backgroundColor: "#f1f5f9" }} />
    <CtaScene name="Cta" from={1641} durationInFrames={120} style={{ backgroundColor: "#020618" }} />
  </Track>
);
