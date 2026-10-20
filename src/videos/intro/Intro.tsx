import { Track } from "remotion";
import { MusicBed } from "../../shared/audio/MusicBed";
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

// the CTA's impact hit (Cta from + 18); the bed dips just before it
const IMPACT = 1668;

export const Intro = () => (
  <>
  {/* "Happy Upbeat" by DELOSound (Pixabay, no Content ID): 117.845 bpm (librosa fit), first beat at 2.12s */}
  <MusicBed src="music/happy-upbeat-delosound.mp3" bpm={117.845} targetBpm={120} firstBeatFrame={64} volume={0.3} duckAt={[IMPACT]} />
  <Track name="Scenes">
    <HookScene name="Hook" from={0} durationInFrames={120} style={{ backgroundColor: "#f8fafc" }} />
    <LogoScene name="Logo" from={120} durationInFrames={90} style={{ backgroundColor: "#f8fafc" }} />
    <CalendarScene name="Calendar" from={210} durationInFrames={150} style={{ backgroundColor: "#f1f5f9" }} />
    <AttendanceScene name="Attendance" from={360} durationInFrames={240} style={{ backgroundColor: "#f1f5f9" }} />
    <ReportScene name="Report" from={600} durationInFrames={210} style={{ backgroundColor: "#f1f5f9" }} />
    <ChapterScene name="Chapter" from={810} durationInFrames={45} style={{ backgroundColor: "#f8fafc" }} />
    <GridScene name="Grid" from={855} durationInFrames={135} style={{ backgroundColor: "#f1f5f9" }} />
    <FeeScene name="Fee" from={990} durationInFrames={150} style={{ backgroundColor: "#f1f5f9" }} />
    <VoucherScene name="Voucher" from={1140} durationInFrames={150} style={{ backgroundColor: "#f1f5f9" }} />
    <ZaloScene name="Zalo" from={1290} durationInFrames={210} style={{ backgroundColor: "#f1f5f9" }} />
    <AnalyticsScene name="Analytics" from={1500} durationInFrames={150} style={{ backgroundColor: "#f1f5f9" }} />
    <CtaScene name="Cta" from={1650} durationInFrames={120} style={{ backgroundColor: "#020618" }} />
  </Track>
  </>
);
