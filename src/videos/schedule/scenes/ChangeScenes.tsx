import { useRef, useState } from "react";
import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { EMPTY_CALENDAR_FILTER } from "@/features/calendar/lib/calendar-filter";
import { onConfirm } from "@/shared/components/ui/confirm-dialog";
import { LOCAL_STORAGE_KEYS } from "@/shared/constants/local-storage";
import { messages } from "@/shared/i18n/messages.generated";
import { useMockApi } from "../../../shared/app/AppProviders";
import { useDemoNow } from "../../../shared/app/frozen-clock";
import { Sfx } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { clamp, ease } from "../../../shared/motion";
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
  SuccessToast,
  TapFinger,
  useMeasure,
} from "../../../shared/tutorial/AppScreen";
import { EndCard } from "../../create-class/scenes/EndScene";
import { CalendarScreen, type CreateSlot } from "../CalendarScreen";
import {
  filterLessons,
  GIA_HAN_ID,
  IELTS_ID,
  IELTS_THU,
  lessonsAt,
  MAKEUP_DATE,
  MAKEUP_ID,
  NOW_5,
  scheduleApi,
  type ScheduleState,
  WEEK_START,
} from "../data";
import { DetailMenu, FilterDialog } from "../Replicas";
import { useSteps } from "../steps";
import { MY_WINDOW } from "./ViewScenes";

const { vi } = messages;
const AMBER = "#f59e0b";

// what has changed by each scene: the scenes play in this order, each starting from where the last left off
let live: ScheduleState = { ieltsThuCancelled: false, makeup: false };
const API = scheduleApi(() => live);

const useScheduleScene = (state: ScheduleState) => {
  useDemoNow(NOW_5);
  live = state;
  useMockApi(API);
  const [client] = useState(newClient);
  return client;
};

const harness = (page: HTMLElement, date: string, name: string) =>
  [
    ...page.querySelectorAll<HTMLElement>(
      `.fc-timegrid-col[data-date="${date}"] .fc-timegrid-event-harness`,
    ),
  ].find((h) => h.textContent?.includes(name));
const dialogTitled = (doc: Document, title: string) =>
  [...doc.querySelectorAll<HTMLElement>("[data-slot=dialog-content]")].find(
    (d) => d.textContent?.includes(title),
  );
const useToast = (frame: number, from: number) =>
  frame >= from && frame < from + 56
    ? interpolate(frame - from, [2, 10, 46, 54], [0, 1, 1, 0], {
        ...clamp,
        easing: ease,
      })
    : 0;

// the week grid sits below the toolbar: scroll it so 16:00-22:00 is on screen
const WEEK_SCROLL = 330;

// 3 · cancelling Thursday's IELTS lesson: open it → ⋮ → Báo nghỉ buổi này → confirm
const TAP_CARD = 20;
const TAP_MENU = 58;
const TAP_ITEM = 86;
const TAP_CONFIRM = 122;
const CANCELLED_HINT = [138, 200] as const;
export const CANCEL_LENGTH = 212;

const CancelSceneInner = () => {
  const frame = useCurrentFrame();
  const cancelled = frame >= TAP_CONFIRM;
  const client = useScheduleScene({
    ieltsThuCancelled: cancelled,
    makeup: false,
  });
  const pageRef = useRef<HTMLDivElement>(null);
  const docOf = () => pageRef.current?.ownerDocument;
  const detail = () =>
    docOf()
      ? (dialogTitled(docOf()!, vi.lesson.detail.dialogDescription) ??
        [
          ...docOf()!.querySelectorAll<HTMLElement>(
            "[data-slot=dialog-content]",
          ),
        ].find((d) => d.querySelector("[data-tour=lesson-detail]")))
      : null;
  const menuButton = () =>
    [...(detail()?.querySelectorAll<HTMLElement>("button") ?? [])].find((b) =>
      b.querySelector("svg[class*='vertical']"),
    );
  const menu = () => docOf()?.querySelector<HTMLElement>("[data-detail-menu]");
  const confirm = () =>
    docOf()?.querySelector<HTMLElement>("[data-confirm-dialog]");
  const menuOpen = frame >= TAP_MENU && frame < TAP_ITEM;
  useSteps(frame, [
    // the app's own confirm, asked with the copy LessonDetailHeader's cancel uses
    {
      at: TAP_ITEM,
      done: () => cancelled || !!confirm(),
      // only once the phone's page (and the ConfirmDialog in it) has mounted, else the app falls back to window.confirm
      act: () => {
        if (!docOf()?.querySelector("[data-tour=lesson-detail]")) return;
        void onConfirm({
          title: vi.lesson.detail.cancelConfirmTitle,
          description: vi.lesson.detail.cancelConfirmDescription,
          confirmText: vi.lesson.detail.cancelConfirmText,
          variant: "destructive",
        });
      },
    },
    {
      at: TAP_CONFIRM,
      done: () => !confirm(),
      act: () => byText(confirm()!, "button", vi.ui.cancel)?.click(),
    },
  ]);
  const t = useMeasure(() => {
    const page = pageRef.current;
    if (!page) return null;
    const card = harness(page, "2026-11-05", "IELTS 5.5");
    const c = confirm();
    return card
      ? {
          card: pageBox(page, card)!,
          menu: screenBox(menuButton()),
          item: screenBox(menu()?.querySelector("[data-cancel-item]")),
          confirm: screenBox(
            c ? byText(c, "button", vi.lesson.detail.cancelConfirmText) : null,
          ),
        }
      : null;
  });
  const toastIn = useToast(frame, TAP_CONFIRM);

  return (
    <>
      <Sfx role="click-soft" at={TAP_CARD} volume={0.8} />
      <Sfx role="pop" at={TAP_CARD + 2} volume={0.6} />
      <Sfx role="click-soft" at={TAP_MENU} volume={0.8} />
      <Sfx role="click-soft" at={TAP_ITEM} volume={0.8} />
      <Sfx role="pop" at={TAP_ITEM + 2} volume={0.6} />
      <Sfx role="confirm" at={TAP_CONFIRM} volume={0.9} />
      <Sfx role="tick" at={CANCELLED_HINT[0] + 2} volume={0.6} />
      <StepCaption eyebrow="Cô bận buổi tối nay?" from={0}>
        <span style={{ color: colors.emerald }}>Báo nghỉ 1 chạm</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/calendar"
        scroll={WEEK_SCROLL}
        pageRef={pageRef}
        fixed={
          <>
            {menuOpen && t?.menu ? <DetailMenu anchor={t.menu} /> : null}
            {toastIn > 0 ? (
              <SuccessToast enter={toastIn}>
                {vi.lesson.detail.cancelSuccess}
              </SuccessToast>
            ) : null}
          </>
        }
        overlay={
          t ? (
            <Explain
              frame={frame}
              from={CANCELLED_HINT[0]}
              to={CANCELLED_HINT[1]}
              box={t.card}
              scroll={WEEK_SCROLL}
              color={AMBER}
            >
              Buổi vẫn ở đó, mờ và gạch ngang, không tính học phí
            </Explain>
          ) : null
        }
      >
        <CalendarScreen
          lessons={lessonsAt(live)}
          view="timeGridWeek"
          date={WEEK_START}
          viewWindow={MY_WINDOW}
          filter={EMPTY_CALENDAR_FILTER}
          detailId={frame >= TAP_CARD && !cancelled ? IELTS_THU : null}
        />
      </AppScreen>
      {t ? (
        <TapFinger
          frame={frame}
          taps={[
            {
              at: TAP_CARD,
              ...center({ ...t.card, y: t.card.y - WEEK_SCROLL }),
            },
            ...(t.menu ? [{ at: TAP_MENU, ...center(t.menu) }] : []),
            ...(t.item ? [{ at: TAP_ITEM, ...center(t.item) }] : []),
            ...(t.confirm ? [{ at: TAP_CONFIRM, ...center(t.confirm) }] : []),
          ]}
          hideAt={TAP_CONFIRM + 12}
        />
      ) : null}
    </>
  );
};

// 4 · a make-up lesson: tap the empty Saturday 18:00 slot → pick the class → Tạo buổi học
const TAP_SLOT = 20;
const TAP_CLASS = 58;
const TAP_CREATE = 96;
const MAKEUP_HINT = [112, 176] as const;
export const MAKEUP_LENGTH = 188;
const SLOT: CreateSlot = {
  date: MAKEUP_DATE,
  startTime: "18:00",
  endTime: "19:30",
};

const MakeupSceneInner = () => {
  const frame = useCurrentFrame();
  const created = frame >= TAP_CREATE;
  const client = useScheduleScene({ ieltsThuCancelled: true, makeup: created });
  const pageRef = useRef<HTMLDivElement>(null);
  const docOf = () => pageRef.current?.ownerDocument;
  const createDialog = () =>
    docOf() ? dialogTitled(docOf()!, vi.lesson.form.createTitle) : null;
  const classSelect = () =>
    createDialog()?.querySelector<HTMLSelectElement>("select");
  useSteps(frame, [
    {
      at: TAP_CLASS,
      done: () => created || classSelect()?.value === IELTS_ID,
      act: () => {
        // the form's Select also renders a native <select> for autofill; setting it picks the class
        const el = classSelect();
        if (!el) return;
        const win = el.ownerDocument.defaultView as Window & typeof globalThis;
        Object.getOwnPropertyDescriptor(
          win.HTMLSelectElement.prototype,
          "value",
        )?.set?.call(el, IELTS_ID);
        el.dispatchEvent(new win.Event("change", { bubbles: true }));
      },
    },
  ]);
  const t = useMeasure(() => {
    const page = pageRef.current;
    if (!page) return null;
    const col = page.querySelector(
      `.fc-timegrid-col[data-date="${MAKEUP_DATE}"]`,
    );
    const slot = page.querySelector(
      '.fc-timegrid-slot-lane[data-time="18:00:00"]',
    );
    const d = createDialog();
    const made = harness(page, MAKEUP_DATE, "IELTS 5.5");
    if (!col || !slot) return null;
    const c = pageBox(page, col)!;
    const s = pageBox(page, slot)!;
    return {
      slot: { x: c.x, y: s.y, w: c.w, h: s.h * 1.5 } as Box,
      trigger: screenBox(
        d?.querySelector("[data-slot=select-trigger], button[role=combobox]"),
      ),
      create: screenBox(d ? byText(d, "button", vi.lesson.form.create) : null),
      made: made ? pageBox(page, made) : null,
    };
  });

  return (
    <>
      <Sfx role="click-soft" at={TAP_SLOT} volume={0.8} />
      <Sfx role="pop" at={TAP_SLOT + 2} volume={0.6} />
      <Sfx role="select" at={TAP_CLASS} volume={0.8} />
      <Sfx role="click-firm" at={TAP_CREATE} volume={0.8} />
      <Sfx role="drop" at={TAP_CREATE + 4} volume={0.7} />
      <Sfx role="tick" at={MAKEUP_HINT[0] + 2} volume={0.6} />
      <StepCaption eyebrow="Dạy bù?" from={0}>
        <span style={{ color: colors.emerald }}>Bấm ô trống</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/calendar"
        scroll={WEEK_SCROLL}
        pageRef={pageRef}
        overlay={
          t ? (
            <Explain
              frame={frame}
              from={MAKEUP_HINT[0]}
              to={MAKEUP_HINT[1]}
              box={t.made}
              scroll={WEEK_SCROLL}
              side="above"
            >
              Buổi dạy bù: học sinh trong lớp tự có trong điểm danh
            </Explain>
          ) : null
        }
      >
        <CalendarScreen
          lessons={lessonsAt(live)}
          view="timeGridWeek"
          date={WEEK_START}
          viewWindow={MY_WINDOW}
          filter={EMPTY_CALENDAR_FILTER}
          createSlot={frame >= TAP_SLOT && !created ? SLOT : null}
        />
      </AppScreen>
      {t ? (
        <TapFinger
          frame={frame}
          taps={[
            {
              at: TAP_SLOT,
              ...center({ ...t.slot, y: t.slot.y - WEEK_SCROLL }),
            },
            ...(t.trigger ? [{ at: TAP_CLASS, ...center(t.trigger) }] : []),
            ...(t.create ? [{ at: TAP_CREATE, ...center(t.create) }] : []),
          ]}
          hideAt={TAP_CREATE + 12}
        />
      ) : null}
    </>
  );
};

// 5 · filter to one class (Gia Hân's, already in view in the list), share its week, then clear the filter
const TAP_FILTER = 20;
const TAP_CHECK = 52;
const TAP_APPLY = 80;
const FILTER_HINT = [92, 150] as const;
const TAP_SHARE = 170;
const TAP_LOCATION = 206;
const TAP_SEND = 240;
const SEND_HINT = [248, 304] as const;
const TAP_CLOSE = 316;
const TAP_CLEAR = 338;
export const SHARE_LENGTH = 358;

const SendSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useScheduleScene({ ieltsThuCancelled: true, makeup: true });
  const pageRef = useRef<HTMLDivElement>(null);
  const docOf = () => pageRef.current?.ownerDocument;
  const filtered = frame >= TAP_APPLY && frame < TAP_CLEAR;
  const filter = filtered
    ? { classIds: [GIA_HAN_ID], studentIds: [] }
    : EMPTY_CALENDAR_FILTER;
  // the share dialog's field toggles live in localStorage: start this scene from the app's defaults
  useState(() =>
    window.localStorage.removeItem(LOCAL_STORAGE_KEYS.calendarExportFields),
  );
  const filterDialog = () =>
    docOf() ? dialogTitled(docOf()!, vi.calendar.filter.description) : null;
  const shareDialog = () =>
    docOf()
      ? dialogTitled(docOf()!, vi.calendar.export.modalDescription)
      : null;
  const classBox = () =>
    filterDialog()?.querySelector<HTMLElement>(
      `[data-class-row="${GIA_HAN_ID}"] [role=checkbox]`,
    );
  const weekTab = () =>
    byText(shareDialog()!, "[role=tab]", vi.calendar.views.week);
  const locationBox = () => {
    const d = shareDialog();
    const label = d
      ? [...d.querySelectorAll<HTMLLabelElement>("label")].find(
          (l) => l.textContent?.trim() === vi.calendar.export.fieldLocation,
        )
      : null;
    return (
      label?.querySelector<HTMLElement>("[role=checkbox]") ??
      (label?.htmlFor
        ? d?.querySelector<HTMLElement>(`#${CSS.escape(label.htmlFor)}`)
        : null) ??
      null
    );
  };
  useSteps(frame, [
    {
      at: TAP_SHARE,
      done: () => frame >= TAP_CLOSE || !!shareDialog(),
      act: () => byText(docOf()!, "button", vi.calendar.export.action)?.click(),
    },
    // the dialog's focus trap lands on a period tab, and a focused radix tab selects itself: keep it on Tuần
    {
      at: TAP_SHARE,
      done: () =>
        frame >= TAP_CLOSE ||
        weekTab()?.getAttribute("data-state") === "active",
      act: () => weekTab()?.focus(),
    },
    {
      at: TAP_LOCATION,
      done: () =>
        frame >= TAP_CLOSE ||
        locationBox()?.getAttribute("data-state") === "checked",
      act: () => locationBox()?.click(),
    },
    {
      at: TAP_CLOSE,
      done: () => !shareDialog(),
      act: () =>
        shareDialog()
          ?.querySelector<HTMLElement>("[data-slot=dialog-close]")
          ?.click(),
    },
  ]);
  const t = useMeasure(() => {
    const page = pageRef.current;
    if (!page) return null;
    const fd = filterDialog();
    const sd = shareDialog();
    const chips = page.querySelector(
      `button[aria-label^="${vi.calendar.filter.remove.split("{")[0]}"]`,
    )?.parentElement;
    const shareBtn = byText(page, "button", vi.calendar.export.action);
    return shareBtn
      ? {
          filterBtn: pageBox(
            page,
            page.querySelector(
              `button[aria-label="${vi.calendar.filter.title}"]`,
            ),
          ),
          check: screenBox(classBox()),
          apply: screenBox(
            fd?.querySelector("[data-apply]"),
          ),
          chips: pageBox(page, chips),
          share: pageBox(page, shareBtn),
          location: screenBox(locationBox()),
          send: screenBox(
            sd ? byText(sd, "button", vi.calendar.export.share) : null,
          ),
          close: screenBox(sd?.querySelector("[data-slot=dialog-close]")),
          clear: pageBox(
            page,
            chips ? byText(chips, "button", vi.calendar.filter.clear) : null,
          ),
        }
      : null;
  });

  return (
    <>
      <Sfx role="click-soft" at={TAP_FILTER} volume={0.8} />
      <Sfx role="pop" at={TAP_FILTER + 2} volume={0.6} />
      <Sfx role="select" at={TAP_CHECK} volume={0.8} />
      <Sfx role="click-firm" at={TAP_APPLY} volume={0.8} />
      <Sfx role="tick" at={FILTER_HINT[0] + 2} volume={0.6} />
      <Sfx role="click-firm" at={TAP_SHARE} volume={0.8} />
      <Sfx role="pop" at={TAP_SHARE + 2} volume={0.6} />
      <Sfx role="select" at={TAP_LOCATION} volume={0.8} />
      <Sfx role="click-firm" at={TAP_SEND} volume={0.8} />
      <Sfx role="tick" at={SEND_HINT[0] + 2} volume={0.6} />
      <Sfx role="click-soft" at={TAP_CLOSE} volume={0.8} />
      <Sfx role="click-soft" at={TAP_CLEAR} volume={0.8} />
      <StepCaption eyebrow="Lọc theo lớp" from={0} to={TAP_SHARE}>
        <span style={{ color: colors.emerald }}>chỉ xem một lớp</span>
      </StepCaption>
      <StepCaption eyebrow="Gửi lịch mới" from={TAP_SHARE}>
        <span style={{ color: colors.emerald }}>vào nhóm lớp</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/calendar"
        scroll={0}
        pageRef={pageRef}
        overlay={
          t ? (
            <>
              <Explain
                frame={frame}
                from={FILTER_HINT[0]}
                to={FILTER_HINT[1]}
                box={t.chips}
              >
                Dạy nhiều lớp? Lọc để chỉ xem một lớp
              </Explain>
              <Explain
                frame={frame}
                from={SEND_HINT[0]}
                to={SEND_HINT[1]}
                box={t.send}
                side="above"
              >
                Gửi vào nhóm Zalo của lớp
              </Explain>
            </>
          ) : null
        }
      >
        <FilterDialog
          open={frame >= TAP_FILTER && frame < TAP_APPLY}
          checkedId={frame >= TAP_CHECK ? GIA_HAN_ID : null}
        />
        <CalendarScreen
          lessons={filterLessons(lessonsAt(live), filter.classIds)}
          view="timeGridWeek"
          date={WEEK_START}
          viewWindow={MY_WINDOW}
          filter={filter}
        />
      </AppScreen>
      {t ? (
        <TapFinger
          frame={frame}
          taps={[
            ...(t.filterBtn
              ? [{ at: TAP_FILTER, ...center(t.filterBtn) }]
              : []),
            ...(t.check ? [{ at: TAP_CHECK, ...center(t.check) }] : []),
            ...(t.apply ? [{ at: TAP_APPLY, ...center(t.apply) }] : []),
            ...(t.share ? [{ at: TAP_SHARE, ...center(t.share) }] : []),
            ...(t.location
              ? [{ at: TAP_LOCATION, ...center(t.location) }]
              : []),
            ...(t.send ? [{ at: TAP_SEND, ...center(t.send) }] : []),
            ...(t.close ? [{ at: TAP_CLOSE, ...center(t.close) }] : []),
            ...(t.clear ? [{ at: TAP_CLEAR, ...center(t.clear) }] : []),
          ]}
          hideAt={TAP_CLEAR + 12}
        />
      ) : null}
    </>
  );
};

const EndSceneInner = () => (
  <EndCard
    episode="Tập 5 · Lịch dạy hằng tuần"
    title={
      <>
        Đổi lịch, gửi lịch
        <br />
        trong 1 phút.
      </>
    }
    next={{ episode: "Tập 6", title: "Đổi học phí giữa chừng" }}
  />
);

const schema = { ...Interactive.backgroundSchema };
export const CancelScene = Interactive.create({
  Component: CancelSceneInner,
  layout: "absolute-fill",
  schema,
});
export const MakeupScene = Interactive.create({
  Component: MakeupSceneInner,
  layout: "absolute-fill",
  schema,
});
export const SendScene = Interactive.create({
  Component: SendSceneInner,
  layout: "absolute-fill",
  schema,
});
export const EndScene = Interactive.create({
  Component: EndSceneInner,
  layout: "absolute-fill",
  schema,
});
