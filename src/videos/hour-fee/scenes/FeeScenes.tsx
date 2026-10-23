import { useRef } from "react";
import { Interactive, useCurrentFrame } from "remotion";
import FeesPage from "@/features/fee/pages/FeesPage";
import { setDemoSearch } from "../../../shared/app/stubs/next-navigation";
import { Sfx } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { colors } from "../../../shared/theme";
import { AppScreen, type Box, center, Explain, pageBox, SCREEN_H, scrollAt, TapFinger, useMeasure } from "../../../shared/tutorial/AppScreen";
import { pickButton, rowsOf, studentCardOf, useOpenCard } from "../../../shared/tutorial/fee-page";
import { makeCheckScene, makeVoucherScene } from "../../fee-common/scenes";
import { STUDENT_REF_7, VOUCHER_OPTIONS_7, voucher7 } from "../data";
import { useHourApp } from "./shared";

const NAME = "Khánh Linh";
const listScrollOf = (rows: Box | null | undefined) => (rows ? Math.max(0, rows.y + rows.h + 40 - SCREEN_H) : 0);

// 3 · the lessons in money: each row is its own hours × the hourly rate
const TAP_PICK = 30;
const ROWS_HINT = [46, 126] as const;
export const LIST_LENGTH = 140;

const ListSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useHourApp({ raised: false, todayDone: true });
  const pageRef = useRef<HTMLDivElement>(null);
  setDemoSearch("");
  useOpenCard(pageRef.current, frame >= TAP_PICK, NAME);
  const t = useMeasure(() => {
    const page = pageRef.current;
    const card = page ? studentCardOf(page, NAME) : null;
    const pick = card ? pickButton(card) : null;
    if (!page || !card || !pick) return null;
    return { pick: pageBox(page, pick)!, rows: pageBox(page, rowsOf(card)) };
  });
  const scroll = scrollAt(frame, [[0, listScrollOf(t?.rows)]]);

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="click-soft" at={TAP_PICK} volume={0.8} />
      <Sfx role="tick" at={ROWS_HINT[0] + 2} volume={0.6} />
      <StepCaption eyebrow="Số giờ × giá giờ" from={0}>
        <span style={{ color: colors.emerald }}>app tự nhân</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/fees"
        scroll={scroll}
        pageRef={pageRef}
        overlay={
          t ? (
            <Explain frame={frame} from={ROWS_HINT[0]} to={ROWS_HINT[1]} box={t.rows} scroll={scroll} side="above">
              Buổi dài ngắn khác nhau, app tự nhân, không cần bấm máy tính
            </Explain>
          ) : null
        }
      >
        <FeesPage />
      </AppScreen>
      {t ? <TapFinger frame={frame} taps={[{ at: TAP_PICK, ...center({ ...t.pick, y: t.pick.y - scroll }) }]} hideAt={TAP_PICK + 10} /> : null}
    </>
  );
};

const useRaised = () => useHourApp({ raised: true, todayDone: true });

export const ListScene = Interactive.create({ Component: ListSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });

// 5 · after the raise: November at 300.000/giờ, October in the history tab still at 250.000/giờ
export const CheckScene = makeCheckScene({
  useApp: useRaised,
  name: NAME,
  newHint: "3 buổi tháng 11 đã tự lên 300.000đ/giờ",
  paidHint: "Buổi tháng 10 đã thu: vẫn 250.000đ/giờ, không đổi",
});

// 6 · the month-end voucher: each lesson's hours × 300.000
export const VoucherScene = makeVoucherScene({
  useApp: useRaised,
  name: NAME,
  student: STUDENT_REF_7,
  options: VOUCHER_OPTIONS_7,
  view: voucher7,
  subtitle: "rõ từng buổi",
  hint: "Phụ huynh thấy rõ từng buổi bao nhiêu giờ, giá bao nhiêu",
});
