import { MODE_LENGTH } from "./scenes/IntroScenes";
import { CHECK_LENGTH, LIST_LENGTH } from "./scenes/FeeScenes";
import { RATE_LENGTH } from "./scenes/RateScene";

const PAPER = { backgroundColor: "#f8fafc" };
const MIST = { backgroundColor: "#f1f5f9" };
const INK = { backgroundColor: "#020618" };

// scene lengths in frames, in play order
const SCENE_LIST = [
  ["hook", 90, PAPER],
  ["mode", MODE_LENGTH, MIST],
  ["list", LIST_LENGTH, MIST],
  ["rate", RATE_LENGTH, MIST],
  ["check", CHECK_LENGTH, MIST],
  ["end", 105, INK],
] as const;

type SceneKey = (typeof SCENE_LIST)[number][0];
type SceneTiming = { from: number; durationInFrames: number; style: { backgroundColor: string } };

export const SCENES = Object.fromEntries(
  SCENE_LIST.map(([key, durationInFrames, style], i) => [
    key,
    { from: SCENE_LIST.slice(0, i).reduce((sum, [, d]) => sum + d, 0), durationInFrames, style },
  ]),
) as Record<SceneKey, SceneTiming>;

export const SESSION_FEE_DURATION = SCENES.end.from + SCENES.end.durationInFrames;

export const END_IMPACT = SCENES.end.from + 16;
