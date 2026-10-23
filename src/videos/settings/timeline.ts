import { HOOK_LENGTH, SUPPORT_LENGTH } from "./scenes/MenuScenes";
import { FILES_LENGTH } from "./scenes/FilesScene";
import { CONNECT_LENGTH, PROFILE_LENGTH } from "./scenes/PagesScenes";
import { BILLING_LENGTH } from "./scenes/BillingScene";

const MIST = { backgroundColor: "#f1f5f9" };
const INK = { backgroundColor: "#020618" };

// scene lengths in frames, in play order
const SCENE_LIST = [
  ["hook", HOOK_LENGTH, MIST],
  ["files", FILES_LENGTH, MIST],
  ["profile", PROFILE_LENGTH, MIST],
  ["connect", CONNECT_LENGTH, MIST],
  ["billing", BILLING_LENGTH, MIST],
  ["support", SUPPORT_LENGTH, MIST],
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

export const SETTINGS_DURATION = SCENES.end.from + SCENES.end.durationInFrames;

export const END_IMPACT = SCENES.end.from + 16;
