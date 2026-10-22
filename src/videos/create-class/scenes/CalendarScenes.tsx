import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { continueRender, delayRender, Interactive, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CalendarView } from "@/features/calendar/components/CalendarView";
import DashboardHeader from "@/shared/components/layouts/dashboard/header";
import DashboardMain from "@/shared/components/layouts/dashboard/main";
import PageHeader from "@/shared/components/layouts/dashboard/PageHeader";
import { messages } from "@/shared/i18n/messages.generated";
import { useMockApi } from "../../../shared/app/AppProviders";
import { DEMO_NOW, useDemoNow } from "../../../shared/app/frozen-clock";
import { Sfx } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { clamp, ease } from "../../../shared/motion";
import { colors } from "../../../shared/theme";
import { AppScreen, byText, center, newClient, pageBox, Ring, SCREEN_H, scrollAt, SuccessToast, TapFinger, useMeasure } from "../../../shared/tutorial/AppScreen";
import { CREATED_API, LESSON_DATES } from "../data";
import { toastText } from "./ScheduleScene";

const WEEK_HOLD = 56;
export const TAP_MONTH = 60;
const POP_FROM = 10;
const POP_EVERY = 6;

// app/dashboard/calendar's page (a server component) laid out the same way
export const CalendarPage = () => {
  const t = useTranslations("calendar");
  return (
    <>
      <DashboardHeader>
        <PageHeader>{t("title")}</PageHeader>
      </DashboardHeader>
      <DashboardMain>
        <CalendarView />
      </DashboardMain>
    </>
  );
};

// the calendar's own week view, right after the wizard sends the tutor here
const WeekSceneInner = () => {
  useDemoNow(DEMO_NOW);
  useMockApi(CREATED_API);
  const frame = useCurrentFrame();
  const pageRef = useRef<HTMLDivElement>(null);
  const [client] = useState(newClient);

  const t = useMeasure(() => {
    const page = pageRef.current;
    if (!page) return null;
    const events = [...page.querySelectorAll(".fc-timegrid-event-harness")].map((el) => pageBox(page, el)!);
    const month = pageBox(page, byText(page, "button", messages.vi.calendar.views.month));
    return events.length === 2 && month ? { events, month } : null;
  });

  // the lessons sit at 18:00, far down the 07:00-23:00 grid: scroll them up into view, then back to the toolbar
  const lessonScroll = t ? Math.max(0, t.events[0].y + t.events[0].h + 40 - SCREEN_H) : 0;
  const scroll = scrollAt(frame, [
    [4, 0],
    [16, lessonScroll],
    [WEEK_HOLD - 18, lessonScroll],
    [WEEK_HOLD - 4, 0],
  ]);
  const toastOut = interpolate(frame, [26, 34], [1, 0], { ...clamp, easing: ease });
  const glow = interpolate(frame, [16, 22, WEEK_HOLD - 20, WEEK_HOLD - 14], [0, 1, 1, 0], clamp);

  return (
    <>
      <Sfx role="whoosh" at={10} volume={0.4} />
      <Sfx role="drop" at={16} volume={0.6} />
      <Sfx role="drop" at={20} volume={0.6} />
      <Sfx role="whoosh" at={WEEK_HOLD - 10} volume={0.3} />
      <Sfx role="click-soft" at={TAP_MONTH} volume={0.8} />
      <StepCaption eyebrow="Xong! Mở Lịch dạy" from={0}>
        Buổi học đã lên lịch
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/calendar"
        scroll={scroll}
        pageRef={pageRef}
        fixed={frame < 34 ? <SuccessToast enter={toastOut}>{toastText(LESSON_DATES.length)}</SuccessToast> : null}
        overlay={t ? t.events.map((e, i) => <Ring key={i} box={{ ...e, y: e.y - scroll }} opacity={glow} />) : null}
      >
        <CalendarPage />
      </AppScreen>
      {t ? <TapFinger frame={frame} taps={[{ at: TAP_MONTH, ...center({ ...t.month, y: t.month.y - scroll }) }]} hideAt={TAP_MONTH + 10} /> : null}
    </>
  );
};

// switch the real calendar to its month view before the first frame is captured; returns the scroll
// (none if it already fits) that brings the whole month grid on screen
export const useMonthView = (page: HTMLDivElement | null) => {
  const [monthScroll, setMonthScroll] = useState<number | null>(null);
  useEffect(() => {
    if (!page) return;
    const handle = delayRender("month view");
    let tries = 0;
    let raf = 0;
    const tick = () => {
      const lessons = page.querySelectorAll(".fc-dayGridMonth-view .fc-daygrid-event-harness").length;
      if (lessons >= LESSON_DATES.length || ++tries > 200) {
        const month = pageBox(page, page.querySelector(".fc-dayGridMonth-view"));
        if (month) setMonthScroll(Math.max(0, month.y + month.h + 12 - SCREEN_H));
        continueRender(handle);
        return;
      }
      if (!page.querySelector(".fc-dayGridMonth-view")) byText(page, "button", messages.vi.calendar.views.month)?.click();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [page]);
  return monthScroll;
};

// lesson i springs in at `shownAt(i)`: a stylesheet keyed by date, so FullCalendar redrawing its nodes can't undo it
const PopIn = ({ frame, shownAt }: { readonly frame: number; readonly shownAt: (i: number) => number }) => {
  const { fps } = useVideoConfig();
  const rules = LESSON_DATES.map((date, i) => {
    const p = spring({ frame: frame - shownAt(i), fps, config: { damping: 12, mass: 0.5 } });
    const opacity = interpolate(p, [0, 0.3], [0, 1], clamp);
    return `.fc-dayGridMonth-view [data-date="${date}"] .fc-daygrid-event-harness { opacity: ${opacity}; scale: ${0.6 + p * 0.4}; }`;
  });
  return <style>{rules.join("\n")}</style>;
};

const MonthSceneInner = () => {
  useDemoNow(DEMO_NOW);
  useMockApi(CREATED_API);
  const frame = useCurrentFrame();
  // a callback ref: the page only mounts once the phone's iframe has loaded
  const [page, setPage] = useState<HTMLDivElement | null>(null);
  const [client] = useState(newClient);
  const monthScroll = useMonthView(page) ?? 0;
  const last = POP_FROM + (LESSON_DATES.length - 1) * POP_EVERY;
  const scroll = scrollAt(frame, [
    [0, 0],
    [POP_FROM - 2, monthScroll],
  ]);

  return (
    <>
      {LESSON_DATES.map((d, i) => (
        <Sfx key={d} role="drop" at={POP_FROM + i * POP_EVERY} volume={0.55} />
      ))}
      <Sfx role="impact-soft" at={last + 6} volume={0.8} />
      <StepCaption eyebrow={`Cả ${LESSON_DATES.length} buổi`} from={last + 4}>
        <span style={{ color: colors.emerald }}>Xong lịch cả tháng</span>
      </StepCaption>
      <Sfx role="whoosh" at={4} volume={0.3} />
      <AppScreen client={client} pathname="/dashboard/calendar" scroll={scroll} pageRef={setPage}>
        <PopIn frame={frame} shownAt={(i) => POP_FROM + i * POP_EVERY} />
        <CalendarPage />
      </AppScreen>
    </>
  );
};

// the finished month up front: what the next minute is going to build
const HookSceneInner = () => {
  useDemoNow(DEMO_NOW);
  useMockApi(CREATED_API);
  const frame = useCurrentFrame();
  // a callback ref: the page only mounts once the phone's iframe has loaded
  const [page, setPage] = useState<HTMLDivElement | null>(null);
  const [client] = useState(newClient);
  const monthScroll = useMonthView(page) ?? 0;
  const zoom = interpolate(frame, [0, 90], [1.06, 1], { ...clamp, easing: ease });

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.5} />
      <Sfx role="impact-soft" at={10} volume={0.8} />
      <StepCaption eyebrow="Xếp lịch cả tháng" from={-20}>
        <span style={{ color: colors.emerald }}>chỉ trong 1 phút</span>
      </StepCaption>
      <div style={{ position: "absolute", inset: 0, scale: String(zoom), transformOrigin: "540px 285px" }}>
        <AppScreen client={client} pathname="/dashboard/calendar" scroll={monthScroll} pageRef={setPage}>
          <CalendarPage />
        </AppScreen>
      </div>
    </>
  );
};

export const WeekScene = Interactive.create({ Component: WeekSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
export const MonthScene = Interactive.create({ Component: MonthSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
export const HookScene = Interactive.create({ Component: HookSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
