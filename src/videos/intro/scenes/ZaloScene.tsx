import { Interactive, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../../../shared/audio/sfx";
import { Caption } from "../../../shared/components/Caption";
import { PHONE_SCALE, PHONE_W, PhoneFrame, SCREEN_H } from "../../../shared/components/Phone";
import { Bubble, ChatTime, HtmlThumb, ZaloThread } from "../../../shared/components/ZaloChat";
import { VOUCHER_W } from "../../../shared/demo/voucher-data";
import { colors, fontFamily } from "../../../shared/theme";
import { ZALO_REPORT_HTML, ZALO_VOUCHER_HTML } from "../data";

const VOUCHER_IN = 8;
const REPORT_IN = 14;
const TEXT_IN = 26;
const PAID = 96;
const THANKS = 150;

// the app renders the report table at this width (ReportTablePreview REPORT_TABLE_W)
const REPORT_W = 1100;

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

      <PhoneFrame enter={phoneIn} background="#e2e8f0">
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: PHONE_W,
              height: SCREEN_H,
              scale: String(PHONE_SCALE),
              transformOrigin: "top left",
            }}
          >
            <ZaloThread name="Mẹ Gia Hân" initials="MH">
              <ChatTime>20:15 · Thứ Tư 30/09</ChatTime>
              <div style={{ alignSelf: "flex-end", display: "flex", gap: 6, alignItems: "flex-start" }}>
                <HtmlThumb html={ZALO_VOUCHER_HTML} width={VOUCHER_W} at={VOUCHER_IN} />
                <HtmlThumb html={ZALO_REPORT_HTML} width={REPORT_W} at={REPORT_IN} />
              </div>
              <Bubble mine at={TEXT_IN}>
                Em gửi học phí kèm báo cáo T9 của Gia Hân ạ, chị quét mã giúp em nha
              </Bubble>
              <Bubble at={PAID}>Chị chuyển rồi nha cô ✅</Bubble>
              <Bubble mine at={THANKS}>
                Dạ em nhận rồi ạ, em cảm ơn chị!
              </Bubble>
            </ZaloThread>
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
