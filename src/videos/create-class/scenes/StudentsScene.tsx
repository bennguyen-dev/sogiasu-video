import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { BillingMode } from "@prisma/client";
import { Form } from "@/shared/components/ui/form";
import { messages } from "@/shared/i18n/messages.generated";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import ClassStudentsField from "@/features/student/components/ClassStudentsField";
import { useMockApi } from "../../../shared/app/AppProviders";
import { DEMO_NOW, useDemoNow } from "../../../shared/app/frozen-clock";
import { Sfx, typingCues } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { clamp } from "../../../shared/motion";
import { colors } from "../../../shared/theme";
import {
  AppScreen,
  type Box,
  center,
  Explain,
  newClient,
  pageBox,
  Ring,
  SCREEN_H,
  screenBox,
  scrollAt,
  TapFinger,
  useDriveForm,
  useFocus,
  useMeasure,
  usePopover,
} from "../../../shared/tutorial/AppScreen";
import { dayOne } from "../date-picker";
import { WizardFooter, WizardPage } from "../WizardPage";
import { draft, MONTH_START, NEW_ACCOUNT_API, STUDENTS, studentsValues, TODAY } from "../data";

const JOIN_HINT = [10, 84] as const;
const TO_CARD = 86;
const SOURCE = [102, 162] as const;
const TAP_NAME_1 = 172;
const TAP_FEE_1 = 196;
const TAP_DATE_1 = 226;
const TAP_DAY_1 = 252;
const EXTRA = [266, 328] as const;
const TAP_ADD = 350;
const COPIED = [372, 432] as const;
const TAP_NAME_2 = 442;
const TAP_FEE_2 = 466;
const BOTH = 498;
const TAP_NEXT = 562;
const TYPE_DELAY = 4;
// the screen above the wizard footer
const VISIBLE_H = SCREEN_H - 68;
const { classStudents: cs } = messages.vi.student;


// one typed character every 2 frames from `from`
const typed = (frame: number, from: number, text: string) => text.slice(0, Math.max(0, Math.floor((frame - from) / 2) + 1));
const typedAmount = (frame: number, from: number, amount: number) => (frame < from ? null : Number(typed(frame, from, String(amount))));

const valuesAt = (frame: number) => {
  const [a, b] = STUDENTS;
  const joined = frame >= TAP_DAY_1 ? MONTH_START : TODAY;
  const first = draft(typed(frame, TAP_NAME_1 + TYPE_DELAY, a.name), typedAmount(frame, TAP_FEE_1 + TYPE_DELAY, a.price), joined);
  if (frame < TAP_ADD) return studentsValues([first]);
  // a new row copies the row above's fee and join date; typing over the fee replaces it
  const price = frame < TAP_FEE_2 + TYPE_DELAY ? a.price : typedAmount(frame, TAP_FEE_2 + TYPE_DELAY, b.price);
  return studentsValues([first, draft(typed(frame, TAP_NAME_2 + TYPE_DELAY, b.name), price, joined)]);
};

// the desktop table keeps a hidden copy of every row; the phone shows the card one
const visibleName = (root: ParentNode, i: number) =>
  [...root.querySelectorAll<HTMLInputElement>(`input[name="enrollments.${i}.newStudent.fullName"]`)].find((el) => el.offsetWidth > 0);
const cardOf = (root: ParentNode, i: number) => visibleName(root, i)?.closest<HTMLElement>("[data-slot=card]");

// the wizard's step-2 hint box, as it renders above the student rows
const StudentHints = () => {
  const tUi = useTranslations("ui");
  const tStudent = useTranslations("student");
  return (
    <Alert variant="info" className="mb-4">
      <Info />
      <AlertTitle>{tUi("alert.info")}</AlertTitle>
      <AlertDescription>
        <ul className="list-disc space-y-1 pl-4">
          {(["hintSource", "hintExtra", "hintPaste"] as const).map((k) => (
            <li key={k}>{tStudent.rich(`classStudents.${k}`, { b: (chunks) => <strong className="font-semibold">{chunks}</strong> })}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};

type Targets = { hint: Box; card: Box; source: Box; name1: Box; fee1: Box; date1: Box; extra: Box; add: Box; next: Box };

const StudentsSceneInner = () => {
  useDemoNow(DEMO_NOW);
  useMockApi(NEW_ACCOUNT_API);
  const frame = useCurrentFrame();
  const pageRef = useRef<HTMLDivElement>(null);
  const [client] = useState(newClient);
  const form = useForm({ defaultValues: valuesAt(0) });
  useDriveForm(form, valuesAt(frame));

  const t = useMeasure<Targets>(() => {
    const page = pageRef.current;
    if (!page) return null;
    const card = cardOf(page, 0);
    const addEl = [...page.querySelectorAll<HTMLElement>("button")].find((b) => b.textContent?.trim() === cs.add && b.offsetWidth > 0);
    const box = {
      hint: pageBox(page, [...page.querySelectorAll("p")].find((p) => p.textContent === cs.joinedAtHint)),
      card: pageBox(page, card),
      source: pageBox(page, card?.querySelector("[role=group]")),
      name1: pageBox(page, visibleName(page, 0)),
      fee1: pageBox(page, card?.querySelectorAll("input")[1]),
      date1: pageBox(page, card?.querySelector("button[aria-haspopup=dialog]")),
      extra: pageBox(page, [...(card?.querySelectorAll("button") ?? [])].find((b) => b.textContent?.trim() === cs.showOptionalFields)),
      add: pageBox(page, addEl),
      next: screenBox(page.ownerDocument.querySelector("[data-footer-next]")),
    };
    if (!Object.values(box).every(Boolean)) return null;
    const b = box as Targets;
    // measured with the second row in place: it sits one card (+ space-y-4) above the button
    return frame < TAP_ADD ? b : { ...b, add: { ...b.add, y: b.add.y - b.card.h - 16 } };
  });

  const dy = t ? t.card.h + 16 : 0;
  const addFit = t ? t.add.y + t.add.h + 16 - VISIBLE_H : 0;
  const keys: [number, number][] = t
    ? [
        [TO_CARD, 0],
        [TO_CARD + 14, t.card.y - 8],
        [EXTRA[1], t.card.y - 8],
        [TAP_ADD - 12, addFit],
        [TAP_ADD + 6, addFit],
        [COPIED[0] - 2, t.card.y + dy - 8],
        [BOTH - 14, t.card.y + dy - 8],
        [BOTH, t.fee1.y - 120],
      ]
    : [[0, 0]];
  const scroll = scrollAt(frame, keys);
  // each tap lands on its target where the page will have scrolled to by then
  const tapOn = (p: { x: number; y: number }, at: number, shift = 0) => ({ at, x: p.x, y: p.y + shift - scrollAt(at, keys) });
  const taps = t
    ? [
        tapOn(center(t.name1), TAP_NAME_1),
        tapOn(center(t.fee1), TAP_FEE_1),
        tapOn(center(t.date1), TAP_DATE_1),
        tapOn(dayOne(t.date1), TAP_DAY_1),
        tapOn(center(t.add), TAP_ADD),
        tapOn(center(t.name1), TAP_NAME_2, dy),
        tapOn(center(t.fee1), TAP_FEE_2, dy),
        { at: TAP_NEXT, ...center(t.next) },
      ]
    : [];

  const doc = pageRef.current?.ownerDocument;
  const card0 = doc ? cardOf(doc, 0) : undefined;
  const card1 = doc ? cardOf(doc, 1) : undefined;
  const focused =
    frame >= TAP_NAME_1 && frame < TAP_FEE_1 ? visibleName(doc!, 0)
    : frame >= TAP_FEE_1 && frame < TAP_DATE_1 ? card0?.querySelectorAll<HTMLInputElement>("input")[1]
    : frame >= TAP_NAME_2 && frame < TAP_FEE_2 ? visibleName(doc!, 1)
    : frame >= TAP_FEE_2 && frame < BOTH ? card1?.querySelectorAll<HTMLInputElement>("input")[1]
    : null;
  useFocus(focused);
  usePopover(card0?.querySelector<HTMLElement>("button[aria-haspopup=dialog]"), frame >= TAP_DATE_1 && frame < TAP_DAY_1 + 3);

  const ring = interpolate(frame, [BOTH + 4, BOTH + 14, TAP_NEXT - 16, TAP_NEXT - 8], [0, 1, 1, 0], clamp);
  const feeRing = (shift: number): Box | null => (t ? { ...t.fee1, y: t.fee1.y + shift - scroll } : null);
  const beat = { frame, scroll };
  // the second row's fee and join date, the two values it copied
  const copied = t ? { x: t.fee1.x, y: t.fee1.y - 26 + dy, w: t.fee1.w, h: t.date1.y + t.date1.h - t.fee1.y + 26 } : null;

  return (
    <>
      {[JOIN_HINT, SOURCE, EXTRA, COPIED].map(([from]) => (
        <Sfx key={from} role="tick" at={from + 2} volume={0.6} />
      ))}
      <Sfx role="whoosh" at={TO_CARD + 8} volume={0.35} />
      <Sfx role="click-soft" at={TAP_NAME_1} volume={0.8} />
      {typingCues(TAP_NAME_1 + TYPE_DELAY, TAP_NAME_1 + TYPE_DELAY + STUDENTS[0].name.length * 2, STUDENTS[0].name.length).map((at) => (
        <Sfx key={`a${at}`} role="key" at={at} volume={0.55} />
      ))}
      <Sfx role="click-soft" at={TAP_FEE_1} volume={0.8} />
      {typingCues(TAP_FEE_1 + TYPE_DELAY, TAP_FEE_1 + TYPE_DELAY + 12, 6).map((at) => (
        <Sfx key={`b${at}`} role="key" at={at} volume={0.55} />
      ))}
      <Sfx role="click-soft" at={TAP_DATE_1} volume={0.8} />
      <Sfx role="pop" at={TAP_DATE_1 + 2} volume={0.6} />
      <Sfx role="select" at={TAP_DAY_1} volume={0.8} />
      <Sfx role="click-firm" at={TAP_ADD} volume={0.8} />
      <Sfx role="pop" at={TAP_ADD + 2} volume={0.7} />
      <Sfx role="click-soft" at={TAP_NAME_2} volume={0.8} />
      {typingCues(TAP_NAME_2 + TYPE_DELAY, TAP_NAME_2 + TYPE_DELAY + STUDENTS[1].name.length * 2, STUDENTS[1].name.length).map((at) => (
        <Sfx key={`c${at}`} role="key" at={at} volume={0.55} />
      ))}
      <Sfx role="click-soft" at={TAP_FEE_2} volume={0.8} />
      {typingCues(TAP_FEE_2 + TYPE_DELAY, TAP_FEE_2 + TYPE_DELAY + 12, 6).map((at) => (
        <Sfx key={`d${at}`} role="key" at={at} volume={0.55} />
      ))}
      <Sfx role="pop" at={BOTH + 6} volume={0.7} />
      <Sfx role="click-firm" at={TAP_NEXT} volume={0.8} />

      <StepCaption eyebrow="Bước 2/3" from={0} to={BOTH}>
        Thêm học sinh
      </StepCaption>
      <StepCaption eyebrow="Học phí mỗi buổi" from={BOTH}>
        <span style={{ color: colors.emerald }}>Mỗi em một giá</span>
      </StepCaption>

      <AppScreen
        client={client}
        pathname="/dashboard/classes/new"
        scroll={scroll}
        pageRef={pageRef}
        fixed={<WizardFooter step={1} />}
        overlay={
          <>
            <Explain {...beat} from={JOIN_HINT[0]} to={JOIN_HINT[1]} box={t?.hint}>
              Ngày vào lớp quyết định em có mặt ở những buổi nào. Học từ đầu tháng thì chọn ngày 1
            </Explain>
            <Explain {...beat} from={SOURCE[0]} to={SOURCE[1]} box={t?.source}>
              Mới: tạo học sinh mới · Cũ: chọn em đã có ở lớp khác
            </Explain>
            <Explain {...beat} from={EXTRA[0]} to={EXTRA[1]} box={t?.extra} side="above">
              Thêm email và SĐT phụ huynh, để mời học và gửi báo cáo
            </Explain>
            <Explain {...beat} from={COPIED[0]} to={COPIED[1]} box={copied} side="above">
              Hàng mới tự chép học phí và ngày vào lớp của hàng trên
            </Explain>
            <Ring box={feeRing(0)} opacity={ring} />
            <Ring box={feeRing(dy)} opacity={ring} />
          </>
        }
      >
        <WizardPage step={1}>
          <Form {...form}>
            <StudentHints />
            <ClassStudentsField control={form.control} setValue={form.setValue} clearErrors={form.clearErrors} billingMode={BillingMode.PER_SESSION} />
          </Form>
        </WizardPage>
      </AppScreen>
      <TapFinger frame={frame} taps={taps} hideAt={TAP_NEXT + 12} />
    </>
  );
};

export const StudentsScene = Interactive.create({
  Component: StudentsSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
