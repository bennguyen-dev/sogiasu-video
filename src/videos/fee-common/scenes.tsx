import type React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { QueryClient } from "@tanstack/react-query";
import { BillingMode } from "@prisma/client";
import { Interactive, interpolate, useCurrentFrame } from "remotion";
import ClassField from "@/features/class/components/ClassField";
import type { CreateClassInput } from "@/features/class/types";
import FeesPage from "@/features/fee/pages/FeesPage";
import type { VoucherOptionsInput } from "@/features/payment/types";
import { Form } from "@/shared/components/ui/form";
import { messages } from "@/shared/i18n/messages.generated";
import { setDemoSearch } from "../../shared/app/stubs/next-navigation";
import { Sfx } from "../../shared/audio/sfx";
import { StepCaption } from "../../shared/tutorial/StepCaption";
import { colors } from "../../shared/theme";
import {
  AppScreen,
  type Box,
  byText,
  center,
  Explain,
  pageBox,
  screenBox,
  SCREEN_H,
  scrollAt,
  TapFinger,
  useClickState,
  useMeasure,
  usePopover,
} from "../../shared/tutorial/AppScreen";
import { dayRowOf, paidRowsOf, pickButton, rowsOf, studentCardOf, useOpenCard, useRerenderWhen } from "../../shared/tutorial/fee-page";
import { classValues } from "../create-class/data";
import { WizardFooter, WizardPage } from "../create-class/WizardPage";
import type { voucherView } from "../fees/data";
import { VoucherDialog } from "../fees/VoucherDialog";
import { scroller, voucherDialog } from "../fees/scenes/FeeScenes";

// the scenes the fee episodes (6, 7, 8) share; each episode passes the hook that stands its app up
const { vi } = messages;
const schema = { ...Interactive.backgroundSchema };
type UseApp = () => QueryClient;
const listScrollOf = (rows: Box | null | undefined) => (rows ? Math.max(0, rows.y + rows.h + 40 - SCREEN_H) : 0);

// the billing mode, picked once when the class is made: its card, then the "can't change it later" line
const MODE_HINT = [14, 76] as const;
const LOCKED = [84, 146] as const;
export const MODE_LENGTH = 160;
const VISIBLE_H = SCREEN_H - 68;

export const makeModeScene = (c: {
  readonly useApp: UseApp;
  readonly mode: BillingMode;
  readonly className: string;
  readonly color: string;
  readonly title: string;
  readonly hint: string;
  readonly hintSide: "above" | "below";
}) => {
  const ModeSceneInner = () => {
    const frame = useCurrentFrame();
    const client = c.useApp();
    const pageRef = useRef<HTMLDivElement>(null);
    const form = useForm<CreateClassInput>({ defaultValues: { ...classValues(c.className, c.color), billingMode: c.mode } });
    const t = useMeasure<{ mode: Box; course: Box; locked: Box }>(() => {
      const page = pageRef.current;
      if (!page) return null;
      const card = (mode: string) => pageBox(page, page.querySelector(`button[value=${mode}]`)?.closest(".rounded-md.border"));
      const box = {
        mode: card(c.mode),
        course: card(BillingMode.PER_COURSE),
        locked: pageBox(page, [...page.querySelectorAll("p")].find((p) => p.textContent === vi.class.form.billingModeHint)),
      };
      return Object.values(box).every(Boolean) ? (box as { mode: Box; course: Box; locked: Box }) : null;
    });
    const scroll = t ? scrollAt(frame, [[0, Math.max(0, t.course.y + t.course.h + 16 - VISIBLE_H)]]) : 0;
    const beat = { frame, scroll };

    return (
      <>
        <Sfx role="whoosh" at={2} volume={0.4} />
        <Sfx role="tick" at={MODE_HINT[0] + 2} volume={0.6} />
        <Sfx role="tick" at={LOCKED[0] + 2} volume={0.6} />
        <StepCaption eyebrow={c.title} from={0}>
          <span style={{ color: colors.emerald }}>chọn lúc tạo lớp</span>
        </StepCaption>
        <AppScreen
          client={client}
          pathname="/dashboard/classes/new"
          scroll={scroll}
          pageRef={pageRef}
          fixed={<WizardFooter step={0} />}
          overlay={
            <>
              <Explain {...beat} from={MODE_HINT[0]} to={MODE_HINT[1]} box={t?.mode} side={c.hintSide}>
                {c.hint}
              </Explain>
              <Explain {...beat} from={LOCKED[0]} to={LOCKED[1]} box={t?.locked} color="#d97706">
                Chọn 1 lần lúc tạo lớp, sau này không đổi được
              </Explain>
            </>
          }
        >
          <WizardPage step={0}>
            <Form {...form}>
              <div className="space-y-4">
                <ClassField control={form.control} />
              </div>
            </Form>
          </WizardPage>
        </AppScreen>
      </>
    );
  };
  return Interactive.create({ Component: ModeSceneInner, layout: "absolute-fill", schema });
};

// after a raise: November at the new price, then the history tab's October, still at the old one
const TAP_PICK = 26;
const NEW_HINT = [42, 106] as const;
const TAP_HISTORY = 124;
const TAP_MONTH = 156;
const TAP_PREV = 184;
const TAP_DAY_ROW = 206;
const PAID_HINT = [222, 300] as const;
export const CHECK_LENGTH = 314;

export const makeCheckScene = (c: {
  readonly useApp: UseApp;
  readonly name: string;
  readonly newHint: string;
  readonly paidHint: string;
}) => {
  const CheckSceneInner = () => {
    const frame = useCurrentFrame();
    const client = c.useApp();
    const pageRef = useRef<HTMLDivElement>(null);
    // the tab and month live in the url; the frame sets it before the page reads it
    setDemoSearch(frame < TAP_HISTORY ? "" : frame < TAP_PREV ? "tab=history&month=2026-11" : "tab=history&month=2026-10");
    const onHistory = frame >= TAP_HISTORY;
    useOpenCard(pageRef.current, frame >= TAP_PICK && !onHistory, c.name);
    const monthTrigger = () => {
      const page = pageRef.current;
      return page ? [...page.querySelectorAll<HTMLElement>("button[aria-haspopup=dialog]")].find((b) => /2026/.test(b.textContent ?? "")) : null;
    };
    usePopover(onHistory ? monthTrigger() : null, frame >= TAP_MONTH && frame < TAP_PREV);
    useRerenderWhen(frame >= TAP_MONTH && frame < TAP_PREV, () => {
      const popover = pageRef.current?.ownerDocument.querySelector("[data-slot=popover-content]");
      return !!popover && !!byText(popover, "button", vi.ui.monthRangePicker.lastMonth);
    });
    const historyCard = () => (pageRef.current && frame >= TAP_PREV ? studentCardOf(pageRef.current, c.name) : null);
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
      const card = studentCardOf(page, c.name);
      const popover = page.ownerDocument.querySelector("[data-slot=popover-content]");
      return {
        pick: card && !onHistory ? pageBox(page, pickButton(card)) : null,
        rows: card && !onHistory ? pageBox(page, rowsOf(card)) : null,
        history: pageBox(page, byText(page, "button", vi.fee.tabs.history)),
        month: onHistory ? pageBox(page, monthTrigger()) : null,
        prev: popover ? screenBox(byText(popover, "button", vi.ui.monthRangePicker.lastMonth)) : null,
        dayRow: frame >= TAP_PREV && card ? pageBox(page, dayRowOf(card)) : null,
        paid: frame >= TAP_PREV && card ? pageBox(page, paidRowsOf(card)) : null,
      };
    });
    // "Tháng trước" closes its popover on the tap: the finger still lands where it was
    const lastPrev = useRef(t?.prev ?? null);
    if (t?.prev) lastPrev.current = t.prev;
    const listScroll = listScrollOf(t?.rows);
    const scroll = onHistory ? 0 : scrollAt(frame, [[0, listScroll]]);
    const keep = (b: Box | null | undefined, at: number) => (b ? [{ at, ...center(b) }] : []);
    // the history tab sits at the top: tap it from where the list is scrolled to
    const historyTap = t?.history ? { ...t.history, y: t.history.y - (frame < TAP_HISTORY ? listScroll : 0) } : null;

    return (
      <>
        <Sfx role="whoosh" at={2} volume={0.4} />
        <Sfx role="click-soft" at={TAP_PICK} volume={0.8} />
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
          <span style={{ color: colors.emerald }}>không đổi</span>
        </StepCaption>
        <AppScreen
          client={client}
          pathname="/dashboard/fees"
          scroll={scroll}
          pageRef={pageRef}
          overlay={
            t ? (
              <>
                <Explain frame={frame} from={NEW_HINT[0]} to={NEW_HINT[1]} box={t.rows} scroll={scroll} side="above">
                  {c.newHint}
                </Explain>
                <Explain
                  frame={frame}
                  from={PAID_HINT[0]}
                  to={PAID_HINT[1]}
                  box={t.paid && { ...t.paid, h: Math.min(t.paid.h, SCREEN_H - 20 - t.paid.y) }}
                  side="above"
                >
                  {c.paidHint}
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
              ...keep(t.pick && { ...t.pick, y: t.pick.y - listScroll }, TAP_PICK),
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
  return Interactive.create({ Component: CheckSceneInner, layout: "absolute-fill", schema });
};

// the month-end voucher: "Tạo phiếu học phí" on the student's card, then down to the finished autumn voucher
const TAP_VOUCHER = 22;
const OPEN = TAP_VOUCHER + 2;
const TO_VOUCHER = [OPEN + 12, OPEN + 32] as const;
const VOUCHER_HINT = [OPEN + 36, OPEN + 116] as const;
export const VOUCHER_LENGTH = OPEN + 128;

export const makeVoucherScene = (c: {
  readonly useApp: UseApp;
  readonly name: string;
  readonly student: { readonly id: string; readonly name: string };
  readonly options: VoucherOptionsInput;
  readonly view: typeof voucherView;
  readonly subtitle: string;
  readonly hint: React.ReactNode;
}) => {
  const VoucherSceneInner = () => {
    const frame = useCurrentFrame();
    const client = c.useApp();
    const pageRef = useRef<HTMLDivElement>(null);
    useState(() => setDemoSearch(""));
    const form = useForm({ defaultValues: c.options });
    const progress = interpolate(frame, [...TO_VOUCHER], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // the dialog's own scroller glides down to the finished voucher
    useLayoutEffect(() => {
      const doc = pageRef.current?.ownerDocument;
      const dialog = doc ? voucherDialog(doc) : null;
      const box = dialog ? scroller(dialog) : null;
      const voucher = dialog?.querySelector("[data-previews]")?.children[1];
      if (!box || !voucher) return;
      box.scrollTop = 0;
      const target = voucher.getBoundingClientRect().top - box.getBoundingClientRect().top - 8;
      box.scrollTop = Math.max(0, target) * progress;
    });
    const t = useMeasure(() => {
      const page = pageRef.current;
      const card = page ? studentCardOf(page, c.name) : null;
      if (!page || !card) return null;
      const dialog = voucherDialog(page.ownerDocument);
      const box = dialog ? scroller(dialog) : null;
      const voucher = screenBox(dialog?.querySelector("[data-previews]")?.children[1]);
      const view = box ? box.getBoundingClientRect() : null;
      return {
        create: pageBox(page, byText(card, "button", vi.fee.table.createVoucher)),
        voucher: voucher && view ? { ...voucher, h: Math.min(voucher.h, view.bottom - 12 - voucher.y) } : null,
      };
    });

    return (
      <>
        <Sfx role="click-firm" at={TAP_VOUCHER} volume={0.8} />
        <Sfx role="pop" at={OPEN + 2} volume={0.6} />
        <Sfx role="whoosh" at={TO_VOUCHER[0]} volume={0.3} />
        <Sfx role="tick" at={VOUCHER_HINT[0] + 2} volume={0.6} />
        <StepCaption eyebrow="Phiếu cuối tháng" from={0}>
          <span style={{ color: colors.emerald }}>{c.subtitle}</span>
        </StepCaption>
        <AppScreen
          client={client}
          pathname="/dashboard/fees"
          scroll={0}
          pageRef={pageRef}
          overlay={
            t ? (
              <Explain frame={frame} from={VOUCHER_HINT[0]} to={VOUCHER_HINT[1]} box={t.voucher}>
                {c.hint}
              </Explain>
            ) : null
          }
        >
          <FeesPage />
          <VoucherDialog open={frame >= OPEN} form={form} student={c.student} view={c.view} />
        </AppScreen>
        {t?.create ? <TapFinger frame={frame} taps={[{ at: TAP_VOUCHER, ...center(t.create) }]} hideAt={TAP_VOUCHER + 10} /> : null}
      </>
    );
  };
  return Interactive.create({ Component: VoucherSceneInner, layout: "absolute-fill", schema });
};
