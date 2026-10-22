import { Track } from "remotion";
import { MusicBed } from "../../shared/audio/MusicBed";
import { END_IMPACT, SCENES } from "./timeline";
import { ClassScene, EndScene, StudentsScene } from "./scenes/LinkScenes";
import { ExportScene, ZaloScene } from "./scenes/PhotoScenes";
import { HookScene, ReportScene } from "./scenes/ReportScenes";

// Tutorial 3 · Parent reports: a photo after every lesson, or one link the parent opens on their own
export const Report = ({ music }: { readonly music: boolean }) => (
  <>
    {music ? (
      <MusicBed src="music/happy-upbeat-delosound.mp3" bpm={117.845} targetBpm={120} firstBeatFrame={64} volume={0.22} duckAt={[END_IMPACT]} />
    ) : null}
    <Track name="Scenes">
      <HookScene name="Hook" {...SCENES.hook} />
      <ExportScene name="Export" {...SCENES.export} />
      <ZaloScene name="Zalo" {...SCENES.zalo} />
      <ReportScene name="Report" {...SCENES.report} />
      <ClassScene name="Class" {...SCENES.class} />
      <StudentsScene name="Students" {...SCENES.students} />
      <EndScene name="End" {...SCENES.end} />
    </Track>
  </>
);
