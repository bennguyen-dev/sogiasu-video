import type React from "react";
import { Easing, Img, Interactive, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fontFamily } from "./theme";
import { Sfx } from "./sfx";

const Rise = ({ children, at, style }: { readonly children: React.ReactNode; readonly at: number; readonly style?: React.CSSProperties }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 200 } });

  return (
    <div style={{ fontFamily, textAlign: "center", opacity: p, translate: `0px ${(1 - p) * 50}px`, ...style }}>
      {children}
    </div>
  );
};

const LogoSceneInner = () => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const logo = spring({ frame: frame - 6, fps, config: { damping: 10, mass: 0.7 } });
  const drift = frame / 30;

  return (
    <>
      <Sfx role="whoosh" at={8} volume={0.8} />
      <Sfx role="impact-soft" at={10} volume={0.9} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: colors.ink,
          clipPath: `circle(${interpolate(frame, [0, 18], [0, height], {
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          })}px at 50% 50%)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 760,
            height: 760,
            borderRadius: "50%",
            background: colors.emerald,
            filter: "blur(160px)",
            opacity: 0.45,
            left: -260 + Math.sin(drift) * 60,
            top: 380,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 820,
            height: 820,
            borderRadius: "50%",
            background: colors.sky,
            filter: "blur(170px)",
            opacity: 0.4,
            right: -300 + Math.cos(drift) * 60,
            bottom: 300,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 80px",
        }}
      >
        <Img
          src={staticFile("logo.svg")}
          style={{
            width: 300,
            height: 300,
            scale: String(logo),
            rotate: `${(1 - logo) * -25}deg`,
            filter: "drop-shadow(0 30px 60px rgba(5,150,105,0.45))",
          }}
        />
        <Rise at={20} style={{ marginTop: 64, fontSize: 132, fontWeight: 800, letterSpacing: "-0.04em", color: "white" }}>
          Sổ Gia Sư
        </Rise>
        <Rise at={36} style={{ marginTop: 36, fontSize: 60, fontWeight: 600, lineHeight: 1.3, color: "#cbd5e1" }}>
          Dạy thêm gọn gàng,
          <br />
          <span
            style={{
              backgroundImage: `linear-gradient(90deg, ${colors.emeraldSoft}, ${colors.skySoft})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            học phí rõ ràng.
          </span>
        </Rise>
      </div>
    </>
  );
};

export const LogoScene = Interactive.create({
  Component: LogoSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
