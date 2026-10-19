import { Interactive, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fontFamily } from "./theme";

// echoes the hook's first line, now as the turn into the month-end half of the video
const ChapterSceneInner = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const title = spring({ frame: frame - 2, fps, config: { damping: 14 } });
  const sub = spring({ frame: frame - 14, fps, config: { damping: 200 } });
  const exit = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          backgroundImage: `radial-gradient(circle at 2px 2px, ${colors.ink} 2px, transparent 0)`,
          backgroundSize: "44px 44px",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 28,
          fontFamily,
          opacity: exit,
        }}
      >
        <div
          style={{
            fontSize: 150,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: colors.ink,
            opacity: interpolate(title, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
            translate: `0px ${(1 - title) * 60}px`,
          }}
        >
          Cuối tháng.
        </div>
        <div style={{ fontSize: 56, fontWeight: 600, color: colors.muted, opacity: sub, translate: `0px ${(1 - sub) * 30}px` }}>
          Chốt sổ tháng 9
        </div>
      </div>
    </>
  );
};

export const ChapterScene = Interactive.create({
  Component: ChapterSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
