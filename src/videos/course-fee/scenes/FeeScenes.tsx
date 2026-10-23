import { useRef } from "react";
import { Interactive, useCurrentFrame } from "remotion";
import FeesPage from "@/features/fee/pages/FeesPage";
import { setDemoSearch } from "../../../shared/app/stubs/next-navigation";
import { Sfx } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { colors } from "../../../shared/theme";
import {
  AppScreen,
  type Box,
  center,
  Explain,
  pageBox,
  SCREEN_H,
  scrollAt,
  TapFinger,
  useMeasure,
} from "../../../shared/tutorial/AppScreen";
import {
  pickButton,
  rowsOf,
  studentCardOf,
  useOpenCard,
} from "../../../shared/tutorial/fee-page";
import { makeVoucherScene } from "../../fee-common/scenes";
import { STUDENT_REF_8, VOUCHER_OPTIONS_8, voucher8 } from "../data";
import { useCourseApp } from "./shared";

const NAME = "Thu Trang";
const listScrollOf = (rows: Box | null | undefined) =>
  rows ? Math.max(0, rows.y + rows.h + 40 - SCREEN_H) : 0;

// 3 · on the Fees page: October's unpaid course and November's, one row each
const TAP_PICK = 30;
const ROWS_HINT = [46, 126] as const;
export const LIST_LENGTH = 140;

const ListSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useCourseApp(true);
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
      <StepCaption eyebrow="Mục Học phí" from={0}>
        <span style={{ color: colors.emerald }}>mỗi khóa một dòng</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/fees"
        scroll={scroll}
        pageRef={pageRef}
        overlay={
          t ? (
            <Explain
              frame={frame}
              from={ROWS_HINT[0]}
              to={ROWS_HINT[1]}
              box={t.rows}
              scroll={scroll}
              side="above"
            >
              Tính theo khóa, không theo số buổi
            </Explain>
          ) : null
        }
      >
        <FeesPage />
      </AppScreen>
      {t ? (
        <TapFinger
          frame={frame}
          taps={[
            { at: TAP_PICK, ...center({ ...t.pick, y: t.pick.y - scroll }) },
          ]}
          hideAt={TAP_PICK + 10}
        />
      ) : null}
    </>
  );
};

const useAdded = () => useCourseApp(true);

export const ListScene = Interactive.create({
  Component: ListSceneInner,
  layout: "absolute-fill",
  schema: { ...Interactive.backgroundSchema },
});

// 4 · the voucher: both unpaid courses on one QR
export const VoucherScene = makeVoucherScene({
  useApp: useAdded,
  name: NAME,
  student: STUDENT_REF_8,
  options: VOUCHER_OPTIONS_8,
  view: voucher8,
  subtitle: "gộp các khóa chưa thu",
  hint: "Phiếu gộp cả khóa tháng 10 chưa thu",
});
