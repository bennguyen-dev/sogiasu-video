import { useRef, useState } from "react";
import { continueRender, delayRender, Interactive, interpolate, useCurrentFrame } from "remotion";
import ClassDetailPage from "@/features/class/pages/ClassDetailPage";
import StudentsPage from "@/features/student/pages/StudentsPage";
import { ConfirmDialog, onConfirm } from "@/shared/components/ui/confirm-dialog";
import { messages } from "@/shared/i18n/messages.generated";
import { useMockApi } from "../../../shared/app/AppProviders";
import { DEMO_NOW, useDemoNow } from "../../../shared/app/frozen-clock";
import { setDemoSearch } from "../../../shared/app/stubs/next-navigation";
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
  scrollAt,
  SuccessToast,
  TapFinger,
  useClickState,
  useMeasure,
} from "../../../shared/tutorial/AppScreen";
import { EndCard } from "../../create-class/scenes/EndScene";
import { CLASS_API, STUDENTS_API } from "../data";
import { ClassShareDialog, StudentShareDialog } from "../ShareDialogs";

const { vi } = messages;
const r = vi.report.share;

const dialogWith = (doc: Document, title: string) =>
  [...doc.querySelectorAll<HTMLElement>("[data-slot=dialog-content]")].find((d) => d.textContent?.includes(title));

// a box cut off where the dialog's sticky footer starts covering it
const clipAbove = (box: Box | null, footer: Box | null): Box | null =>
  box && footer && box.y + box.h > footer.y - 8 ? { ...box, h: footer.y - 8 - box.y } : box;

const useToast = (frame: number, from: number) => (frame >= from && frame < from + 60 ? interpolate(frame - from, [2, 10, 50, 58], [0, 1, 1, 0], { ...clamp, easing: ease }) : 0);

// the class's Students tab: one message with every student's link, for the class's parent group
const TAP_OPEN = 64;
const TAP_ALL = 104;
const LINKED = TAP_ALL + 14;
const MESSAGE_HINT = [136, 210] as const;
const TAP_COPY = 224;
const GROUP_HINT = [236, 300] as const;
export const CLASS_LENGTH = 312;

const ClassSceneInner = () => {
  useDemoNow(DEMO_NOW);
  useMockApi(CLASS_API);
  useState(() => setDemoSearch("tab=students"));
  const frame = useCurrentFrame();
  const pageRef = useRef<HTMLDivElement>(null);
  const [client] = useState(newClient);
  const t = useMeasure(() => {
    const page = pageRef.current;
    if (!page) return null;
    const button = byText(page, "button", r.classMessage.buttonLabel);
    const dialog = dialogWith(page.ownerDocument, r.classMessage.dialogTitle);
    return button
      ? {
          button: pageBox(page, button)!,
          all: screenBox(dialog?.querySelector("[data-select-all]")),
          message: clipAbove(screenBox(dialog?.querySelector("[data-message] textarea")), screenBox(dialog?.querySelector("[data-slot=dialog-footer]"))),
          copy: screenBox(dialog ? byText(dialog, "button", r.classMessage.copyMessage) : null),
        }
      : null;
  });
  const scroll = t ? scrollAt(frame, [[0, Math.max(0, t.button.y - 220)]]) : 0;
  const toastIn = useToast(frame, TAP_COPY);

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="tick" at={16} volume={0.6} />
      <Sfx role="click-firm" at={TAP_OPEN} volume={0.8} />
      <Sfx role="pop" at={TAP_OPEN + 2} volume={0.6} />
      <Sfx role="select" at={TAP_ALL} volume={0.8} />
      <Sfx role="pop" at={LINKED} volume={0.6} />
      <Sfx role="tick" at={MESSAGE_HINT[0] + 2} volume={0.6} />
      <Sfx role="click-firm" at={TAP_COPY} volume={0.8} />
      <Sfx role="tick" at={GROUP_HINT[0] + 2} volume={0.6} />
      <StepCaption eyebrow="Gửi vào nhóm lớp?" from={0}>
        <span style={{ color: colors.emerald }}>Copy tin nhắn tổng hợp</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/classes/new-class"
        scroll={scroll}
        pageRef={pageRef}
        fixed={toastIn > 0 ? <SuccessToast enter={toastIn}>{r.classMessage.copied}</SuccessToast> : null}
        overlay={
          t ? (
            <>
              <Explain frame={frame} from={12} to={TAP_OPEN - 6} box={t.button} scroll={scroll}>
                Trang lớp, mục Học sinh: Tổng hợp link báo cáo
              </Explain>
              <Explain frame={frame} from={MESSAGE_HINT[0]} to={MESSAGE_HINT[1]} box={t.message} side="above">
                App soạn sẵn tin nhắn kèm link từng em. Sửa lời được, đừng sửa link
              </Explain>
              <Explain frame={frame} from={GROUP_HINT[0]} to={GROUP_HINT[1]} box={t.copy} side="above">
                Dán vào nhóm Zalo của lớp: cả lớp thấy link của nhau
              </Explain>
            </>
          ) : null
        }
      >
        <ClassDetailPage id="new-class" />
        <ClassShareDialog open={frame >= TAP_OPEN} included={frame >= TAP_ALL} linked={frame >= LINKED} />
      </AppScreen>
      {t ? (
        <TapFinger
          frame={frame}
          taps={[
            { at: TAP_OPEN, ...center({ ...t.button, y: t.button.y - scroll }) },
            ...(t.all ? [{ at: TAP_ALL, ...center(t.all) }] : []),
            ...(t.copy ? [{ at: TAP_COPY, ...center(t.copy) }] : []),
          ]}
          hideAt={TAP_COPY + 12}
        />
      ) : null}
    </>
  );
};

// the Students page: one student's own link, for a private chat with that parent; then switching it off
const LINK_HINT = [12, 70] as const;
const TAP_LINK = 84;
const SEES_HINT = [100, 170] as const;
const TAP_COPY_LINK = 184;
const PRIVATE_HINT = [196, 256] as const;
const OFF = 268;
const TAP_STOP = 288;
const STOP_HINT = [304, 380] as const;
export const STUDENTS_LENGTH = 392;

const StudentsSceneInner = () => {
  useDemoNow(DEMO_NOW);
  useMockApi(STUDENTS_API);
  const frame = useCurrentFrame();
  const pageRef = useRef<HTMLDivElement>(null);
  const [client] = useState(newClient);
  const doc = pageRef.current?.ownerDocument;
  // the confirm dialog opens after this render: render once more so it gets measured
  const [, setRound] = useState(0);
  useClickState(
    frame >= TAP_STOP,
    () => (doc ? !!doc.querySelector("[data-confirm-dialog]") : null),
    (want) => {
      if (want) {
        void onConfirm({ title: r.revokeTitle, description: r.revokeDescription, confirmText: r.stopShare, variant: "destructive" });
        const handle = delayRender("confirm measured");
        const tick = () => {
          if (!doc?.querySelector("[data-confirm-dialog]")) return requestAnimationFrame(tick);
          setRound((n) => n + 1);
          requestAnimationFrame(() => continueRender(handle));
        };
        requestAnimationFrame(tick);
      } else {
        const d = doc?.querySelector<HTMLElement>("[data-confirm-dialog]");
        if (d) byText(d, "button", vi.ui.cancel)?.click();
      }
    },
  );
  const t = useMeasure(() => {
    const page = pageRef.current;
    if (!page) return null;
    // the desktop table keeps a hidden copy of each row's button; the phone shows the card's
    const link = [...page.querySelectorAll<HTMLElement>("button")].find((b) => b.textContent?.trim() === r.manageLabel && b.offsetWidth > 0);
    const dialog = dialogWith(page.ownerDocument, r.dialogTitle);
    const confirm = page.ownerDocument.querySelector("[data-confirm-dialog]");
    return link
      ? {
          link: pageBox(page, link)!,
          sees: screenBox(dialog?.querySelector("[data-point-sees]")),
          input: screenBox(dialog?.querySelector("[data-link] input")),
          copy: screenBox(dialog?.querySelector("[data-copy-link]")),
          stop: screenBox(dialog?.querySelector("[data-stop-share]")),
          confirmBody: screenBox(confirm ? byText(confirm, "div", r.revokeDescription) : null),
        }
      : null;
  });
  const toastIn = useToast(frame, TAP_COPY_LINK);

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      {[LINK_HINT, SEES_HINT, PRIVATE_HINT, STOP_HINT].map(([from]) => (
        <Sfx key={from} role="tick" at={from + 2} volume={0.6} />
      ))}
      <Sfx role="click-firm" at={TAP_LINK} volume={0.8} />
      <Sfx role="pop" at={TAP_LINK + 2} volume={0.6} />
      <Sfx role="click-firm" at={TAP_COPY_LINK} volume={0.8} />
      <Sfx role="click-firm" at={TAP_STOP} volume={0.8} />
      <Sfx role="pop" at={TAP_STOP + 2} volume={0.6} />
      <StepCaption eyebrow="Gửi riêng phụ huynh?" from={0} to={OFF}>
        <span style={{ color: colors.emerald }}>Copy link từng em</span>
      </StepCaption>
      <StepCaption eyebrow="Không muốn chia sẻ nữa?" from={OFF}>
        <span style={{ color: colors.rose }}>Tắt 1 chạm</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/students"
        scroll={0}
        pageRef={pageRef}
        fixed={toastIn > 0 ? <SuccessToast enter={toastIn}>{r.copied}</SuccessToast> : null}
        overlay={
          t ? (
            <>
              <Explain frame={frame} from={LINK_HINT[0]} to={LINK_HINT[1]} box={t.link}>
                Muốn gửi riêng từng phụ huynh? Lấy link ở trang Học sinh
              </Explain>
              <Explain frame={frame} from={SEES_HINT[0]} to={SEES_HINT[1]} box={t.sees}>
                Phụ huynh thấy ngày học, điểm danh, nhận xét. Học phí không hiển thị
              </Explain>
              <Explain frame={frame} from={PRIVATE_HINT[0]} to={PRIVATE_HINT[1]} box={t.input}>
                Nhắn riêng cho phụ huynh, các nhà khác không thấy link này
              </Explain>
              <Explain frame={frame} from={STOP_HINT[0]} to={STOP_HINT[1]} box={t.confirmBody} color={colors.rose} side="above">
                Tắt là link đã gửi ngừng hoạt động. Bật lại vẫn dùng đúng link cũ
              </Explain>
            </>
          ) : null
        }
      >
        <StudentsPage />
        <StudentShareDialog open={frame >= TAP_LINK} studentKey="ma" copied={frame >= TAP_COPY_LINK && frame < TAP_COPY_LINK + 60} />
        <ConfirmDialog />
      </AppScreen>
      {t ? (
        <TapFinger
          frame={frame}
          taps={[
            { at: TAP_LINK, ...center(t.link) },
            ...(t.copy ? [{ at: TAP_COPY_LINK, ...center(t.copy) }] : []),
            ...(t.stop ? [{ at: TAP_STOP, ...center(t.stop) }] : []),
          ]}
          hideAt={TAP_STOP + 12}
        />
      ) : null}
    </>
  );
};

const EndSceneInner = () => (
  <EndCard
    episode="Tập 3 · Gửi báo cáo cho phụ huynh"
    title={
      <>
        Gửi 1 lần,
        <br />
        xem cả khoá.
      </>
    }
    next={{ episode: "Tập 4", title: "Thu học phí cuối tháng" }}
  />
);

const schema = { ...Interactive.backgroundSchema };
export const ClassScene = Interactive.create({ Component: ClassSceneInner, layout: "absolute-fill", schema });
export const StudentsScene = Interactive.create({ Component: StudentsSceneInner, layout: "absolute-fill", schema });
export const EndScene = Interactive.create({ Component: EndSceneInner, layout: "absolute-fill", schema });
