import { Track } from "remotion";
import { MusicBed } from "../../shared/audio/MusicBed";
import { END_IMPACT, SCENES } from "./timeline";
import { EndScene, HookScene, ModeScene } from "./scenes/IntroScenes";
import { AddScene } from "./scenes/AddScene";
import { ListScene, VoucherScene } from "./scenes/FeeScenes";

// Tutorial 8 · Per-course fees: a monthly course added for the whole class, an unpaid one gone overdue
export const CourseFee = ({ music }: { readonly music: boolean }) => (
  <>
    {music ? (
      <MusicBed
        src="music/happy-upbeat-delosound.mp3"
        bpm={117.845}
        targetBpm={120}
        firstBeatFrame={64}
        volume={0.22}
        duckAt={[END_IMPACT]}
      />
    ) : null}
    <Track name="Scenes">
      <HookScene name="Hook" {...SCENES.hook} />
      <ModeScene name="Mode" {...SCENES.mode} />
      <AddScene name="Add" {...SCENES.add} />
      <ListScene name="List" {...SCENES.list} />
      <VoucherScene name="Voucher" {...SCENES.voucher} />
      <EndScene name="End" {...SCENES.end} />
    </Track>
  </>
);
