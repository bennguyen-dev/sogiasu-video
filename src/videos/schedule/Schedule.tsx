import { Track } from "remotion";
import { MusicBed } from "../../shared/audio/MusicBed";
import { END_IMPACT, SCENES } from "./timeline";
import { CancelScene, EndScene, MakeupScene, SendScene } from "./scenes/ChangeScenes";
import { CardsScene, HookScene, WindowScene } from "./scenes/ViewScenes";

// Tutorial 5 · The weekly calendar: hours to fit, reading the cards, cancel + make-up, then send the week out
export const Schedule = ({ music }: { readonly music: boolean }) => (
  <>
    {music ? (
      <MusicBed src="music/happy-upbeat-delosound.mp3" bpm={117.845} targetBpm={120} firstBeatFrame={64} volume={0.22} duckAt={[END_IMPACT]} />
    ) : null}
    <Track name="Scenes">
      <HookScene name="Hook" {...SCENES.hook} />
      <WindowScene name="Window" {...SCENES.window} />
      <CardsScene name="Cards" {...SCENES.cards} />
      <CancelScene name="Cancel" {...SCENES.cancel} />
      <MakeupScene name="Makeup" {...SCENES.makeup} />
      <SendScene name="Send" {...SCENES.send} />
      <EndScene name="End" {...SCENES.end} />
    </Track>
  </>
);
