import type React from "react";
import { interpolate } from "remotion";
import { PHONE_W } from "../components/Phone";
import { clamp } from "../motion";
import { colors, fontFamily } from "../theme";
import type { Box } from "../tutorial/AppScreen";
import { PHONE, S, toFrame } from "./layout";

// a ring on the phone around `box` (app css px) with a dark bubble explaining it — the series'
// Explain, placed through the pan; fades in at `from`, out by `to`
export const Explain = ({
  frame,
  from,
  to,
  pan,
  box,
  side,
  children,
}: {
  readonly frame: number;
  readonly from: number;
  readonly to: number;
  readonly pan: number;
  readonly box: Box | null | undefined;
  readonly side: "above" | "below";
  readonly children: React.ReactNode;
}) => {
  if (!box || frame < from || frame > to) return null;
  const opacity = interpolate(frame, [from, from + 8, to - 8, to], [0, 1, 1, 0], clamp);
  const pad = 6;
  const tl = toFrame(pan, { x: box.x - pad, y: box.y - pad });
  const w = (box.w + 2 * pad) * S;
  const h = (box.h + 2 * pad) * S;
  const screenLeft = PHONE.x + PHONE.bezel + 14 * S;
  const bubbleW = (PHONE_W - 28) * S;
  const arrowX = Math.min(Math.max(tl.left + w / 2 - screenLeft, 40), bubbleW - 40);
  const below = side === "below";
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: tl.left,
          top: tl.top,
          width: w,
          height: h,
          borderRadius: 22,
          border: `7px solid ${colors.emerald}`,
          boxShadow: `0 0 0 14px ${colors.emerald}2e`,
          opacity,
          scale: String(1.12 - opacity * 0.12),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: screenLeft,
          width: bubbleW,
          top: below ? tl.top + h + 22 : tl.top - 22,
          transform: below ? undefined : "translateY(-100%)",
          translate: `0px ${below ? (1 - opacity) * 16 : (1 - opacity) * -16}px`,
          opacity,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: arrowX - 16,
            [below ? "top" : "bottom"]: -14,
            width: 32,
            height: 32,
            rotate: "45deg",
            borderRadius: 6,
            background: colors.ink,
          }}
        />
        <div
          style={{
            position: "relative",
            padding: "22px 30px",
            borderRadius: 26,
            background: colors.ink,
            color: "white",
            fontFamily,
            fontSize: 36,
            fontWeight: 600,
            lineHeight: 1.3,
            boxShadow: "0 24px 50px rgba(2,6,24,0.3)",
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
};
