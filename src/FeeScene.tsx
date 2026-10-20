import type React from "react";
import { useEffect, useRef, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import {
  continueRender,
  delayRender,
  Easing,
  Interactive,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import FeeList from "@/features/fee/components/FeeList";
import { AppProviders } from "./app-ui/AppProviders";
import { PhoneViewport } from "./app-ui/PhoneViewport";
import { useDemoNow } from "./app-ui/frozen-clock";
import { SEPT_END } from "./app-ui/september-data";
import { colors, fontFamily } from "./theme";
import { Sfx } from "./sfx";

const PHONE_W = 390;
const PHONE_X = 70;
const PHONE_Y = 430;
const BEZEL = 20;
const S = (1080 - 2 * PHONE_X - 2 * BEZEL) / PHONE_W;
const SCREEN_H = (1920 - PHONE_Y - BEZEL) / S;

const RING_TOTAL = 18;
const TO_CARD = [52, 80] as const;
const RING_CARD = 84;
const TAP_VOUCHER = 118;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);

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
        fontSize: 86,
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
      <Caption from={0} to={TO_CARD[1]}>
        Học phí
        <br />
        <span style={{ color: colors.emerald }}>tự cộng sẵn</span>
      </Caption>
      <Caption from={TO_CARD[1]} to={10_000}>
        Không cần
        <br />
        <span style={{ color: colors.emerald }}>bấm máy tính</span>
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
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 70, overflow: "clip", background: "#f8fafc" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: PHONE_W, scale: String(S), transformOrigin: "top left" }}>
            <PhoneViewport width={PHONE_W} height={SCREEN_H}>
              <AppProviders client={client}>
                <div ref={uiRef} className="min-h-[1200px] bg-muted/40 p-3" style={{ position: "absolute", left: 0, right: 0, top: -scroll }}>
                  <FeeList />
                </div>
              </AppProviders>
            </PhoneViewport>
          </div>
        </div>

        {t ? (
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
        ) : null}
      </div>

      {t ? (
        <div
          style={{
            position: "absolute",
            left: PHONE_X + onScreen(t.voucher).left + onScreen(t.voucher).width / 2,
            top: PHONE_Y + onScreen(t.voucher).top + onScreen(t.voucher).height / 2 + (1 - fingerIn) * 220,
            opacity: fingerIn,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 200,
              height: 200,
              left: -100,
              top: -100,
              borderRadius: "50%",
              border: "6px solid rgba(5,150,105,0.6)",
              opacity: since < 0 ? 0 : interpolate(since, [0, 16], [1, 0], clamp),
              scale: String(interpolate(since, [0, 16], [0.3, 1.1], clamp)),
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 96,
              height: 96,
              left: -48,
              top: -48,
              borderRadius: "50%",
              background: "rgba(2,6,24,0.28)",
              border: "4px solid rgba(255,255,255,0.9)",
              boxShadow: "0 10px 30px rgba(2,6,24,0.25)",
              scale: String(interpolate(since, [0, 4, 10], [0.8, 0.8, 1], clamp)),
            }}
          />
        </div>
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
