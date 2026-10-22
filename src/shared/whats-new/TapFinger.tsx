import { interpolate } from "remotion";
import { Finger } from "../components/Finger";
import { clamp, ease } from "../motion";
import { toFrame } from "./layout";

// a tap at app css (x, y) on frame `at`
export type Tap = { at: number; x: number; y: number };

// the fingertip glides into each tap and ripples on it, placed through the pan; gone after `hideAt`
export const TapFinger = ({
  frame,
  pan,
  taps,
  hideAt,
}: {
  readonly frame: number;
  readonly pan: number;
  readonly taps: Tap[];
  readonly hideAt: number;
}) => {
  if (taps.length === 0) return null;
  const leg = taps.findIndex((t) => frame < t.at);
  const to = taps[leg === -1 ? taps.length - 1 : leg];
  const prev = leg > 0 ? taps[leg - 1] : leg === -1 ? taps[taps.length - 1] : null;
  const from = prev && leg !== -1 ? prev : { x: to.x + 60, y: to.y + 90 };
  const move = interpolate(frame, [to.at - 16, to.at - 2], [0, 1], { ...clamp, easing: ease });
  const p = leg === -1 ? to : { x: from.x + (to.x - from.x) * move, y: from.y + (to.y - from.y) * move };
  const fadeIn = interpolate(frame, [taps[0].at - 22, taps[0].at - 12], [0, 1], clamp);
  const fadeOut = interpolate(frame, [hideAt, hideAt + 8], [1, 0], clamp);
  return <Finger {...toFrame(pan, p)} opacity={Math.min(fadeIn, fadeOut)} since={prev ? frame - prev.at : -1} />;
};
