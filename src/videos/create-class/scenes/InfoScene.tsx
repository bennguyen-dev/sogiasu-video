import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Interactive, useCurrentFrame } from "remotion";
import { Form } from "@/shared/components/ui/form";
import { messages } from "@/shared/i18n/messages.generated";
import ClassField from "@/features/class/components/ClassField";
import { useMockApi } from "../../../shared/app/AppProviders";
import { DEMO_NOW, useDemoNow } from "../../../shared/app/frozen-clock";
import { Sfx, typingCues } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { colors } from "../../../shared/theme";
import {
  AppScreen,
  type Box,
  byText,
  center,
  Explain,
  newClient,
  pageBox,
  SCREEN_H,
  screenBox,
  scrollAt,
  TapFinger,
  useDriveForm,
  useFocus,
  useMeasure,
  usePopover,
} from "../../../shared/tutorial/AppScreen";
import { WizardFooter, WizardPage } from "../WizardPage";
import { CLASS_COLOR, CLASS_NAME, classValues, DEFAULT_CLASS, NEW_ACCOUNT_API } from "../data";

const TAP_NAME = 18;
const TYPE_START = 24;
const TYPE_END = TYPE_START + Math.ceil(CLASS_NAME.length / 1.5);
const TAP_COLOR = 62;
const TAP_GREEN = 90;
// one explanation beat each, back to back, top to bottom as the cards sit
const HOUR = [108, 170] as const;
const SESSION = [170, 232] as const;
const COURSE = [232, 294] as const;
const LOCKED = [294, 356] as const;
const LINK = [364, 432] as const;
const MEET = [432, 500] as const;
const TAP_NEXT = 518;
// ColorMapHelp is a popover too; the color field's own trigger is the full-width one
const COLOR_TRIGGER = "button[aria-haspopup=dialog].w-full";
const { form: f } = messages.vi.class;

// Sage, 2nd swatch of the first row: ColorSelect's w-80 p-2 grid of 5, opened 4px under the trigger
const sageSwatch = (trigger: Box) => ({ x: trigger.x + 8 + ((320 - 16 - 16) / 5 + 4) * 1.5, y: trigger.y + trigger.h + 4 + 8 + 24 });

// the screen above the wizard footer
const VISIBLE_H = SCREEN_H - 68;

type Targets = { name: Box; color: Box; session: Box; hour: Box; course: Box; locked: Box; link: Box; meet: Box; next: Box };

const InfoSceneInner = () => {
  useDemoNow(DEMO_NOW);
  useMockApi(NEW_ACCOUNT_API);
  const frame = useCurrentFrame();
  const pageRef = useRef<HTMLDivElement>(null);
  const [client] = useState(newClient);
  const form = useForm({ defaultValues: DEFAULT_CLASS });

  const typed = CLASS_NAME.slice(0, Math.max(0, Math.floor((frame - TYPE_START) * 1.5)));
  useDriveForm(form, frame >= TAP_GREEN ? classValues(typed, CLASS_COLOR) : classValues(typed, DEFAULT_CLASS.color));

  const t = useMeasure<Targets>(() => {
    const page = pageRef.current;
    if (!page) return null;
    const card = (mode: string) => pageBox(page, page.querySelector(`button[value=${mode}]`)?.closest(".rounded-md.border"));
    const label = [...page.querySelectorAll("label")].find((l) => l.textContent === f.onlineLinkLabel);
    const box = {
      name: pageBox(page, page.querySelector("input[name=name]")),
      color: pageBox(page, page.querySelector(COLOR_TRIGGER)),
      session: card("PER_SESSION"),
      hour: card("PER_HOUR"),
      course: card("PER_COURSE"),
      locked: pageBox(page, [...page.querySelectorAll("p")].find((p) => p.textContent === f.billingModeHint)),
      link: pageBox(page, label?.closest("[data-slot=form-item]")),
      meet: pageBox(page, byText(page, "button", f.createMeetLink)),
      next: screenBox(page.ownerDocument.querySelector("[data-footer-next]")),
    };
    return Object.values(box).every(Boolean) ? (box as Targets) : null;
  });

  const fit = (b: Box | undefined) => (b ? Math.max(0, b.y + b.h + 16 - VISIBLE_H) : 0);
  const scroll = scrollAt(frame, [
    [HOUR[0] - 14, 0],
    [HOUR[0], fit(t?.course)],
    [LINK[0] - 14, fit(t?.course)],
    [LINK[0], fit(t?.link)],
  ]);

  const doc = pageRef.current?.ownerDocument;
  useFocus(frame >= TAP_NAME && frame < TAP_COLOR ? doc?.querySelector<HTMLElement>("input[name=name]") : null);
  usePopover(doc?.querySelector<HTMLElement>(COLOR_TRIGGER), frame >= TAP_COLOR && frame < TAP_GREEN + 3);

  const taps = t
    ? [
        { at: TAP_NAME, ...center(t.name) },
        { at: TAP_COLOR, ...center(t.color) },
        { at: TAP_GREEN, ...sageSwatch(t.color) },
        { at: TAP_NEXT, ...center(t.next) },
      ]
    : [];
  const beat = { frame, scroll };

  return (
    <>
      <Sfx role="click-soft" at={TAP_NAME} volume={0.8} />
      {typingCues(TYPE_START, TYPE_END, CLASS_NAME.length).map((at) => (
        <Sfx key={at} role="key" at={at} volume={0.55} />
      ))}
      <Sfx role="click-soft" at={TAP_COLOR} volume={0.8} />
      <Sfx role="pop" at={TAP_COLOR + 2} volume={0.6} />
      <Sfx role="select" at={TAP_GREEN} volume={0.8} />
      {[HOUR, SESSION, COURSE, LOCKED, LINK, MEET].map(([from]) => (
        <Sfx key={from} role="tick" at={from + 2} volume={0.6} />
      ))}
      <Sfx role="click-firm" at={TAP_NEXT} volume={0.8} />

      <StepCaption eyebrow="Bước 1/3" from={0} to={HOUR[0]}>
        Đặt tên & chọn màu
      </StepCaption>
      <StepCaption eyebrow="Học phí" from={HOUR[0]} to={LINK[0]}>
        <span style={{ color: colors.emerald }}>3 cách tính tiền</span>
      </StepCaption>
      <StepCaption eyebrow="Dạy online?" from={LINK[0]}>
        <span style={{ color: colors.sky }}>Link học chung</span>
      </StepCaption>

      <AppScreen
        client={client}
        pathname="/dashboard/classes/new"
        scroll={scroll}
        pageRef={pageRef}
        fixed={<WizardFooter step={0} />}
        overlay={
          <>
            <Explain {...beat} from={SESSION[0]} to={SESSION[1]} box={t?.session} side="above">
              Theo buổi: điểm danh buổi nào, tính tiền buổi đó
            </Explain>
            <Explain {...beat} from={HOUR[0]} to={HOUR[1]} box={t?.hour} side="above">
              Theo giờ: buổi dạy 2 tiếng thì tính tiền 2 giờ
            </Explain>
            <Explain {...beat} from={COURSE[0]} to={COURSE[1]} box={t?.course} side="above">
              Theo khóa: thu trọn gói một đợt, VD khóa tháng 10
            </Explain>
            <Explain {...beat} from={LOCKED[0]} to={LOCKED[1]} box={t?.locked} color="#d97706">
              Chọn kỹ nhé: tạo lớp xong là không đổi được hình thức học phí
            </Explain>
            <Explain {...beat} from={LINK[0]} to={LINK[1]} box={t?.link} side="above">
              Dạy online? Một link dùng chung cho mọi buổi, gửi học sinh 1 lần là xong
            </Explain>
            <Explain {...beat} from={MEET[0]} to={MEET[1]} box={t?.meet} side="above">
              Bấm để tạo link Google Meet (cần kết nối Google), hoặc dán link Zoom có sẵn
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
      <TapFinger frame={frame} taps={taps} hideAt={TAP_NEXT + 12} />
    </>
  );
};

export const InfoScene = Interactive.create({
  Component: InfoSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
