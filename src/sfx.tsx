import { Audio } from "@remotion/media";
import { staticFile, useVideoConfig } from "remotion";

// files in public/sfx/ (coldframe CC0 library, sources in public/sfx/LICENSE.md); peakMs from its library.json
const LIB = {
  "click-soft": { peakMs: [19, 8, 8] },
  "click-firm": { peakMs: [0, 0, 1] },
  tick: { peakMs: [1, 1] },
  key: { peakMs: [5, 7, 26, 17] },
  pop: { peakMs: [0, 0] },
  drop: { peakMs: [0, 0, 1] },
  confirm: { peakMs: [1, 0] },
  open: { peakMs: [240, 154] },
  whoosh: { peakMs: [49, 25] },
  "impact-soft": { peakMs: [5, 5] },
  impact: { peakMs: [6, 7, 16] },
} as const;

export type SfxRole = keyof typeof LIB;

// these swell into their peak, so the peak lands on `at` instead of the start
const PEAK_ALIGNED: SfxRole[] = ["whoosh", "open"];

export const Sfx = ({ role, at, volume = 1 }: { readonly role: SfxRole; readonly at: number; readonly volume?: number }) => {
  const { fps } = useVideoConfig();
  const { peakMs } = LIB[role];
  const i = at % peakMs.length;
  const rate = 1 + (((at * 7919) % 9) - 4) * 0.008;
  const shift = PEAK_ALIGNED.includes(role) ? Math.round(((peakMs[i] / 1000) * fps) / rate) : 0;
  return (
    <Audio
      name={`sfx ${role}`}
      from={Math.max(0, at - shift)}
      src={staticFile(`sfx/${role}-${i + 1}.wav`)}
      volume={volume}
      playbackRate={rate}
    />
  );
};

// one keystroke per ~2 typed characters
export const typingCues = (from: number, to: number, chars: number) => {
  const taps = Math.max(1, Math.round(chars / 2));
  return Array.from({ length: taps }, (_, k) => Math.round(from + ((to - from) * k) / taps));
};
