import { Composition, Folder } from "remotion";
import { AnalyticsScene } from "./AnalyticsScene";
import { AttendanceScene } from "./AttendanceScene";
import { CalendarScene } from "./CalendarScene";
import { ChapterScene } from "./ChapterScene";
import { CtaScene } from "./CtaScene";
import { FeeScene } from "./FeeScene";
import { GridScene } from "./GridScene";
import { HookScene } from "./HookScene";
import { Intro } from "./Intro";
import { LogoScene } from "./LogoScene";
import { ReportScene } from "./ReportScene";
import { VoucherScene } from "./VoucherScene";

export const RemotionRoot = () => (
  <>
    <Composition id="Intro" component={Intro} width={1080} height={1920} fps={30} durationInFrames={1761} />
    <Folder name="Scenes">
      <Composition
        id="Hook"
        component={HookScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={120}
        defaultProps={{ style: { backgroundColor: "#f8fafc" } }}
      />
      <Composition
        id="Logo"
        component={LogoScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={90}
        defaultProps={{ style: { backgroundColor: "#f8fafc" } }}
      />
      <Composition
        id="Calendar"
        component={CalendarScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={150}
        defaultProps={{ style: { backgroundColor: "#f1f5f9" } }}
      />
      <Composition
        id="Attendance"
        component={AttendanceScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={240}
        defaultProps={{ style: { backgroundColor: "#f1f5f9" } }}
      />
      <Composition
        id="Report"
        component={ReportScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={300}
        defaultProps={{ style: { backgroundColor: "#f1f5f9" } }}
      />
      <Composition
        id="Chapter"
        component={ChapterScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={36}
        defaultProps={{ style: { backgroundColor: "#f8fafc" } }}
      />
      <Composition
        id="Grid"
        component={GridScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={135}
        defaultProps={{ style: { backgroundColor: "#f1f5f9" } }}
      />
      <Composition
        id="Fee"
        component={FeeScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={150}
        defaultProps={{ style: { backgroundColor: "#f1f5f9" } }}
      />
      <Composition
        id="Analytics"
        component={AnalyticsScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={150}
        defaultProps={{ style: { backgroundColor: "#f1f5f9" } }}
      />
      <Composition
        id="Cta"
        component={CtaScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={120}
        defaultProps={{ style: { backgroundColor: "#020618" } }}
      />
      <Composition
        id="Voucher"
        component={VoucherScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={270}
        defaultProps={{ style: { backgroundColor: "#f1f5f9" } }}
      />
    </Folder>
  </>
);
