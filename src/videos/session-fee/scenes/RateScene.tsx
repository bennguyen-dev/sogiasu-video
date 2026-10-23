import { useRef } from "react";
import { interpolate, Interactive, useCurrentFrame } from "remotion";
import ClassDetailPage from "@/features/class/pages/ClassDetailPage";
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
  scrollAt,
  SuccessToast,
  TapFinger,
  useFocus,
  useMeasure,
  usePopover,
} from "../../../shared/tutorial/AppScreen";
import { maHistory, NEW_PRICE, NOVEMBER, RAISE_FROM } from "../data";
import { RateDialog } from "../RateDialog";
import { useRerenderWhen } from "../use-rerender";
import { studentCardOf, useClassPage } from "./IntroScenes";

const { vi } = messages;
const e = vi.enrollment;
const AMBER = "#f59e0b";

const CARD_HINT = [10, 66] as const;
const TAP_RATE = 80;
const HISTORY_HINT = [96, 156] as const;
const TAP_INPUT = 170;
const TYPE_AT = TAP_INPUT + 6;
const TYPE_STEP = 4;
const DIGITS = String(NEW_PRICE);
const TAP_DATE = 214;
const TAP_DAY = 242;
const DATE_HINT = [254, 320] as const;
const NOTE_HINT = [328, 398] as const;
const TAP_SAVE = 412;
const SAVED = TAP_SAVE + 2;
const SINCE_HINT = [430, 488] as const;
const TO_GH = 494;
const UPCOMING_HINT = [512, 586] as const;
export const RATE_LENGTH = 600;

const typedPrice = (frame: number) => {
  if (frame < TYPE_AT) return 300_000;
  const n = Math.min(
    DIGITS.length,
    Math.floor((frame - TYPE_AT) / TYPE_STEP) + 1,
  );
  return Number(DIGITS.slice(0, n));
};

const rateDialog = (doc: Document) =>
  doc.querySelector<HTMLElement>("[data-rate-dialog]");
const dayOne = (doc: Document) => {
  const popover = doc.querySelector("[data-slot=popover-content]");
  return popover
    ? [...popover.querySelectorAll<HTMLElement>("button")].find(
        (b) => b.textContent?.trim() === "1" && !b.closest("[data-outside]"),
      )
    : null;
};
const rateLine = (card: HTMLElement) =>
  byText(card, "span", e.list.priceTitle)?.closest<HTMLElement>(".flex-col") ??
  null;

const RateSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useClassPage(frame >= SAVED);
  const pageRef = useRef<HTMLDivElement>(null);
  const doc = pageRef.current?.ownerDocument;
  const open = frame >= TAP_RATE && frame < SAVED;
  const dialog = doc ? rateDialog(doc) : null;
  const dateTrigger = dialog?.querySelector<HTMLElement>(
    "[data-effective-from] button",
  );

  useFocus(
    frame >= TAP_INPUT && frame < TAP_DATE
      ? dialog?.querySelector<HTMLElement>("[data-price] input")
      : null,
  );
  usePopover(dateTrigger, frame >= TAP_DATE && frame < TAP_DAY + 4);
  useRerenderWhen(frame >= TAP_DATE && frame < TAP_DAY, () => !!doc && !!dayOne(doc));

  const t = useMeasure(() => {
    const page = pageRef.current;
    if (!page) return null;
    const ma = studentCardOf(page, "Minh Anh");
    const gh = studentCardOf(page, "Gia Hân");
    if (!ma || !gh) return null;
    const d = rateDialog(page.ownerDocument);
    return {
      ma: pageBox(page, ma)!,
      maRate: pageBox(page, rateLine(ma)),
      rateBtn: pageBox(page, byText(ma, "button", e.list.managePrice)),
      gh: pageBox(page, gh)!,
      upcoming: pageBox(page, gh.querySelector(".text-warning")),
      history: screenBox(d?.querySelector("[data-history]")),
      price: screenBox(d?.querySelector("[data-price] input")),
      date: screenBox(d?.querySelector("[data-effective-from] button")),
      day: screenBox(dayOne(page.ownerDocument)),
      note: screenBox(d?.querySelector("[data-note]")),
      save: screenBox(d?.querySelector("[data-save]")),
    };
  });

  // the dialog and its popover close on the taps that end them: the finger still lands where they were
  const last = useRef<Partial<Record<"price" | "date" | "day" | "save", Box>>>({});
  for (const k of ["price", "date", "day", "save"] as const) {
    const b = t?.[k];
    if (b) last.current[k] = b;
  }
  const cardScroll = t ? Math.max(0, t.ma.y - 120) : 0;
  const ghScroll = t ? Math.max(cardScroll, t.gh.y - 200) : 0;
  const scroll = scrollAt(frame, [
    [TO_GH, cardScroll],
    [TO_GH + 16, ghScroll],
  ]);
  const toastIn =
    frame >= SAVED && frame < SAVED + 64
      ? interpolate(frame - SAVED, [2, 10, 54, 62], [0, 1, 1, 0], {
          ...clamp,
          easing: ease,
        })
      : 0;
  const onPage = <B extends { y: number }>(b: B | null | undefined) =>
    b ? { ...b, y: b.y - cardScroll } : null;
  const tap = (
    b: { x: number; y: number; w: number; h: number } | null | undefined,
    at: number,
  ) => (b ? [{ at, ...center(b) }] : []);

  return (
    <>
      <Sfx role="tick" at={CARD_HINT[0] + 2} volume={0.6} />
      <Sfx role="click-firm" at={TAP_RATE} volume={0.8} />
      <Sfx role="pop" at={TAP_RATE + 2} volume={0.6} />
      <Sfx role="tick" at={HISTORY_HINT[0] + 2} volume={0.6} />
      <Sfx role="click-soft" at={TAP_INPUT} volume={0.8} />
      {typingCues(
        TYPE_AT,
        TYPE_AT + DIGITS.length * TYPE_STEP,
        DIGITS.length,
      ).map((f) => (
        <Sfx key={f} role="key" at={f} volume={0.55} />
      ))}
      <Sfx role="click-soft" at={TAP_DATE} volume={0.8} />
      <Sfx role="pop" at={TAP_DATE + 2} volume={0.6} />
      <Sfx role="select" at={TAP_DAY} volume={0.8} />
      <Sfx role="tick" at={DATE_HINT[0] + 2} volume={0.6} />
      <Sfx role="tick" at={NOTE_HINT[0] + 2} volume={0.6} />
      <Sfx role="confirm" at={TAP_SAVE} volume={0.9} />
      <Sfx role="tick" at={SINCE_HINT[0] + 2} volume={0.6} />
      <Sfx role="whoosh" at={TO_GH} volume={0.3} />
      <Sfx role="tick" at={UPCOMING_HINT[0] + 2} volume={0.6} />
      <StepCaption eyebrow="Tăng giá từ 01/11" from={0} to={SAVED}>
        <span style={{ color: colors.emerald }}>chọn ngày bắt đầu áp dụng</span>
      </StepCaption>
      <StepCaption eyebrow="Lưu là xong" from={SAVED} to={TO_GH}>
        <span style={{ color: colors.emerald }}>
          khoản chưa thu tự tính lại
        </span>
      </StepCaption>
      <StepCaption eyebrow="Tăng từ tháng sau?" from={TO_GH}>
        <span style={{ color: "#d97706" }}>chọn ngày sau hôm nay</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/classes/new-class"
        scroll={scroll}
        pageRef={pageRef}
        fixed={
          toastIn > 0 ? (
            <SuccessToast enter={toastIn}>
              {e.priceDialog.saved}
              <div className="text-sm font-normal">
                {e.priceDialog.resynced.replace(
                  "{count}",
                  String(NOVEMBER.length),
                )}
              </div>
            </SuccessToast>
          ) : null
        }
        overlay={
          t ? (
            <>
              <Explain
                frame={frame}
                from={CARD_HINT[0]}
                to={CARD_HINT[1]}
                box={t.ma}
                scroll={scroll}
                side="above"
              >
                Mỗi em một giá, đổi riêng từng em
              </Explain>
              <Explain
                frame={frame}
                from={HISTORY_HINT[0]}
                to={HISTORY_HINT[1]}
                box={t.history}
              >
                Đang có 1 mức: 300.000đ cho mọi buổi
              </Explain>
              <Explain
                frame={frame}
                from={DATE_HINT[0]}
                to={DATE_HINT[1]}
                box={t.date}
                side="above"
              >
                Buổi từ 01/11 tính giá mới, buổi trước giữ giá cũ
              </Explain>
              <Explain
                frame={frame}
                from={NOTE_HINT[0]}
                to={NOTE_HINT[1]}
                box={t.note && t.save && t.note.y + t.note.h > t.save.y - 22 ? { ...t.note, h: t.save.y - 22 - t.note.y } : t.note}
                side="above"
              >
                Khoản chưa thu tự tính lại, khoản đã thu giữ nguyên
              </Explain>
              <Explain
                frame={frame}
                from={SINCE_HINT[0]}
                to={SINCE_HINT[1]}
                box={t.maRate}
                scroll={scroll}
              >
                Từ 01/11 tính 350.000đ một buổi
              </Explain>
              <Explain
                frame={frame}
                from={UPCOMING_HINT[0]}
                to={UPCOMING_HINT[1]}
                box={t.upcoming}
                scroll={scroll}
                color={AMBER}
              >
                Chọn ngày sau hôm nay? Tới ngày đó app mới tính giá mới
              </Explain>
            </>
          ) : null
        }
      >
        <ClassDetailPage id="new-class" />
        <RateDialog
          open={open}
          history={maHistory(false)}
          price={typedPrice(frame)}
          effectiveFrom={frame >= TAP_DAY ? RAISE_FROM : "2026-11-12"}
        />
      </AppScreen>
      {t ? (
        <TapFinger
          frame={frame}
          taps={[
            ...tap(onPage(t.rateBtn), TAP_RATE),
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

export const RateScene = Interactive.create({
  Component: RateSceneInner,
  layout: "absolute-fill",
  schema: { ...Interactive.backgroundSchema },
});
