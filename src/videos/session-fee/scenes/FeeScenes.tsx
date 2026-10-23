import { useRef, useState } from "react";
import { Interactive, useCurrentFrame } from "remotion";
import FeesPage from "@/features/fee/pages/FeesPage";
import { useMockApi } from "../../../shared/app/AppProviders";
import { useDemoNow } from "../../../shared/app/frozen-clock";
import { setDemoSearch } from "../../../shared/app/stubs/next-navigation";
import { Sfx } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { colors } from "../../../shared/theme";
import { AppScreen, center, Explain, newClient, pageBox, SCREEN_H, scrollAt, TapFinger, useMeasure } from "../../../shared/tutorial/AppScreen";
import { pickButton, rowOn, rowsOf, studentCardOf, useOpenCard } from "../../../shared/tutorial/fee-page";
import { makeCheckScene, makeVoucherScene } from "../../fee-common/scenes";
import { STUDENT_IDS } from "../../attendance/data";
import { SESSION_FEE_API, TODAY_6, VOUCHER_OPTIONS_6, voucher6 } from "../data";

const AMBER = "#f59e0b";

let raised = false;
const API = SESSION_FEE_API(() => raised);

const useFeesPage = (isRaised: boolean) => {
  useDemoNow(TODAY_6);
  raised = isRaised;
  useMockApi(API);
  const [client] = useState(newClient);
  return client;
};

// 2 · before the change: Minh Anh's three November lessons, the 10/11 absence charged like the rest
const TAP_PICK = 30;
const ROWS_HINT = [46, 112] as const;
const ABSENT_HINT = [120, 196] as const;
export const LIST_LENGTH = 208;

const ListSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useFeesPage(false);
  const pageRef = useRef<HTMLDivElement>(null);
  useState(() => setDemoSearch(""));
  useOpenCard(pageRef.current, frame >= TAP_PICK, "Minh Anh");
  const t = useMeasure(() => {
    const page = pageRef.current;
    const ma = page ? studentCardOf(page, "Minh Anh") : null;
    const pick = ma ? pickButton(ma) : null;
    if (!page || !ma || !pick) return null;
    return {
      pick: pageBox(page, pick)!,
      rows: pageBox(page, rowsOf(ma)),
      absent: pageBox(page, rowOn(ma, "10/11")),
    };
  });
  const scroll = t?.rows ? scrollAt(frame, [[0, Math.max(0, t.rows.y + t.rows.h + 40 - SCREEN_H)]]) : 0;
  const pickAt = t ? { ...t.pick, y: t.pick.y - scroll } : null;

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="click-soft" at={TAP_PICK} volume={0.8} />
      <Sfx role="tick" at={ROWS_HINT[0] + 2} volume={0.6} />
      <Sfx role="tick" at={ABSENT_HINT[0] + 2} volume={0.6} />
      <StepCaption eyebrow="Mỗi buổi dạy xong" from={0}>
        <span style={{ color: colors.emerald }}>= 1 khoản học phí</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/fees"
        scroll={scroll}
        pageRef={pageRef}
        overlay={
          t ? (
            <>
              <Explain frame={frame} from={ROWS_HINT[0]} to={ROWS_HINT[1]} box={t.rows} scroll={scroll} side="above">
                Bấm <b>Đã dạy xong</b> là có khoản, không cần nhập tay
              </Explain>
              <Explain frame={frame} from={ABSENT_HINT[0]} to={ABSENT_HINT[1]} box={t.absent} scroll={scroll} color={AMBER} side="above">
                Buổi này em vắng không phép: vẫn tính tiền. Chỉ nghỉ có phép mới miễn
              </Explain>
            </>
          ) : null
        }
      >
        <FeesPage />
      </AppScreen>
      {pickAt ? <TapFinger frame={frame} taps={[{ at: TAP_PICK, ...center(pickAt) }]} hideAt={TAP_PICK + 10} /> : null}
    </>
  );
};

const useRaisedFees = () => useFeesPage(true);

export const ListScene = Interactive.create({ Component: ListSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });

// 4 · after: November at 350.000, October in the history tab still at 300.000
export const CheckScene = makeCheckScene({
  useApp: useRaisedFees,
  name: "Minh Anh",
  newHint: "3 buổi tháng 11 đã tự lên 350.000đ",
  paidHint: "Buổi tháng 10 đã thu: vẫn 300.000đ, không đổi",
});

// 5 · the month-end voucher picks up the new price
export const VoucherScene = makeVoucherScene({
  useApp: useRaisedFees,
  name: "Minh Anh",
  student: { id: STUDENT_IDS.ma, name: "Minh Anh" },
  options: VOUCHER_OPTIONS_6,
  view: voucher6,
  subtitle: "tự lấy giá mới",
  hint: "Phiếu tự lấy giá mới, QR đúng 1.050.000đ",
});
