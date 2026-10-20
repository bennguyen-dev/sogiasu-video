import { Audio } from "@remotion/media";
import { interpolate, staticFile, Track } from "remotion";
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

const DURATION = 1770;
// the CTA's impact hit (Cta from + 18); the bed dips just before it
const IMPACT = 1668;
// "Happy Upbeat" by DELOSound (Pixabay, no Content ID): 117.845 bpm (librosa fit), first beat at 2.12s
const MUSIC_RATE = 120 / 117.845;
const MUSIC_FIRST_BEAT = 64;
const MUSIC_VOLUME = 0.3;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const musicVolume = (f: number) =>
  MUSIC_VOLUME *
  Math.min(interpolate(f, [0, 8], [0, 1], clamp), interpolate(f, [DURATION - 60, DURATION], [1, 0], clamp)) *
  interpolate(f, [IMPACT - 8, IMPACT - 2, IMPACT + 10, IMPACT + 30], [1, 0.35, 0.35, 1], clamp);

export const Intro = () => (
  <>
  <Audio
    name="Music"
    src={staticFile("music/happy-upbeat-delosound.mp3")}
    trimBefore={MUSIC_FIRST_BEAT}
    playbackRate={MUSIC_RATE}
    volume={musicVolume}
  />
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
