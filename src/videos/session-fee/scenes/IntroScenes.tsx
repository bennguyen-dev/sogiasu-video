import { useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender, Interactive, interpolate, useCurrentFrame } from "remotion";
import ClassDetailPage from "@/features/class/pages/ClassDetailPage";
import { enrollmentKeys } from "@/features/enrollment/hooks/enrollment-keys";
import { useMockApi } from "../../../shared/app/AppProviders";
import { useDemoNow } from "../../../shared/app/frozen-clock";
import { setDemoSearch } from "../../../shared/app/stubs/next-navigation";
import { Sfx } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { clamp, ease } from "../../../shared/motion";
import { colors } from "../../../shared/theme";
import { AppScreen, newClient, pageBox, useMeasure } from "../../../shared/tutorial/AppScreen";
import { makeModeScene } from "../../fee-common/scenes";
import { EndCard } from "../../create-class/scenes/EndScene";
import { BillingMode } from "@prisma/client";
import { CLASS_COLOR, CLASS_NAME } from "../../create-class/data";
import { SESSION_FEE_API, TODAY_6 } from "../data";

// the class page's student cards answer from this flag; the scene rendering sets it
let raised = false;
const API = SESSION_FEE_API(() => raised);

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
const useModeApp = () => useClassPage(false);
export const ModeScene = makeModeScene({
  useApp: useModeApp,
  mode: BillingMode.PER_SESSION,
  className: CLASS_NAME,
  color: CLASS_COLOR,
  title: "Học phí theo buổi",
  hint: "Theo buổi: dạy xong buổi nào, tính tiền buổi đó",
  hintSide: "above",
});

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
export const EndScene = Interactive.create({ Component: EndSceneInner, layout: "absolute-fill", schema });
