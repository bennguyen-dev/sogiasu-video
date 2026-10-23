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
import { studentCardOf, useRerenderWhen } from "../../../shared/tutorial/fee-page";
import { CLASS_NAME } from "../../create-class/data";
import { CLASS_ID } from "../../attendance/data";
import { RateDialog } from "../../session-fee/RateDialog";
import { DISCOUNT, DISCOUNT_FROM, GH_NAME, GH_PRICE, ghHistory, NOVEMBER, TODAY_DATE } from "../data";
import { useAdjustApp } from "./shared";

const { vi } = messages;
const e = vi.enrollment;

const TAP_RATE = 26;
const OPEN = TAP_RATE + 2;
const TAP_DISCOUNT = 56;
const TYPE_AT = TAP_DISCOUNT + 6;
const TYPE_STEP = 4;
const DIGITS = String(DISCOUNT);
const DISCOUNT_HINT = [76, 146] as const;
const TAP_DATE = 158;
const TAP_DAY = 186;
const TAP_SAVE = 210;
const SAVED = TAP_SAVE + 2;
const MODES_HINT = [232, 302] as const;
export const DISCOUNT_LENGTH = 316;

const typedDiscount = (frame: number) =>
  frame < TYPE_AT ? null : Number(DIGITS.slice(0, Math.min(DIGITS.length, Math.floor((frame - TYPE_AT) / TYPE_STEP) + 1)));
const rateDialog = (doc: Document) => doc.querySelector<HTMLElement>("[data-rate-dialog]");
const dayOne = (doc: Document) => {
  const popover = doc.querySelector("[data-slot=popover-content]");
  return popover ? [...popover.querySelectorAll<HTMLElement>("button")].find((b) => b.textContent?.trim() === "1" && !b.closest("[data-outside]")) : null;
};
const rateLine = (card: HTMLElement) => byText(card, "span", e.list.priceTitle)?.closest<HTMLElement>(".flex-col") ?? null;

const DiscountSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useAdjustApp(frame >= SAVED ? 1 : 0);
  useState(() => setDemoSearch("tab=students"));
  const pageRef = useRef<HTMLDivElement>(null);
  const doc = pageRef.current?.ownerDocument;
  const dialog = doc ? rateDialog(doc) : null;
  useFocus(frame >= TAP_DISCOUNT && frame < TAP_DATE ? dialog?.querySelector<HTMLElement>("[data-discount] input") : null);
  usePopover(dialog?.querySelector<HTMLElement>("[data-effective-from] button"), frame >= TAP_DATE && frame < TAP_DAY + 4);
  useRerenderWhen(frame >= TAP_DATE && frame < TAP_DAY, () => !!doc && !!dayOne(doc));

  const t = useMeasure(() => {
    const page = pageRef.current;
    const tabs = page?.querySelector("[role=tablist]");
    const card = page ? studentCardOf(page, GH_NAME) : null;
    if (!page || !tabs || !card) return null;
    const d = rateDialog(page.ownerDocument);
    return {
      scroll: Math.max(0, pageBox(page, tabs)!.y - 12),
      rateLine: pageBox(page, rateLine(card)),
      rateBtn: pageBox(page, byText(card, "button", e.list.managePrice)),
      discount: screenBox(d?.querySelector("[data-discount] input")),
      date: screenBox(d?.querySelector("[data-effective-from] button")),
      day: screenBox(dayOne(page.ownerDocument)),
      save: screenBox(d?.querySelector("[data-save]")),
    };
  });
  // the dialog and its popover close on the taps that end them: the finger still lands where they were
  const last = useRef<Partial<Record<"discount" | "date" | "day" | "save", Box>>>({});
  for (const k of ["discount", "date", "day", "save"] as const) {
    const b = t?.[k];
    if (b) last.current[k] = b;
  }
  const scroll = t?.scroll ?? 0;
  const toastIn = frame >= SAVED && frame < SAVED + 64 ? interpolate(frame - SAVED, [2, 10, 54, 62], [0, 1, 1, 0], { ...clamp, easing: ease }) : 0;
  const tap = (b: Box | null | undefined, at: number) => (b ? [{ at, ...center(b) }] : []);

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="click-firm" at={TAP_RATE} volume={0.8} />
      <Sfx role="pop" at={OPEN + 2} volume={0.6} />
      <Sfx role="click-soft" at={TAP_DISCOUNT} volume={0.8} />
      {typingCues(TYPE_AT, TYPE_AT + DIGITS.length * TYPE_STEP, DIGITS.length).map((f) => (
        <Sfx key={f} role="key" at={f} volume={0.55} />
      ))}
      <Sfx role="tick" at={DISCOUNT_HINT[0] + 2} volume={0.6} />
      <Sfx role="click-soft" at={TAP_DATE} volume={0.8} />
      <Sfx role="pop" at={TAP_DATE + 2} volume={0.6} />
      <Sfx role="select" at={TAP_DAY} volume={0.8} />
      <Sfx role="confirm" at={TAP_SAVE} volume={0.9} />
      <Sfx role="tick" at={MODES_HINT[0] + 2} volume={0.6} />
      <StepCaption eyebrow="Giảm giá" from={0} to={SAVED}>
        <span style={{ color: colors.emerald }}>theo %</span>
      </StepCaption>
      <StepCaption eyebrow="Từ 01/11" from={SAVED}>
        <span style={{ color: colors.emerald }}>còn 225.000đ một buổi</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname={`/dashboard/classes/${CLASS_ID}`}
        scroll={scroll}
        pageRef={pageRef}
        fixed={
          toastIn > 0 ? (
            <SuccessToast enter={toastIn}>
              {e.priceDialog.saved}
              <div className="text-sm font-normal">{e.priceDialog.resynced.replace("{count}", String(NOVEMBER.length))}</div>
            </SuccessToast>
          ) : null
        }
        overlay={
          t ? (
            <>
              <Explain frame={frame} from={DISCOUNT_HINT[0]} to={DISCOUNT_HINT[1]} box={t.discount} side="above">
                Tháng khuyến mãi hay học sinh khó khăn thì giảm theo %
              </Explain>
              <Explain frame={frame} from={MODES_HINT[0]} to={MODES_HINT[1]} box={t.rateLine} scroll={scroll}>
                Lớp theo giờ, theo khóa cũng có ô Giảm giá
              </Explain>
            </>
          ) : null
        }
      >
        <ClassDetailPage id={CLASS_ID} />
        <RateDialog
          open={frame >= OPEN && frame < SAVED}
          history={ghHistory(0)}
          price={GH_PRICE}
          discount={typedDiscount(frame)}
          effectiveFrom={frame >= TAP_DAY ? DISCOUNT_FROM : TODAY_DATE}
          student={GH_NAME}
          className={CLASS_NAME}
        />
      </AppScreen>
      {t ? (
        <TapFinger
          frame={frame}
          taps={[
            ...tap(t.rateBtn && { ...t.rateBtn, y: t.rateBtn.y - scroll }, TAP_RATE),
            ...tap(last.current.discount, TAP_DISCOUNT),
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

export const DiscountScene = Interactive.create({ Component: DiscountSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
