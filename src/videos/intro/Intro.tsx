import { Track } from "remotion";
import { MusicBed } from "../../shared/audio/MusicBed";
import { CTA_IMPACT, SCENES } from "./timeline";
import { AnalyticsScene } from "./scenes/AnalyticsScene";
import { AttendanceScene } from "./scenes/AttendanceScene";
import { CalendarScene } from "./scenes/CalendarScene";
import { ChapterScene } from "./scenes/ChapterScene";
import { CtaScene } from "./scenes/CtaScene";
import { FeeScene } from "./scenes/FeeScene";
import { GridScene } from "./scenes/GridScene";
import { HookScene } from "./scenes/HookScene";
import { LogoScene } from "./scenes/LogoScene";
import { ReportScene } from "./scenes/ReportScene";
import { VoucherScene } from "./scenes/VoucherScene";
import { ZaloScene } from "./scenes/ZaloScene";

// music is opt-in: the default cut carries only sound effects, so a track can be added in the platform's own editor
export const Intro = ({ music }: { readonly music: boolean }) => (
  <>
  {/* "Happy Upbeat" by DELOSound (Pixabay, no Content ID): 117.845 bpm (librosa fit), first beat at 2.12s */}
  {music ? (
    <MusicBed src="music/happy-upbeat-delosound.mp3" bpm={117.845} targetBpm={120} firstBeatFrame={64} volume={0.3} duckAt={[CTA_IMPACT]} />
  ) : null}
  <Track name="Scenes">
    <HookScene name="Hook" {...SCENES.hook} />
    <LogoScene name="Logo" {...SCENES.logo} />
    <CalendarScene name="Calendar" {...SCENES.calendar} />
    <AttendanceScene name="Attendance" {...SCENES.attendance} />
    <ReportScene name="Report" {...SCENES.report} />
    <ChapterScene name="Chapter" {...SCENES.chapter} />
    <GridScene name="Grid" {...SCENES.grid} />
    <FeeScene name="Fee" {...SCENES.fee} />
    <VoucherScene name="Voucher" {...SCENES.voucher} />
    <ZaloScene name="Zalo" {...SCENES.zalo} />
    <AnalyticsScene name="Analytics" {...SCENES.analytics} />
    <CtaScene name="Cta" {...SCENES.cta} />
  </Track>
  </>
);
