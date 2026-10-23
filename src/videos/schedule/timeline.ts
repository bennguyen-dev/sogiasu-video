import { CANCEL_LENGTH, MAKEUP_LENGTH, SHARE_LENGTH } from "./scenes/ChangeScenes";
import { CARDS_LENGTH, WINDOW_LENGTH } from "./scenes/ViewScenes";

const PAPER = { backgroundColor: "#f8fafc" };
const MIST = { backgroundColor: "#f1f5f9" };
const INK = { backgroundColor: "#020618" };

// scene lengths in frames, in play order
const SCENE_LIST = [
  ["hook", 90, PAPER],
  ["window", WINDOW_LENGTH, MIST],
  ["cards", CARDS_LENGTH, MIST],
  ["cancel", CANCEL_LENGTH, MIST],
  ["makeup", MAKEUP_LENGTH, MIST],
  ["send", SHARE_LENGTH, MIST],
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

export const SCHEDULE_DURATION = SCENES.end.from + SCENES.end.durationInFrames;

export const END_IMPACT = SCENES.end.from + 16;
