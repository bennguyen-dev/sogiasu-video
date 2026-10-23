import { useLayoutEffect, useRef, useState } from "react";
import { interpolate, Interactive, useCurrentFrame } from "remotion";
import ClassDetailPage from "@/features/class/pages/ClassDetailPage";
import { messages } from "@/shared/i18n/messages.generated";
import { setDemoSearch } from "../../../shared/app/stubs/next-navigation";
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
  SCREEN_H,
  screenBox,
  SuccessToast,
  TapFinger,
  useFocus,
  useMeasure,
  usePopover,
} from "../../../shared/tutorial/AppScreen";
import {
  studentCardOf,
  useRerenderWhen,
} from "../../../shared/tutorial/fee-page";
import { CourseDialog } from "../CourseDialog";
import {
  CLASS_ID_8,
  NEW_AMOUNT,
  NEW_END,
  NEW_LABEL,
  NEW_START,
  STUDENTS_8,
} from "../data";
import { useCourseApp } from "./shared";

const { vi } = messages;
const e = vi.enrollment;

const OVERDUE_HINT = [12, 78] as const;
const TAP_ADD = 92;
const OPEN = TAP_ADD + 2;
const TAP_LABEL = 112;
const LABEL_AT = TAP_LABEL + 6;
const LABEL_STEP = 2;
const TAP_AMOUNT = 152;
const AMOUNT_AT = TAP_AMOUNT + 6;
const AMOUNT_STEP = 4;
const DIGITS = String(NEW_AMOUNT);
const TAP_END = 198;
const TAP_DAY = 226;
const TO_STUDENTS = [236, 256] as const;
const TAP_SAVE = 270;
const SAVED = TAP_SAVE + 2;
const EACH_HINT = [292, 362] as const;
export const ADD_LENGTH = 376;

const typed = (frame: number, at: number, step: number, text: string) =>
  frame < at
    ? ""
    : text.slice(0, Math.min(text.length, Math.floor((frame - at) / step) + 1));
const courseDialog = (doc: Document) =>
  doc.querySelector<HTMLElement>("[data-course-dialog]");
const scrollerOf = (dialog: HTMLElement) => dialog.querySelector<HTMLElement>(".overflow-y-auto");
const day30 = (doc: Document) => {
  const popover = doc.querySelector("[data-slot=popover-content]");
  return popover
    ? [...popover.querySelectorAll<HTMLElement>("button")].find(
        (b) => b.textContent?.trim() === "30" && !b.closest("[data-outside]"),
      )
    : null;
};
const ledgerOf = (card: HTMLElement) =>
  byText(card, "span", e.list.coursesTitle)?.closest<HTMLElement>(
    ".flex-col",
  ) ?? null;

const AddSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useCourseApp(frame >= SAVED);
  useState(() => setDemoSearch("tab=students"));
  const pageRef = useRef<HTMLDivElement>(null);
  const doc = pageRef.current?.ownerDocument;
  const dialog = doc ? courseDialog(doc) : null;
  const open = frame >= OPEN && frame < SAVED;
  useFocus(
    frame >= TAP_LABEL && frame < TAP_AMOUNT
      ? dialog?.querySelector<HTMLElement>("[data-label] input")
      : frame >= TAP_AMOUNT && frame < TAP_END
        ? dialog?.querySelector<HTMLElement>("[data-amount] input")
        : null,
  );
  usePopover(
    dialog?.querySelector<HTMLElement>("[data-period-end] button"),
    frame >= TAP_END && frame < TAP_DAY + 4,
  );
  useRerenderWhen(
    frame >= TAP_END && frame < TAP_DAY,
    () => !!doc && !!day30(doc),
  );
  const progress = interpolate(frame, [...TO_STUDENTS], [0, 1], {
    ...clamp,
    easing: ease,
  });
  // the dialog's own scroller glides down to the students and the save button
  useLayoutEffect(() => {
    const box = dialog ? scrollerOf(dialog) : null;
    if (box) box.scrollTop = (box.scrollHeight - box.clientHeight) * progress;
  });

  const t = useMeasure(() => {
    const page = pageRef.current;
    const tabs = page?.querySelector("[role=tablist]");
    const trang = page ? studentCardOf(page, STUDENTS_8[0].name) : null;
    if (!page || !tabs || !trang) return null;
    const d = courseDialog(page.ownerDocument);
    const cards = STUDENTS_8.map((s) => studentCardOf(page, s.name));
    const ledgers = cards
      .map((c) => (c ? pageBox(page, ledgerOf(c)) : null))
      .filter((b): b is Box => !!b);
    return {
      scroll: Math.max(0, pageBox(page, tabs)!.y - 12),
      overdue: pageBox(page, ledgerOf(trang)),
      cards: ledgers.length
        ? {
            x: ledgers[0].x,
            y: ledgers[0].y,
            w: ledgers[0].w,
            h:
              ledgers[ledgers.length - 1].y +
              ledgers[ledgers.length - 1].h -
              ledgers[0].y,
          }
        : null,
      add: pageBox(page, byText(page, "button", e.list.addCourse)),
      label: screenBox(d?.querySelector("[data-label] input")),
      amount: screenBox(d?.querySelector("[data-amount] input")),
      end: screenBox(d?.querySelector("[data-period-end] button")),
      day: screenBox(day30(page.ownerDocument)),
      save: screenBox(d?.querySelector("[data-save]")),
    };
  });
  // the popover and the dialog close on the taps that end them: the finger still lands where they were
  const last = useRef<
    Partial<Record<"label" | "amount" | "end" | "day" | "save", Box>>
  >({});
  for (const k of ["label", "amount", "end", "day", "save"] as const) {
    const b = t?.[k];
    if (b) last.current[k] = b;
  }
  const scroll = t?.scroll ?? 0;
  const onScreen = (b: Box | null | undefined) =>
    b && { ...b, y: b.y - scroll };
  const fit = (b: Box | null | undefined) =>
    b && { ...b, h: Math.min(b.h, SCREEN_H - 20 - b.y) };
  const toastIn =
    frame >= SAVED && frame < SAVED + 64
      ? interpolate(frame - SAVED, [2, 10, 54, 62], [0, 1, 1, 0], {
          ...clamp,
          easing: ease,
        })
      : 0;
  const tap = (b: Box | null | undefined, at: number) =>
    b ? [{ at, ...center(b) }] : [];

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="tick" at={OVERDUE_HINT[0] + 2} volume={0.6} />
      <Sfx role="click-firm" at={TAP_ADD} volume={0.8} />
      <Sfx role="pop" at={OPEN + 2} volume={0.6} />
      <Sfx role="click-soft" at={TAP_LABEL} volume={0.8} />
      {typingCues(
        LABEL_AT,
        LABEL_AT + NEW_LABEL.length * LABEL_STEP,
        NEW_LABEL.length,
      ).map((f) => (
        <Sfx key={`l${f}`} role="key" at={f} volume={0.55} />
      ))}
      <Sfx role="click-soft" at={TAP_AMOUNT} volume={0.8} />
      {typingCues(
        AMOUNT_AT,
        AMOUNT_AT + DIGITS.length * AMOUNT_STEP,
        DIGITS.length,
      ).map((f) => (
        <Sfx key={`a${f}`} role="key" at={f} volume={0.55} />
      ))}
      <Sfx role="click-soft" at={TAP_END} volume={0.8} />
      <Sfx role="pop" at={TAP_END + 2} volume={0.6} />
      <Sfx role="select" at={TAP_DAY} volume={0.8} />
      <Sfx role="whoosh" at={TO_STUDENTS[0]} volume={0.3} />
      <Sfx role="confirm" at={TAP_SAVE} volume={0.9} />
      <Sfx role="tick" at={EACH_HINT[0] + 2} volume={0.6} />
      <StepCaption eyebrow="Khóa mới" from={0} to={SAVED}>
        <span style={{ color: colors.emerald }}>thêm cho cả lớp</span>
      </StepCaption>
      <StepCaption eyebrow="Đã thêm" from={SAVED}>
        <span style={{ color: colors.emerald }}>khóa tháng 11</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname={`/dashboard/classes/${CLASS_ID_8}`}
        scroll={scroll}
        pageRef={pageRef}
        fixed={
          toastIn > 0 ? (
            <SuccessToast enter={toastIn}>
              {e.bulkCourseDialog.added.replace(
                "{count}",
                String(STUDENTS_8.length),
              )}
            </SuccessToast>
          ) : null
        }
        overlay={
          t ? (
            <>
              <Explain
                frame={frame}
                from={OVERDUE_HINT[0]}
                to={OVERDUE_HINT[1]}
                box={t.overdue}
                scroll={scroll}
              >
                Hết khóa mà chưa thu sẽ hiện Quá hạn
              </Explain>
              <Explain
                frame={frame}
                from={EACH_HINT[0]}
                to={EACH_HINT[1]}
                box={fit(onScreen(t.cards))}
                side="above"
              >
                Mỗi học sinh có một khoản riêng
              </Explain>
            </>
          ) : null
        }
      >
        <ClassDetailPage id={CLASS_ID_8} />
        <CourseDialog
          open={open}
          label={typed(frame, LABEL_AT, LABEL_STEP, NEW_LABEL)}
          amount={
            frame < AMOUNT_AT
              ? null
              : Number(typed(frame, AMOUNT_AT, AMOUNT_STEP, DIGITS))
          }
          periodStart={NEW_START}
          periodEnd={frame >= TAP_DAY ? NEW_END : ""}
        />
      </AppScreen>
      {t ? (
        <TapFinger
          frame={frame}
          taps={[
            ...tap(onScreen(t.add), TAP_ADD),
            ...tap(last.current.label, TAP_LABEL),
            ...tap(last.current.amount, TAP_AMOUNT),
            ...tap(last.current.end, TAP_END),
            ...tap(last.current.day, TAP_DAY),
            ...tap(last.current.save, TAP_SAVE),
          ]}
          hideAt={TAP_SAVE + 12}
        />
      ) : null}
    </>
  );
};

export const AddScene = Interactive.create({
  Component: AddSceneInner,
  layout: "absolute-fill",
  schema: { ...Interactive.backgroundSchema },
});
