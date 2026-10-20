import { interpolate } from "remotion";
import { clamp } from "../motion";

// a fingertip at (left, top) that ripples `since` frames after its tap (negative = not yet)
export const Finger = ({
  left,
  top,
  opacity,
  since,
}: {
  readonly left: number;
  readonly top: number;
  readonly opacity: number;
  readonly since: number;
}) => (
  <div style={{ position: "absolute", left, top, opacity, pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        width: 200,
        height: 200,
        left: -100,
        top: -100,
        borderRadius: "50%",
        border: "6px solid rgba(5,150,105,0.6)",
        opacity: since < 0 ? 0 : interpolate(since, [0, 16], [1, 0], clamp),
        scale: String(interpolate(since, [0, 16], [0.3, 1.1], clamp)),
      }}
    />
    <div
      style={{
        position: "absolute",
        width: 96,
        height: 96,
        left: -48,
        top: -48,
        borderRadius: "50%",
        background: "rgba(2,6,24,0.28)",
        border: "4px solid rgba(255,255,255,0.9)",
        boxShadow: "0 10px 30px rgba(2,6,24,0.25)",
        scale: String(interpolate(since, [0, 4, 10], [0.8, 0.8, 1], clamp)),
      }}
    />
  </div>
);
