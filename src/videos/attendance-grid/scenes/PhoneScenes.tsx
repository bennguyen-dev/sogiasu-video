import { useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender, Interactive, interpolate, useCurrentFrame } from "remotion";
import AttendancePage from "@/features/attendance/pages/AttendancePage";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { messages } from "@/shared/i18n/messages.generated";
import { Sfx, typingCues } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { clamp, ease } from "../../../shared/motion";
import { colors } from "../../../shared/theme";
import {
  AppScreen,
  type Box,
  byText,
  center,
  Explain,
  pageBox,
  screenBox,
  SuccessToast,
  TapFinger,
  useClickState,
  useFocus,
  useMeasure,
} from "../../../shared/tutorial/AppScreen";
import { CLASSES } from "../../../shared/demo/demo-school";
import { MARKED, MARKED_REASON, OPEN_CLASS_ID, OPEN_CLASS_NAME, OPEN_DATE } from "../data";
import { MarkedToast, ReasonDialog, StatusMenu } from "../Replicas";
import { useGridApp } from "./shared";

const { vi } = messages;
const AMBER = "#f59e0b";
const OPEN_COLOR = CLASSES.find((c) => c.id === OPEN_CLASS_ID)!.color;
const OPEN_DAY = new Date(`${OPEN_DATE}T19:30:00+07:00`);
const OPEN_END = new Date(`${OPEN_DATE}T21:30:00+07:00`);

// the table, its rows and the 11/11 cells, on the phone's attendance page
const tableOf = (page: HTMLElement) => page.querySelector<HTMLElement>("[data-slot=table-container]");
const rowsOf = (page: HTMLElement) => [...page.querySelectorAll<HTMLTableRowElement>("tbody tr")];
const classRow = (page: HTMLElement) => rowsOf(page).find((tr) => tr.cells[0]?.getAttribute("title") === OPEN_CLASS_NAME);
const studentRow = (page: HTMLElement, name: string) => rowsOf(page).filter((tr) => tr.cells[0]?.textContent?.includes(name)).at(-1);
const dayOf = (th: Element) => Number(th.textContent?.trim().match(/^(?:T\d|CN)(\d{1,2})$/)?.[1] ?? NaN);
const cellOn = (page: HTMLElement, row: HTMLTableRowElement | undefined, day: number) => {
  const head = [...page.querySelectorAll("thead th")].find((th) => dayOf(th) === day);
  if (!row || !head) return undefined;
  const h = head.getBoundingClientRect();
  const cx = h.left + h.width / 2;
  return [...row.cells].find((td) => {
    const b = td.getBoundingClientRect();
    return b.left <= cx && cx < b.right;
  });
};
const span = (a: Box | null, b: Box | null) => (a && b ? { x: a.x, y: a.y, w: a.w, h: b.y + b.h - a.y } : null);

// the table scrolls on its own: bring IELTS Teens' rows up under the day heads
const useTeensInView = (pageRef: React.RefObject<HTMLDivElement | null>) => {
  useLayoutEffect(() => {
    const page = pageRef.current;
    const box = page ? tableOf(page) : null;
    const row = page ? classRow(page) : null;
    const head = page?.querySelector("thead");
    if (!box || !row || !head) return;
    box.scrollTop = row.offsetTop - head.getBoundingClientRect().height - 44;
  });
};

const toastAt = (frame: number, at: number) =>
  frame >= at && frame < at + 70 ? interpolate(frame - at, [2, 10, 60, 68], [0, 1, 1, 0], { ...clamp, easing: ease }) : 0;

// 2 · Thảo Vy's 11/11 cell: tap it, pick Vắng, a reason, saved
const OPEN_HINT = [10, 72] as const;
const TAP_CELL = 86;
const TAP_ABSENT = 114;
const TAP_REASON = 136;
const TYPE_AT = TAP_REASON + 6;
const TYPE_STEP = 2;
const TAP_SAVE = TYPE_AT + MARKED_REASON.length * TYPE_STEP + 12;
const SAVED = TAP_SAVE + 2;
export const MARK_LENGTH = SAVED + 84;

const MarkSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useGridApp(frame >= SAVED ? 1 : 0);
  const pageRef = useRef<HTMLDivElement>(null);
  useTeensInView(pageRef);
  const doc = pageRef.current?.ownerDocument;
  const dialog = doc?.querySelector<HTMLElement>("[data-reason-dialog]");
  useFocus(frame >= TAP_REASON && frame < TAP_SAVE ? dialog?.querySelector<HTMLElement>("[data-reason]") : null);
  const t = useMeasure(() => {
    const page = pageRef.current;
    if (!page) return null;
    const head = pageBox(page, cellOn(page, classRow(page), 11));
    const cell = pageBox(page, cellOn(page, studentRow(page, MARKED.name), 11));
    if (!head || !cell) return null;
    const menu = page.ownerDocument.querySelector("[data-status-menu]");
    return {
      column: span(head, cell),
      cell,
      absent: screenBox(menu?.querySelector("[data-option=ABSENT]")),
      reason: screenBox(dialog?.querySelector("[data-reason]")),
      save: screenBox(dialog?.querySelector("[data-save]")),
    };
  });
  const last = useRef<Partial<Record<"absent" | "reason" | "save", Box>>>({});
  for (const k of ["absent", "reason", "save"] as const) {
    const b = t?.[k];
    if (b) last.current[k] = b;
  }
  const tap = (b: Box | null | undefined, at: number) => (b ? [{ at, ...center(b) }] : []);
  const toastIn = toastAt(frame, SAVED);

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="tick" at={OPEN_HINT[0] + 2} volume={0.6} />
      <Sfx role="click-soft" at={TAP_CELL} volume={0.8} />
      <Sfx role="pop" at={TAP_CELL + 2} volume={0.6} />
      <Sfx role="select" at={TAP_ABSENT} volume={0.8} />
      <Sfx role="click-soft" at={TAP_REASON} volume={0.8} />
      {typingCues(TYPE_AT, TYPE_AT + MARKED_REASON.length * TYPE_STEP, MARKED_REASON.length).map((f) => (
        <Sfx key={f} role="key" at={f} volume={0.55} />
      ))}
      <Sfx role="confirm" at={TAP_SAVE} volume={0.9} />
      <StepCaption eyebrow="Chạm ô" from={0}>
        <span style={{ color: colors.emerald }}>để điểm danh</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/attendance"
        scroll={0}
        pageRef={pageRef}
        fixed={
          <>
            {t && frame >= TAP_CELL + 2 && frame < TAP_ABSENT + 2 ? <StatusMenu cell={t.cell} student={MARKED.name} date={OPEN_DAY} /> : null}
            {toastIn > 0 ? (
              <MarkedToast enter={toastIn} student={MARKED.name} start={OPEN_DAY} end={OPEN_END} className={OPEN_CLASS_NAME} classColor={OPEN_COLOR} reason={MARKED_REASON} />
            ) : null}
          </>
        }
        overlay={
          t ? (
            <Explain frame={frame} from={OPEN_HINT[0]} to={OPEN_HINT[1]} box={t.column} color={AMBER}>
              Buổi tối 11/11 chưa điểm danh
            </Explain>
          ) : null
        }
      >
        <AttendancePage />
        <ReasonDialog
          open={frame >= TAP_ABSENT + 2 && frame < SAVED}
          student={MARKED.name}
          date={OPEN_DAY}
          reason={frame < TYPE_AT ? "" : MARKED_REASON.slice(0, Math.min(MARKED_REASON.length, Math.floor((frame - TYPE_AT) / TYPE_STEP) + 1))}
        />
      </AppScreen>
      {t ? (
        <TapFinger
          frame={frame}
          taps={[...tap(t.cell, TAP_CELL), ...tap(last.current.absent, TAP_ABSENT), ...tap(last.current.reason, TAP_REASON), ...tap(last.current.save, TAP_SAVE)]}
          hideAt={TAP_SAVE + 12}
        />
      ) : null}
    </>
  );
};

export const MarkScene = Interactive.create({ Component: MarkSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });

// 3 · the class row's 11/11: the lesson opens over the grid, "Đã dạy xong", confirmed, closed
const TAP_HEAD = 26;
const TAP_DONE = 76;
const TAP_CONFIRM = 108;
const TAP_CLOSE = 166;
const DONE_HINT = [184, 252] as const;
export const CLOSE_LENGTH = 266;

const lessonDialog = (doc: Document) =>
  [...doc.querySelectorAll<HTMLElement>("[data-slot=dialog-content]")].find((d) => !d.hasAttribute("data-confirm-dialog"));
const confirmDialog = (doc: Document) => doc.querySelector<HTMLElement>("[data-confirm-dialog]");

const CloseSceneInner = () => {
  const frame = useCurrentFrame();
  const done = frame >= TAP_CONFIRM;
  const client = useGridApp(done ? 2 : 1);
  const pageRef = useRef<HTMLDivElement>(null);
  const [, setRound] = useState(0);
  useTeensInView(pageRef);
  const doc = pageRef.current?.ownerDocument;
  const rerender = (label: string) => {
    const handle = delayRender(label);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setRound((n) => n + 1);
        continueRender(handle);
      }),
    );
  };
  // the grid owns which lesson is open: its status cell opens it, the dialog's X closes it
  useClickState(
    frame >= TAP_HEAD && frame < TAP_CLOSE,
    () => (doc ? !!lessonDialog(doc) : null),
    (want) => {
      const page = pageRef.current;
      if (!doc || !page) return;
      if (want) cellOn(page, classRow(page), 11)?.querySelector("button")?.click();
      else lessonDialog(doc)?.querySelector<HTMLElement>("[data-slot=dialog-close]")?.click();
      rerender("lesson dialog");
    },
  );
  // the app's own confirm opens on the banner's button; once confirmed the lesson reads back completed
  useClickState(
    frame >= TAP_DONE && frame < TAP_CONFIRM,
    () => (doc ? !!confirmDialog(doc) : null),
    (want) => {
      if (!doc) return;
      const d = lessonDialog(doc);
      if (want) (d ? byText(d, "button", vi.lesson.banner.markDone) : null)?.click();
      else byText(confirmDialog(doc) ?? doc, "button", vi.ui.cancel)?.click();
      rerender("confirm");
    },
  );
  const t = useMeasure(() => {
    const page = pageRef.current;
    if (!page) return null;
    const headCell = cellOn(page, classRow(page), 11);
    const head = pageBox(page, headCell);
    if (!head) return null;
    const d = doc ? lessonDialog(doc) : null;
    const c = doc ? confirmDialog(doc) : null;
    const rows = rowsOf(page);
    const lastRow = rows[rows.indexOf(classRow(page)!) + 2];
    return {
      head,
      column: span(head, pageBox(page, cellOn(page, lastRow, 11))),
      done: screenBox(d ? byText(d, "button", vi.lesson.banner.markDone) : null),
      confirm: screenBox(c ? byText(c, "button", vi.ui.confirm) : null),
      close: screenBox(d?.querySelector("[data-slot=dialog-close]")),
    };
  });
  const last = useRef<Partial<Record<"done" | "confirm" | "close", Box>>>({});
  for (const k of ["done", "confirm", "close"] as const) {
    const b = t?.[k];
    if (b) last.current[k] = b;
  }
  const tap = (b: Box | null | undefined, at: number) => (b ? [{ at, ...center(b) }] : []);
  const toastIn = toastAt(frame, TAP_CONFIRM);

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="click-soft" at={TAP_HEAD} volume={0.8} />
      <Sfx role="pop" at={TAP_HEAD + 2} volume={0.6} />
      <Sfx role="click-firm" at={TAP_DONE} volume={0.8} />
      <Sfx role="pop" at={TAP_DONE + 2} volume={0.6} />
      <Sfx role="confirm" at={TAP_CONFIRM} volume={0.9} />
      <Sfx role="click-soft" at={TAP_CLOSE} volume={0.7} />
      <Sfx role="tick" at={DONE_HINT[0] + 2} volume={0.6} />
      <StepCaption eyebrow="Chốt buổi" from={0}>
        <span style={{ color: colors.emerald }}>ngay trên bảng</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/attendance"
        scroll={0}
        pageRef={pageRef}
        fixed={toastIn > 0 ? <SuccessToast enter={toastIn}>{vi.lesson.banner.completeSuccess}</SuccessToast> : null}
        overlay={
          t ? (
            <Explain frame={frame} from={DONE_HINT[0]} to={DONE_HINT[1]} box={t.column}>
              Buổi đã chốt: Minh Quân có mặt, Thảo Vy vắng
            </Explain>
          ) : null
        }
      >
        <AttendancePage />
        <ConfirmDialog />
      </AppScreen>
      {t ? (
        <TapFinger
          frame={frame}
          taps={[...tap(t.head, TAP_HEAD), ...tap(last.current.done, TAP_DONE), ...tap(last.current.confirm, TAP_CONFIRM), ...tap(last.current.close, TAP_CLOSE)]}
          hideAt={TAP_CLOSE + 12}
        />
      ) : null}
    </>
  );
};

export const CloseScene = Interactive.create({ Component: CloseSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
