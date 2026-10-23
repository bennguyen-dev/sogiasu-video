import { useRef, useState } from "react";
import { continueRender, delayRender, Interactive, interpolate, useCurrentFrame } from "remotion";
import { useTranslations } from "next-intl";
import LessonDetailContent from "@/features/lesson/components/LessonDetailContent";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import DashboardHeader from "@/shared/components/layouts/dashboard/header";
import DashboardMain from "@/shared/components/layouts/dashboard/main";
import PageHeader from "@/shared/components/layouts/dashboard/PageHeader";
import { messages } from "@/shared/i18n/messages.generated";
import { Sfx } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { clamp, ease } from "../../../shared/motion";
import { colors } from "../../../shared/theme";
import {
  AppScreen,
  byText,
  center,
  Explain,
  pageBox,
  screenBox,
  SuccessToast,
  TapFinger,
  useClickState,
  useMeasure,
} from "../../../shared/tutorial/AppScreen";
import { LESSON_ID_7 } from "../data";
import { useHourApp } from "./shared";

const { vi } = messages;
const AMBER = "#f59e0b";

const DUR_HINT = [10, 76] as const;
const FIX_HINT = [84, 150] as const;
const TAP_DONE = 164;
const TAP_CONFIRM = 198;
export const LESSON_LENGTH = 250;

const confirmDialog = (doc: Document) => doc.querySelector<HTMLElement>("[data-confirm-dialog]");
const confirmButton = (d: HTMLElement) => byText(d, "button", vi.ui.confirm);
// LessonDetailPage: the app's own lesson screen, read from the mock api
const LessonPage = () => {
  const t = useTranslations("lesson");
  return (
    <>
      <DashboardHeader>
        <PageHeader backHref="/dashboard/calendar">{t("detail.title")}</PageHeader>
      </DashboardHeader>
      <DashboardMain>
        <LessonDetailContent lessonId={LESSON_ID_7} />
      </DashboardMain>
      <ConfirmDialog />
    </>
  );
};

const LessonSceneInner = () => {
  const frame = useCurrentFrame();
  const done = frame >= TAP_CONFIRM;
  const client = useHourApp({ raised: false, todayDone: done });
  const pageRef = useRef<HTMLDivElement>(null);
  const doc = pageRef.current?.ownerDocument;
  const [, setRound] = useState(0);
  // the app's own confirm opens on the banner's button; once confirmed the lesson reads back completed
  useClickState(
    frame >= TAP_DONE && frame < TAP_CONFIRM,
    () => (doc ? !!confirmDialog(doc) : null),
    (want) => {
      const page = pageRef.current;
      if (!doc || !page) return;
      if (want) byText(page, "button", vi.lesson.banner.markDone)?.click();
      else byText(confirmDialog(doc) ?? doc, "button", vi.ui.cancel)?.click();
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
    const time = [...page.querySelectorAll<HTMLElement>(".text-primary.font-medium")].find((el) => el.textContent?.includes("09:00"));
    const d = confirmDialog(page.ownerDocument);
    return time
      ? {
          time: pageBox(page, time)!,
          edit: pageBox(page, page.querySelector(`button[aria-label="${vi.ui.edit}"]`)),
          done: pageBox(page, byText(page, "button", vi.lesson.banner.markDone)),
          confirm: d ? screenBox(confirmButton(d)) : null,
        }
      : null;
  });
  const last = useRef<typeof t>(null);
  if (t?.confirm) last.current = t;
  const toastIn = frame >= TAP_CONFIRM && frame < TAP_CONFIRM + 60 ? interpolate(frame - TAP_CONFIRM, [2, 10, 50, 58], [0, 1, 1, 0], { ...clamp, easing: ease }) : 0;

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="tick" at={DUR_HINT[0] + 2} volume={0.6} />
      <Sfx role="tick" at={FIX_HINT[0] + 2} volume={0.6} />
      <Sfx role="click-firm" at={TAP_DONE} volume={0.8} />
      <Sfx role="pop" at={TAP_DONE + 2} volume={0.6} />
      <Sfx role="confirm" at={TAP_CONFIRM} volume={0.9} />
      <StepCaption eyebrow="Buổi hôm nay 2 tiếng" from={0}>
        <span style={{ color: colors.emerald }}>app đọc đúng giờ học</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname={`/dashboard/lessons/${LESSON_ID_7}`}
        scroll={0}
        pageRef={pageRef}
        fixed={toastIn > 0 ? <SuccessToast enter={toastIn}>{vi.lesson.banner.completeSuccess}</SuccessToast> : null}
        overlay={
          t ? (
            <>
              <Explain frame={frame} from={DUR_HINT[0]} to={DUR_HINT[1]} box={t.time}>
                App lấy đúng giờ bắt đầu, giờ kết thúc của buổi
              </Explain>
              <Explain frame={frame} from={FIX_HINT[0]} to={FIX_HINT[1]} box={t.edit} color={AMBER} side="above">
                Ghi sai giờ? Bấm Sửa trước khi bấm Đã dạy xong
              </Explain>
            </>
          ) : null
        }
      >
        <LessonPage />
      </AppScreen>
      {(last.current ?? t)?.done ? (
        <TapFinger
          frame={frame}
          taps={[{ at: TAP_DONE, ...center((last.current ?? t)!.done!) }, ...(last.current?.confirm ? [{ at: TAP_CONFIRM, ...center(last.current.confirm) }] : [])]}
          hideAt={TAP_CONFIRM + 12}
        />
      ) : null}
    </>
  );
};

export const LessonScene = Interactive.create({ Component: LessonSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
