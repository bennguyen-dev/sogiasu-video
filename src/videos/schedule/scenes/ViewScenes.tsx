import { useRef, useState } from "react";
import { Interactive, interpolate, useCurrentFrame } from "remotion";
import type { ViewType } from "@/features/calendar/components/CalendarView/CalendarToolbar";
import { EMPTY_CALENDAR_FILTER } from "@/features/calendar/lib/calendar-filter";
import { DEFAULT_VIEW_WINDOW } from "@/features/calendar/lib/view-window";
import { messages } from "@/shared/i18n/messages.generated";
import { useMockApi } from "../../../shared/app/AppProviders";
import { useDemoNow } from "../../../shared/app/frozen-clock";
import { Sfx } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { clamp, ease } from "../../../shared/motion";
import { colors } from "../../../shared/theme";
import { AppScreen, type Box, byText, center, Explain, newClient, pageBox, screenBox, TapFinger, useMeasure } from "../../../shared/tutorial/AppScreen";
import { CalendarScreen } from "../CalendarScreen";
import { lessonsAt, NOW_5, scheduleApi, THREE_DAY_START, WEEK_START } from "../data";
import { typeInto, useSteps } from "../steps";

const { vi } = messages;
const AMBER = "#f59e0b";
export const MY_WINDOW = { minHour: "09:00", maxHour: "22:00" };
const BEFORE = { ieltsThuCancelled: false, makeup: false };
const API = scheduleApi(() => BEFORE);

const useCalendarScene = () => {
  useDemoNow(NOW_5);
  useMockApi(API);
  const [client] = useState(newClient);
  return client;
};

// the lessons of one day column, by class name, in the page's own px
const cardIn = (page: HTMLElement, date: string, name: string) =>
  [...page.querySelectorAll<HTMLElement>(`.fc-timegrid-col[data-date="${date}"] .fc-timegrid-event-harness`)].find((h) => h.textContent?.includes(name));

// the full week up front: every class, already cut to the tutor's own 9h-22h
const HookSceneInner = () => {
  const client = useCalendarScene();
  const frame = useCurrentFrame();
  const pageRef = useRef<HTMLDivElement>(null);
  const zoom = interpolate(frame, [0, 90], [1.06, 1], { ...clamp, easing: ease });
  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.5} />
      <Sfx role="impact-soft" at={10} volume={0.8} />
      <StepCaption eyebrow="10 lớp một tuần" from={-20}>
        <span style={{ color: colors.emerald }}>gọn trong 1 màn hình</span>
      </StepCaption>
      <div style={{ position: "absolute", inset: 0, scale: String(zoom), transformOrigin: "540px 285px" }}>
        <AppScreen client={client} pathname="/dashboard/calendar" scroll={150} pageRef={pageRef}>
          <CalendarScreen lessons={lessonsAt(BEFORE)} view="timeGridWeek" date={WEEK_START} viewWindow={MY_WINDOW} filter={EMPTY_CALENDAR_FILTER} />
        </AppScreen>
      </div>
    </>
  );
};

// 1 · the hour window: Hiển thị → 09:00 to 22:00 → the grid tightens
const SETTINGS_HINT = [8, 64] as const;
const TAP_SETTINGS = 76;
const TAP_START = 104;
const TAP_END = 132;
const TAP_CLOSE = 200;
export const WINDOW_LENGTH = 232;

const settingsDialog = (doc: Document) =>
  [...doc.querySelectorAll<HTMLElement>("[data-slot=dialog-content]")].find((d) => d.textContent?.includes(vi.calendar.viewSettings.modalTitle));

const WindowSceneInner = () => {
  const client = useCalendarScene();
  const frame = useCurrentFrame();
  const pageRef = useRef<HTMLDivElement>(null);
  const docOf = () => pageRef.current?.ownerDocument;
  const viewWindow = frame >= TAP_CLOSE ? MY_WINDOW : DEFAULT_VIEW_WINDOW;
  const inputs = () => {
    const d = docOf();
    const dialog = d ? settingsDialog(d) : null;
    return dialog ? [...dialog.querySelectorAll<HTMLInputElement>("input")] : [];
  };
  useSteps(frame, [
    {
      at: TAP_SETTINGS,
      done: () => frame >= TAP_CLOSE || !!(docOf() && settingsDialog(docOf()!)),
      act: () => docOf()?.querySelector<HTMLElement>(`button[aria-label="${vi.calendar.viewSettings.button}"]`)?.click(),
    },
    { at: TAP_START, done: () => frame >= TAP_CLOSE || inputs()[0]?.value === "09:00", act: () => typeInto(inputs()[0], "09:00") },
    { at: TAP_END, done: () => frame >= TAP_CLOSE || inputs()[1]?.value === "22:00", act: () => typeInto(inputs()[1], "22:00") },
    {
      at: TAP_CLOSE,
      done: () => !(docOf() && settingsDialog(docOf()!)),
      act: () => settingsDialog(docOf()!)?.querySelector<HTMLElement>("[data-slot=dialog-close]")?.click(),
    },
  ]);
  const t = useMeasure(() => {
    const page = pageRef.current;
    if (!page) return null;
    const button = page.querySelector(`button[aria-label="${vi.calendar.viewSettings.button}"]`);
    const d = settingsDialog(page.ownerDocument);
    const ins = d ? [...d.querySelectorAll("input")] : [];
    return button
      ? {
          button: pageBox(page, button)!,
          start: screenBox(ins[0]),
          end: screenBox(ins[1]),
          fields: screenBox(ins[0]?.closest(".flex.items-end")),
          close: screenBox(d?.querySelector("[data-slot=dialog-close]")),
        }
      : null;
  });

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="tick" at={SETTINGS_HINT[0] + 2} volume={0.6} />
      <Sfx role="click-firm" at={TAP_SETTINGS} volume={0.8} />
      <Sfx role="pop" at={TAP_SETTINGS + 2} volume={0.6} />
      <Sfx role="key" at={TAP_START + 2} volume={0.6} />
      <Sfx role="key" at={TAP_START + 6} volume={0.6} />
      <Sfx role="key" at={TAP_END + 2} volume={0.6} />
      <Sfx role="key" at={TAP_END + 6} volume={0.6} />
      <Sfx role="click-soft" at={TAP_CLOSE} volume={0.8} />
      <Sfx role="whoosh" at={TAP_CLOSE + 4} volume={0.35} />
      <StepCaption eyebrow="Lịch theo giờ dạy" from={0}>
        <span style={{ color: colors.emerald }}>của chính bạn</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/calendar"
        scroll={0}
        pageRef={pageRef}
        overlay={
          t ? (
            <>
              <Explain frame={frame} from={SETTINGS_HINT[0]} to={SETTINGS_HINT[1]} box={t.button}>
                Bấm <b>Hiển thị</b>: chỉnh khoảng giờ theo giờ dạy của bạn
              </Explain>
              <Explain frame={frame} from={TAP_END + 10} to={TAP_CLOSE - 6} box={t.fields}>
                Ví dụ dạy từ 9h đến 22h
              </Explain>
            </>
          ) : null
        }
      >
        <CalendarScreen lessons={lessonsAt(BEFORE)} view="timeGridWeek" date={WEEK_START} viewWindow={viewWindow} filter={EMPTY_CALENDAR_FILTER} />
      </AppScreen>
      {t ? (
        <TapFinger
          frame={frame}
          taps={[
            { at: TAP_SETTINGS, ...center(t.button) },
            ...(t.start ? [{ at: TAP_START, ...center(t.start) }] : []),
            ...(t.end ? [{ at: TAP_END, ...center(t.end) }] : []),
            ...(t.close ? [{ at: TAP_CLOSE, ...center(t.close) }] : []),
          ]}
          hideAt={TAP_CLOSE + 10}
        />
      ) : null}
    </>
  );
};

// 2 · reading the cards, on three wide days (04-06/11): every badge and icon a card can carry
const TAP_THREE = 10;
const HINTS = [
  ["scheduled", 30, "Đã lên lịch"],
  ["completed", 76, "Hoàn thành: đã chốt, học phí đã tạo"],
  ["overdue", 122, "Chưa hoàn thành: đã dạy mà chưa bấm Đã dạy xong, nên chưa có học phí"],
  ["noStudents", 174, "Cần kiểm tra: buổi chưa có học sinh"],
  ["cancelled", 220, "Đã nghỉ: không tính học phí"],
  ["mode", 266, "Online hay offline"],
  ["location", 312, "Buổi offline có địa chỉ"],
  ["synced", 358, "Đã đồng bộ Google Calendar"],
] as const;
const HINT_LEN = 42;
const TAP_MONTH = 414;
const TAP_WEEK = 446;
export const CARDS_LENGTH = 470;

type CardTargets = Record<(typeof HINTS)[number][0], Box | null> & { three: Box | null; month: Box | null; week: Box | null };

const CardsSceneInner = () => {
  const client = useCalendarScene();
  const frame = useCurrentFrame();
  const pageRef = useRef<HTMLDivElement>(null);
  const view: ViewType = frame >= TAP_WEEK ? "timeGridWeek" : frame >= TAP_MONTH ? "dayGridMonth" : frame >= TAP_THREE ? "threeDay" : "timeGridWeek";
  const date = view === "threeDay" ? THREE_DAY_START : WEEK_START;
  const t = useMeasure<CardTargets>(() => {
    const page = pageRef.current;
    if (!page) return null;
    const pb = (el: Element | null | undefined) => pageBox(page, el);
    const badge = (h: HTMLElement | undefined) => h?.querySelector(".absolute.-right-1 > :last-child");
    const viewButton = (label: string) => byText(page, "button", label);
    const teens = cardIn(page, "2026-11-04", "IELTS Teens");
    const cun = cardIn(page, "2026-11-04", "Cún");
    return {
      three: pb(viewButton(vi.calendar.views.threeDay)),
      month: pb(viewButton(vi.calendar.views.month)),
      week: pb(viewButton(vi.calendar.views.week)),
      scheduled: pb(badge(cardIn(page, "2026-11-05", "IELTS 5.5"))),
      completed: pb(badge(cun)),
      overdue: pb(badge(cardIn(page, "2026-11-04", "Mít"))),
      noStudents: pb(badge(cardIn(page, "2026-11-06", "Giao tiếp công sở"))),
      cancelled: pb(cardIn(page, "2026-11-05", "IELTS Speaking")),
      mode: pb(teens?.querySelector(".truncate.font-semibold")),
      // the address row, not the title row above it (both are line-clamped)
      location: pb([...(cun?.querySelectorAll("div") ?? [])].find((d) => d.childElementCount <= 1 && d.textContent?.trim().startsWith("Nhà"))),
      // the corner logo; the one inside the time row only shows on wide screens
      synced: pb(teens?.querySelector(".absolute.-right-1 img")),
    };
  });
  const scroll = view === "dayGridMonth" ? 120 : 150;

  return (
    <>
      <Sfx role="click-soft" at={TAP_THREE} volume={0.8} />
      {HINTS.map(([key, at]) => (
        <Sfx key={key} role="tick" at={at + 2} volume={0.6} />
      ))}
      <Sfx role="click-soft" at={TAP_MONTH} volume={0.8} />
      <Sfx role="click-soft" at={TAP_WEEK} volume={0.8} />
      <StepCaption eyebrow="Nhìn thẻ" from={0}>
        <span style={{ color: colors.emerald }}>biết ngay buổi đó thế nào</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/calendar"
        scroll={scroll}
        pageRef={pageRef}
        overlay={
          t ? (
            <>
              {HINTS.map(([key, at, text]) => (
                <Explain key={key} frame={frame} from={at} to={at + HINT_LEN} box={t[key]} scroll={scroll} color={key === "overdue" ? AMBER : undefined} side={key === "noStudents" || key === "synced" ? "above" : "below"}>
                  {text}
                </Explain>
              ))}
              <Explain frame={frame} from={TAP_MONTH - 4} to={TAP_WEEK + 20} box={t.month} scroll={scroll}>
                Màu thẻ là màu lớp · đổi kiểu xem ở góc trên
              </Explain>
            </>
          ) : null
        }
      >
        <CalendarScreen lessons={lessonsAt(BEFORE)} view={view} date={date} viewWindow={MY_WINDOW} filter={EMPTY_CALENDAR_FILTER} />
      </AppScreen>
      {t ? (
        <TapFinger
          frame={frame}
          taps={[
            ...(t.three ? [{ at: TAP_THREE, ...center(t.three) }] : []),
            ...(t.month ? [{ at: TAP_MONTH, ...center(t.month) }] : []),
            ...(t.week ? [{ at: TAP_WEEK, ...center(t.week) }] : []),
          ].map((tap) => ({ ...tap, y: tap.y - (tap.at === TAP_WEEK ? 120 : 150) }))}
          hideAt={TAP_WEEK + 10}
        />
      ) : null}
    </>
  );
};

const schema = { ...Interactive.backgroundSchema };
export const HookScene = Interactive.create({ Component: HookSceneInner, layout: "absolute-fill", schema });
export const WindowScene = Interactive.create({ Component: WindowSceneInner, layout: "absolute-fill", schema });
export const CardsScene = Interactive.create({ Component: CardsSceneInner, layout: "absolute-fill", schema });
