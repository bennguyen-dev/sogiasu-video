import type React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "../motion";
import { colors, fontFamily } from "../theme";

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

export const ChatHeader = ({ name, initials }: { readonly name: string; readonly initials: string }) => (
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
      {initials}
    </div>
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: colors.ink }}>
        {name}
      </div>
      <div style={{ fontSize: 12, color: colors.muted }}>Vừa truy cập</div>
    </div>
  </div>
);

export const ChatTime = ({ children }: { readonly children: string }) => (
  <div
    style={{
      alignSelf: "center",
      fontSize: 11,
      color: colors.muted,
      background: "rgba(255,255,255,0.7)",
      borderRadius: 999,
      padding: "2px 10px",
    }}
  >
    {children}
  </div>
);

// a Zalo thread filling its (positioned) parent: header, then the messages top-down
export const ZaloThread = ({
  name,
  initials,
  children,
}: {
  readonly name: string;
  readonly initials: string;
  readonly children: React.ReactNode;
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "#e2e8f0",
      display: "flex",
      flexDirection: "column",
      fontFamily,
    }}
  >
    <ChatHeader name={name} initials={initials} />
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "16px 12px" }}>{children}</div>
  </div>
);

const THUMB_W = 175;
const THUMB_MAX_H = 330;

// a chat photo at its own proportions: the html laid out at `width`, shrunk to the thumb, capped in height
export const HtmlThumb = ({ html, width, at }: { readonly html: string; readonly width: number; readonly at: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);
  useLayoutEffect(() => {
    const next = ref.current?.offsetHeight ?? 0;
    if (next !== h) setH(next);
  });
  const k = THUMB_W / width;
  return (
    <Bubble mine bare at={at}>
      <div
        style={{
          position: "relative",
          width: THUMB_W,
          height: Math.min(h * k, THUMB_MAX_H),
          overflow: "hidden",
          borderRadius: 12,
          background: "white",
          boxShadow: "0 1px 3px rgba(2,6,24,0.14)",
        }}
      >
        <div
          ref={ref}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width,
            scale: String(k),
            transformOrigin: "top left",
            whiteSpace: "normal",
            lineHeight: 1.5,
            ["--font-inter" as string]: fontFamily,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </Bubble>
  );
};
