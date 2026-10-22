import type React from "react";

// a phone in a 1080×1920 frame; its screen lays out at PHONE_W css px
export const PHONE_W = 390;

export type PhoneLayout = {
  // the screen's width in css px
  readonly width: number;
  readonly x: number;
  readonly y: number;
  readonly bezel: number;
  // frame px per css px of the screen
  readonly scale: number;
  // the screen's height in css px
  readonly screenH: number;
  // the body's height in frame px; past the frame's bottom edge means the phone is cropped there
  readonly height: number;
  readonly radius: number;
  readonly screenRadius: number;
};

const layout = (x: number, y: number, bezel: number, [radius, screenRadius]: [number, number], screenH?: number, width = PHONE_W): PhoneLayout => {
  const scale = (1080 - 2 * x - 2 * bezel) / width;
  const h = screenH ?? (1920 - y - bezel) / scale;
  return { width, x, y, bezel, scale, screenH: h, height: screenH ? h * scale + 2 * bezel : 1920, radius, screenRadius };
};

// the promo: a big phone rising out of the bottom edge, cropped there
export const INTRO_PHONE = layout(70, 430, 20, [88, 70]);

// the tutorial series: the whole phone at a real phone's proportions, under a compact caption; a 411 px screen
// (big Android), wide enough that the attendance stats don't wrap. Same body on the frame as at 390 (780 css tall)
const TUTORIAL_W = 411;
export const TUTORIAL_PHONE = layout(150, 285, 18, [74, 58], (780 * TUTORIAL_W) / PHONE_W, TUTORIAL_W);

export const PHONE_X = INTRO_PHONE.x;
export const PHONE_Y = INTRO_PHONE.y;
export const BEZEL = INTRO_PHONE.bezel;
export const PHONE_SCALE = INTRO_PHONE.scale;
export const SCREEN_H = INTRO_PHONE.screenH;

// `enter` 0 → 1 slides it up from below; `overlay` sits on the bezel, above the screen
export const PhoneFrame = ({
  enter,
  background = "#f8fafc",
  layout: l = INTRO_PHONE,
  children,
  overlay,
}: {
  readonly enter: number;
  readonly background?: string;
  readonly layout?: PhoneLayout;
  readonly children: React.ReactNode;
  readonly overlay?: React.ReactNode;
}) => (
  <div
    style={{
      position: "absolute",
      left: l.x,
      top: l.y,
      width: 1080 - 2 * l.x,
      height: l.height,
      translate: `0px ${(1 - enter) * 900}px`,
      borderRadius: l.radius,
      background: "#0f172a",
      padding: l.bezel,
      boxShadow: "0 40px 90px rgba(2,6,24,0.25)",
    }}
  >
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: l.screenRadius,
        overflow: "hidden",
        background,
      }}
    >
      {children}
    </div>
    {overlay}
  </div>
);
