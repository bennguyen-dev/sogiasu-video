import { useLayoutEffect, useRef } from "react";
import { continueRender, delayRender, Interactive, useCurrentFrame } from "remotion";
import AnalyticsPage from "@/features/analytics/pages/AnalyticsPage";
import { messages } from "@/shared/i18n/messages.generated";
import { Sfx } from "../../../shared/audio/sfx";
import { colors } from "../../../shared/theme";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { AppScreen, type Box, byText, center, Explain, pageBox, scrollAt, screenBox, TapFinger, useMeasure, usePopover } from "../../../shared/tutorial/AppScreen";
import { useRerenderWhen } from "../../../shared/tutorial/fee-page";
import { useRevenueApp } from "./shared";

const { vi } = messages;
const ALL = vi.ui.monthPicker.all;
const THIS_MONTH = vi.ui.monthRangePicker.thisMonth;

const TAP_MONTH = 34;
const TAP_ALL = 68;
const KPI_HINT = [84, 140] as const;
const SCROLL = [146, 176] as const;
const CHART_HINT = [184, 272] as const;
export const MONTHS_LENGTH = 290;

const filtersOf = (page: HTMLElement) => page.querySelector<HTMLElement>(".space-y-6 > .grid");
const monthTrigger = (page: HTMLElement) => filtersOf(page)?.querySelector<HTMLElement>(":scope > button:last-child") ?? null;
const popover = (doc: Document) => doc.querySelector<HTMLElement>("[data-slot=popover-content]");
const cardTitled = (page: HTMLElement, title: string) =>
  [...page.querySelectorAll('[data-slot="card-title"]')].find((el) => el.textContent === title)?.closest<HTMLElement>('[data-slot="card"]');

// the month is the section's own state: pick it through the popover until the trigger shows the wanted month
const useMonthAll = (page: HTMLElement | null, want: boolean) => {
  useLayoutEffect(() => {
    const trigger = page ? monthTrigger(page) : null;
    if (!trigger || (trigger.textContent === ALL) === want) return;
    const handle = delayRender("pick month");
    const doc = trigger.ownerDocument;
    if (!popover(doc)) trigger.click();
    let clicked = false;
    let tries = 0;
    const tick = () => {
      const content = popover(doc);
      if (!clicked && content) {
        byText(content, "button", want ? ALL : THIS_MONTH)?.click();
        clicked = true;
      }
      if ((clicked && (monthTrigger(page!)?.textContent === ALL) === want && !popover(doc)) || ++tries > 120) continueRender(handle);
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
};

const MonthsSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useRevenueApp();
  const pageRef = useRef<HTMLDivElement>(null);
  const page = pageRef.current;
  usePopover(page ? monthTrigger(page) : null, frame >= TAP_MONTH && frame < TAP_ALL);
  useMonthAll(page, frame >= TAP_ALL);
  useRerenderWhen(frame >= TAP_ALL, () => !!(page && cardTitled(page, vi.analytics.byMonth.title)?.querySelector('[data-slot="chart"] svg')));
  const t = useMeasure(() => {
    const p = pageRef.current;
    if (!p) return null;
    const trigger = pageBox(p, monthTrigger(p));
    if (!trigger) return null;
    const kpis = [...p.querySelectorAll('[data-slot="card-description"]')]
      .filter((d) => d.textContent === vi.analytics.kpi.collected || d.textContent === vi.analytics.kpi.rate)
      .map((d) => pageBox(p, d.closest('[data-slot="card"]')));
    const byMonth = pageBox(p, cardTitled(p, vi.analytics.byMonth.title));
    const content = popover(p.ownerDocument);
    return {
      trigger,
      all: content ? screenBox(byText(content, "button", ALL)) : null,
      kpis: kpis.length === 2 && kpis[0] && kpis[1] ? { x: kpis[0].x, y: kpis[0].y, w: kpis[1].x + kpis[1].w - kpis[0].x, h: kpis[1].y + kpis[1].h - kpis[0].y } : null,
      byMonth,
    };
  });
  const last = useRef<{ all?: Box }>({});
  if (t?.all) last.current.all = t.all;
  const target = t?.byMonth ? Math.max(0, t.byMonth.y - 16) : 0;
  const scroll = scrollAt(frame, [
    [SCROLL[0], 0],
    [SCROLL[1], target],
  ]);
  const tap = (b: Box | null | undefined, at: number) => (b ? [{ at, ...center(b) }] : []);

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="click-soft" at={TAP_MONTH} volume={0.8} />
      <Sfx role="pop" at={TAP_MONTH + 2} volume={0.6} />
      <Sfx role="select" at={TAP_ALL} volume={0.8} />
      <Sfx role="tick" at={KPI_HINT[0] + 2} volume={0.6} />
      <Sfx role="whoosh" at={SCROLL[0] + 4} volume={0.35} />
      <Sfx role="tick" at={CHART_HINT[0] + 2} volume={0.6} />
      <StepCaption eyebrow={`Chọn "${ALL}"`} from={0}>
        <span style={{ color: colors.emerald }}>xem từng tháng</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/analytics"
        scroll={scroll}
        pageRef={pageRef}
        overlay={
          t ? (
            <>
              <Explain frame={frame} from={KPI_HINT[0]} to={KPI_HINT[1]} box={t.kpis} scroll={scroll}>
                Cộng dồn mọi tháng
              </Explain>
              <Explain frame={frame} from={CHART_HINT[0]} to={CHART_HINT[1]} box={t.byMonth} scroll={scroll}>
                Tiền đã thu, theo tháng đóng
              </Explain>
            </>
          ) : null
        }
      >
        <AnalyticsPage />
      </AppScreen>
      {t ? <TapFinger frame={frame} taps={[...tap(t.trigger, TAP_MONTH), ...tap(last.current.all, TAP_ALL)]} hideAt={TAP_ALL + 12} /> : null}
    </>
  );
};

export const MonthsScene = Interactive.create({ Component: MonthsSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
