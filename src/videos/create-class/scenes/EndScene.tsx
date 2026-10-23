import type React from "react";
import { Img, Interactive, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../../../shared/audio/sfx";
import { colors, fontFamily } from "../../../shared/theme";

const Pop = ({ children, at, style }: { readonly children: React.ReactNode; readonly at: number; readonly style?: React.CSSProperties }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 14, mass: 0.7 } });
  return <div style={{ opacity: interpolate(p, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }), scale: String(0.7 + p * 0.3), ...style }}>{children}</div>;
};

// the series' sign-off: what this episode did, and where the next one picks up
export const EndCard = ({
  episode,
  title,
  titleSize = 112,
  next,
}: {
  readonly episode: string;
  readonly title: React.ReactNode;
  readonly titleSize?: number;
  readonly next: { readonly episode: string; readonly title: string };
}) => {
  const frame = useCurrentFrame();
  const drift = frame / 30;

  return (
    <>
      <Sfx role="pop" at={2} volume={0.7} />
      <Sfx role="impact" at={16} volume={0.9} />
      <Sfx role="pop" at={34} volume={0.7} />
      <div style={{ position: "absolute", inset: 0, background: colors.ink }}>
        <div
          style={{
            position: "absolute",
            width: 800,
            height: 800,
            borderRadius: "50%",
            background: colors.emerald,
            filter: "blur(170px)",
            opacity: 0.45,
            left: -280 + Math.sin(drift) * 60,
            top: 260,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 840,
            height: 840,
            borderRadius: "50%",
            background: colors.sky,
            filter: "blur(170px)",
            opacity: 0.4,
            right: -320 + Math.cos(drift) * 60,
            bottom: 220,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 34,
          padding: "0 80px",
          fontFamily,
          textAlign: "center",
        }}
      >
        <Pop at={2}>
          <Img src={staticFile("logo.svg")} style={{ width: 140, height: 140, filter: "drop-shadow(0 30px 60px rgba(5,150,105,0.45))" }} />
        </Pop>
        <Pop at={8} style={{ fontSize: 52, fontWeight: 600, color: "#94a3b8" }}>
          {episode}
        </Pop>
        <Pop at={16} style={{ fontSize: titleSize, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05 }}>
          <span
            style={{
              backgroundImage: `linear-gradient(90deg, ${colors.emeraldSoft}, ${colors.skySoft})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {title}
          </span>
        </Pop>
        <Pop at={34} style={{ marginTop: 30 }}>
          <div
            style={{
              padding: "22px 40px",
              borderRadius: 36,
              background: "rgba(255,255,255,0.08)",
              border: "2px solid rgba(255,255,255,0.16)",
              color: "white",
            }}
          >
            <div style={{ fontSize: 38, fontWeight: 600, color: "#cbd5e1" }}>{next.episode}</div>
            <div style={{ fontSize: 60, fontWeight: 800, letterSpacing: "-0.02em" }}>{next.title} →</div>
          </div>
        </Pop>
        <Pop at={46} style={{ marginTop: 26 }}>
          <div
            style={{
              padding: "20px 56px",
              borderRadius: 999,
              background: "white",
              color: colors.ink,
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              boxShadow: "0 30px 80px rgba(16,185,129,0.35)",
            }}
          >
            sogiasu.com
          </div>
        </Pop>
      </div>
    </>
  );
};

const EndSceneInner = () => (
  <EndCard
    episode="Tập 1 · Tạo lớp đầu tiên"
    title={
      <>
        Xong lịch
        <br />
        cả tháng.
      </>
    }
    next={{ episode: "Tập 2", title: "Điểm danh buổi đầu tiên" }}
  />
);

export const EndScene = Interactive.create({
  Component: EndSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
