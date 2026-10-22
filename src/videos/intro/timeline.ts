const PAPER = { backgroundColor: "#f8fafc" };
const MIST = { backgroundColor: "#f1f5f9" };
const INK = { backgroundColor: "#020618" };

// scene lengths in frames, in play order; at 120 bpm a beat is 15 frames, so keep each a multiple of 15
const SCENE_LIST = [
  ["hook", 120, PAPER],
  ["logo", 90, PAPER],
  ["calendar", 150, MIST],
  ["attendance", 240, MIST],
  ["report", 210, MIST],
  ["chapter", 45, PAPER],
  ["grid", 135, MIST],
  ["fee", 150, MIST],
  ["voucher", 150, MIST],
  ["zalo", 210, MIST],
  ["analytics", 150, MIST],
  ["cta", 150, INK],
] as const;

type SceneKey = (typeof SCENE_LIST)[number][0];
type SceneTiming = { from: number; durationInFrames: number; style: { backgroundColor: string } };

export const SCENES = Object.fromEntries(
  SCENE_LIST.map(([key, durationInFrames, style], i) => [
    key,
    { from: SCENE_LIST.slice(0, i).reduce((sum, [, d]) => sum + d, 0), durationInFrames, style },
  ]),
) as Record<SceneKey, SceneTiming>;

export const INTRO_DURATION = SCENES.cta.from + SCENES.cta.durationInFrames;

// CtaScene lands its impact 18 frames in; the music bed dips just before it
export const CTA_IMPACT = SCENES.cta.from + 18;
