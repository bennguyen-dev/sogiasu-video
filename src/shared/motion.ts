import { Easing } from "remotion";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const ease = Easing.bezier(0.65, 0, 0.35, 1);
