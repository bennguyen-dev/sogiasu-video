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
import { INTRO_DURATION, SCENES } from "./videos/intro/timeline";
import { LogoScene } from "./videos/intro/scenes/LogoScene";
import { ReportScene } from "./videos/intro/scenes/ReportScene";
import { VoucherScene } from "./videos/intro/scenes/VoucherScene";
import { ZaloScene } from "./videos/intro/scenes/ZaloScene";

export const RemotionRoot = () => (
  <>
    <Composition id="Intro" component={Intro} width={1080} height={1920} fps={30} durationInFrames={INTRO_DURATION} defaultProps={{ music: false }} />
    <Composition id="IntroWithMusic" component={Intro} width={1080} height={1920} fps={30} durationInFrames={INTRO_DURATION} defaultProps={{ music: true }} />
    <Folder name="Scenes">
      <Composition
        id="Hook"
        component={HookScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={SCENES.hook.durationInFrames}
        defaultProps={{ style: SCENES.hook.style }}
      />
      <Composition
        id="Logo"
        component={LogoScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={SCENES.logo.durationInFrames}
        defaultProps={{ style: SCENES.logo.style }}
      />
      <Composition
        id="Calendar"
        component={CalendarScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={SCENES.calendar.durationInFrames}
        defaultProps={{ style: SCENES.calendar.style }}
      />
      <Composition
        id="Attendance"
        component={AttendanceScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={SCENES.attendance.durationInFrames}
        defaultProps={{ style: SCENES.attendance.style }}
      />
      <Composition
        id="Report"
        component={ReportScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={SCENES.report.durationInFrames}
        defaultProps={{ style: SCENES.report.style }}
      />
      <Composition
        id="Chapter"
        component={ChapterScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={SCENES.chapter.durationInFrames}
        defaultProps={{ style: SCENES.chapter.style }}
      />
      <Composition
        id="Grid"
        component={GridScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={SCENES.grid.durationInFrames}
        defaultProps={{ style: SCENES.grid.style }}
      />
      <Composition
        id="Fee"
        component={FeeScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={SCENES.fee.durationInFrames}
        defaultProps={{ style: SCENES.fee.style }}
      />
      <Composition
        id="Analytics"
        component={AnalyticsScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={SCENES.analytics.durationInFrames}
        defaultProps={{ style: SCENES.analytics.style }}
      />
      <Composition
        id="Cta"
        component={CtaScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={SCENES.cta.durationInFrames}
        defaultProps={{ style: SCENES.cta.style }}
      />
      <Composition
        id="Voucher"
        component={VoucherScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={SCENES.voucher.durationInFrames}
        defaultProps={{ style: SCENES.voucher.style }}
      />
      <Composition
        id="Zalo"
        component={ZaloScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={SCENES.zalo.durationInFrames}
        defaultProps={{ style: SCENES.zalo.style }}
      />
    </Folder>
  </>
);
