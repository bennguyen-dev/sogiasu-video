import type React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "../motion";
import { colors, fontFamily } from "../theme";

// the headline above a scene's UI: springs in at `from`, slides out over the 8 frames before `to`
export const Caption = ({
  children,
  from,
  to,
  fontSize = 84,
  inset = 70,
}: {
  readonly children: React.ReactNode;
  readonly from: number;
  readonly to: number;
  readonly fontSize?: number;
  readonly inset?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - from, fps, config: { damping: 200 } });
  const exit = interpolate(frame, [to - 8, to], [1, 0], clamp);

  return (
    <div
      style={{
        position: "absolute",
        top: 150,
        left: inset,
        right: inset,
        textAlign: "center",
        fontFamily,
        fontSize,
        fontWeight: 800,
        letterSpacing: "-0.035em",
        lineHeight: 1.08,
        color: colors.ink,
        opacity: enter * exit,
        translate: `0px ${(1 - enter) * 40 - (1 - exit) * 30}px`,
      }}
    >
      {children}
    </div>
  );
};
