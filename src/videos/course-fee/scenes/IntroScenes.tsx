import { useRef } from "react";
import { BillingMode } from "@prisma/client";
import { Interactive, interpolate, useCurrentFrame } from "remotion";
import FeesPage from "@/features/fee/pages/FeesPage";
import { setDemoSearch } from "../../../shared/app/stubs/next-navigation";
import { Sfx } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { clamp, ease } from "../../../shared/motion";
import { colors } from "../../../shared/theme";
import {
  AppScreen,
  pageBox,
  SCREEN_H,
  useMeasure,
} from "../../../shared/tutorial/AppScreen";
import { EndCard } from "../../create-class/scenes/EndScene";
import {
  rowsOf,
  studentCardOf,
  useOpenCard,
} from "../../../shared/tutorial/fee-page";
import { makeModeScene } from "../../fee-common/scenes";
import { CLASS_COLOR_8, CLASS_NAME_8 } from "../data";
import { useCourseApp } from "./shared";

const NAME = "Thu Trang";

// 0 · Thu Trang's courses laid open: October and November, one amount each
const HookSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useCourseApp(true);
  const pageRef = useRef<HTMLDivElement>(null);
  setDemoSearch("");
  useOpenCard(pageRef.current, true, NAME);
  const t = useMeasure(() => {
    const card = pageRef.current ? studentCardOf(pageRef.current, NAME) : null;
    return card ? { rows: pageBox(pageRef.current!, rowsOf(card)) } : null;
  });
  const zoom = interpolate(frame, [0, 90], [1.06, 1], {
    ...clamp,
    easing: ease,
  });

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.5} />
      <Sfx role="impact-soft" at={10} volume={0.8} />
      <StepCaption eyebrow="Thu tiền trọn gói" from={-20}>
        <span style={{ color: colors.emerald }}>theo khóa học</span>
      </StepCaption>
      <div
        style={{
          position: "absolute",
          inset: 0,
          scale: String(zoom),
          transformOrigin: "540px 1100px",
        }}
      >
        <AppScreen
          client={client}
          pathname="/dashboard/fees"
          scroll={
            t?.rows ? Math.max(0, t.rows.y + t.rows.h + 60 - SCREEN_H) : 0
          }
          pageRef={pageRef}
        >
          <FeesPage />
        </AppScreen>
      </div>
    </>
  );
};

// 1 · the billing mode, picked once when the class is made
const useModeApp = () => useCourseApp(false);
export const ModeScene = makeModeScene({
  useApp: useModeApp,
  mode: BillingMode.PER_COURSE,
  className: CLASS_NAME_8,
  color: CLASS_COLOR_8,
  title: "Học phí theo khóa",
  hint: "Mỗi khóa thu một khoản, không tính theo buổi",
  hintSide: "above",
});

const EndSceneInner = () => (
  <EndCard
    episode="Tập 8 · Học phí theo khóa"
    title={
      <>
        Thu tiền trọn gói
        <br />
        theo khóa học.
      </>
    }
    titleSize={100}
    next={{ episode: "Tập 9", title: "Giảm giá, sửa giá, phí khác" }}
  />
);

const schema = { ...Interactive.backgroundSchema };
export const HookScene = Interactive.create({
  Component: HookSceneInner,
  layout: "absolute-fill",
  schema,
});
export const EndScene = Interactive.create({
  Component: EndSceneInner,
  layout: "absolute-fill",
  schema,
});
