import { useLayoutEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { continueRender, delayRender, Interactive, interpolate, useCurrentFrame } from "remotion";
import FeesPage from "@/features/fee/pages/FeesPage";
import { QR_TEMPLATES } from "@/features/payment/lib/voucher-v2/registry";
import { useMockApi } from "../../../shared/app/AppProviders";
import { useDemoNow } from "../../../shared/app/frozen-clock";
import { Sfx } from "../../../shared/audio/sfx";
import { Bubble, ChatTime, HtmlThumb, ZaloThread } from "../../../shared/components/ZaloChat";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { clamp, ease } from "../../../shared/motion";
import { colors, fontFamily } from "../../../shared/theme";
import {
  AppScreen,
  newClient,
  SCREEN_H,
  SCREEN_W,
} from "../../../shared/tutorial/AppScreen";
import { CREATED_API } from "../../create-class/data";
import { FEES_API, MONTH_END, reportImageHtml, voucherView } from "../data";
import { VoucherDialog } from "../VoucherDialog";
import { FINAL_OPTIONS, scroller, voucherDialog } from "./FeeScenes";

const API = FEES_API(() => false);

// the finished voucher up front: autumn template, QR, 2.700.000đ, the tutor's note
const HookSceneInner = () => {
  useDemoNow(MONTH_END);
  useMockApi(API);
  const frame = useCurrentFrame();
  const pageRef = useRef<HTMLDivElement>(null);
  const [client] = useState(newClient);
  const form = useForm({ defaultValues: FINAL_OPTIONS });
  // the dialog mounts after the page: scroll it to the voucher once it's there, holding the frame till then
  useLayoutEffect(() => {
    const handle = delayRender("hook voucher");
    let tries = 0;
    const tick = () => {
      const doc = pageRef.current?.ownerDocument;
      const dialog = doc ? voucherDialog(doc) : null;
      const box = dialog ? scroller(dialog) : null;
      const voucher = dialog?.querySelector("[data-previews]")?.children[1];
      if (box && voucher) box.scrollTop = voucher.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - 8;
      if ((box && voucher) || ++tries > 120) continueRender(handle);
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);
  const zoom = interpolate(frame, [0, 90], [1.06, 1], {
    ...clamp,
    easing: ease,
  });

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.5} />
      <Sfx role="impact-soft" at={10} volume={0.8} />
      <StepCaption eyebrow="Thu học phí cuối tháng" from={-20}>
        <span style={{ color: colors.emerald }}>không cần bấm máy tính</span>
      </StepCaption>
      <div
        style={{
          position: "absolute",
          inset: 0,
          scale: String(zoom),
          transformOrigin: "540px 285px",
        }}
      >
        <AppScreen
          client={client}
          pathname="/dashboard/fees"
          scroll={0}
          pageRef={pageRef}
        >
          <FeesPage />
          <VoucherDialog open form={form} />
        </AppScreen>
      </div>
    </>
  );
};

const VOUCHER_HTML = QR_TEMPLATES.find((t) => t.id === "autumn")!.render(
  voucherView(FINAL_OPTIONS),
);
// the app renders the report table at this width (ReportTablePreview REPORT_TABLE_W)
const REPORT_W = 1100;
const VOUCHER_W = 440;
const REPLY = 64;
export const ZALO_LENGTH = 120;

// the share sheet lands in Zalo: voucher + report, and the parent pays
const ZaloSceneInner = () => {
  useDemoNow(MONTH_END);
  useMockApi(CREATED_API);
  const pageRef = useRef<HTMLDivElement>(null);
  const [client] = useState(newClient);

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="pop" at={8} volume={0.7} />
      <Sfx role="pop" at={14} volume={0.7} />
      <Sfx role="pop" at={26} volume={0.6} />
      <Sfx role="confirm" at={REPLY} volume={0.9} />
      <StepCaption eyebrow="Gửi qua Zalo" from={0} to={REPLY}>
        <span style={{ color: colors.emerald }}>Phụ huynh quét mã</span>
      </StepCaption>
      <StepCaption eyebrow="Phụ huynh" from={REPLY}>
        <span style={{ color: colors.emerald }}>chuyển khoản luôn</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/fees"
        scroll={0}
        pageRef={pageRef}
      >
        <div style={{ position: "relative", width: SCREEN_W, height: SCREEN_H }}>
          <ZaloThread name="Mẹ Minh Anh" initials="MM">
            <ChatTime>20:05 · Thứ Bảy 31/10</ChatTime>
            <div style={{ alignSelf: "flex-end", display: "flex", gap: 6, alignItems: "flex-start" }}>
              <HtmlThumb html={VOUCHER_HTML} width={VOUCHER_W} at={8} />
              <HtmlThumb html={reportImageHtml("autumn")} width={REPORT_W} at={14} />
            </div>
            <Bubble mine at={26}>
              Em gửi học phí tháng 10 của Minh Anh ạ, chị quét mã giúp em nha
            </Bubble>
            <Bubble at={REPLY}>Chị chuyển rồi nha cô</Bubble>
          </ZaloThread>
        </div>
      </AppScreen>
    </>
  );
};

const schema = { ...Interactive.backgroundSchema };
export const HookScene = Interactive.create({
  Component: HookSceneInner,
  layout: "absolute-fill",
  schema,
});
export const ZaloScene = Interactive.create({
  Component: ZaloSceneInner,
  layout: "absolute-fill",
  schema,
});
