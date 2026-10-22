import { useLayoutEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  continueRender,
  delayRender,
  Interactive,
  interpolate,
  useCurrentFrame,
} from "remotion";
import FeesPage from "@/features/fee/pages/FeesPage";
import { feeKeys } from "@/features/fee/hooks/fee-keys";
import type { VoucherOptionsInput } from "@/features/payment/types";
import {
  ConfirmDialog,
  onConfirm,
} from "@/shared/components/ui/confirm-dialog";
import { messages } from "@/shared/i18n/messages.generated";
import { formatCurrency } from "@/shared/lib/utils";
import { useMockApi } from "../../../shared/app/AppProviders";
import { useDemoNow } from "../../../shared/app/frozen-clock";
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
  newClient,
  pageBox,
  screenBox,
  SCREEN_H,
  scrollAt,
  SuccessToast,
  TapFinger,
  useClickState,
  useDriveForm,
  useMeasure,
} from "../../../shared/tutorial/AppScreen";
import { EndCard } from "../../create-class/scenes/EndScene";
import {
  COMMENT,
  FEES_API,
  MINH_ANH,
  MONTH_END,
  REPORT_FROM,
  REPORT_TO,
  TRANSFER_REF,
} from "../data";
import { VoucherDialog } from "../VoucherDialog";

const { vi } = messages;
const AMBER = "#f59e0b";

// the collected flag the fees api answers from, set by whichever scene renders
let collected = false;
const API = FEES_API(() => collected);

const cardOf = (root: ParentNode, name: string) =>
  [...root.querySelectorAll<HTMLElement>("[data-slot=card]")].find(
    (c) =>
      c.querySelector(".font-semibold, span")?.textContent?.includes(name) ||
      c.textContent?.startsWith(name),
  );
const studentCard = (root: ParentNode, name: string) =>
  [...root.querySelectorAll<HTMLElement>("[data-slot=card]")]
    .filter((c) => c.textContent?.includes(name))
    .sort((a, b) => a.textContent!.length - b.textContent!.length)[0] ??
  cardOf(root, name);
const totalRow = (root: ParentNode) =>
  byText(root, "span, p, div", vi.fee.list.totalDebtLabel)?.parentElement ??
  null;
const useToast = (frame: number, from: number) =>
  frame >= from && frame < from + 60
    ? interpolate(frame - from, [2, 10, 50, 58], [0, 1, 1, 0], {
        ...clamp,
        easing: ease,
      })
    : 0;

const useFeesPage = (tab: "pending" | "history", isCollected: boolean) => {
  useDemoNow(MONTH_END);
  collected = isCollected;
  useMockApi(API);
  useState(() => setDemoSearch(tab === "history" ? "tab=history" : ""));
  const [client] = useState(newClient);
  // marking fees collected: the pending list refetches, as it does after the app's own mutation
  const seen = useRef(isCollected);
  useLayoutEffect(() => {
    if (seen.current === isCollected) return;
    seen.current = isCollected;
    const handle = delayRender("refetch fees");
    void client
      .invalidateQueries({ queryKey: feeKeys.all })
      .then(() => requestAnimationFrame(() => continueRender(handle)));
  });
  return client;
};

// 1 · the Fees page at month end: the total, and Gia Hân's 8 lessons
const TOTAL_HINT = [10, 76] as const;
const GH_HINT = [92, 156] as const;
const TAP_VOUCHER = 176;
export const FEES_LENGTH = 188;

const FeesSceneInner = () => {
  const client = useFeesPage("pending", false);
  const frame = useCurrentFrame();
  const pageRef = useRef<HTMLDivElement>(null);
  const t = useMeasure(() => {
    const page = pageRef.current;
    const ma = page ? studentCard(page, "Minh Anh") : null;
    const gh = page ? studentCard(page, "Gia Hân") : null;
    const total = page ? totalRow(page) : null;
    if (!page || !ma || !gh || !total) return null;
    return {
      total: pageBox(page, total)!,
      ma: pageBox(page, ma)!,
      gh: pageBox(page, gh)!,
      voucher: pageBox(page, byText(ma, "button", vi.fee.table.createVoucher))!,
    };
  });
  const keys: [number, number][] = t
    ? [
        [GH_HINT[0] - 14, 0],
        [GH_HINT[0], Math.max(0, t.gh.y - 120)],
        [GH_HINT[1] + 2, Math.max(0, t.gh.y - 120)],
        [
          GH_HINT[1] + 14,
          Math.max(0, t.voucher.y + t.voucher.h + 30 - SCREEN_H),
        ],
      ]
    : [[0, 0]];
  const scroll = scrollAt(frame, keys);

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="tick" at={TOTAL_HINT[0] + 2} volume={0.6} />
      <Sfx role="tick" at={GH_HINT[0] + 2} volume={0.6} />
      <Sfx role="click-firm" at={TAP_VOUCHER} volume={0.8} />
      <StepCaption eyebrow="Cuối tháng" from={0}>
        <span style={{ color: colors.emerald }}>Học phí cộng sẵn</span>
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
                from={TOTAL_HINT[0]}
                to={TOTAL_HINT[1]}
                box={t.total}
                scroll={scroll}
              >
                Chỉ buổi đã bấm <b>Đã dạy xong</b> mới vào đây
              </Explain>
              <Explain
                frame={frame}
                from={GH_HINT[0]}
                to={GH_HINT[1]}
                box={t.gh}
                scroll={scroll}
                color={AMBER}
                side="above"
              >
                Gia Hân 8 buổi: buổi nghỉ có phép không tính
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
            {
              at: TAP_VOUCHER,
              ...center({
                ...t.voucher,
                y: t.voucher.y - scrollAt(TAP_VOUCHER, keys),
              }),
            },
          ]}
          hideAt={TAP_VOUCHER + 10}
        />
      ) : null}
    </>
  );
};

// 2 · the voucher dialog: each option on top, then down to the finished voucher and its report image
const QR_HINT = [10, 76] as const;
const HIDE_HINT = [88, 150] as const;
const TAP_REPORT = 166;
const RANGE_HINT = [178, 242] as const;
const TAP_COMMENTS = 270;
const TAP_REVIEW = 296;
const NOTES_HINT = [308, 368] as const;
const TAP_CLOSE_NOTES = 380;
const TAP_TEXT = 398;
const TYPE_AT = TAP_TEXT + 6;
const TYPE_RATE = 4;
const TEMPLATES = 454;
const TAP_AUTUMN = 506;
const TEMPLATE_HINT = [514, 574] as const;
const PREVIEW = 584;
const PREVIEW_HINT = [606, 670] as const;
const REPORT_HINT = [698, 758] as const;
const TAP_SHARE = 774;
export const VOUCHER_LENGTH = 786;

export const optionsAt = (frame: number): VoucherOptionsInput => ({
  templateId: frame >= TAP_AUTUMN ? "autumn" : "basic",
  useQr: true,
  transferRef: TRANSFER_REF,
  hideSessionDetails: false,
  showComments: frame >= TAP_COMMENTS,
  comment:
    frame >= TYPE_AT
      ? COMMENT.slice(0, Math.floor((frame - TYPE_AT) * TYPE_RATE))
      : "",
  includeReport: frame >= TAP_REPORT,
  reportFrom: REPORT_FROM,
  reportTo: REPORT_TO,
});
export const FINAL_OPTIONS = optionsAt(10_000);

export const voucherDialog = (doc: Document) =>
  [...doc.querySelectorAll<HTMLElement>("[data-slot=dialog-content]")].find((d) => d.querySelector("h2")?.textContent?.startsWith(`${vi.payment.qrDialog.title} ·`));
export const scroller = (dialog: HTMLElement) =>
  dialog.querySelector<HTMLElement>(".overflow-y-auto");
const notesDialog = (doc: Document) =>
  [...doc.querySelectorAll<HTMLElement>("[data-slot=dialog-content]")].find(
    (d) => d.textContent?.includes(vi.payment.comments.reviewTitle),
  );
// a switch card's label may carry a badge ("Mới") after its text
const switchCard = (root: ParentNode, label: string) =>
  [...root.querySelectorAll<HTMLElement>("label")].find((l) => l.textContent?.trim().startsWith(label))?.closest<HTMLElement>(".rounded-md.border");

type Content = Record<
  | "qr"
  | "hide"
  | "report"
  | "comments"
  | "templates"
  | "voucher"
  | "reportImage",
  Box | null
>;

// positions inside the dialog's own scroller, so they hold whatever it's scrolled to
const measureDialog = (doc: Document) => {
  const dialog = voucherDialog(doc);
  const box = dialog ? scroller(dialog) : null;
  if (!dialog || !box) return null;
  const top = box.getBoundingClientRect().top;
  const inContent = (el: Element | null | undefined): Box | null => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return {
      x: b.left,
      y: b.top - top + box.scrollTop,
      w: b.width,
      h: b.height,
    };
  };
  const p = vi.payment.qrDialog;
  const previews = dialog.querySelector("[data-previews]");
  const content: Content = {
    qr: inContent(switchCard(dialog, p.useQr)),
    hide: inContent(switchCard(dialog, p.hideSessionDetails)),
    report: inContent(switchCard(dialog, p.includeReport)),
    comments: inContent(switchCard(dialog, p.showComments)),
    templates: inContent(
      byText(dialog, "label", p.templateLabel)?.parentElement,
    ),
    voucher: inContent(previews?.children[1]),
    reportImage: inContent(previews?.children[2]),
  };
  const notes = notesDialog(doc);
  return {
    top,
    viewH: box.clientHeight,
    maxScroll: box.scrollHeight - box.clientHeight,
    content,
    toggles: {
      report: screenBox(
        switchCard(dialog, p.includeReport)?.querySelector("[role=switch]"),
      ),
      comments: screenBox(
        switchCard(dialog, p.showComments)?.querySelector("[role=switch]"),
      ),
    },
    review: screenBox(
      byText(dialog, "button", vi.payment.comments.reviewLabel),
    ),
    textarea: screenBox(dialog.querySelector("textarea")),
    autumn: screenBox(
      dialog.querySelector(
        `button[aria-label="${vi.payment.qrTemplate.autumn}"]`,
      ),
    ),
    share: screenBox(dialog.querySelector("[data-share]")),
    notes: screenBox(notes),
    closeNotes: screenBox(notes ? byText(notes, "button", vi.ui.close) : null),
  };
};

// a box in the scroller's content, where it sits on screen at scroll `s`
const onScreen = (
  b: Box | null | undefined,
  top: number,
  s: number,
): Box | null => (b ? { ...b, y: top + b.y - s } : null);

const VoucherSceneInner = () => {
  const client = useFeesPage("pending", false);
  const frame = useCurrentFrame();
  const pageRef = useRef<HTMLDivElement>(null);
  const values = optionsAt(frame);
  const form = useForm({ defaultValues: values });
  useDriveForm(form, values);
  // read the document when used, not at render: the first render runs before the page has mounted
  const docOf = () => pageRef.current?.ownerDocument;
  const [d, setD] = useState<ReturnType<typeof measureDialog>>(null);

  const c = d?.content;
  const fit = (b: Box | null | undefined, margin = 16) =>
    b && d ? Math.max(0, b.y + b.h + margin - d.viewH) : 0;
  const keys: [number, number][] =
    c && d
      ? [
          [RANGE_HINT[1], 0],
          [RANGE_HINT[1] + 14, fit(c.comments, 140)],
          [TAP_CLOSE_NOTES + 4, fit(c.comments, 140)],
          [TAP_CLOSE_NOTES + 14, fit(c.comments, 20)],
          [TEMPLATES, fit(c.comments, 20)],
          [TEMPLATES + 16, Math.max(0, (c.templates?.y ?? 0) - 120)],
          [PREVIEW, Math.max(0, (c.templates?.y ?? 0) - 120)],
          [PREVIEW + 20, c.voucher?.y ?? 0],
          [REPORT_HINT[0] - 22, c.voucher?.y ?? 0],
          [REPORT_HINT[0] - 4, (c.reportImage?.y ?? 0) - 60],
          [TAP_SHARE - 20, (c.reportImage?.y ?? 0) - 60],
        ]
      : [[0, 0]];
  // the browser stops a scroller at its end, so the overlay must too
  const dialogScroll = Math.min(scrollAt(frame, keys), d?.maxScroll ?? Infinity);
  // the template strip scrolls sideways to the seasonal ones at its end
  const stripScroll = interpolate(
    frame,
    [TEMPLATES + 20, TAP_AUTUMN - 16],
    [0, 1],
    { ...clamp, easing: ease },
  );

  useLayoutEffect(() => {
    const doc = docOf();
    const dialog = doc ? voucherDialog(doc) : null;
    const box = dialog ? scroller(dialog) : null;
    if (box) box.scrollTop = dialogScroll;
    const strip = dialog
      ? byText(dialog, "label", vi.payment.qrDialog.templateLabel)
          ?.nextElementSibling
      : null;
    // the strip lives in the phone's iframe, so its elements fail the parent window's instanceof checks
    if (strip) {
      const el = strip as HTMLElement;
      el.scrollLeft = stripScroll * (el.scrollWidth - el.clientWidth);
    }
    const next = doc ? measureDialog(doc) : null;
    if (JSON.stringify(next) !== JSON.stringify(d)) setD(next);
  });
  // the review-notes dialog is the app's own: opened and closed by its buttons
  useClickState(
    frame >= TAP_REVIEW && frame < TAP_CLOSE_NOTES,
    () => {
      const doc = docOf();
      return doc ? !!notesDialog(doc) : null;
    },
    (want) => {
      const doc = docOf();
      const dialog = doc ? voucherDialog(doc) : null;
      if (want && dialog)
        byText(dialog, "button", vi.payment.comments.reviewLabel)?.click();
      if (!want && doc) {
        const n = notesDialog(doc);
        if (n) byText(n, "button", vi.ui.close)?.click();
      }
      const handle = delayRender("notes dialog");
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setD(doc ? measureDialog(doc) : null);
          continueRender(handle);
        }),
      );
    },
  );
  const holdMeasure = useMeasure(() => {
    const doc = docOf();
    return doc ? measureDialog(doc) : null;
  });
  void holdMeasure;

  const top = d?.top ?? 0;
  const at = (b: Box | null | undefined) => onScreen(b, top, dialogScroll);
  const tapAt = (b: Box | null | undefined, when: number) =>
    b ? { at: when, ...center(b) } : null;
  const taps = d
    ? [
        tapAt(d.toggles.report, TAP_REPORT),
        tapAt(d.toggles.comments, TAP_COMMENTS),
        tapAt(d.review, TAP_REVIEW),
        tapAt(d.closeNotes, TAP_CLOSE_NOTES),
        tapAt(d.textarea, TAP_TEXT),
        tapAt(d.autumn, TAP_AUTUMN),
        tapAt(d.share, TAP_SHARE),
      ].filter((x): x is NonNullable<typeof x> => !!x)
    : [];

  return (
    <>
      {[
        QR_HINT,
        HIDE_HINT,
        RANGE_HINT,
        NOTES_HINT,
        TEMPLATE_HINT,
        PREVIEW_HINT,
        REPORT_HINT,
      ].map(([from]) => (
        <Sfx key={from} role="tick" at={from + 2} volume={0.6} />
      ))}
      {[TAP_REPORT, TAP_COMMENTS, TAP_AUTUMN].map((f) => (
        <Sfx key={f} role="select" at={f} volume={0.8} />
      ))}
      <Sfx role="click-soft" at={TAP_REVIEW} volume={0.8} />
      <Sfx role="pop" at={TAP_REVIEW + 2} volume={0.6} />
      <Sfx role="click-soft" at={TAP_CLOSE_NOTES} volume={0.8} />
      <Sfx role="click-soft" at={TAP_TEXT} volume={0.8} />
      {typingCues(
        TYPE_AT,
        TYPE_AT + Math.ceil(COMMENT.length / TYPE_RATE),
        24,
      ).map((f) => (
        <Sfx key={`k${f}`} role="key" at={f} volume={0.5} />
      ))}
      <Sfx role="whoosh" at={TEMPLATES + 20} volume={0.3} />
      <Sfx role="whoosh" at={PREVIEW + 4} volume={0.3} />
      <Sfx role="click-firm" at={TAP_SHARE} volume={0.8} />
      <StepCaption eyebrow="Phiếu học phí" from={0} to={TAP_REPORT}>
        <span style={{ color: colors.emerald }}>QR đúng số tiền</span>
      </StepCaption>
      <StepCaption eyebrow="Tuỳ chỉnh phiếu" from={TAP_REPORT} to={TEMPLATES}>
        Kèm báo cáo, kèm lời nhắn
      </StepCaption>
      <StepCaption eyebrow="Chọn mẫu phiếu" from={TEMPLATES} to={PREVIEW}>
        <span style={{ color: colors.emerald }}>App nhớ cho lần sau</span>
      </StepCaption>
      <StepCaption eyebrow="Xem trước" from={PREVIEW}>
        <span style={{ color: colors.emerald }}>rồi gửi phụ huynh</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/fees"
        scroll={0}
        pageRef={pageRef}
        overlay={
          d ? (
            <>
              <Explain
                frame={frame}
                from={QR_HINT[0]}
                to={QR_HINT[1]}
                box={at(c?.qr)}
              >
                QR có sẵn số tiền. Phụ huynh ghi đúng nội dung này, cô đối soát
                nhanh
              </Explain>
              <Explain
                frame={frame}
                from={HIDE_HINT[0]}
                to={HIDE_HINT[1]}
                box={at(c?.hide)}
              >
                Phụ huynh chỉ cần con số? Bật Ẩn chi tiết học phí
              </Explain>
              <Explain
                frame={frame}
                from={RANGE_HINT[0]}
                to={RANGE_HINT[1]}
                box={at(c?.report)}
                side="above"
              >
                Kèm ảnh báo cáo cả tháng, tự lấy đúng khoảng ngày đang thu
              </Explain>
              <Explain
                frame={frame}
                from={NOTES_HINT[0]}
                to={NOTES_HINT[1]}
                box={d.notes}
              >
                Xem lại nhận xét cả tháng để viết lời nhắn
              </Explain>
              <Explain
                frame={frame}
                from={TEMPLATE_HINT[0]}
                to={TEMPLATE_HINT[1]}
                box={at(c?.templates)}
                side="above"
              >
                Chọn 1 lần, app nhớ mẫu cho các phiếu sau
              </Explain>
              <Explain
                frame={frame}
                from={PREVIEW_HINT[0]}
                to={PREVIEW_HINT[1]}
                box={at(
                  c?.voucher && {
                    ...c.voucher,
                    h: Math.min(c.voucher.h, (d?.viewH ?? 600) - 40),
                  },
                )}
              >
                Phiếu có QR đúng 2.700.000đ, kèm lời nhắn của cô
              </Explain>
              <Explain
                frame={frame}
                from={REPORT_HINT[0]}
                to={REPORT_HINT[1]}
                box={at(
                  c?.reportImage && {
                    ...c.reportImage,
                    h: Math.min(c.reportImage.h, (d?.viewH ?? 600) - 120),
                  },
                )}
                side="above"
              >
                Ảnh báo cáo: nội dung, bài tập, điểm từng buổi
              </Explain>
            </>
          ) : null
        }
      >
        <FeesPage />
        <VoucherDialog open form={form} />
      </AppScreen>
      <TapFinger frame={frame} taps={taps} hideAt={TAP_SHARE + 12} />
    </>
  );
};

// 3 · money in: Đã thu tiền → confirm → the card leaves, the total drops; then over to the history tab
const TAP_COLLECT = 34;
const TAP_CONFIRM = 84;
const TOTAL2_HINT = [126, 190] as const;
const TAP_HISTORY = 206;
export const COLLECT_LENGTH = 218;

const CollectSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useFeesPage("pending", frame >= TAP_CONFIRM);
  const pageRef = useRef<HTMLDivElement>(null);
  const doc = pageRef.current?.ownerDocument;
  const [, setRound] = useState(0);
  const amount = formatCurrency(MINH_ANH.pendingAmount);
  useClickState(
    frame >= TAP_COLLECT && frame < TAP_CONFIRM,
    () => (doc ? !!doc.querySelector("[data-confirm-dialog]") : null),
    (want) => {
      if (want) {
        void onConfirm({
          title: vi.fee.table.confirmTitle,
          description: vi.fee.table.confirmDescription
            .replace("{amount}", amount)
            .replace("{count}", String(MINH_ANH.sessions.length))
            .replace("{name}", "Minh Anh"),
          confirmText: vi.fee.table.confirmText,
        });
      } else {
        const dialog = doc?.querySelector<HTMLElement>("[data-confirm-dialog]");
        if (dialog) byText(dialog, "button", vi.fee.table.confirmText)?.click();
      }
      const handle = delayRender("confirm");
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setRound((n) => n + 1);
          continueRender(handle);
        }),
      );
    },
  );
  const t = useMeasure(() => {
    const page = pageRef.current;
    if (!page) return null;
    const total = totalRow(page);
    const ma = studentCard(page, "Minh Anh");
    const confirm = page.ownerDocument.querySelector<HTMLElement>(
      "[data-confirm-dialog]",
    );
    return total
      ? {
          total: pageBox(page, total)!,
          collect: ma
            ? pageBox(page, byText(ma, "button", vi.fee.table.collect))
            : null,
          confirm: confirm
            ? screenBox(byText(confirm, "button", vi.fee.table.confirmText))
            : null,
          history: pageBox(page, byText(page, "button", vi.fee.tabs.history)),
        }
      : null;
  });
  const collectScroll = t?.collect
    ? Math.max(0, t.collect.y + t.collect.h + 30 - SCREEN_H)
    : 0;
  const scroll =
    frame < TAP_CONFIRM + 20
      ? collectScroll
      : scrollAt(frame, [
          [TAP_CONFIRM + 20, collectScroll],
          [TAP_CONFIRM + 36, 0],
        ]);
  const toastIn = useToast(frame, TAP_CONFIRM);
  const toast = vi.fee.table.collected
    .replace("{count}", String(MINH_ANH.sessions.length))
    .replace("{name}", "Minh Anh");

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="click-firm" at={TAP_COLLECT} volume={0.8} />
      <Sfx role="pop" at={TAP_COLLECT + 2} volume={0.6} />
      <Sfx role="confirm" at={TAP_CONFIRM} volume={0.9} />
      <Sfx role="tick" at={TOTAL2_HINT[0] + 2} volume={0.6} />
      <Sfx role="click-soft" at={TAP_HISTORY} volume={0.8} />
      <StepCaption eyebrow="Nhận tiền rồi?" from={0}>
        <span style={{ color: colors.emerald }}>Bấm Đã thu tiền</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/fees"
        scroll={scroll}
        pageRef={pageRef}
        fixed={
          toastIn > 0 ? (
            <SuccessToast enter={toastIn}>{toast}</SuccessToast>
          ) : null
        }
        overlay={
          t ? (
            <Explain
              frame={frame}
              from={TOTAL2_HINT[0]}
              to={TOTAL2_HINT[1]}
              box={t.total}
              scroll={scroll}
            >
              Minh Anh đã xong. Còn ai chưa đóng, nhìn là biết
            </Explain>
          ) : null
        }
      >
        <FeesPage />
        <ConfirmDialog />
      </AppScreen>
      {t ? (
        <TapFinger
          frame={frame}
          taps={[
            ...(t.collect
              ? [
                  {
                    at: TAP_COLLECT,
                    ...center({ ...t.collect, y: t.collect.y - collectScroll }),
                  },
                ]
              : []),
            ...(t.confirm ? [{ at: TAP_CONFIRM, ...center(t.confirm) }] : []),
            ...(t.history ? [{ at: TAP_HISTORY, ...center(t.history) }] : []),
          ]}
          hideAt={TAP_HISTORY + 10}
        />
      ) : null}
    </>
  );
};

// 4 · the history tab: what's collected is locked in; a mistake is one Hoàn tác away
const LOCK_HINT = [12, 78] as const;
const UNDO_HINT = [92, 158] as const;
export const HISTORY_LENGTH = 170;

const HistorySceneInner = () => {
  const client = useFeesPage("history", true);
  const frame = useCurrentFrame();
  const pageRef = useRef<HTMLDivElement>(null);
  const t = useMeasure(() => {
    const page = pageRef.current;
    const ma = page ? studentCard(page, "Minh Anh") : null;
    const undo = ma ? byText(ma, "button", vi.fee.history.undo) : null;
    return page && ma && undo
      ? { ma: pageBox(page, ma)!, undo: pageBox(page, undo)! }
      : null;
  });

  return (
    <>
      <Sfx role="tick" at={LOCK_HINT[0] + 2} volume={0.6} />
      <Sfx role="tick" at={UNDO_HINT[0] + 2} volume={0.6} />
      <StepCaption eyebrow="Lịch sử thu" from={0}>
        <span style={{ color: colors.emerald }}>Đã thu là khoá</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/fees"
        scroll={0}
        pageRef={pageRef}
        overlay={
          t ? (
            <>
              <Explain
                frame={frame}
                from={LOCK_HINT[0]}
                to={LOCK_HINT[1]}
                box={{ ...t.ma, h: Math.min(t.ma.h, 220) }}
                side="above"
              >
                Đã thu thì khoá: sau này đổi học phí cũng không ảnh hưởng
              </Explain>
              <Explain
                frame={frame}
                from={UNDO_HINT[0]}
                to={UNDO_HINT[1]}
                box={t.undo}
              >
                Lỡ bấm nhầm? Hoàn tác, khoản quay lại mục Chưa thu
              </Explain>
            </>
          ) : null
        }
      >
        <FeesPage />
      </AppScreen>
    </>
  );
};

const EndSceneInner = () => (
  <EndCard
    episode="Tập 4 · Thu học phí cuối tháng"
    title={
      <>
        Thu đủ,
        <br />
        không cần máy tính.
      </>
    }
    next={{ episode: "Tập 5", title: "Đọc lịch dạy" }}
  />
);

const schema = { ...Interactive.backgroundSchema };
export const FeesScene = Interactive.create({
  Component: FeesSceneInner,
  layout: "absolute-fill",
  schema,
});
export const VoucherScene = Interactive.create({
  Component: VoucherSceneInner,
  layout: "absolute-fill",
  schema,
});
export const CollectScene = Interactive.create({
  Component: CollectSceneInner,
  layout: "absolute-fill",
  schema,
});
export const HistoryScene = Interactive.create({
  Component: HistorySceneInner,
  layout: "absolute-fill",
  schema,
});
export const EndScene = Interactive.create({
  Component: EndSceneInner,
  layout: "absolute-fill",
  schema,
});
