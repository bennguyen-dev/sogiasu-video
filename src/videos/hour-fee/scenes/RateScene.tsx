import { useRef, useState } from "react";
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
  screenBox,
  SuccessToast,
  TapFinger,
  useFocus,
  useMeasure,
  usePopover,
} from "../../../shared/tutorial/AppScreen";
import { RateDialog } from "../../session-fee/RateDialog";
import { studentCardOf, useRerenderWhen } from "../../../shared/tutorial/fee-page";
import { CLASS_ID_7, CLASS_NAME_7, klHistory, NEW_RATE, NOVEMBER_7, OLD_RATE, RAISE_FROM_7, STUDENT_7, TODAY_DATE } from "../data";
import { useHourApp } from "./shared";

const { vi } = messages;
const e = vi.enrollment;
const NAME = "Khánh Linh";

const TAP_RATE = 30;
const TAP_INPUT = 56;
const TYPE_AT = TAP_INPUT + 6;
const TYPE_STEP = 4;
const DIGITS = String(NEW_RATE);
const TAP_DATE = 100;
const TAP_DAY = 128;
const DATE_HINT = [140, 206] as const;
const TAP_SAVE = 220;
const SAVED = TAP_SAVE + 2;
const SINCE_HINT = [240, 300] as const;
export const RATE_LENGTH = 314;

const typedRate = (frame: number) => {
  if (frame < TYPE_AT) return OLD_RATE;
  const n = Math.min(DIGITS.length, Math.floor((frame - TYPE_AT) / TYPE_STEP) + 1);
  return Number(DIGITS.slice(0, n));
};
const rateDialog = (doc: Document) => doc.querySelector<HTMLElement>("[data-rate-dialog]");
const dayOne = (doc: Document) => {
  const popover = doc.querySelector("[data-slot=popover-content]");
  return popover ? [...popover.querySelectorAll<HTMLElement>("button")].find((b) => b.textContent?.trim() === "1" && !b.closest("[data-outside]")) : null;
};
const rateLine = (card: HTMLElement) => byText(card, "span", e.list.priceTitle)?.closest<HTMLElement>(".flex-col") ?? null;

const RateSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useHourApp({ raised: frame >= SAVED, todayDone: true });
  useState(() => setDemoSearch("tab=students"));
  const pageRef = useRef<HTMLDivElement>(null);
  const doc = pageRef.current?.ownerDocument;
  const dialog = doc ? rateDialog(doc) : null;
  useFocus(frame >= TAP_INPUT && frame < TAP_DATE ? dialog?.querySelector<HTMLElement>("[data-price] input") : null);
  usePopover(dialog?.querySelector<HTMLElement>("[data-effective-from] button"), frame >= TAP_DATE && frame < TAP_DAY + 4);
  useRerenderWhen(frame >= TAP_DATE && frame < TAP_DAY, () => !!doc && !!dayOne(doc));

  const t = useMeasure(() => {
    const page = pageRef.current;
    const card = page ? studentCardOf(page, NAME) : null;
    if (!page || !card) return null;
    const d = rateDialog(page.ownerDocument);
    return {
      rateLine: pageBox(page, rateLine(card)),
      rateBtn: pageBox(page, byText(card, "button", e.list.managePrice)),
      price: screenBox(d?.querySelector("[data-price] input")),
      date: screenBox(d?.querySelector("[data-effective-from] button")),
      day: screenBox(dayOne(page.ownerDocument)),
      save: screenBox(d?.querySelector("[data-save]")),
    };
  });
  // the dialog and its popover close on the taps that end them: the finger still lands where they were
  const last = useRef<Partial<Record<"price" | "date" | "day" | "save", Box>>>({});
  for (const k of ["price", "date", "day", "save"] as const) {
    const b = t?.[k];
    if (b) last.current[k] = b;
  }
  const toastIn = frame >= SAVED && frame < SAVED + 64 ? interpolate(frame - SAVED, [2, 10, 54, 62], [0, 1, 1, 0], { ...clamp, easing: ease }) : 0;
  const tap = (b: Box | null | undefined, at: number) => (b ? [{ at, ...center(b) }] : []);

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="click-firm" at={TAP_RATE} volume={0.8} />
      <Sfx role="pop" at={TAP_RATE + 2} volume={0.6} />
      <Sfx role="click-soft" at={TAP_INPUT} volume={0.8} />
      {typingCues(TYPE_AT, TYPE_AT + DIGITS.length * TYPE_STEP, DIGITS.length).map((f) => (
        <Sfx key={f} role="key" at={f} volume={0.55} />
      ))}
      <Sfx role="click-soft" at={TAP_DATE} volume={0.8} />
      <Sfx role="pop" at={TAP_DATE + 2} volume={0.6} />
      <Sfx role="select" at={TAP_DAY} volume={0.8} />
      <Sfx role="tick" at={DATE_HINT[0] + 2} volume={0.6} />
      <Sfx role="confirm" at={TAP_SAVE} volume={0.9} />
      <Sfx role="tick" at={SINCE_HINT[0] + 2} volume={0.6} />
      <StepCaption eyebrow="Tăng giá từ 01/11" from={0} to={SAVED}>
        <span style={{ color: colors.emerald }}>chọn ngày bắt đầu áp dụng</span>
      </StepCaption>
      <StepCaption eyebrow="Lưu là xong" from={SAVED}>
        <span style={{ color: colors.emerald }}>khoản chưa thu tự tính lại</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname={`/dashboard/classes/${CLASS_ID_7}`}
        scroll={0}
        pageRef={pageRef}
        fixed={
          toastIn > 0 ? (
            <SuccessToast enter={toastIn}>
              {e.priceDialog.saved}
              <div className="text-sm font-normal">{e.priceDialog.resynced.replace("{count}", String(NOVEMBER_7.length))}</div>
            </SuccessToast>
          ) : null
        }
        overlay={
          t ? (
            <>
              <Explain frame={frame} from={DATE_HINT[0]} to={DATE_HINT[1]} box={t.date} side="above">
                Buổi từ 01/11 tính giá mới, buổi trước giữ giá cũ
              </Explain>
              <Explain frame={frame} from={SINCE_HINT[0]} to={SINCE_HINT[1]} box={t.rateLine}>
                Từ 01/11 tính 300.000đ một giờ
              </Explain>
            </>
          ) : null
        }
      >
        <ClassDetailPage id={CLASS_ID_7} />
        <RateDialog
          open={frame >= TAP_RATE && frame < SAVED}
          history={klHistory(false)}
          price={typedRate(frame)}
          effectiveFrom={frame >= TAP_DAY ? RAISE_FROM_7 : TODAY_DATE}
          hourly
          student={STUDENT_7}
          className={CLASS_NAME_7}
        />
      </AppScreen>
      {t ? (
        <TapFinger
          frame={frame}
          taps={[
            ...tap(t.rateBtn, TAP_RATE),
            ...tap(last.current.price, TAP_INPUT),
            ...tap(last.current.date, TAP_DATE),
            ...tap(last.current.day, TAP_DAY),
            ...tap(last.current.save, TAP_SAVE),
          ]}
          hideAt={TAP_SAVE + 12}
        />
      ) : null}
    </>
  );
};

export const RateScene = Interactive.create({ Component: RateSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
