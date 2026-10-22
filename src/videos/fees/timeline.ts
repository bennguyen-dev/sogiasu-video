import { COLLECT_LENGTH, FEES_LENGTH, HISTORY_LENGTH, VOUCHER_LENGTH } from "./scenes/FeeScenes";
import { ZALO_LENGTH } from "./scenes/SendScenes";

const PAPER = { backgroundColor: "#f8fafc" };
const MIST = { backgroundColor: "#f1f5f9" };
const INK = { backgroundColor: "#020618" };

// scene lengths in frames, in play order
const SCENE_LIST = [
  ["hook", 90, PAPER],
  ["fees", FEES_LENGTH, MIST],
  ["voucher", VOUCHER_LENGTH, MIST],
  ["zalo", ZALO_LENGTH, MIST],
  ["collect", COLLECT_LENGTH, MIST],
  ["history", HISTORY_LENGTH, MIST],
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

export const FEES_DURATION = SCENES.end.from + SCENES.end.durationInFrames;

export const END_IMPACT = SCENES.end.from + 16;
