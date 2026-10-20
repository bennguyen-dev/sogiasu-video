import { useLayoutEffect, useRef, useState } from "react";
import { Interactive, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../../../shared/audio/sfx";
import { Caption } from "../../../shared/components/Caption";
import { PHONE_SCALE, PHONE_W, PhoneFrame, SCREEN_H } from "../../../shared/components/Phone";
import { Bubble, ChatHeader } from "../../../shared/components/ZaloChat";
import { VOUCHER_W } from "../../../shared/demo/voucher-data";
import { colors, fontFamily } from "../../../shared/theme";
import { ZALO_REPORT_HTML, ZALO_VOUCHER_HTML } from "../data";

const VOUCHER_IN = 8;
const REPORT_IN = 14;
const TEXT_IN = 26;
const PAID = 96;
const THANKS = 150;

const THUMB_W = 170;
const THUMB_H = 240;
// the app renders the report table at this width (ReportTablePreview REPORT_TABLE_W)
const REPORT_W = 1100;

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

      <PhoneFrame enter={phoneIn} background="#eef2f7">
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: PHONE_W,
              height: SCREEN_H,
              scale: String(PHONE_SCALE),
              transformOrigin: "top left",
              display: "flex",
              flexDirection: "column",
              fontFamily,
            }}
          >
            <ChatHeader name="Mẹ Gia Hân" initials="MH" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "18px 12px" }}>
              <div style={{ alignSelf: "center", fontSize: 11, color: colors.muted }}>20:15</div>
              <div style={{ alignSelf: "flex-end", display: "flex", gap: 6 }}>
                <Thumb html={ZALO_VOUCHER_HTML} width={VOUCHER_W} at={VOUCHER_IN} fit="contain" />
                <Thumb html={ZALO_REPORT_HTML} width={REPORT_W} at={REPORT_IN} fit="cover" />
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
      </PhoneFrame>
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
