import { Audio } from "@remotion/media";
import { interpolate, staticFile, useVideoConfig } from "remotion";
import { clamp } from "../motion";

// a music bed retimed from its own `bpm` to `targetBpm` (pick one whose beat is a whole number of
// frames, e.g. 120 bpm = 15 frames at 30 fps) and started on its first beat; it fades in and out
// and dips around each frame in `duckAt` (a big hit, a voiceover line)
export const MusicBed = ({
  src,
  bpm,
  targetBpm,
  firstBeatFrame,
  volume,
  duckAt = [],
  duckTo = 0.35,
  fadeIn = 8,
  fadeOut = 60,
}: {
  readonly src: string;
  readonly bpm: number;
  readonly targetBpm: number;
  readonly firstBeatFrame: number;
  readonly volume: number;
  readonly duckAt?: number[];
  readonly duckTo?: number;
  readonly fadeIn?: number;
  readonly fadeOut?: number;
}) => {
  const { durationInFrames } = useVideoConfig();
  return (
    <Audio
      name="Music"
      src={staticFile(src)}
      trimBefore={firstBeatFrame}
      playbackRate={targetBpm / bpm}
      volume={(f) =>
        volume *
        Math.min(
          interpolate(f, [0, fadeIn], [0, 1], clamp),
          interpolate(f, [durationInFrames - fadeOut, durationInFrames], [1, 0], clamp),
        ) *
        duckAt.reduce((v, at) => v * interpolate(f, [at - 8, at - 2, at + 10, at + 30], [1, duckTo, duckTo, 1], clamp), 1)
      }
    />
  );
};
