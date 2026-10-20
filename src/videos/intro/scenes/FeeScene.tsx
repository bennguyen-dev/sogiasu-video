import { useEffect, useRef, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import {
  continueRender,
  delayRender,
  Interactive,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import FeeList from "@/features/fee/components/FeeList";
import { AppProviders } from "../../../shared/app/AppProviders";
import { PhoneViewport } from "../../../shared/app/PhoneViewport";
import { useDemoNow } from "../../../shared/app/frozen-clock";
import { SEPT_END } from "../../../shared/demo/september-data";
import { Sfx } from "../../../shared/audio/sfx";
import { Caption } from "../../../shared/components/Caption";
import { Finger } from "../../../shared/components/Finger";
import { BEZEL, PHONE_SCALE as S, PHONE_W, PHONE_X, PHONE_Y, PhoneFrame, SCREEN_H } from "../../../shared/components/Phone";
import { clamp, ease } from "../../../shared/motion";
import { colors } from "../../../shared/theme";

const RING_TOTAL = 18;
const TO_CARD = [52, 80] as const;
const RING_CARD = 84;
const TAP_VOUCHER = 118;


type Box = { x: number; y: number; w: number; h: number };
type Targets = { total: Box; card: Box; voucher: Box };

const findTargets = (root: HTMLElement): Targets | null => {
  const r = root.getBoundingClientRect();
  if (!r.width) return null;
  const k = r.width / PHONE_W;
  const box = (el: Element | null | undefined): Box | null => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: (b.left - r.left) / k, y: (b.top - r.top) / k, w: b.width / k, h: b.height / k };
  };
  const label = [...root.querySelectorAll("span, p, div")].find((el) => el.childElementCount === 0 && el.textContent?.trim() === "Học phí chưa thu:");
  const card = [...root.querySelectorAll('[data-slot="card"]')].find((el) => el.textContent?.includes("Gia Hân"));
  const voucher = card ? [...card.querySelectorAll("button")].find((b) => b.textContent?.includes("Tạo phiếu học phí")) : null;
  const total = label?.parentElement?.parentElement ?? label?.parentElement;
  const t = { total: box(total), card: box(card), voucher: box(voucher) };
  return t.total && t.card && t.voucher ? (t as Targets) : null;
};

const FeeSceneInner = () => {
  useDemoNow(SEPT_END);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const uiRef = useRef<HTMLDivElement>(null);
  const [t, setT] = useState<Targets | null>(null);
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } }));

  useEffect(() => {
    const handle = delayRender("measure fee targets");
    let last = "";
    let tries = 0;
    let raf = 0;
    const tick = () => {
      const next = uiRef.current ? findTargets(uiRef.current) : null;
      const key = JSON.stringify(next);
      if ((next && key === last) || ++tries > 150) {
        setT(next);
        continueRender(handle);
        return;
      }
      last = key;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const phoneIn = spring({ frame, fps, config: { damping: 200 } });
  const cardScroll = t ? Math.max(0, t.card.y - 16) : 0;
  const scroll = interpolate(frame, [...TO_CARD], [0, cardScroll], { ...clamp, easing: ease });
  const ring = (at: number) => spring({ frame: frame - at, fps, config: { damping: 14 } });
  const totalRing = ring(RING_TOTAL) * interpolate(frame, [TO_CARD[0] - 6, TO_CARD[0]], [1, 0], clamp);
  const cardRing = ring(RING_CARD);
  const since = frame - TAP_VOUCHER;
  const fingerIn = interpolate(frame, [TAP_VOUCHER - 18, TAP_VOUCHER - 4], [0, 1], { ...clamp, easing: ease });
  const onScreen = (b: Box) => ({
    left: BEZEL + b.x * S,
    top: BEZEL + (b.y - scroll) * S,
    width: b.w * S,
    height: b.h * S,
  });

  return (
    <>
      <Sfx role="pop" at={RING_TOTAL} volume={0.7} />
      <Sfx role="pop" at={RING_CARD} volume={0.7} />
      <Sfx role="click-firm" at={TAP_VOUCHER} />
      <Caption from={0} to={TO_CARD[1]} fontSize={86}>
        Học phí
        <br />
        <span style={{ color: colors.emerald }}>tự cộng sẵn</span>
      </Caption>
      <Caption from={TO_CARD[1]} to={10_000} fontSize={86}>
        Không cần
        <br />
        <span style={{ color: colors.emerald }}>bấm máy tính</span>
      </Caption>

      <PhoneFrame
        enter={phoneIn}
        overlay={
          t ? (
          <>
            <div
              style={{
                position: "absolute",
                ...onScreen(t.total),
                borderRadius: 24,
                border: "7px solid #f59e0b",
                boxShadow: "0 0 0 12px rgba(245,158,11,0.18)",
                opacity: totalRing,
                scale: String(1.08 - totalRing * 0.08),
              }}
            />
            <div
              style={{
                position: "absolute",
                ...onScreen(t.card),
                borderRadius: 34,
                border: "7px solid #10b981",
                boxShadow: "0 0 0 14px rgba(16,185,129,0.18)",
                opacity: cardRing,
                scale: String(1.04 - cardRing * 0.04),
              }}
            />
          </>
          ) : null
        }
      >
          <div style={{ position: "absolute", left: 0, top: 0, width: PHONE_W, scale: String(S), transformOrigin: "top left" }}>
            <PhoneViewport width={PHONE_W} height={SCREEN_H}>
              <AppProviders client={client}>
                <div ref={uiRef} className="min-h-[1200px] bg-muted/40 p-3" style={{ position: "absolute", left: 0, right: 0, top: -scroll }}>
                  <FeeList />
                </div>
              </AppProviders>
            </PhoneViewport>
          </div>
      </PhoneFrame>

      {t ? (
        <Finger
          left={PHONE_X + onScreen(t.voucher).left + onScreen(t.voucher).width / 2}
          top={PHONE_Y + onScreen(t.voucher).top + onScreen(t.voucher).height / 2 + (1 - fingerIn) * 220}
          opacity={fingerIn}
          since={since}
        />
      ) : null}
    </>
  );
};

export const FeeScene = Interactive.create({
  Component: FeeSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
