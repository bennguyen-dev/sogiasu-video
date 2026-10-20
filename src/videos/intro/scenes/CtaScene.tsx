import type React from "react";
import { Img, Interactive, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fontFamily } from "../../../shared/theme";
import { Sfx } from "../../../shared/audio/sfx";

const Pop = ({ children, at, style }: { readonly children: React.ReactNode; readonly at: number; readonly style?: React.CSSProperties }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 14, mass: 0.7 } });

  return <div style={{ opacity: interpolate(p, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }), scale: String(0.7 + p * 0.3), ...style }}>{children}</div>;
};

const Chip = ({ children, at }: { readonly children: React.ReactNode; readonly at: number }) => (
  <Pop at={at}>
    <div
      style={{
        padding: "18px 34px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.08)",
        border: "2px solid rgba(255,255,255,0.16)",
        color: "#e2e8f0",
        fontSize: 40,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  </Pop>
);

const CtaSceneInner = () => {
  const frame = useCurrentFrame();
  const drift = frame / 30;

  return (
    <>
      <Sfx role="pop" at={2} volume={0.7} />
      <Sfx role="impact" at={18} />
      <Sfx role="pop" at={38} volume={0.7} />
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
          gap: 30,
          padding: "0 80px",
          fontFamily,
        }}
      >
        <Pop at={2}>
          <Img src={staticFile("logo.svg")} style={{ width: 150, height: 150, filter: "drop-shadow(0 30px 60px rgba(5,150,105,0.45))" }} />
        </Pop>
        <Pop at={8} style={{ textAlign: "center", fontSize: 76, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, color: "#cbd5e1" }}>
          Sổ tay, Excel,
          <br />
          tin nhắn chồng chất?
        </Pop>
        <Pop at={18} style={{ textAlign: "center", fontSize: 124, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05 }}>
          <span
            style={{
              backgroundImage: `linear-gradient(90deg, ${colors.emeraldSoft}, ${colors.skySoft})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Để Sổ Gia Sư lo.
          </span>
        </Pop>
        <Pop at={28} style={{ textAlign: "center", fontSize: 50, fontWeight: 600, lineHeight: 1.3, color: "white" }}>
          Tập trung vào giảng dạy -
          <br />
          quản lý nhẹ nhàng
        </Pop>
        <Pop at={38} style={{ marginTop: 24 }}>
          <div
            style={{
              padding: "24px 60px",
              borderRadius: 999,
              background: "white",
              color: colors.ink,
              fontSize: 84,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              boxShadow: "0 30px 80px rgba(16,185,129,0.35)",
            }}
          >
            sogiasu.com
          </div>
        </Pop>
        <div style={{ marginTop: 28 }}>
          <Chip at={50}>Sử dụng và đồng bộ dữ liệu trên mọi thiết bị</Chip>
        </div>
        <Pop at={60} style={{ textAlign: "center", fontSize: 38, fontWeight: 500, lineHeight: 1.4, color: "#94a3b8" }}>
          Hơn 4.000 giáo viên đã sử dụng,
          <br />
          quản lý hơn 100.000 buổi học
        </Pop>
      </div>
    </>
  );
};

export const CtaScene = Interactive.create({
  Component: CtaSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
