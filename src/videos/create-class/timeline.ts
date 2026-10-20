const PAPER = { backgroundColor: "#f8fafc" };
const MIST = { backgroundColor: "#f1f5f9" };
const INK = { backgroundColor: "#020618" };

// scene lengths in frames, in play order; each scene ends a few frames after its last tap, so the cut is the tap's result
const SCENE_LIST = [
  ["hook", 90, PAPER],
  ["classes", 66, MIST],
  ["info", 530, MIST],
  ["students", 575, MIST],
  ["schedule", 528, MIST],
  ["week", 66, MIST],
  ["month", 120, MIST],
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

export const CREATE_CLASS_DURATION = SCENES.end.from + SCENES.end.durationInFrames;

// the end card lands its impact 16 frames in; the music bed dips just before it
export const END_IMPACT = SCENES.end.from + 16;
