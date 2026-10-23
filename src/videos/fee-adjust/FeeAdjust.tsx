import { Track } from "remotion";
import { MusicBed } from "../../shared/audio/MusicBed";
import { END_IMPACT, SCENES } from "./timeline";
import { EndScene, HookScene, VoucherScene } from "./scenes/IntroScenes";
import { DiscountScene } from "./scenes/DiscountScene";
import { OverrideScene } from "./scenes/OverrideScene";
import { OtherFeeScene } from "./scenes/OtherFeeScene";

// Tutorial 9 · Discount, a hand-set price, other fees: all three end up on one voucher
export const FeeAdjust = ({ music }: { readonly music: boolean }) => (
  <>
    {music ? (
      <MusicBed src="music/happy-upbeat-delosound.mp3" bpm={117.845} targetBpm={120} firstBeatFrame={64} volume={0.22} duckAt={[END_IMPACT]} />
    ) : null}
    <Track name="Scenes">
      <HookScene name="Hook" {...SCENES.hook} />
      <DiscountScene name="Discount" {...SCENES.discount} />
      <OverrideScene name="Override" {...SCENES.override} />
      <OtherFeeScene name="Other" {...SCENES.other} />
      <VoucherScene name="Voucher" {...SCENES.voucher} />
      <EndScene name="End" {...SCENES.end} />
    </Track>
  </>
);
