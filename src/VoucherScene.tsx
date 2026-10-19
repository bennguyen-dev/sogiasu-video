import { useLayoutEffect, useRef, useState } from "react";
import {
  Easing,
  Interactive,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import paymentVi from "@/features/payment/i18n/vi.json";
import { PLAN_ENTITLEMENTS } from "@/features/billing/lib/plan-entitlements";
import { colors, fontFamily } from "./theme";
import { VOUCHER_W, VOUCHERS } from "./voucher-data";

// the free plan's templates, straight from the app, so the video never implies all ten are free
const FREE_TEMPLATES = new Set<string>(PLAN_ENTITLEMENTS.FREE.qrTemplateIds);

const INTRO = 15;
const STEP = 18;
const MOVE = 8;
const GRID_START = INTRO + STEP * VOUCHERS.length;
const CAROUSEL_SCALE = 1.55;
// room between the headline and the template chip; tall templates shrink to fit it
const CAROUSEL_MAX_H = 1200;
const GRID_SCALE = 0.36;
const GRID_COLS = 5;

const ease = Easing.bezier(0.65, 0, 0.35, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const VoucherSceneInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const [heights, setHeights] = useState<number[]>([]);

  useLayoutEffect(() => {
    setHeights(cards.current.map((el) => el?.offsetHeight ?? 0));
  }, []);

  // step-and-hold: slide for MOVE frames, rest on each template for the remainder
  const t = Math.max(0, frame - INTRO);
  const step = Math.min(Math.floor(t / STEP), VOUCHERS.length - 1);
  const pos = frame >= GRID_START ? VOUCHERS.length - 1 : step - 1 + ease(Math.min(1, (t - step * STEP) / MOVE));
  const active = Math.round(Math.max(0, pos));
  const titleIn = spring({ frame, fps, config: { damping: 200 } });
  const toGrid = (i: number) =>
    interpolate(frame, [GRID_START + i * 2, GRID_START + i * 2 + 24], [0, 1], {
      ...clamp,
      easing: ease,
    });
  const gridText = spring({
    frame: frame - GRID_START - 20,
    fps,
    config: { damping: 200 },
  });

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 80,
          right: 80,
          textAlign: "center",
          fontFamily,
          opacity: titleIn,
          translate: `0px ${(1 - titleIn) * 40}px`,
        }}
      >
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            letterSpacing: "-0.035em",
            lineHeight: 1.08,
            color: colors.ink,
          }}
        >
          Phiếu thu có QR
          <br />
          đúng số tiền
        </div>
      </div>

      {VOUCHERS.map((v, i) => {
        const d = i - pos;
        const q = toGrid(i);
        const col = i % GRID_COLS;
        const row = Math.floor(i / GRID_COLS);
        const carousel = {
          x: d * 640,
          y: 1000,
          s: Math.min(CAROUSEL_SCALE, CAROUSEL_MAX_H / (heights[i] || 1)) * (1 - Math.min(Math.abs(d), 2) * 0.2),
          o: 1 - Math.min(Math.abs(d), 1.6) * 0.55,
        };
        const grid = {
          x: (col - (GRID_COLS - 1) / 2) * 186,
          y: 860 + row * 300,
          s: GRID_SCALE,
          o: 1,
        };

        return (
          <div
            key={v.id}
            ref={(el) => {
              cards.current[i] = el;
            }}
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              width: VOUCHER_W,
              translate: `calc(-50% + ${carousel.x + (grid.x - carousel.x) * q}px) calc(-50% + ${carousel.y + (grid.y - carousel.y) * q}px)`,
              scale: String(carousel.s + (grid.s - carousel.s) * q),
              opacity:
                Math.max(0, carousel.o + (grid.o - carousel.o) * q) * titleIn,
              zIndex: Math.round(100 - Math.abs(d) * 10),
              filter: `drop-shadow(0 ${30 - q * 20}px ${60 - q * 40}px rgba(2,6,24,0.18))`,
              ["--font-inter" as string]: fontFamily,
            }}
            dangerouslySetInnerHTML={{ __html: v.html }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          bottom: 190,
          left: 80,
          right: 80,
          display: "flex",
          justifyContent: "center",
          fontFamily,
          opacity: titleIn * (1 - toGrid(0)),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            background: "white",
            borderRadius: 999,
            padding: "18px 36px",
            boxShadow: "0 12px 30px rgba(2,6,24,0.10)",
            fontSize: 46,
            fontWeight: 700,
            color: colors.ink,
          }}
        >
          {paymentVi.qrTemplate[VOUCHERS[active].id]}
          {FREE_TEMPLATES.has(VOUCHERS[active].id) ? null : (
            <span style={{ fontSize: 30, fontWeight: 700, color: "white", background: "#7c3aed", borderRadius: 999, padding: "4px 16px" }}>Pro</span>
          )}
          <span style={{ fontSize: 36, fontWeight: 600, color: colors.muted }}>
            {active + 1}/{VOUCHERS.length}
          </span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 260,
          left: 80,
          right: 80,
          textAlign: "center",
          fontFamily,
          fontSize: 56,
          fontWeight: 700,
          color: colors.emerald,
          opacity: gridText,
          translate: `0px ${(1 - gridText) * 40}px`,
        }}
      >
        {VOUCHERS.length} mẫu · Gửi Zalo là xong
      </div>
    </>
  );
};

export const VoucherScene = Interactive.create({
  Component: VoucherSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
