import { Track } from "remotion";
import { MusicBed } from "../../shared/audio/MusicBed";
import { END_IMPACT, SCENES } from "./timeline";
import { OverviewScene } from "./scenes/OverviewScene";
import { CloseScene, MarkScene } from "./scenes/PhoneScenes";
import { EndScene } from "./scenes/EndScene";

// Tutorial 10 · The attendance grid: the month at a glance as a floating card, then marking and closing on the phone
export const AttendanceGrid = ({ music }: { readonly music: boolean }) => (
  <>
    {music ? (
      <MusicBed src="music/happy-upbeat-delosound.mp3" bpm={117.845} targetBpm={120} firstBeatFrame={64} volume={0.22} duckAt={[END_IMPACT]} />
    ) : null}
    <Track name="Scenes">
      <OverviewScene name="Overview" {...SCENES.overview} />
      <MarkScene name="Mark" {...SCENES.mark} />
      <CloseScene name="Close" {...SCENES.close} />
      <EndScene name="End" {...SCENES.end} />
    </Track>
  </>
);
