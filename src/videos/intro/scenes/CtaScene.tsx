import type React from "react";
import {
  Img,
  Interactive,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, fontFamily } from "../../../shared/theme";
import { Sfx } from "../../../shared/audio/sfx";

const Pop = ({
  children,
  at,
  style,
}: {
  readonly children: React.ReactNode;
  readonly at: number;
  readonly style?: React.CSSProperties;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - at,
    fps,
    config: { damping: 14, mass: 0.7 },
  });

  return (
    <div
      style={{
        opacity: interpolate(p, [0, 0.4], [0, 1], {
          extrapolateRight: "clamp",
        }),
        scale: String(0.7 + p * 0.3),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Gradient = ({ children }: { readonly children: React.ReactNode }) => (
  <span
    style={{
      backgroundImage: `linear-gradient(90deg, ${colors.emeraldSoft}, ${colors.skySoft})`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    }}
  >
    {children}
  </span>
);

const CtaSceneInner = () => {
  const frame = useCurrentFrame();
  const drift = frame / 30;

  return (
    <>
      <Sfx role="pop" at={2} volume={0.7} />
      <Sfx role="impact" at={18} />
      <Sfx role="pop" at={34} volume={0.7} />
      <Sfx role="pop" at={50} volume={0.7} />
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
          textAlign: "center",
        }}
      >
        <Pop at={2}>
          <Img
            src={staticFile("logo.svg")}
            style={{
              width: 140,
              height: 140,
              filter: "drop-shadow(0 30px 60px rgba(5,150,105,0.45))",
            }}
          />
        </Pop>
        <Pop
          at={8}
          style={{
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            color: "#cbd5e1",
          }}
        >
          Sổ tay, Excel,
          <br />
          tin nhắn chồng chất?
        </Pop>
        <Pop
          at={18}
          style={{
            fontSize: 120,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
          }}
        >
          <Gradient>Để Sổ Gia Sư lo.</Gradient>
        </Pop>
        <Pop at={34} style={{ marginTop: 30 }}>
          <div
            style={{
              padding: "28px 44px",
              borderRadius: 40,
              background: "rgba(255,255,255,0.08)",
              border: "2px solid rgba(255,255,255,0.16)",
              color: "white",
              fontSize: 52,
              whiteSpace: "nowrap",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.3,
            }}
          >
            8 học sinh đầu <Gradient>miễn phí</Gradient>
            <br />
            Đăng ký mới <Gradient>tặng Pro 30 ngày</Gradient>
          </div>
        </Pop>
        <Pop at={50} style={{ marginTop: 20 }}>
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
        <Pop
          at={60}
          style={{ fontSize: 38, fontWeight: 500, color: "#94a3b8" }}
        >
          Hơn 4.000 giáo viên · 100.000+ buổi học
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
