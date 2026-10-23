import { useRef } from "react";
import { interpolate, Interactive, useCurrentFrame } from "remotion";
import { useTranslations } from "next-intl";
import LessonDetailContent from "@/features/lesson/components/LessonDetailContent";
import DashboardHeader from "@/shared/components/layouts/dashboard/header";
import DashboardMain from "@/shared/components/layouts/dashboard/main";
import PageHeader from "@/shared/components/layouts/dashboard/PageHeader";
import { messages } from "@/shared/i18n/messages.generated";
import { Sfx, typingCues } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { clamp, ease } from "../../../shared/motion";
import { colors } from "../../../shared/theme";
import { AppScreen, type Box, center, Explain, pageBox, screenBox, SuccessToast, TapFinger, useFocus, useMeasure } from "../../../shared/tutorial/AppScreen";
import { OverrideDialog } from "../Dialogs";
import { LESSON_ID_9, OVERRIDE_AMOUNT, OVERRIDE_FEE_BEFORE, OVERRIDE_REASON } from "../data";
import { useAdjustApp } from "./shared";

const { vi } = messages;

const TAP_EDIT = 30;
const OPEN = TAP_EDIT + 2;
const TAP_AMOUNT = 52;
const AMOUNT_AT = TAP_AMOUNT + 6;
const AMOUNT_STEP = 4;
const DIGITS = String(OVERRIDE_AMOUNT);
const TAP_REASON = 94;
const REASON_AT = TAP_REASON + 6;
const REASON_STEP = 2;
const REASON_HINT = [148, 214] as const;
const TAP_SAVE = 226;
const SAVED = TAP_SAVE + 2;
export const OVERRIDE_LENGTH = 300;

const typed = (frame: number, at: number, step: number, text: string) =>
  text.slice(0, Math.max(0, Math.min(text.length, Math.floor((frame - at) / step) + 1)));
const amountAt = (frame: number) => (frame < AMOUNT_AT ? OVERRIDE_FEE_BEFORE.amount : Number(typed(frame, AMOUNT_AT, AMOUNT_STEP, DIGITS)));
const overrideDialog = (doc: Document) => doc.querySelector<HTMLElement>("[data-override-dialog]");
// Gia Hân is the roster's second row: her "Sửa giá" button, and the header line it sits in
const ghEdit = (page: HTMLElement) => [...page.querySelectorAll<HTMLElement>(`button[aria-label="${vi.fee.override.action}"]`)][1];

// LessonDetailPage: the app's own lesson screen, read from the mock api
const LessonPage = () => {
  const t = useTranslations("lesson");
  return (
    <>
      <DashboardHeader>
        <PageHeader backHref="/dashboard/calendar">{t("detail.title")}</PageHeader>
      </DashboardHeader>
      <DashboardMain>
        <LessonDetailContent lessonId={LESSON_ID_9} />
      </DashboardMain>
    </>
  );
};

const OverrideSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useAdjustApp(frame >= SAVED ? 2 : 1);
  const pageRef = useRef<HTMLDivElement>(null);
  const dialog = pageRef.current ? overrideDialog(pageRef.current.ownerDocument) : null;
  useFocus(
    frame >= TAP_AMOUNT && frame < TAP_REASON
      ? dialog?.querySelector<HTMLElement>("[data-amount] input")
      : frame >= TAP_REASON && frame < TAP_SAVE
        ? dialog?.querySelector<HTMLElement>("[data-reason] input")
        : null,
  );
  const t = useMeasure(() => {
    const page = pageRef.current;
    const edit = page ? ghEdit(page) : null;
    if (!page || !edit) return null;
    const d = overrideDialog(page.ownerDocument);
    const row = pageBox(page, edit.closest(".flex-wrap"))!;
    return {
      scroll: Math.max(0, row.y - 320),
      edit: pageBox(page, edit),
      amount: screenBox(d?.querySelector("[data-amount] input")),
      reason: screenBox(d?.querySelector("[data-reason] input")),
      reasonField: screenBox(d?.querySelector("[data-reason]")),
      save: screenBox(d?.querySelector("[data-save]")),
    };
  });
  const last = useRef<Partial<Record<"amount" | "reason" | "save", Box>>>({});
  for (const k of ["amount", "reason", "save"] as const) {
    const b = t?.[k];
    if (b) last.current[k] = b;
  }
  const scroll = t?.scroll ?? 0;
  const toastIn = frame >= SAVED && frame < SAVED + 64 ? interpolate(frame - SAVED, [2, 10, 54, 62], [0, 1, 1, 0], { ...clamp, easing: ease }) : 0;
  const tap = (b: Box | null | undefined, at: number) => (b ? [{ at, ...center(b) }] : []);

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="click-firm" at={TAP_EDIT} volume={0.8} />
      <Sfx role="pop" at={OPEN + 2} volume={0.6} />
      <Sfx role="click-soft" at={TAP_AMOUNT} volume={0.8} />
      {typingCues(AMOUNT_AT, AMOUNT_AT + DIGITS.length * AMOUNT_STEP, DIGITS.length).map((f) => (
        <Sfx key={`a${f}`} role="key" at={f} volume={0.55} />
      ))}
      <Sfx role="click-soft" at={TAP_REASON} volume={0.8} />
      {typingCues(REASON_AT, REASON_AT + OVERRIDE_REASON.length * REASON_STEP, OVERRIDE_REASON.length).map((f) => (
        <Sfx key={`r${f}`} role="key" at={f} volume={0.55} />
      ))}
      <Sfx role="tick" at={REASON_HINT[0] + 2} volume={0.6} />
      <Sfx role="confirm" at={TAP_SAVE} volume={0.9} />
      <StepCaption eyebrow="Sửa giá 1 buổi" from={0} to={SAVED}>
        <span style={{ color: colors.emerald }}>kèm lý do</span>
      </StepCaption>
      <StepCaption eyebrow="Buổi 07/11" from={SAVED}>
        <span style={{ color: colors.emerald }}>còn 125.000đ</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname={`/dashboard/lessons/${LESSON_ID_9}`}
        scroll={scroll}
        pageRef={pageRef}
        fixed={toastIn > 0 ? <SuccessToast enter={toastIn}>{vi.fee.override.saved}</SuccessToast> : null}
        overlay={
          t ? (
            <Explain frame={frame} from={REASON_HINT[0]} to={REASON_HINT[1]} box={t.reasonField} side="above">
              Lý do hiện trên phiếu gửi phụ huynh
            </Explain>
          ) : null
        }
      >
        <LessonPage />
        <OverrideDialog
          open={frame >= OPEN && frame < SAVED}
          amount={frame >= AMOUNT_AT && amountAt(frame) === 0 ? null : amountAt(frame)}
          reason={frame < REASON_AT ? "" : typed(frame, REASON_AT, REASON_STEP, OVERRIDE_REASON)}
        />
      </AppScreen>
      {t ? (
        <TapFinger
          frame={frame}
          taps={[
            ...tap(t.edit && { ...t.edit, y: t.edit.y - scroll }, TAP_EDIT),
            ...tap(last.current.amount, TAP_AMOUNT),
            ...tap(last.current.reason, TAP_REASON),
            ...tap(last.current.save, TAP_SAVE),
          ]}
          hideAt={TAP_SAVE + 12}
        />
      ) : null}
    </>
  );
};

export const OverrideScene = Interactive.create({ Component: OverrideSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
