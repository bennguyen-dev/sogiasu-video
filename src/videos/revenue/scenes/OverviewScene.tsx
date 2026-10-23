import { useEffect, useRef, useState } from "react";
import { continueRender, delayRender, Interactive, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import RevenueSection from "@/features/analytics/components/RevenueSection";
import { messages } from "@/shared/i18n/messages.generated";
import { AppProviders } from "../../../shared/app/AppProviders";
import { PhoneViewport } from "../../../shared/app/PhoneViewport";
import { Sfx } from "../../../shared/audio/sfx";
import { clamp, ease } from "../../../shared/motion";
import { colors } from "../../../shared/theme";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { Ring } from "../../attendance-grid/scenes/OverviewScene";
import { MOST_OWED } from "../data";
import { useRevenueApp } from "./shared";

const a = messages.vi.analytics;

// the analytics page as a floating card, as the intro shows it: a tablet-width viewport lays the KPIs out 2×2
const UI_W = 768;
const UI_H = 2600;
const UI_X = 40;
const UI_Y = 430;
const S = (1080 - 2 * UI_X) / UI_W;
// where a beat's focus lands on the frame
const TARGET = { x: 540, y: 1150 };

const KPI_MOVE = 70;
const KPI_RINGS = [100, 145, 190, 235] as const;
const ACTIVITY = { move: 282, ring: 312, end: 372 };
const POTENTIAL = { move: 378, ring: 408, end: 470 };
const EXIT = [476, 504] as const;
export const OVERVIEW_LENGTH = 510;

const KPI_STEPS = [
  { label: a.kpi.collected, line: "tiền đã về", color: "#059669" },
  { label: a.kpi.pending, line: "đã dạy, chưa đóng", color: "#d97706" },
  { label: a.kpi.potential, line: "nếu dạy hết lịch", color: "#7c3aed" },
  { label: a.kpi.rate, line: "đã thu được mấy phần", color: "#059669" },
];

type Box = { x: number; y: number; w: number; h: number };
type Targets = { kpis: Box[]; summary: Box; owed: Box };

const cardTitled = (root: HTMLElement, title: string) =>
  [...root.querySelectorAll('[data-slot="card-title"]')].find((el) => el.textContent === title)?.closest<HTMLElement>('[data-slot="card"]');

// every target in the card's own layout px
const findTargets = (root: HTMLElement): Targets | null => {
  const r = root.getBoundingClientRect();
  const box = (el: Element | null | undefined): Box | null => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: b.left - r.left, y: b.top - r.top, w: b.width, h: b.height };
  };
  const descs = [...root.querySelectorAll('[data-slot="card-description"]')];
  const kpis = KPI_STEPS.map((s) => box(descs.find((d) => d.textContent === s.label)?.closest('[data-slot="card"]')));
  const activity = cardTitled(root, a.byActivity.title);
  const summary = box(activity?.querySelector('[data-slot="card-header"] > .flex-wrap'));
  const potential = cardTitled(root, a.byPotential.title);
  const chart = box(potential?.querySelector('[data-slot="chart"]'));
  const tick = box([...(potential?.querySelectorAll("foreignObject") ?? [])].find((f) => f.textContent?.includes(MOST_OWED.className)));
  const owed = chart && tick ? { x: chart.x, y: tick.y - 4, w: chart.w, h: tick.h + 8 } : null;
  if (kpis.some((k) => !k) || !summary || !owed) return null;
  return { kpis: kpis as Box[], summary, owed };
};

type Shot = { z: number; x: number; y: number };
const WIDE: Shot = { z: 1, x: UI_W / 2, y: (TARGET.y - UI_Y) / S };
// keep the shot inside the card: half the frame's width, in layout px at that zoom
const fit = (z: number, x: number) => Math.min(Math.max(x, 540 / (z * S)), UI_W - 540 / (z * S));

const OverviewSceneInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const client = useRevenueApp();
  const uiRef = useRef<HTMLDivElement>(null);
  const [t, setT] = useState<Targets | null>(null);

  useEffect(() => {
    const handle = delayRender("measure analytics targets");
    let last = "";
    let tries = 0;
    let raf = 0;
    const tick = () => {
      const next = uiRef.current ? findTargets(uiRef.current) : null;
      const key = JSON.stringify(next);
      if ((next && key === last) || ++tries > 300) {
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

  const shots: [number, Shot][] = t
    ? (() => {
        const k = t.kpis;
        const kpiBox = { y: k[0].y, h: k[3].y + k[3].h - k[0].y };
        const kpiShot = { z: 1.06, x: UI_W / 2, y: kpiBox.y + kpiBox.h / 2 + 300 };
        const summaryShot = { z: 1.15, x: fit(1.15, t.summary.x + t.summary.w / 2), y: t.summary.y + 220 };
        const owedShot = { z: 1.1, x: UI_W / 2, y: t.owed.y + t.owed.h / 2 };
        const hookShot = { ...WIDE, y: Math.max(WIDE.y, kpiBox.y + kpiBox.h / 2 + 140) };
        return [
          [0, hookShot],
          [KPI_MOVE, hookShot],
          [KPI_MOVE + 24, kpiShot],
          [ACTIVITY.move, kpiShot],
          [ACTIVITY.move + 26, summaryShot],
          [POTENTIAL.move, summaryShot],
          [POTENTIAL.move + 26, owedShot],
          [EXIT[0], owedShot],
          [EXIT[0] + 20, { ...owedShot, z: 1 }],
        ];
      })()
    : [[0, WIDE]];
  const at = (key: keyof Shot) =>
    shots.length === 1
      ? shots[0][1][key]
      : interpolate(
          frame,
          shots.map(([f]) => f),
          shots.map(([, s]) => s[key]),
          { ...clamp, easing: ease },
        );
  const shot = { z: at("z"), x: at("x"), y: at("y") };
  const tx = TARGET.x - shot.z * (UI_X + shot.x * S);
  const ty = TARGET.y - shot.z * (UI_Y + shot.y * S);
  const toScreen = (x: number, y: number) => ({ left: tx + shot.z * (UI_X + x * S), top: ty + shot.z * (UI_Y + y * S) });

  const appear = spring({ frame, fps, config: { damping: 200 } });
  const exit = interpolate(frame, [EXIT[1] - 6, OVERVIEW_LENGTH], [1, 0], clamp);
  const shrink = interpolate(frame, [...EXIT], [1, 0.92], { ...clamp, easing: ease });
  const ringEnd = (i: number) => (i < KPI_RINGS.length - 1 ? KPI_RINGS[i + 1] - 3 : ACTIVITY.move - 4);

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.5} />
      <Sfx role="impact-soft" at={12} volume={0.8} />
      {[KPI_MOVE, ACTIVITY.move, POTENTIAL.move].map((f) => (
        <Sfx key={f} role="whoosh" at={f + 4} volume={0.35} />
      ))}
      {[...KPI_RINGS, ACTIVITY.ring, POTENTIAL.ring].map((f) => (
        <Sfx key={f} role="pop" at={f} volume={0.7} />
      ))}
      <Sfx role="whoosh" at={EXIT[0] + 6} volume={0.5} />
      <div style={{ position: "absolute", inset: 0, overflow: "clip", opacity: exit, scale: String(shrink) }}>
        <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", translate: `${tx}px ${ty}px`, scale: String(shot.z) }}>
          <div
            style={{
              position: "absolute",
              left: UI_X,
              top: UI_Y,
              width: UI_W,
              scale: String(S),
              transformOrigin: "top left",
              opacity: appear,
              translate: `0px ${(1 - appear) * 60}px`,
              overflow: "clip",
              borderRadius: 16,
              filter: "drop-shadow(0 30px 60px rgba(2,6,24,0.16))",
            }}
          >
            <PhoneViewport width={UI_W} height={UI_H}>
              <AppProviders client={client}>
                <div ref={uiRef} className="bg-muted/40 p-4" style={{ minHeight: UI_H }}>
                  <RevenueSection />
                </div>
              </AppProviders>
            </PhoneViewport>
          </div>
        </div>
        {t ? (
          <>
            {KPI_STEPS.map((s, i) => (
              <Ring key={s.label} box={t.kpis[i]} at={KPI_RINGS[i]} end={ringEnd(i)} color={s.color} toScreen={toScreen} />
            ))}
            <Ring box={t.summary} at={ACTIVITY.ring} end={ACTIVITY.end} color="#059669" toScreen={toScreen} />
            <Ring box={t.owed} at={POTENTIAL.ring} end={POTENTIAL.end} color="#d97706" toScreen={toScreen} />
          </>
        ) : null}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 400,
          background: "linear-gradient(#f1f5f9 80%, rgba(241,245,249,0))",
        }}
      />
      <StepCaption eyebrow="Xem kỹ hơn" from={-20} to={KPI_RINGS[0]}>
        <span style={{ color: colors.emerald }}>ở trang Phân tích</span>
      </StepCaption>
      {KPI_STEPS.map((s, i) => (
        <StepCaption key={s.label} eyebrow={s.label} from={KPI_RINGS[i]} to={i < KPI_RINGS.length - 1 ? KPI_RINGS[i + 1] : ACTIVITY.move}>
          <span style={{ color: colors.emerald }}>{s.line}</span>
        </StepCaption>
      ))}
      <StepCaption eyebrow={a.byActivity.title} from={ACTIVITY.move} to={POTENTIAL.move}>
        <span style={{ color: colors.emerald }}>số buổi, số giờ đã dạy</span>
      </StepCaption>
      <StepCaption eyebrow={a.byPotential.title} from={POTENTIAL.move}>
        <span style={{ color: colors.emerald }}>lớp nào còn chưa thu</span>
      </StepCaption>
    </>
  );
};

export const OverviewScene = Interactive.create({ Component: OverviewSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
