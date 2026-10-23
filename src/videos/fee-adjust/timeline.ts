import { VOUCHER_LENGTH } from "../fee-common/scenes";
import { DISCOUNT_LENGTH } from "./scenes/DiscountScene";
import { OVERRIDE_LENGTH } from "./scenes/OverrideScene";
import { OTHER_LENGTH } from "./scenes/OtherFeeScene";

const PAPER = { backgroundColor: "#f8fafc" };
const MIST = { backgroundColor: "#f1f5f9" };
const INK = { backgroundColor: "#020618" };

// scene lengths in frames, in play order
const SCENE_LIST = [
  ["hook", 90, PAPER],
  ["discount", DISCOUNT_LENGTH, MIST],
  ["override", OVERRIDE_LENGTH, MIST],
  ["other", OTHER_LENGTH, MIST],
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

export const FEE_ADJUST_DURATION =
  SCENES.end.from + SCENES.end.durationInFrames;

export const END_IMPACT = SCENES.end.from + 16;
