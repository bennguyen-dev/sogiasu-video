import type React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Bubble = ({
  children,
  mine,
  at,
  bare,
}: {
  readonly children: React.ReactNode;
  readonly mine?: boolean;
  readonly at: number;
  readonly bare?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - at,
    fps,
    config: { damping: 14, mass: 0.6 },
  });

  return (
    <div
      style={{
        alignSelf: mine ? "flex-end" : "flex-start",
        maxWidth: "82%",
        padding: bare ? 0 : "10px 13px",
        borderRadius: mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: bare ? "transparent" : mine ? "#dbeafe" : "white",
        color: colors.ink,
        fontSize: 14,
        lineHeight: 1.45,
        whiteSpace: "pre-line",
        boxShadow: bare ? "none" : "0 1px 2px rgba(2,6,24,0.08)",
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
        scale: String(0.6 + p * 0.4),
        transformOrigin: mine ? "bottom right" : "bottom left",
      }}
    >
      {children}
    </div>
  );
};

export const ChatHeader = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "14px 16px",
      background: "white",
      borderBottom: "1px solid #e2e8f0",
    }}
  >
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "#fde68a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: 700,
        color: "#92400e",
      }}
    >
      MH
    </div>
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: colors.ink }}>
        Mẹ Gia Hân
      </div>
      <div style={{ fontSize: 12, color: colors.muted }}>Vừa truy cập</div>
    </div>
  </div>
);
