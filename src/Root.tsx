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
import { ClassesScene } from "./videos/create-class/scenes/ClassesScene";
import { InfoScene } from "./videos/create-class/scenes/InfoScene";
import { StudentsScene } from "./videos/create-class/scenes/StudentsScene";
import { ScheduleScene } from "./videos/create-class/scenes/ScheduleScene";
import { HookScene as CCHookScene, MonthScene, WeekScene } from "./videos/create-class/scenes/CalendarScenes";
import { EndScene } from "./videos/create-class/scenes/EndScene";
import { CreateClass } from "./videos/create-class/CreateClass";
import { CREATE_CLASS_DURATION, SCENES as CC } from "./videos/create-class/timeline";

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
    <Composition id="CreateClass" component={CreateClass} width={1080} height={1920} fps={30} durationInFrames={CREATE_CLASS_DURATION} defaultProps={{ music: false }} />
    <Composition id="CreateClassWithMusic" component={CreateClass} width={1080} height={1920} fps={30} durationInFrames={CREATE_CLASS_DURATION} defaultProps={{ music: true }} />
    <Folder name="CreateClassScenes">
      <Composition id="CC-Hook" component={CCHookScene} width={1080} height={1920} fps={30} durationInFrames={CC.hook.durationInFrames} defaultProps={{ style: CC.hook.style }} />
      <Composition id="CC-Classes" component={ClassesScene} width={1080} height={1920} fps={30} durationInFrames={CC.classes.durationInFrames} defaultProps={{ style: CC.classes.style }} />
      <Composition id="CC-Info" component={InfoScene} width={1080} height={1920} fps={30} durationInFrames={CC.info.durationInFrames} defaultProps={{ style: CC.info.style }} />
      <Composition id="CC-Students" component={StudentsScene} width={1080} height={1920} fps={30} durationInFrames={CC.students.durationInFrames} defaultProps={{ style: CC.students.style }} />
      <Composition id="CC-Schedule" component={ScheduleScene} width={1080} height={1920} fps={30} durationInFrames={CC.schedule.durationInFrames} defaultProps={{ style: CC.schedule.style }} />
      <Composition id="CC-Week" component={WeekScene} width={1080} height={1920} fps={30} durationInFrames={CC.week.durationInFrames} defaultProps={{ style: CC.week.style }} />
      <Composition id="CC-Month" component={MonthScene} width={1080} height={1920} fps={30} durationInFrames={CC.month.durationInFrames} defaultProps={{ style: CC.month.style }} />
      <Composition id="CC-End" component={EndScene} width={1080} height={1920} fps={30} durationInFrames={CC.end.durationInFrames} defaultProps={{ style: CC.end.style }} />
    </Folder>
  </>
);
