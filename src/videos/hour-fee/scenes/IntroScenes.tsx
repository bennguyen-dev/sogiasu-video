import { useRef } from "react";
import { BillingMode } from "@prisma/client";
import { Interactive, interpolate, useCurrentFrame } from "remotion";
import FeesPage from "@/features/fee/pages/FeesPage";
import { setDemoSearch } from "../../../shared/app/stubs/next-navigation";
import { Sfx } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { clamp, ease } from "../../../shared/motion";
import { colors } from "../../../shared/theme";
import { AppScreen, pageBox, SCREEN_H, useMeasure } from "../../../shared/tutorial/AppScreen";
import { EndCard } from "../../create-class/scenes/EndScene";
import { rowsOf, studentCardOf, useOpenCard } from "../../../shared/tutorial/fee-page";
import { makeModeScene } from "../../fee-common/scenes";
import { CLASS_NAME_7 } from "../data";
import { useHourApp } from "./shared";

// 0 · Khánh Linh's lessons laid open: 1 hour, 1.5 hours, 2 hours, each its own amount
const HookSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useHourApp({ raised: false, todayDone: true });
  const pageRef = useRef<HTMLDivElement>(null);
  setDemoSearch("");
  useOpenCard(pageRef.current, true, "Khánh Linh");
  const t = useMeasure(() => {
    const card = pageRef.current ? studentCardOf(pageRef.current, "Khánh Linh") : null;
    return card ? { rows: pageBox(pageRef.current!, rowsOf(card)) } : null;
  });
  const zoom = interpolate(frame, [0, 90], [1.06, 1], { ...clamp, easing: ease });

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.5} />
      <Sfx role="impact-soft" at={10} volume={0.8} />
      <StepCaption eyebrow="Mỗi buổi dài ngắn khác nhau?" from={-20}>
        <span style={{ color: colors.emerald }}>tính đúng theo giờ</span>
      </StepCaption>
      <div style={{ position: "absolute", inset: 0, scale: String(zoom), transformOrigin: "540px 1100px" }}>
        <AppScreen client={client} pathname="/dashboard/fees" scroll={t?.rows ? Math.max(0, t.rows.y + t.rows.h + 60 - SCREEN_H) : 0} pageRef={pageRef}>
          <FeesPage />
        </AppScreen>
      </div>
    </>
  );
};

// 1 · the billing mode, picked once when the class is made
const useModeApp = () => useHourApp({ raised: false, todayDone: false });
export const ModeScene = makeModeScene({
  useApp: useModeApp,
  mode: BillingMode.PER_HOUR,
  className: CLASS_NAME_7,
  color: "#00897b",
  title: "Học phí theo giờ",
  hint: "Buổi dài bao nhiêu, tính tiền bấy nhiêu giờ",
  hintSide: "below",
});

const EndSceneInner = () => (
  <EndCard
    episode="Tập 7 · Học phí theo giờ"
    title={
      <>
        Dạy bao nhiêu giờ,
        <br />
        tính đúng bấy nhiêu.
      </>
    }
    titleSize={100}
    next={{ episode: "Tập 8", title: "Học phí theo khóa" }}
  />
);

const schema = { ...Interactive.backgroundSchema };
export const HookScene = Interactive.create({ Component: HookSceneInner, layout: "absolute-fill", schema });
export const EndScene = Interactive.create({ Component: EndSceneInner, layout: "absolute-fill", schema });
