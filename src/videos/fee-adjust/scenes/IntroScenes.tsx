import { useRef } from "react";
import { Interactive, interpolate, useCurrentFrame } from "remotion";
import FeesPage from "@/features/fee/pages/FeesPage";
import { setDemoSearch } from "../../../shared/app/stubs/next-navigation";
import { Sfx } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { clamp, ease } from "../../../shared/motion";
import { colors } from "../../../shared/theme";
import { AppScreen, pageBox, SCREEN_H, useMeasure } from "../../../shared/tutorial/AppScreen";
import { EndCard } from "../../create-class/scenes/EndScene";
import { studentCardOf, useOpenCard } from "../../../shared/tutorial/fee-page";
import { makeVoucherScene } from "../../fee-common/scenes";
import { GH_NAME, STUDENT_REF_9, VOUCHER_OPTIONS_9, voucher9 } from "../data";
import { useAdjustApp } from "./shared";

// 0 · Gia Hân's card laid open: −10% sessions, the hand-set 07/11, the textbook
const HookSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useAdjustApp(3);
  const pageRef = useRef<HTMLDivElement>(null);
  setDemoSearch("");
  useOpenCard(pageRef.current, true, GH_NAME);
  const t = useMeasure(() => {
    const card = pageRef.current ? studentCardOf(pageRef.current, GH_NAME) : null;
    return card ? { card: pageBox(pageRef.current!, card) } : null;
  });
  const zoom = interpolate(frame, [0, 90], [1.06, 1], { ...clamp, easing: ease });

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.5} />
      <Sfx role="impact-soft" at={10} volume={0.8} />
      <StepCaption eyebrow="Giảm giá, sửa giá" from={-20}>
        <span style={{ color: colors.emerald }}>thêm phí khác</span>
      </StepCaption>
      <div style={{ position: "absolute", inset: 0, scale: String(zoom), transformOrigin: "540px 1100px" }}>
        <AppScreen client={client} pathname="/dashboard/fees" scroll={t?.card ? Math.max(0, t.card.y + t.card.h + 24 - SCREEN_H) : 0} pageRef={pageRef}>
          <FeesPage />
        </AppScreen>
      </div>
    </>
  );
};

const useDone = () => useAdjustApp(3);

// 4 · the voucher: all three on Gia Hân's November
export const VoucherScene = makeVoucherScene({
  useApp: useDone,
  name: GH_NAME,
  student: STUDENT_REF_9,
  options: VOUCHER_OPTIONS_9,
  view: voucher9,
  subtitle: "ghi rõ từng khoản",
  hint: "Phụ huynh thấy rõ từng khoản",
});

const EndSceneInner = () => (
  <EndCard
    episode="Tập 9 · Giảm giá, sửa giá, phí khác"
    title={
      <>
        Giảm giá, sửa giá,
        <br />
        thêm phí khác.
      </>
    }
    titleSize={100}
    next={{ episode: "Tập 10", title: "Bảng điểm danh" }}
  />
);

const schema = { ...Interactive.backgroundSchema };
export const HookScene = Interactive.create({ Component: HookSceneInner, layout: "absolute-fill", schema });
export const EndScene = Interactive.create({ Component: EndSceneInner, layout: "absolute-fill", schema });
