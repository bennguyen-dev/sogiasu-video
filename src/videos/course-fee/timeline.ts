import { MODE_LENGTH, VOUCHER_LENGTH } from "../fee-common/scenes";
import { ADD_LENGTH } from "./scenes/AddScene";
import { LIST_LENGTH } from "./scenes/FeeScenes";

const PAPER = { backgroundColor: "#f8fafc" };
const MIST = { backgroundColor: "#f1f5f9" };
const INK = { backgroundColor: "#020618" };

// scene lengths in frames, in play order
const SCENE_LIST = [
  ["hook", 90, PAPER],
  ["mode", MODE_LENGTH, MIST],
  ["add", ADD_LENGTH, MIST],
  ["list", LIST_LENGTH, MIST],
  ["voucher", VOUCHER_LENGTH, MIST],
  ["end", 105, INK],
] as const;

type SceneKey = (typeof SCENE_LIST)[number][0];
type SceneTiming = {
  from: number;
  durationInFrames: number;
  style: { backgroundColor: string };
};

export const SCENES = Object.fromEntries(
  SCENE_LIST.map(([key, durationInFrames, style], i) => [
    key,
    {
      from: SCENE_LIST.slice(0, i).reduce((sum, [, d]) => sum + d, 0),
      durationInFrames,
      style,
    },
  ]),
) as Record<SceneKey, SceneTiming>;

export const COURSE_FEE_DURATION =
  SCENES.end.from + SCENES.end.durationInFrames;

export const END_IMPACT = SCENES.end.from + 16;
