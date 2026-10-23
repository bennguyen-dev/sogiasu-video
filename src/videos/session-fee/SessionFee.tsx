import { Track } from "remotion";
import { MusicBed } from "../../shared/audio/MusicBed";
import { END_IMPACT, SCENES } from "./timeline";
import { EndScene, HookScene, ModeScene } from "./scenes/IntroScenes";
import { CheckScene, ListScene, VoucherScene } from "./scenes/FeeScenes";
import { RateScene } from "./scenes/RateScene";

// Tutorial 6 · Per-session fees: one charge per lesson taught, a price change from a date, collected fees untouched
export const SessionFee = ({ music }: { readonly music: boolean }) => (
  <>
    {music ? (
      <MusicBed src="music/happy-upbeat-delosound.mp3" bpm={117.845} targetBpm={120} firstBeatFrame={64} volume={0.22} duckAt={[END_IMPACT]} />
    ) : null}
    <Track name="Scenes">
      <HookScene name="Hook" {...SCENES.hook} />
      <ModeScene name="Mode" {...SCENES.mode} />
      <ListScene name="List" {...SCENES.list} />
      <RateScene name="Rate" {...SCENES.rate} />
      <CheckScene name="Check" {...SCENES.check} />
      <VoucherScene name="Voucher" {...SCENES.voucher} />
      <EndScene name="End" {...SCENES.end} />
    </Track>
  </>
);
