import type React from "react";

// a phone filling the lower part of a 1080×1920 frame; its screen lays out at PHONE_W css px
export const PHONE_W = 390;
export const PHONE_X = 70;
export const PHONE_Y = 430;
export const BEZEL = 20;
export const PHONE_SCALE = (1080 - 2 * PHONE_X - 2 * BEZEL) / PHONE_W;
export const SCREEN_H = (1920 - PHONE_Y - BEZEL) / PHONE_SCALE;

// `enter` 0 → 1 slides it up from below; `overlay` sits on the bezel, above the screen
export const PhoneFrame = ({
  enter,
  background = "#f8fafc",
  children,
  overlay,
}: {
  readonly enter: number;
  readonly background?: string;
  readonly children: React.ReactNode;
  readonly overlay?: React.ReactNode;
}) => (
  <div
    style={{
      position: "absolute",
      left: PHONE_X,
      top: PHONE_Y,
      width: 1080 - 2 * PHONE_X,
      height: 1920,
      translate: `0px ${(1 - enter) * 900}px`,
      borderRadius: 88,
      background: "#0f172a",
      padding: BEZEL,
      boxShadow: "0 40px 90px rgba(2,6,24,0.25)",
    }}
  >
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 70,
        overflow: "hidden",
        background,
      }}
    >
      {children}
    </div>
    {overlay}
  </div>
);
