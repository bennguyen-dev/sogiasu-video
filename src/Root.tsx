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
import { EssayPhoto } from "./videos/attendance/EssayPhoto";
import { Report } from "./videos/report/Report";
import { Fees } from "./videos/fees/Fees";
import { Schedule } from "./videos/schedule/Schedule";
import { SCHEDULE_DURATION, SCENES as SC } from "./videos/schedule/timeline";
import { CancelScene as SCCancelScene, MakeupScene as SCMakeupScene, SendScene as SCSendScene, CANCEL_LENGTH as SC_CANCEL, MAKEUP_LENGTH as SC_MAKEUP, SHARE_LENGTH as SC_SHARE } from "./videos/schedule/scenes/ChangeScenes";
import { CardsScene as SCCardsScene, HookScene as SCHookScene, WindowScene as SCWindowScene, CARDS_LENGTH as SC_CARDS, WINDOW_LENGTH as SC_WINDOW } from "./videos/schedule/scenes/ViewScenes";
import { FEES_DURATION, SCENES as FE } from "./videos/fees/timeline";
import { CollectScene as FECollectScene, FeesScene as FEFeesScene, HistoryScene as FEHistoryScene, VoucherScene as FEVoucherScene } from "./videos/fees/scenes/FeeScenes";
import { HookScene as FEHookScene, ZaloScene as FEZaloScene } from "./videos/fees/scenes/SendScenes";
import { REPORT_DURATION, SCENES as RP } from "./videos/report/timeline";
import { ClassScene as RPClassScene, StudentsScene as RPStudentsScene } from "./videos/report/scenes/LinkScenes";
import { ExportScene as RPExportScene, ZaloScene as RPZaloScene } from "./videos/report/scenes/PhotoScenes";
import { HookScene as RPHookScene, ReportScene as RPReportScene } from "./videos/report/scenes/ReportScenes";
import { Attendance } from "./videos/attendance/Attendance";
import { ATTENDANCE_DURATION, SCENES as AT } from "./videos/attendance/timeline";
import { DetailScene as ATDetailScene } from "./videos/attendance/scenes/DetailScene";
import { DoneScene as ATDoneScene, HookScene as ATHookScene, OpenScene as ATOpenScene } from "./videos/attendance/scenes/CalendarScenes";

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
    <Composition id="FirstAttendance" component={Attendance} width={1080} height={1920} fps={30} durationInFrames={ATTENDANCE_DURATION} defaultProps={{ music: false }} />
    <Composition id="FirstAttendanceWithMusic" component={Attendance} width={1080} height={1920} fps={30} durationInFrames={ATTENDANCE_DURATION} defaultProps={{ music: true }} />
    <Folder name="AttendanceScenes">
      <Composition id="AT-Hook" component={ATHookScene} width={1080} height={1920} fps={30} durationInFrames={AT.hook.durationInFrames} defaultProps={{ style: AT.hook.style }} />
      <Composition id="AT-Open" component={ATOpenScene} width={1080} height={1920} fps={30} durationInFrames={AT.open.durationInFrames} defaultProps={{ style: AT.open.style }} />
      <Composition id="AT-Detail" component={ATDetailScene} width={1080} height={1920} fps={30} durationInFrames={AT.detail.durationInFrames} defaultProps={{ style: AT.detail.style }} />
      <Composition id="AT-Done" component={ATDoneScene} width={1080} height={1920} fps={30} durationInFrames={AT.done.durationInFrames} defaultProps={{ style: AT.done.style }} />
    </Folder>
    <Composition id="ParentReport" component={Report} width={1080} height={1920} fps={30} durationInFrames={REPORT_DURATION} defaultProps={{ music: false }} />
    <Composition id="ParentReportWithMusic" component={Report} width={1080} height={1920} fps={30} durationInFrames={REPORT_DURATION} defaultProps={{ music: true }} />
    <Folder name="ParentReportScenes">
      <Composition id="RP-Hook" component={RPHookScene} width={1080} height={1920} fps={30} durationInFrames={RP.hook.durationInFrames} defaultProps={{ style: RP.hook.style }} />
      <Composition id="RP-Export" component={RPExportScene} width={1080} height={1920} fps={30} durationInFrames={RP.export.durationInFrames} defaultProps={{ style: RP.export.style }} />
      <Composition id="RP-Zalo" component={RPZaloScene} width={1080} height={1920} fps={30} durationInFrames={RP.zalo.durationInFrames} defaultProps={{ style: RP.zalo.style }} />
      <Composition id="RP-Report" component={RPReportScene} width={1080} height={1920} fps={30} durationInFrames={RP.report.durationInFrames} defaultProps={{ style: RP.report.style }} />
      <Composition id="RP-Class" component={RPClassScene} width={1080} height={1920} fps={30} durationInFrames={RP.class.durationInFrames} defaultProps={{ style: RP.class.style }} />
      <Composition id="RP-Students" component={RPStudentsScene} width={1080} height={1920} fps={30} durationInFrames={RP.students.durationInFrames} defaultProps={{ style: RP.students.style }} />
    </Folder>
    <Composition id="MonthEndFees" component={Fees} width={1080} height={1920} fps={30} durationInFrames={FEES_DURATION} defaultProps={{ music: false }} />
    <Composition id="MonthEndFeesWithMusic" component={Fees} width={1080} height={1920} fps={30} durationInFrames={FEES_DURATION} defaultProps={{ music: true }} />
    <Folder name="MonthEndFeesScenes">
      <Composition id="FE-Hook" component={FEHookScene} width={1080} height={1920} fps={30} durationInFrames={FE.hook.durationInFrames} defaultProps={{ style: FE.hook.style }} />
      <Composition id="FE-Fees" component={FEFeesScene} width={1080} height={1920} fps={30} durationInFrames={FE.fees.durationInFrames} defaultProps={{ style: FE.fees.style }} />
      <Composition id="FE-Voucher" component={FEVoucherScene} width={1080} height={1920} fps={30} durationInFrames={FE.voucher.durationInFrames} defaultProps={{ style: FE.voucher.style }} />
      <Composition id="FE-Zalo" component={FEZaloScene} width={1080} height={1920} fps={30} durationInFrames={FE.zalo.durationInFrames} defaultProps={{ style: FE.zalo.style }} />
      <Composition id="FE-Collect" component={FECollectScene} width={1080} height={1920} fps={30} durationInFrames={FE.collect.durationInFrames} defaultProps={{ style: FE.collect.style }} />
      <Composition id="FE-History" component={FEHistoryScene} width={1080} height={1920} fps={30} durationInFrames={FE.history.durationInFrames} defaultProps={{ style: FE.history.style }} />
    </Folder>
    <Composition id="WeeklySchedule" component={Schedule} width={1080} height={1920} fps={30} durationInFrames={SCHEDULE_DURATION} defaultProps={{ music: false }} />
    <Composition id="WeeklyScheduleWithMusic" component={Schedule} width={1080} height={1920} fps={30} durationInFrames={SCHEDULE_DURATION} defaultProps={{ music: true }} />
    <Folder name="ScheduleScenes">
      <Composition id="SC-Hook" component={SCHookScene} width={1080} height={1920} fps={30} durationInFrames={SC.hook.durationInFrames} defaultProps={{ style: SC.hook.style }} />
      <Composition id="SC-Window" component={SCWindowScene} width={1080} height={1920} fps={30} durationInFrames={SC_WINDOW} defaultProps={{ style: { backgroundColor: "#f1f5f9" } }} />
      <Composition id="SC-Cancel" component={SCCancelScene} width={1080} height={1920} fps={30} durationInFrames={SC_CANCEL} defaultProps={{ style: { backgroundColor: "#f1f5f9" } }} />
      <Composition id="SC-Makeup" component={SCMakeupScene} width={1080} height={1920} fps={30} durationInFrames={SC_MAKEUP} defaultProps={{ style: { backgroundColor: "#f1f5f9" } }} />
      <Composition id="SC-Send" component={SCSendScene} width={1080} height={1920} fps={30} durationInFrames={SC_SHARE} defaultProps={{ style: { backgroundColor: "#f1f5f9" } }} />
      <Composition id="SC-Cards" component={SCCardsScene} width={1080} height={1920} fps={30} durationInFrames={SC_CARDS} defaultProps={{ style: { backgroundColor: "#f1f5f9" } }} />
    </Folder>
    <Folder name="Assets">
      <Composition id="EssayPhoto" component={EssayPhoto} width={1200} height={1600} fps={30} durationInFrames={1} />
    </Folder>
  </>
);
