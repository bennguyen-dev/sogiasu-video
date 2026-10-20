import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Interactive, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Form } from "@/shared/components/ui/form";
import { messages } from "@/shared/i18n/messages.generated";
import BulkLessonScheduler from "@/features/lesson/components/BulkLessonScheduler";
import { generatePreviewLessons } from "@/features/lesson/lib/generate-lessons-from-schedules";
import { useMockApi } from "../../../shared/app/AppProviders";
import { DEMO_NOW, useDemoNow } from "../../../shared/app/frozen-clock";
import { Sfx } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { colors } from "../../../shared/theme";
import {
  AppScreen,
  type Box,
  center,
  Explain,
  newClient,
  pageBox,
  screenBox,
  scrollAt,
  SuccessToast,
  TapFinger,
  useClickState,
  useDriveForm,
  useMeasure,
  usePopover,
} from "../../../shared/tutorial/AppScreen";
import { dayOne } from "../date-picker";
import { WizardFooter, WizardPage } from "../WizardPage";
import {
  CLASS_NAME,
  MONTH_START,
  NEW_ACCOUNT_API,
  scheduleValues,
  THU,
  TUE,
} from "../data";

const TAP_TUE = 26;
const TAP_THU = 46;
const TAP_THU_AGAIN = 76;
const TWICE = [80, 146] as const;
const TAP_TRASH = 156;
const TO_RANGE = 172;
const TAP_CUSTOM = 196;
const CUSTOM = [200, 262] as const;
const TAP_START = 272;
const TAP_DAY = 298;
const SYNC = [318, 392] as const;
const PREVIEW = [404, 478] as const;
const TAP_SUBMIT = 494;
export const TOAST_AT = TAP_SUBMIT + 8;

const { bulk, onlineFields } = messages.vi.lesson;
export const toastText = (count: number) =>
  messages.vi.class.wizard.created
    .replace("{name}", CLASS_NAME)
    .replace("{count}", String(count));

const daysAt = (frame: number) =>
  frame >= TAP_TRASH
    ? [TUE, THU]
    : frame >= TAP_THU_AGAIN
      ? [TUE, THU, THU]
      : frame >= TAP_THU
        ? [TUE, THU]
        : frame >= TAP_TUE
          ? [TUE]
          : [];

const formItemOf = (page: HTMLElement, label: string) =>
  [...page.querySelectorAll("label")]
    .find((l) => l.textContent?.startsWith(label))
    ?.closest<HTMLElement>("[data-slot=form-item]");
const buttonStarting = (page: HTMLElement, text: string) =>
  [...page.querySelectorAll<HTMLElement>("button")].find((b) =>
    b.textContent?.trim().startsWith(text),
  );
const startTriggerOf = (page: HTMLElement) =>
  formItemOf(page, bulk.startDate)?.querySelector<HTMLElement>(
    "button[aria-haspopup=dialog]",
  );

type Targets = {
  tue: Box;
  thu: Box;
  range: Box;
  custom: Box;
  sync: Box;
  selectAll: Box;
  submit: Box;
  // only on screen for part of the scene
  slots: Box | null;
  rowStep: number | null;
  trash: Box | null;
  start: Box | null;
};

const ScheduleSceneInner = () => {
  useDemoNow(DEMO_NOW);
  useMockApi(NEW_ACCOUNT_API);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pageRef = useRef<HTMLDivElement>(null);
  const [client] = useState(newClient);
  const values = scheduleValues(
    daysAt(frame),
    frame >= TAP_DAY ? MONTH_START : undefined,
  );
  const form = useForm({ defaultValues: scheduleValues([]) });
  useDriveForm(form, values);
  const lessons = generatePreviewLessons(values).length;

  const t = useMeasure<Targets>(() => {
    const page = pageRef.current;
    if (!page) return null;
    const weekdays = formItemOf(page, bulk.whichDays)
      ?.querySelector(".flex.flex-wrap")
      ?.querySelectorAll("button");
    const slotList = page.querySelector(".divide-y.rounded-md.border");
    const rows = slotList?.children;
    const trashes = slotList?.querySelectorAll(
      `button[aria-label="${bulk.removeSlot}"]`,
    );
    const section = [...page.querySelectorAll("h3")]
      .find((h) => h.textContent === bulk.toCreate)
      ?.closest("section");
    const base = {
      tue: pageBox(page, weekdays?.[1]),
      thu: pageBox(page, weekdays?.[3]),
      range: pageBox(
        page,
        [...page.querySelectorAll("label")].find((l) =>
          l.textContent?.startsWith(bulk.createFor),
        )?.parentElement,
      ),
      custom: pageBox(page, buttonStarting(page, bulk.custom)),
      sync: pageBox(page, formItemOf(page, onlineFields.syncCalendar)),
      selectAll: pageBox(page, section?.querySelector(".sticky")),
      submit: screenBox(page.ownerDocument.querySelector("[data-footer-next]")),
    };
    if (!Object.values(base).every(Boolean)) return null;
    const r0 = rows?.[0] ? pageBox(page, rows[0]) : null;
    const r1 = rows?.[1] ? pageBox(page, rows[1]) : null;
    return {
      ...(base as Omit<Targets, "slots" | "rowStep" | "trash" | "start">),
      slots: pageBox(page, slotList),
      rowStep: r0 && r1 ? r1.y - r0.y : null,
      trash: trashes?.[1] ? pageBox(page, trashes[1]) : null,
      start: pageBox(page, startTriggerOf(page)),
    };
  });

  // "Tùy chỉnh" is RepeatRangeField's own state, set only by its button; a preset button clears it
  useClickState(
    frame >= TAP_CUSTOM,
    () => (pageRef.current ? !!startTriggerOf(pageRef.current) : null),
    (custom) =>
      buttonStarting(
        pageRef.current!,
        custom ? bulk.custom : bulk.preset["4"],
      )?.click(),
  );
  usePopover(
    pageRef.current ? startTriggerOf(pageRef.current) : null,
    frame >= TAP_START && frame < TAP_DAY + 3,
  );

  const rangeTop = t ? t.range.y - 24 : 0;
  const syncTop = t ? t.sync.y - 120 : 0;
  const keys: [number, number][] = t
    ? [
        [TO_RANGE - 14, 0],
        [TO_RANGE, rangeTop],
        [SYNC[0] - 14, rangeTop],
        [SYNC[0], syncTop],
        [PREVIEW[0] - 14, syncTop],
        [PREVIEW[0], t.selectAll.y - 60],
      ]
    : [[0, 0]];
  const scroll = scrollAt(frame, keys);
  const tapOn = (p: { x: number; y: number }, at: number) => ({
    at,
    x: p.x,
    y: p.y - scrollAt(at, keys),
  });
  // the second Thursday slot lands one row below the first Thursday; its bin is placed from the rows already there
  const extraTrash =
    t?.trash && t.rowStep ? { ...t.trash, y: t.trash.y + t.rowStep } : null;
  // before "Tùy chỉnh" opens the start field there is nothing to measure; it appears under the presets
  const start =
    t?.start ?? (t ? { ...t.custom, y: t.custom.y + t.custom.h + 40 } : null);
  const taps =
    t && start
      ? [
          tapOn(center(t.tue), TAP_TUE),
          tapOn(center(t.thu), TAP_THU),
          tapOn(center(t.thu), TAP_THU_AGAIN),
          tapOn(center(extraTrash ?? t.thu), TAP_TRASH),
          tapOn(center(t.custom), TAP_CUSTOM),
          tapOn(center(start), TAP_START),
          tapOn(dayOne(start), TAP_DAY),
          { at: TAP_SUBMIT, ...center(t.submit) },
        ]
      : [];

  const toast = spring({
    frame: frame - TOAST_AT,
    fps,
    config: { damping: 200 },
  });
  const beat = { frame, scroll };
  const customRow = t?.start
    ? { ...t.range, y: t.start.y - 26, h: t.start.h + 26 }
    : null;

  return (
    <>
      <Sfx role="select" at={TAP_TUE} volume={0.8} />
      <Sfx role="drop" at={TAP_TUE + 3} volume={0.5} />
      <Sfx role="select" at={TAP_THU} volume={0.8} />
      <Sfx role="drop" at={TAP_THU + 3} volume={0.5} />
      <Sfx role="select" at={TAP_THU_AGAIN} volume={0.8} />
      <Sfx role="drop" at={TAP_THU_AGAIN + 3} volume={0.5} />
      <Sfx role="click-soft" at={TAP_TRASH} volume={0.8} />
      <Sfx role="whoosh" at={TO_RANGE - 6} volume={0.35} />
      <Sfx role="click-soft" at={TAP_CUSTOM} volume={0.8} />
      <Sfx role="click-soft" at={TAP_START} volume={0.8} />
      <Sfx role="pop" at={TAP_START + 2} volume={0.6} />
      <Sfx role="select" at={TAP_DAY} volume={0.8} />
      {[TWICE, CUSTOM, SYNC, PREVIEW].map(([from]) => (
        <Sfx key={from} role="tick" at={from + 2} volume={0.6} />
      ))}
      <Sfx role="whoosh" at={SYNC[0] - 6} volume={0.35} />
      <Sfx role="whoosh" at={PREVIEW[0] - 6} volume={0.35} />
      <Sfx role="click-firm" at={TAP_SUBMIT} volume={0.9} />
      <Sfx role="confirm" at={TOAST_AT} volume={0.9} />

      <StepCaption eyebrow="Bước 3/3" from={0} to={TO_RANGE}>
        Chọn thứ & giờ học
      </StepCaption>
      <StepCaption eyebrow="Lớp học từ đầu tháng?" from={TO_RANGE} to={SYNC[0]}>
        <span style={{ color: colors.emerald }}>Tạo lại buổi đã dạy</span>
      </StepCaption>
      <StepCaption eyebrow="Đồng bộ lịch" from={SYNC[0]} to={PREVIEW[0]}>
        <span style={{ color: colors.sky }}>Kết nối Google</span>
      </StepCaption>
      <StepCaption eyebrow="App tự sinh" from={PREVIEW[0]}>
        <span style={{ color: colors.emerald }}>cả {lessons} buổi</span>
      </StepCaption>

      <AppScreen
        client={client}
        pathname="/dashboard/classes/new"
        scroll={scroll}
        pageRef={pageRef}
        fixed={
          <>
            <WizardFooter step={2} lessons={lessons} />
            {frame >= TOAST_AT ? (
              <SuccessToast enter={toast}>{toastText(lessons)}</SuccessToast>
            ) : null}
          </>
        }
        overlay={
          <>
            <Explain {...beat} from={TWICE[0]} to={TWICE[1]} box={t?.slots}>
              Bấm 1 thứ 2 lần = 2 ca trong cùng ngày, mỗi ca một giờ riêng
            </Explain>
            <Explain {...beat} from={CUSTOM[0]} to={CUSTOM[1]} box={customRow}>
              Tùy chỉnh: chọn ngày bắt đầu trong quá khứ để tạo lại các buổi đã
              dạy
            </Explain>
            <Explain {...beat} from={SYNC[0]} to={SYNC[1]} box={t?.sync}>
              Kết nối Google để tự tạo link Meet, đưa lịch lên Google Calendar
              và mời học sinh qua email
            </Explain>
            <Explain
              {...beat}
              from={PREVIEW[0]}
              to={PREVIEW[1]}
              box={t?.selectAll}
            >
              Xem trước từng buổi. Bỏ tick buổi nghỉ, VD ngày lễ
            </Explain>
          </>
        }
      >
        <WizardPage step={2}>
          <Form {...form}>
            <BulkLessonScheduler
              control={form.control}
              setValue={form.setValue}
              classLink={null}
              joinDateWarning={false}
            />
          </Form>
        </WizardPage>
      </AppScreen>
      <TapFinger frame={frame} taps={taps} hideAt={TAP_SUBMIT + 12} />
    </>
  );
};

export const ScheduleScene = Interactive.create({
  Component: ScheduleSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
