import type React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { Interactive, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fontFamily } from "../../../shared/theme";
import { Sfx } from "../../../shared/audio/sfx";
import { REPORT_HTML, VOUCHER_W, ZALO_VOUCHER_HTML } from "../../../shared/demo/voucher-data";
import { Bubble, ChatHeader } from "../../../shared/components/zalo-chat";

const PHONE_W = 390;
const PHONE_X = 70;
const PHONE_Y = 430;
const BEZEL = 20;
const S = (1080 - 2 * PHONE_X - 2 * BEZEL) / PHONE_W;
const SCREEN_H = (1920 - PHONE_Y - BEZEL) / S;

const VOUCHER_IN = 8;
const REPORT_IN = 14;
const TEXT_IN = 26;
const PAID = 96;
const THANKS = 150;

const THUMB_W = 170;
const THUMB_H = 240;
// the app renders the report table at this width (ReportTablePreview REPORT_TABLE_W)
const REPORT_W = 1100;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Caption = ({ children, from, to }: { readonly children: React.ReactNode; readonly from: number; readonly to: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - from, fps, config: { damping: 200 } });
  const exit = interpolate(frame, [to - 8, to], [1, 0], clamp);

  return (
    <div
      style={{
        position: "absolute",
        top: 150,
        left: 70,
        right: 70,
        textAlign: "center",
        fontFamily,
        fontSize: 84,
        fontWeight: 800,
        letterSpacing: "-0.035em",
        lineHeight: 1.08,
        color: colors.ink,
        opacity: enter * exit,
        translate: `0px ${(1 - enter) * 40 - (1 - exit) * 30}px`,
      }}
    >
      {children}
    </div>
  );
};

// a Zalo image thumbnail of the full-size export: the voucher fits whole (its QR is the point),
// the wide report table fills the tile and crops on the right, like Zalo's image grid
const Thumb = ({ html, width, at, fit }: { readonly html: string; readonly width: number; readonly at: number; readonly fit: "contain" | "cover" }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => setHeight(ref.current?.offsetHeight ?? 0), []);
  const k = !height ? THUMB_W / width : fit === "contain" ? Math.min(THUMB_W / width, THUMB_H / height) : Math.max(THUMB_W / width, THUMB_H / height);

  return (
    <Bubble mine bare at={at}>
      <div style={{ position: "relative", width: THUMB_W, height: THUMB_H, overflow: "hidden", borderRadius: 12, background: "white", boxShadow: "0 1px 3px rgba(2,6,24,0.12)" }}>
        <div
          ref={ref}
          style={{
            position: "absolute",
            left: fit === "contain" ? (THUMB_W - width * k) / 2 : 0,
            top: (THUMB_H - height * k) / 2,
            width,
            scale: String(k),
            transformOrigin: "top left",
            // the bubble's pre-line text style would turn the template's newlines into gaps
            whiteSpace: "normal",
            fontSize: 16,
            lineHeight: 1.5,
            ["--font-inter" as string]: fontFamily,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </Bubble>
  );
};

const ZaloSceneInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phoneIn = spring({ frame, fps, config: { damping: 200 } });

  return (
    <>
      <Sfx role="pop" at={VOUCHER_IN} volume={0.7} />
      <Sfx role="pop" at={REPORT_IN} volume={0.7} />
      <Sfx role="pop" at={TEXT_IN} volume={0.6} />
      <Sfx role="confirm" at={PAID} />
      <Sfx role="pop" at={THANKS} volume={0.6} />
      <Caption from={0} to={PAID}>
        Gửi phiếu thu
        <br />
        <span style={{ color: colors.sky }}>kèm báo cáo qua Zalo</span>
      </Caption>
      <Caption from={PAID} to={10_000}>
        Phụ huynh quét mã,
        <br />
        <span style={{ color: colors.emerald }}>chuyển khoản luôn</span>
      </Caption>

      <div
        style={{
          position: "absolute",
          left: PHONE_X,
          top: PHONE_Y,
          width: 1080 - 2 * PHONE_X,
          height: 1920,
          translate: `0px ${(1 - phoneIn) * 900}px`,
          borderRadius: 88,
          background: "#0f172a",
          padding: BEZEL,
          boxShadow: "0 40px 90px rgba(2,6,24,0.25)",
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 70, overflow: "hidden", background: "#eef2f7" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: PHONE_W,
              height: SCREEN_H,
              scale: String(S),
              transformOrigin: "top left",
              display: "flex",
              flexDirection: "column",
              fontFamily,
            }}
          >
            <ChatHeader />
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "18px 12px" }}>
              <div style={{ alignSelf: "center", fontSize: 11, color: colors.muted }}>20:15</div>
              <div style={{ alignSelf: "flex-end", display: "flex", gap: 6 }}>
                <Thumb html={ZALO_VOUCHER_HTML} width={VOUCHER_W} at={VOUCHER_IN} fit="contain" />
                <Thumb html={REPORT_HTML} width={REPORT_W} at={REPORT_IN} fit="cover" />
              </div>
              <Bubble mine at={TEXT_IN}>
                Em gửi học phí kèm báo cáo T9 của Gia Hân ạ, chị quét mã giúp em nha
              </Bubble>
              <Bubble at={PAID}>Chị chuyển rồi nha cô ✅</Bubble>
              <Bubble mine at={THANKS}>
                Dạ em nhận rồi ạ, em cảm ơn chị!
              </Bubble>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const ZaloScene = Interactive.create({
  Component: ZaloSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
