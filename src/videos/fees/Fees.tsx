import { Track } from "remotion";
import { MusicBed } from "../../shared/audio/MusicBed";
import { END_IMPACT, SCENES } from "./timeline";
import { CollectScene, EndScene, FeesScene, HistoryScene, VoucherScene } from "./scenes/FeeScenes";
import { HookScene, ZaloScene } from "./scenes/SendScenes";

// Tutorial 4 · Month-end fees: the sum is ready, a QR voucher, then one tap once the money is in
export const Fees = ({ music }: { readonly music: boolean }) => (
  <>
    {music ? (
      <MusicBed src="music/happy-upbeat-delosound.mp3" bpm={117.845} targetBpm={120} firstBeatFrame={64} volume={0.22} duckAt={[END_IMPACT]} />
    ) : null}
    <Track name="Scenes">
      <HookScene name="Hook" {...SCENES.hook} />
      <FeesScene name="Fees" {...SCENES.fees} />
      <VoucherScene name="Voucher" {...SCENES.voucher} />
      <ZaloScene name="Zalo" {...SCENES.zalo} />
      <CollectScene name="Collect" {...SCENES.collect} />
      <HistoryScene name="History" {...SCENES.history} />
      <EndScene name="End" {...SCENES.end} />
    </Track>
  </>
);
