import { Composition, Folder } from "remotion";
import { AnalyticsScene } from "./videos/intro/scenes/AnalyticsScene";
import { AttendanceScene } from "./videos/intro/scenes/AttendanceScene";
import { CalendarScene } from "./videos/intro/scenes/CalendarScene";
import { ChapterScene } from "./videos/intro/scenes/ChapterScene";
import { CtaScene } from "./videos/intro/scenes/CtaScene";
import { FeeScene } from "./videos/intro/scenes/FeeScene";
import { GridScene } from "./videos/intro/scenes/GridScene";
import { HookScene } from "./videos/intro/scenes/HookScene";
import { Intro } from "./videos/intro/Intro";
import { LogoScene } from "./videos/intro/scenes/LogoScene";
import { ReportScene } from "./videos/intro/scenes/ReportScene";
import { VoucherScene } from "./videos/intro/scenes/VoucherScene";
import { ZaloScene } from "./videos/intro/scenes/ZaloScene";

export const RemotionRoot = () => (
  <>
    <Composition id="Intro" component={Intro} width={1080} height={1920} fps={30} durationInFrames={1770} />
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
        durationInFrames={210}
        defaultProps={{ style: { backgroundColor: "#f1f5f9" } }}
      />
      <Composition
        id="Chapter"
        component={ChapterScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={45}
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
        durationInFrames={150}
        defaultProps={{ style: { backgroundColor: "#f1f5f9" } }}
      />
      <Composition
        id="Zalo"
        component={ZaloScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={210}
        defaultProps={{ style: { backgroundColor: "#f1f5f9" } }}
      />
    </Folder>
  </>
);
