import { Track } from "remotion";
import { MusicBed } from "../../shared/audio/MusicBed";
import { END_IMPACT, SCENES } from "./timeline";
import { HookScene, SupportScene } from "./scenes/MenuScenes";
import { FilesScene } from "./scenes/FilesScene";
import { ConnectScene, ProfileScene } from "./scenes/PagesScenes";
import { BillingScene } from "./scenes/BillingScene";
import { EndScene } from "./scenes/EndScene";

// Tutorial 12 · Settings and connections: a round of the "Khác" tab, the last of the series
export const Settings = ({ music }: { readonly music: boolean }) => (
  <>
    {music ? (
      <MusicBed src="music/happy-upbeat-delosound.mp3" bpm={117.845} targetBpm={120} firstBeatFrame={64} volume={0.22} duckAt={[END_IMPACT]} />
    ) : null}
    <Track name="Scenes">
      <HookScene name="Hook" {...SCENES.hook} />
      <FilesScene name="Files" {...SCENES.files} />
      <ProfileScene name="Profile" {...SCENES.profile} />
      <ConnectScene name="Connect" {...SCENES.connect} />
      <BillingScene name="Billing" {...SCENES.billing} />
      <SupportScene name="Support" {...SCENES.support} />
      <EndScene name="End" {...SCENES.end} />
    </Track>
  </>
);
