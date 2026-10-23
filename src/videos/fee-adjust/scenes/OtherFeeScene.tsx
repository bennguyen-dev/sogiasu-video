import { useRef, useState } from "react";
import { interpolate, Interactive, useCurrentFrame } from "remotion";
import ClassDetailPage from "@/features/class/pages/ClassDetailPage";
import { messages } from "@/shared/i18n/messages.generated";
import { setDemoSearch } from "../../../shared/app/stubs/next-navigation";
import { Sfx, typingCues } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { clamp, ease } from "../../../shared/motion";
import { colors } from "../../../shared/theme";
import { AppScreen, type Box, byText, center, Explain, pageBox, screenBox, SuccessToast, TapFinger, useFocus, useMeasure } from "../../../shared/tutorial/AppScreen";
import { studentCardOf } from "../../../shared/tutorial/fee-page";
import { CLASS_ID } from "../../attendance/data";
import { STUDENTS } from "../../create-class/data";
import { OtherFeeDialog } from "../Dialogs";
import { OTHER_AMOUNT, OTHER_LABEL } from "../data";
import { useAdjustApp } from "./shared";

const { vi } = messages;
const e = vi.enrollment;

const TAP_ADD = 24;
const OPEN = TAP_ADD + 2;
const TAP_LABEL = 46;
const LABEL_AT = TAP_LABEL + 6;
const LABEL_STEP = 2;
const TAP_AMOUNT = 82;
const AMOUNT_AT = TAP_AMOUNT + 6;
const AMOUNT_STEP = 4;
const DIGITS = String(OTHER_AMOUNT);
const TAP_SAVE = 128;
const SAVED = TAP_SAVE + 2;
const MODES_HINT = [150, 222] as const;
export const OTHER_LENGTH = 236;

const typed = (frame: number, at: number, step: number, text: string) =>
  frame < at ? "" : text.slice(0, Math.min(text.length, Math.floor((frame - at) / step) + 1));
const otherDialog = (doc: Document) => doc.querySelector<HTMLElement>("[data-other-dialog]");
const ledgerOf = (card: HTMLElement) => byText(card, "span", `${e.list.otherFees}:`)?.closest<HTMLElement>(".flex-col") ?? null;

const OtherFeeSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useAdjustApp(frame >= SAVED ? 3 : 2);
  useState(() => setDemoSearch("tab=students"));
  const pageRef = useRef<HTMLDivElement>(null);
  const dialog = pageRef.current ? otherDialog(pageRef.current.ownerDocument) : null;
  useFocus(
    frame >= TAP_LABEL && frame < TAP_AMOUNT
      ? dialog?.querySelector<HTMLElement>("[data-label] input")
      : frame >= TAP_AMOUNT && frame < TAP_SAVE
        ? dialog?.querySelector<HTMLElement>("[data-amount] input")
        : null,
  );
  const t = useMeasure(() => {
    const page = pageRef.current;
    const tabs = page?.querySelector("[role=tablist]");
    if (!page || !tabs) return null;
    const d = otherDialog(page.ownerDocument);
    const ledgers = STUDENTS.map((s) => studentCardOf(page, s.name))
      .map((c) => (c ? pageBox(page, ledgerOf(c)) : null))
      .filter((b): b is Box => !!b);
    const first = ledgers[0];
    const lastLedger = ledgers[ledgers.length - 1];
    return {
      scroll: Math.max(0, pageBox(page, tabs)!.y - 12),
      add: pageBox(page, byText(page, "button", e.list.addOtherFee)),
      ledgers: first && lastLedger ? { x: first.x, y: first.y, w: first.w, h: lastLedger.y + lastLedger.h - first.y } : null,
      label: screenBox(d?.querySelector("[data-label] input")),
      amount: screenBox(d?.querySelector("[data-amount] input")),
      save: screenBox(d?.querySelector("[data-save]")),
    };
  });
  const last = useRef<Partial<Record<"label" | "amount" | "save", Box>>>({});
  for (const k of ["label", "amount", "save"] as const) {
    const b = t?.[k];
    if (b) last.current[k] = b;
  }
  const scroll = t?.scroll ?? 0;
  const toastIn = frame >= SAVED && frame < SAVED + 64 ? interpolate(frame - SAVED, [2, 10, 54, 62], [0, 1, 1, 0], { ...clamp, easing: ease }) : 0;
  const tap = (b: Box | null | undefined, at: number) => (b ? [{ at, ...center(b) }] : []);

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="click-firm" at={TAP_ADD} volume={0.8} />
      <Sfx role="pop" at={OPEN + 2} volume={0.6} />
      <Sfx role="click-soft" at={TAP_LABEL} volume={0.8} />
      {typingCues(LABEL_AT, LABEL_AT + OTHER_LABEL.length * LABEL_STEP, OTHER_LABEL.length).map((f) => (
        <Sfx key={`l${f}`} role="key" at={f} volume={0.55} />
      ))}
      <Sfx role="click-soft" at={TAP_AMOUNT} volume={0.8} />
      {typingCues(AMOUNT_AT, AMOUNT_AT + DIGITS.length * AMOUNT_STEP, DIGITS.length).map((f) => (
        <Sfx key={`a${f}`} role="key" at={f} volume={0.55} />
      ))}
      <Sfx role="confirm" at={TAP_SAVE} volume={0.9} />
      <Sfx role="tick" at={MODES_HINT[0] + 2} volume={0.6} />
      <StepCaption eyebrow="Phí khác" from={0}>
        <span style={{ color: colors.emerald }}>thêm cho cả lớp</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname={`/dashboard/classes/${CLASS_ID}`}
        scroll={scroll}
        pageRef={pageRef}
        fixed={toastIn > 0 ? <SuccessToast enter={toastIn}>{e.bulkOtherFeeDialog.added.replace("{count}", String(STUDENTS.length))}</SuccessToast> : null}
        overlay={
          t ? (
            <Explain frame={frame} from={MODES_HINT[0]} to={MODES_HINT[1]} box={t.ledgers} scroll={scroll} side="above">
              Lớp theo giờ, theo khóa thêm phí khác giống vậy
            </Explain>
          ) : null
        }
      >
        <ClassDetailPage id={CLASS_ID} />
        <OtherFeeDialog
          open={frame >= OPEN && frame < SAVED}
          label={typed(frame, LABEL_AT, LABEL_STEP, OTHER_LABEL)}
          amount={frame < AMOUNT_AT ? null : Number(typed(frame, AMOUNT_AT, AMOUNT_STEP, DIGITS))}
        />
      </AppScreen>
      {t ? (
        <TapFinger
          frame={frame}
          taps={[
            ...tap(t.add && { ...t.add, y: t.add.y - scroll }, TAP_ADD),
            ...tap(last.current.label, TAP_LABEL),
            ...tap(last.current.amount, TAP_AMOUNT),
            ...tap(last.current.save, TAP_SAVE),
          ]}
          hideAt={TAP_SAVE + 12}
        />
      ) : null}
    </>
  );
};

export const OtherFeeScene = Interactive.create({ Component: OtherFeeSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
