import { CLASS_LENGTH, STUDENTS_LENGTH } from "./scenes/LinkScenes";
import { REPORT_LENGTH } from "./scenes/ReportScenes";

const PAPER = { backgroundColor: "#f8fafc" };
const MIST = { backgroundColor: "#f1f5f9" };
const INK = { backgroundColor: "#020618" };

// scene lengths in frames, in play order
const SCENE_LIST = [
  ["hook", 90, PAPER],
  ["export", 150, MIST],
  ["zalo", 200, MIST],
  ["report", REPORT_LENGTH, MIST],
  ["class", CLASS_LENGTH, MIST],
  ["students", STUDENTS_LENGTH, MIST],
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

export const REPORT_DURATION = SCENES.end.from + SCENES.end.durationInFrames;

export const END_IMPACT = SCENES.end.from + 16;
