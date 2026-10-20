import { Track } from "remotion";
import { MusicBed } from "../../shared/audio/MusicBed";
import { END_IMPACT, SCENES } from "./timeline";
import { HookScene, MonthScene, WeekScene } from "./scenes/CalendarScenes";
import { ClassesScene } from "./scenes/ClassesScene";
import { EndScene } from "./scenes/EndScene";
import { InfoScene } from "./scenes/InfoScene";
import { ScheduleScene } from "./scenes/ScheduleScene";
import { StudentsScene } from "./scenes/StudentsScene";

// Tutorial 1 · Create your first class. Music is opt-in, as in the intro: same bed, so the series sounds like one
export const CreateClass = ({ music }: { readonly music: boolean }) => (
  <>
    {music ? (
      <MusicBed src="music/happy-upbeat-delosound.mp3" bpm={117.845} targetBpm={120} firstBeatFrame={64} volume={0.22} duckAt={[END_IMPACT]} />
    ) : null}
    <Track name="Scenes">
      <HookScene name="Hook" {...SCENES.hook} />
      <ClassesScene name="Classes" {...SCENES.classes} />
      <InfoScene name="Info" {...SCENES.info} />
      <StudentsScene name="Students" {...SCENES.students} />
      <ScheduleScene name="Schedule" {...SCENES.schedule} />
      <WeekScene name="Week" {...SCENES.week} />
      <MonthScene name="Month" {...SCENES.month} />
      <EndScene name="End" {...SCENES.end} />
    </Track>
  </>
);
