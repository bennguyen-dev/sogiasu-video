import { useRef, useState } from "react";
import { continueRender, delayRender, Interactive, useCurrentFrame } from "remotion";
import FeesPage from "@/features/fee/pages/FeesPage";
import { messages } from "@/shared/i18n/messages.generated";
import { useMockApi } from "../../../shared/app/AppProviders";
import { useDemoNow } from "../../../shared/app/frozen-clock";
import { setDemoSearch } from "../../../shared/app/stubs/next-navigation";
import { Sfx } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { colors } from "../../../shared/theme";
import {
  AppScreen,
  type Box,
  byText,
  center,
  Explain,
  newClient,
  pageBox,
  screenBox,
  SCREEN_H,
  scrollAt,
  TapFinger,
  useClickState,
  useMeasure,
  usePopover,
} from "../../../shared/tutorial/AppScreen";
import { SESSION_FEE_API, TODAY_6 } from "../data";
import { studentCardOf } from "./IntroScenes";
import { useRerenderWhen } from "../use-rerender";

const { vi } = messages;
const AMBER = "#f59e0b";

let raised = false;
const API = SESSION_FEE_API(() => raised);

const useFeesPage = (isRaised: boolean) => {
  useDemoNow(TODAY_6);
  raised = isRaised;
  useMockApi(API);
  const [client] = useState(newClient);
  return client;
};

const pickButton = (card: HTMLElement) =>
  [...card.querySelectorAll<HTMLElement>("button")].find((b) => {
    const text = b.textContent?.trim();
    return text === vi.fee.card.selectSessions || text === vi.fee.card.collapse;
  });
const expanded = (card: HTMLElement | null | undefined) =>
  card ? pickButton(card)?.textContent?.trim() === vi.fee.card.collapse : null;
// Minh Anh's lesson rows once the card is opened, and the one dated `ddmm`
const rowsOf = (card: HTMLElement) =>
  card.querySelector<HTMLElement>(".space-y-1.pl-6");
const rowOn = (card: HTMLElement, ddmm: string) =>
  [...card.querySelectorAll<HTMLElement>("label")].find((l) =>
    l.textContent?.includes(ddmm),
  );

// opens Minh Anh's lesson list with "Chọn buổi", as a tap does
// the lesson rows mount after this render: render once more so they get measured
const useOpenCard = (page: HTMLElement | null, open: boolean) => {
  const [, setRound] = useState(0);
  useClickState(
    open,
    () => expanded(page ? studentCardOf(page, "Minh Anh") : null),
    () => {
      const card = page ? studentCardOf(page, "Minh Anh") : null;
      if (card) pickButton(card)?.click();
      const handle = delayRender("lesson rows");
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setRound((n) => n + 1);
          continueRender(handle);
        }),
      );
    },
  );
};

// 2 · before the change: Minh Anh's three November lessons, the 10/11 absence charged like the rest
const TAP_PICK = 30;
const ROWS_HINT = [46, 112] as const;
const ABSENT_HINT = [120, 196] as const;
export const LIST_LENGTH = 208;

const ListSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useFeesPage(false);
  const pageRef = useRef<HTMLDivElement>(null);
  useState(() => setDemoSearch(""));
  useOpenCard(pageRef.current, frame >= TAP_PICK);
  const t = useMeasure(() => {
    const page = pageRef.current;
    const ma = page ? studentCardOf(page, "Minh Anh") : null;
    const pick = ma ? pickButton(ma) : null;
    if (!page || !ma || !pick) return null;
    return {
      pick: pageBox(page, pick)!,
      rows: pageBox(page, rowsOf(ma)),
      absent: pageBox(page, rowOn(ma, "10/11")),
    };
  });
  const scroll = t?.rows
    ? scrollAt(frame, [[0, Math.max(0, t.rows.y + t.rows.h + 40 - SCREEN_H)]])
    : 0;
  const pickAt = t ? { ...t.pick, y: t.pick.y - scroll } : null;

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="click-soft" at={TAP_PICK} volume={0.8} />
      <Sfx role="tick" at={ROWS_HINT[0] + 2} volume={0.6} />
      <Sfx role="tick" at={ABSENT_HINT[0] + 2} volume={0.6} />
      <StepCaption eyebrow="Mỗi buổi dạy xong" from={0}>
        <span style={{ color: colors.emerald }}>= 1 khoản học phí</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/fees"
        scroll={scroll}
        pageRef={pageRef}
        overlay={
          t ? (
            <>
              <Explain
                frame={frame}
                from={ROWS_HINT[0]}
                to={ROWS_HINT[1]}
                box={t.rows}
                scroll={scroll}
                side="above"
              >
                Bấm <b>Đã dạy xong</b> là có khoản, không cần nhập tay
              </Explain>
              <Explain
                frame={frame}
                from={ABSENT_HINT[0]}
                to={ABSENT_HINT[1]}
                box={t.absent}
                scroll={scroll}
                color={AMBER}
                side="above"
              >
                Buổi này em vắng không phép: vẫn tính tiền. Chỉ nghỉ có phép mới
                miễn
              </Explain>
            </>
          ) : null
        }
      >
        <FeesPage />
      </AppScreen>
      {pickAt ? (
        <TapFinger
          frame={frame}
          taps={[{ at: TAP_PICK, ...center(pickAt) }]}
          hideAt={TAP_PICK + 10}
        />
      ) : null}
    </>
  );
};

// 4 · after: November at the new price, then October in the history tab, untouched
const TAP_PICK2 = 26;
const NEW_HINT = [42, 106] as const;
const TAP_HISTORY = 124;
const TAP_MONTH = 156;
const TAP_PREV = 184;
const TAP_DAY_ROW = 206;
const PAID_HINT = [222, 300] as const;
export const CHECK_LENGTH = 314;

// the 31/10 collection in Minh Anh's history card, and its lesson rows once opened
const dayRowOf = (card: HTMLElement) =>
  [...card.querySelectorAll<HTMLElement>("button")].find((b) => b.textContent?.includes("thg 10"));
const paidRowsOf = (card: HTMLElement) => card.querySelector<HTMLElement>(".mt-1.space-y-1.pl-4");

const CheckSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useFeesPage(true);
  const pageRef = useRef<HTMLDivElement>(null);
  // the tab and month live in the url; the frame sets it before the page reads it
  setDemoSearch(
    frame < TAP_HISTORY
      ? ""
      : frame < TAP_PREV
        ? "tab=history&month=2026-11"
        : "tab=history&month=2026-10",
  );
  const onHistory = frame >= TAP_HISTORY;
  useOpenCard(pageRef.current, frame >= TAP_PICK2 && !onHistory);
  const monthTrigger = () => {
    const page = pageRef.current;
    return page
      ? [
          ...page.querySelectorAll<HTMLElement>("button[aria-haspopup=dialog]"),
        ].find((b) => /2026/.test(b.textContent ?? ""))
      : null;
  };
  usePopover(
    onHistory ? monthTrigger() : null,
    frame >= TAP_MONTH && frame < TAP_PREV,
  );
  useRerenderWhen(frame >= TAP_MONTH && frame < TAP_PREV, () => {
    const popover = pageRef.current?.ownerDocument.querySelector("[data-slot=popover-content]");
    return !!popover && !!byText(popover, "button", vi.ui.monthRangePicker.lastMonth);
  });
  const historyCard = () => (pageRef.current && frame >= TAP_PREV ? studentCardOf(pageRef.current, "Minh Anh") : null);
  useClickState(
    frame >= TAP_DAY_ROW,
    () => {
      const card = historyCard();
      return card ? !!paidRowsOf(card) : null;
    },
    () => {
      const card = historyCard();
      if (card) dayRowOf(card)?.click();
    },
  );
  useRerenderWhen(frame >= TAP_DAY_ROW, () => {
    const card = historyCard();
    return !!card && !!paidRowsOf(card);
  });
  const t = useMeasure(() => {
    const page = pageRef.current;
    if (!page) return null;
    const ma = studentCardOf(page, "Minh Anh");
    const popover = page.ownerDocument.querySelector(
      "[data-slot=popover-content]",
    );
    return {
      pick: ma && !onHistory ? pageBox(page, pickButton(ma)) : null,
      rows: ma && !onHistory ? pageBox(page, rowsOf(ma)) : null,
      history: pageBox(page, byText(page, "button", vi.fee.tabs.history)),
      month: onHistory ? pageBox(page, monthTrigger()) : null,
      prev: popover
        ? screenBox(byText(popover, "button", vi.ui.monthRangePicker.lastMonth))
        : null,
      dayRow: frame >= TAP_PREV && ma ? pageBox(page, dayRowOf(ma)) : null,
      paid: frame >= TAP_PREV && ma ? pageBox(page, paidRowsOf(ma)) : null,
    };
  });
  const lastPrev = useRef(t?.prev ?? null);
  if (t?.prev) lastPrev.current = t.prev;
  const listScroll = t?.rows
    ? Math.max(0, t.rows.y + t.rows.h + 40 - SCREEN_H)
    : 0;
  const scroll = onHistory ? 0 : scrollAt(frame, [[0, listScroll]]);
  const keep = (b: Box | null | undefined, at: number) =>
    b ? [{ at, ...center(b) }] : [];
  // the history tab sits at the top: tap it from where the list is scrolled to
  const historyTap = t?.history
    ? { ...t.history, y: t.history.y - (frame < TAP_HISTORY ? listScroll : 0) }
    : null;

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="click-soft" at={TAP_PICK2} volume={0.8} />
      <Sfx role="tick" at={NEW_HINT[0] + 2} volume={0.6} />
      <Sfx role="click-soft" at={TAP_HISTORY} volume={0.8} />
      <Sfx role="click-soft" at={TAP_MONTH} volume={0.8} />
      <Sfx role="pop" at={TAP_MONTH + 2} volume={0.6} />
      <Sfx role="select" at={TAP_PREV} volume={0.8} />
      <Sfx role="click-soft" at={TAP_DAY_ROW} volume={0.8} />
      <Sfx role="tick" at={PAID_HINT[0] + 2} volume={0.6} />
      <StepCaption eyebrow="Tháng 11" from={0} to={TAP_HISTORY}>
        <span style={{ color: colors.emerald }}>đã lên giá mới</span>
      </StepCaption>
      <StepCaption eyebrow="Đã thu" from={TAP_HISTORY}>
        <span style={{ color: colors.emerald }}>không bị đổi</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/fees"
        scroll={scroll}
        pageRef={pageRef}
        overlay={
          t ? (
            <>
              <Explain
                frame={frame}
                from={NEW_HINT[0]}
                to={NEW_HINT[1]}
                box={t.rows}
                scroll={scroll}
                side="above"
              >
                3 buổi tháng 11 đã tự lên 350.000đ
              </Explain>
              <Explain
                frame={frame}
                from={PAID_HINT[0]}
                to={PAID_HINT[1]}
                box={t.paid && { ...t.paid, h: Math.min(t.paid.h, SCREEN_H - 20 - t.paid.y) }}
                side="above"
              >
                Buổi tháng 10 đã thu: vẫn 300.000đ, không đổi
              </Explain>
            </>
          ) : null
        }
      >
        <FeesPage />
      </AppScreen>
      {t ? (
        <TapFinger
          frame={frame}
          taps={[
            ...keep(
              t.pick && { ...t.pick, y: t.pick.y - listScroll },
              TAP_PICK2,
            ),
            ...keep(historyTap, TAP_HISTORY),
            ...keep(t.month, TAP_MONTH),
            ...keep(lastPrev.current, TAP_PREV),
            ...keep(t.dayRow, TAP_DAY_ROW),
          ]}
          hideAt={TAP_DAY_ROW + 12}
        />
      ) : null}
    </>
  );
};

const schema = { ...Interactive.backgroundSchema };
export const ListScene = Interactive.create({
  Component: ListSceneInner,
  layout: "absolute-fill",
  schema,
});
export const CheckScene = Interactive.create({
  Component: CheckSceneInner,
  layout: "absolute-fill",
  schema,
});
