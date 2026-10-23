import { useLayoutEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { continueRender, delayRender, Interactive, interpolate, useCurrentFrame } from "remotion";
import ClassDetailPage from "@/features/class/pages/ClassDetailPage";
import ClassField from "@/features/class/components/ClassField";
import { enrollmentKeys } from "@/features/enrollment/hooks/enrollment-keys";
import { Form } from "@/shared/components/ui/form";
import { messages } from "@/shared/i18n/messages.generated";
import { useMockApi } from "../../../shared/app/AppProviders";
import { useDemoNow } from "../../../shared/app/frozen-clock";
import { setDemoSearch } from "../../../shared/app/stubs/next-navigation";
import { Sfx } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { clamp, ease } from "../../../shared/motion";
import { colors } from "../../../shared/theme";
import { AppScreen, type Box, Explain, newClient, pageBox, SCREEN_H, scrollAt, useMeasure } from "../../../shared/tutorial/AppScreen";
import { EndCard } from "../../create-class/scenes/EndScene";
import { WizardFooter, WizardPage } from "../../create-class/WizardPage";
import { CLASS_COLOR, CLASS_NAME, classValues } from "../../create-class/data";
import { SESSION_FEE_API, TODAY_6 } from "../data";

const { form: f } = messages.vi.class;

// the class page's student cards answer from this flag; the scene rendering sets it
let raised = false;
const API = SESSION_FEE_API(() => raised);

export const studentCardOf = (root: ParentNode, name: string) =>
  [...root.querySelectorAll<HTMLElement>("[data-slot=card]")]
    .filter((c) => c.textContent?.includes(name))
    .sort((a, b) => a.textContent!.length - b.textContent!.length)[0];

// the class page on its Students tab; flipping `isRaised` refetches the cards, as the app's own mutation does
export const useClassPage = (isRaised: boolean) => {
  useDemoNow(TODAY_6);
  raised = isRaised;
  useMockApi(API);
  useState(() => setDemoSearch("tab=students"));
  const [client] = useState(newClient);
  const seen = useRef(isRaised);
  useLayoutEffect(() => {
    if (seen.current === isRaised) return;
    seen.current = isRaised;
    const handle = delayRender("refetch enrollments");
    void client.invalidateQueries({ queryKey: enrollmentKeys.all }).then(() => requestAnimationFrame(() => continueRender(handle)));
  });
  return client;
};

// 0 · Minh Anh's card: 300.000đ turns into 350.000đ
const FLIP = 34;

const HookSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useClassPage(frame >= FLIP);
  const pageRef = useRef<HTMLDivElement>(null);
  const t = useMeasure(() => {
    const page = pageRef.current;
    const tabs = page?.querySelector("[role=tablist]");
    return page && tabs ? pageBox(page, tabs) : null;
  });
  const zoom = interpolate(frame, [0, 90], [1.06, 1], { ...clamp, easing: ease });

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.5} />
      <Sfx role="impact-soft" at={FLIP} volume={0.8} />
      <StepCaption eyebrow="Tăng học phí giữa chừng?" from={-20}>
        <span style={{ color: colors.emerald }}>buổi cũ vẫn giữ giá cũ</span>
      </StepCaption>
      <div style={{ position: "absolute", inset: 0, scale: String(zoom), transformOrigin: "540px 900px" }}>
        <AppScreen client={client} pathname="/dashboard/classes/new-class" scroll={t ? Math.max(0, t.y - 12) : 0} pageRef={pageRef}>
          <ClassDetailPage id="new-class" />
        </AppScreen>
      </div>
    </>
  );
};

// 1 · the billing mode, picked once when the class is made
const SESSION = [14, 76] as const;
const LOCKED = [84, 146] as const;
export const MODE_LENGTH = 160;
const VISIBLE_H = SCREEN_H - 68;

const ModeSceneInner = () => {
  useDemoNow(TODAY_6);
  useMockApi(API);
  const frame = useCurrentFrame();
  const pageRef = useRef<HTMLDivElement>(null);
  const [client] = useState(newClient);
  const form = useForm({ defaultValues: classValues(CLASS_NAME, CLASS_COLOR) });
  const t = useMeasure<{ session: Box; course: Box; locked: Box }>(() => {
    const page = pageRef.current;
    if (!page) return null;
    const card = (mode: string) => pageBox(page, page.querySelector(`button[value=${mode}]`)?.closest(".rounded-md.border"));
    const box = {
      session: card("PER_SESSION"),
      course: card("PER_COURSE"),
      locked: pageBox(page, [...page.querySelectorAll("p")].find((p) => p.textContent === f.billingModeHint)),
    };
    return Object.values(box).every(Boolean) ? (box as { session: Box; course: Box; locked: Box }) : null;
  });
  const scroll = t ? scrollAt(frame, [[0, Math.max(0, t.course.y + t.course.h + 16 - VISIBLE_H)]]) : 0;
  const beat = { frame, scroll };

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="tick" at={SESSION[0] + 2} volume={0.6} />
      <Sfx role="tick" at={LOCKED[0] + 2} volume={0.6} />
      <StepCaption eyebrow="Học phí theo buổi" from={0}>
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
            <Explain {...beat} from={SESSION[0]} to={SESSION[1]} box={t?.session} side="above">
              Theo buổi: dạy xong buổi nào, tính tiền buổi đó
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

const EndSceneInner = () => (
  <EndCard
    episode="Tập 6 · Học phí theo buổi"
    titleSize={92}
    title={
      <>
        Tự động tính giá mới,
        <br />
        chính xác từng ngày.
      </>
    }
    next={{ episode: "Tập 7", title: "Học phí theo giờ" }}
  />
);

const schema = { ...Interactive.backgroundSchema };
export const HookScene = Interactive.create({ Component: HookSceneInner, layout: "absolute-fill", schema });
export const ModeScene = Interactive.create({ Component: ModeSceneInner, layout: "absolute-fill", schema });
export const EndScene = Interactive.create({ Component: EndSceneInner, layout: "absolute-fill", schema });
