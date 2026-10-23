import { Track } from "remotion";
import { MusicBed } from "../../shared/audio/MusicBed";
import { END_IMPACT, SCENES } from "./timeline";
import { DashboardScene } from "./scenes/DashboardScene";
import { OverviewScene } from "./scenes/OverviewScene";
import { MonthsScene } from "./scenes/MonthsScene";
import { EndScene } from "./scenes/EndScene";

// Tutorial 11 · Revenue: the dashboard's money cards, the month in detail as a floating card, then month by month on the phone
export const Revenue = ({ music }: { readonly music: boolean }) => (
  <>
    {music ? (
      <MusicBed src="music/happy-upbeat-delosound.mp3" bpm={117.845} targetBpm={120} firstBeatFrame={64} volume={0.22} duckAt={[END_IMPACT]} />
    ) : null}
    <Track name="Scenes">
      <DashboardScene name="Dashboard" {...SCENES.dashboard} />
      <OverviewScene name="Overview" {...SCENES.overview} />
      <MonthsScene name="Months" {...SCENES.months} />
      <EndScene name="End" {...SCENES.end} />
    </Track>
  </>
);
