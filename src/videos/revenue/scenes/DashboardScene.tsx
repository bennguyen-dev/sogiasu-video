import { useRef } from "react";
import { Interactive, spring, useCurrentFrame, useVideoConfig } from "remotion";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import { messages } from "@/shared/i18n/messages.generated";
import { Sfx } from "../../../shared/audio/sfx";
import { colors } from "../../../shared/theme";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { AppScreen, type Box, center, Explain, pageBox, scrollAt, TapFinger, useClickState, useMeasure } from "../../../shared/tutorial/AppScreen";
import { useRerenderWhen } from "../../../shared/tutorial/fee-page";
import { useRevenueApp } from "./shared";

const d = messages.vi.dashboard;

const UNCHECKED_HINT = [18, 76] as const;
const LOW_HINT = [80, 138] as const;
const STATS_SCROLL = [142, 164] as const;
const STATS_HINT = [168, 224] as const;
const MONEY_SCROLL = [228, 250] as const;
const MONEY_HINT = [254, 306] as const;
const TAP_EYE = 318;
const HIDDEN_HINT = [326, 378] as const;
const TODAY_SCROLL = [382, 404] as const;
const TODAY_HINT = [408, 462] as const;
export const DASHBOARD_LENGTH = 472;

// the tightest element whose text starts with the title (a title may carry a count after it), up to its card
const cardTitled = (page: HTMLElement, title: string) =>
  [...page.querySelectorAll<HTMLElement>('[data-slot="card"] *')]
    .filter((el) => el.textContent?.trim().startsWith(title))
    .sort((x, y) => (x.textContent?.length ?? 0) - (y.textContent?.length ?? 0))[0]
    ?.closest<HTMLElement>('[data-slot="card"]') ?? null;
const lowToggle = (page: HTMLElement) => cardTitled(page, d.lowRemaining.title)?.querySelector<HTMLElement>("[aria-expanded]") ?? null;
const eyes = (page: HTMLElement, label: string) => page.querySelectorAll<HTMLElement>(`button[aria-label="${label}"]`);
const span = (a: Box | null, b: Box | null) => {
  if (!a || !b) return null;
  const x = Math.min(a.x, b.x);
  return { x, y: a.y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: b.y + b.h - a.y };
};

// 0 · the dashboard on 12/11, card by card from the top: what needs doing, the counts, this month's money, today
const DashboardSceneInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const client = useRevenueApp();
  const pageRef = useRef<HTMLDivElement>(null);
  const page = pageRef.current;
  // the low-lessons card opens before the scene starts, so nothing below it moves mid-scene
  const toggle = page ? lowToggle(page) : null;
  useClickState(true, () => (toggle ? toggle.getAttribute("aria-expanded") === "true" : null), () => toggle?.click());
  useRerenderWhen(true, () => toggle?.getAttribute("aria-expanded") === "true");
  useClickState(
    frame >= TAP_EYE,
    () => (page && eyes(page, d.money.show).length + eyes(page, d.money.hide).length ? eyes(page, d.money.show).length > 0 : null),
    () => (page ? (eyes(page, d.money.hide)[0] ?? eyes(page, d.money.show)[0])?.click() : undefined),
  );
  const t = useMeasure(() => {
    const p = pageRef.current;
    if (!p) return null;
    const box = (title: string) => pageBox(p, cardTitled(p, title));
    const r = {
      unchecked: box(d.unchecked.title),
      low: box(d.lowRemaining.title),
      stats: span(box(d.students.title), box(d.monthly.title)),
      money: span(box(d.revenue.title), box(d.pendingFees.title)),
      today: box(d.today.title),
      eye: pageBox(p, eyes(p, d.money.hide)[0] ?? eyes(p, d.money.show)[0]),
    };
    return r.unchecked && r.low && r.stats && r.money && r.today ? r : null;
  });
  const at = (b: Box | null | undefined) => (b ? Math.max(0, b.y - 150) : 0);
  const scroll = scrollAt(frame, [
    [STATS_SCROLL[0], 0],
    [STATS_SCROLL[1], at(t?.stats)],
    [MONEY_SCROLL[0], at(t?.stats)],
    [MONEY_SCROLL[1], at(t?.money)],
    [TODAY_SCROLL[0], at(t?.money)],
    [TODAY_SCROLL[1], at(t?.today)],
  ]);
  const phoneIn = spring({ frame, fps, config: { damping: 200 } });
  const tap = (b: Box | null | undefined, f: number) => (b ? [{ at: f, ...center({ ...b, y: b.y - scroll }) }] : []);

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.5} />
      {[STATS_SCROLL, MONEY_SCROLL, TODAY_SCROLL].map(([f]) => (
        <Sfx key={f} role="whoosh" at={f + 4} volume={0.35} />
      ))}
      {[UNCHECKED_HINT, LOW_HINT, STATS_HINT, MONEY_HINT, HIDDEN_HINT, TODAY_HINT].map(([f]) => (
        <Sfx key={f} role="tick" at={f + 2} volume={0.6} />
      ))}
      <Sfx role="click-soft" at={TAP_EYE} volume={0.8} />
      <StepCaption eyebrow="Mở app" from={-20} to={STATS_SCROLL[0]}>
        <span style={{ color: colors.emerald }}>thấy ngay việc cần làm</span>
      </StepCaption>
      <StepCaption eyebrow="Tổng quan" from={STATS_SCROLL[0]} to={MONEY_SCROLL[0]}>
        <span style={{ color: colors.emerald }}>lớp, học sinh, buổi học</span>
      </StepCaption>
      <StepCaption eyebrow="Tháng này" from={MONEY_SCROLL[0]} to={TODAY_SCROLL[0]}>
        <span style={{ color: colors.emerald }}>thu được bao nhiêu?</span>
      </StepCaption>
      <StepCaption eyebrow="Hôm nay" from={TODAY_SCROLL[0]}>
        <span style={{ color: colors.emerald }}>dạy những buổi nào</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard"
        scroll={scroll}
        enter={phoneIn}
        pageRef={pageRef}
        nav
        overlay={
          t ? (
            <>
              <Explain frame={frame} from={UNCHECKED_HINT[0]} to={UNCHECKED_HINT[1]} box={t.unchecked} scroll={scroll}>
                Buổi dạy mà chưa bấm Hoàn thành
              </Explain>
              <Explain frame={frame} from={LOW_HINT[0]} to={LOW_HINT[1]} box={t.low} scroll={scroll}>
                Lớp sắp hết buổi: tạo thêm ngay từ đây
              </Explain>
              <Explain frame={frame} from={STATS_HINT[0]} to={STATS_HINT[1]} box={t.stats} scroll={scroll} side="above">
                Số học sinh, lớp và buổi học tháng này
              </Explain>
              <Explain frame={frame} from={MONEY_HINT[0]} to={MONEY_HINT[1]} box={t.money} scroll={scroll} side="above">
                Mở app là thấy tiền tháng này
              </Explain>
              <Explain frame={frame} from={HIDDEN_HINT[0]} to={HIDDEN_HINT[1]} box={t.money} scroll={scroll} side="above">
                Ẩn số tiền nếu cần riêng tư
              </Explain>
              <Explain frame={frame} from={TODAY_HINT[0]} to={TODAY_HINT[1]} box={t.today} scroll={scroll} side="above">
                Các buổi dạy hôm nay
              </Explain>
            </>
          ) : null
        }
      >
        <DashboardPage />
      </AppScreen>
      {t ? <TapFinger frame={frame} taps={tap(t.eye, TAP_EYE)} hideAt={TAP_EYE + 12} /> : null}
    </>
  );
};

export const DashboardScene = Interactive.create({ Component: DashboardSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
