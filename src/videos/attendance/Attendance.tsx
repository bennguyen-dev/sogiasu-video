import { Track } from "remotion";
import { MusicBed } from "../../shared/audio/MusicBed";
import { END_IMPACT, SCENES } from "./timeline";
import { DoneScene, EndScene, HookScene, OpenScene } from "./scenes/CalendarScenes";
import { DetailScene } from "./scenes/DetailScene";

// Tutorial 2 · First lesson's attendance: mark, evaluate, attach, complete
export const Attendance = ({ music }: { readonly music: boolean }) => (
  <>
    {music ? (
      <MusicBed src="music/happy-upbeat-delosound.mp3" bpm={117.845} targetBpm={120} firstBeatFrame={64} volume={0.22} duckAt={[END_IMPACT]} />
    ) : null}
    <Track name="Scenes">
      <HookScene name="Hook" {...SCENES.hook} />
      <OpenScene name="Open" {...SCENES.open} />
      <DetailScene name="Detail" {...SCENES.detail} />
      <DoneScene name="Done" {...SCENES.done} />
      <EndScene name="End" {...SCENES.end} />
    </Track>
  </>
);
