import { useRef, useState } from "react";
import { Lock } from "lucide-react";
import { Interactive, interpolate, useCurrentFrame } from "remotion";
import PublicReport from "@/features/report/components/PublicReport";
import ReportLayout from "@/shared/components/layouts/report/layout";
import { useMockApi } from "../../../shared/app/AppProviders";
import { DEMO_NOW, useDemoNow } from "../../../shared/app/frozen-clock";
import { Sfx } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { clamp, ease } from "../../../shared/motion";
import { colors } from "../../../shared/theme";
import { AppScreen, type Box, center, Explain, newClient, pageBox, SCREEN_H, scrollAt, TapFinger, useMeasure } from "../../../shared/tutorial/AppScreen";
import { CREATED_API } from "../../create-class/data";
import { report, reportUrl } from "../data";

const BAR_H = 52;
const AMBER = "#f59e0b";

// the phone's browser chrome above the public report
const BrowserBar = ({ url }: { readonly url: string }) => (
  <div className="fixed inset-x-0 top-0 z-50 flex items-center gap-2 border-b bg-white px-3" style={{ height: BAR_H }}>
    <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
      <Lock className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{url.replace("https://", "")}</span>
    </div>
  </div>
);

type Targets = { header: Box; grid: Box; chip: Box | null; card: Box | null; cardHead: Box | null; body: Box | null; reason: Box | null };

const measureReport = (page: HTMLElement): Targets | null => {
  const cards = [...page.querySelectorAll("[data-slot=card]")];
  const card = page.querySelector("[id*='new-class-0']");
  const chip = page.querySelector("a[href*='new-class-0']");
  const pb = (el: Element | null | undefined) => pageBox(page, el);
  if (cards.length < 2) return null;
  return {
    header: pb(cards[0])!,
    grid: pb(cards[1])!,
    chip: pb(chip),
    card: pb(card),
    cardHead: pb(card?.querySelector("[data-slot=card-header]")),
    body: pb(card?.querySelector("[data-slot=card-content]")),
    reason: pb(card?.querySelector("[data-slot=alert]")),
  };
};

const ReportPage = ({ studentKey }: { readonly studentKey: "ma" | "gh" }) => (
  <div style={{ paddingTop: BAR_H }}>
    <ReportLayout>
      <PublicReport report={report(studentKey)} />
    </ReportLayout>
  </div>
);

// 1 · what the link opens · 2 · this month's lessons · 3 · tap one → its notes · 4 · Gia Hân's excused lesson
const HEAD = [10, 76] as const;
const GRID = [100, 170] as const;
const TAP_CHIP = 184;
const BODY = [214, 290] as const;
const NO_FEE = [298, 356] as const;
export const SWITCH = 372;
const REASON_HINT = [392, 466] as const;
export const REPORT_LENGTH = 480;

const ReportSceneInner = () => {
  useDemoNow(DEMO_NOW);
  useMockApi(CREATED_API);
  const frame = useCurrentFrame();
  const pageRef = useRef<HTMLDivElement>(null);
  const [client] = useState(newClient);
  const studentKey = frame < SWITCH ? "ma" : "gh";
  const t = useMeasure(() => (pageRef.current ? measureReport(pageRef.current) : null));
  const cardTop = t?.card ? t.card.y - BAR_H - 10 : 0;
  const keys: [number, number][] = t
    ? [
        [HEAD[1] + 4, 0],
        [HEAD[1] + 20, t.grid.y - BAR_H - 10],
        [TAP_CHIP + 4, t.grid.y - BAR_H - 10],
        [TAP_CHIP + 22, cardTop],
        [BODY[0] - 4, cardTop],
        [BODY[0] + 30, cardTop + 260],
        [NO_FEE[0] - 4, cardTop + 260],
        [NO_FEE[0] + 12, cardTop],
        [SWITCH - 1, cardTop],
      ]
    : [[0, 0]];
  const scroll = frame < SWITCH ? scrollAt(frame, keys) : cardTop;
  // the switch to the second link: a quick fade through white
  const flash = interpolate(frame, [SWITCH - 8, SWITCH, SWITCH + 8], [0, 1, 0], clamp);
  // the result + notes the tutor wrote, cut to what's on screen
  const visibleBody =
    t?.body && { ...t.body, y: Math.max(t.body.y, scroll + BAR_H + 70), h: Math.min(t.body.y + t.body.h, scroll + SCREEN_H - 170) - Math.max(t.body.y, scroll + BAR_H + 70) };

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      {[HEAD, GRID, BODY, NO_FEE, REASON_HINT].map(([from]) => (
        <Sfx key={from} role="tick" at={from + 2} volume={0.6} />
      ))}
      <Sfx role="click-soft" at={TAP_CHIP} volume={0.8} />
      <Sfx role="whoosh" at={TAP_CHIP + 6} volume={0.3} />
      <Sfx role="whoosh" at={SWITCH - 6} volume={0.4} />
      <StepCaption eyebrow="Gửi link 1 lần" from={0} to={GRID[0]}>
        <span style={{ color: colors.emerald }}>Phụ huynh tự vào xem</span>
      </StepCaption>
      <StepCaption eyebrow="Có cả lịch học" from={GRID[0]} to={BODY[0]}>
        Buổi nào học, buổi nào tới
      </StepCaption>
      <StepCaption eyebrow="Sau mỗi buổi" from={BODY[0]} to={SWITCH}>
        <span style={{ color: colors.emerald }}>Nhận xét có ngay</span>
      </StepCaption>
      <StepCaption eyebrow="Nghỉ học?" from={SWITCH}>
        <span style={{ color: "#d97706" }}>Có lý do rõ ràng</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/report"
        scroll={scroll}
        pageRef={pageRef}
        fixed={
          <>
            <BrowserBar url={reportUrl(studentKey)} />
            <div className="pointer-events-none fixed inset-0 z-[60] bg-white" style={{ opacity: flash }} />
          </>
        }
        overlay={
          t ? (
            <>
              <Explain frame={frame} from={HEAD[0]} to={HEAD[1]} box={t.header} scroll={scroll}>
                Mỗi em một link riêng, phụ huynh chỉ thấy con mình
              </Explain>
              <Explain frame={frame} from={GRID[0]} to={GRID[1]} box={t.grid} scroll={scroll} side="above">
                Lịch học cả tháng: buổi nào đã học, buổi nào sắp tới
              </Explain>
              <Explain frame={frame} from={BODY[0]} to={BODY[1]} box={visibleBody} scroll={scroll} side="above">
                Điểm, nhận xét, bài tập, file đính kèm: cô ghi gì phụ huynh thấy nấy
              </Explain>
              <Explain frame={frame} from={NO_FEE[0]} to={NO_FEE[1]} box={t.cardHead} scroll={scroll}>
                Học phí không hiển thị trong báo cáo
              </Explain>
              <Explain frame={frame} from={REASON_HINT[0]} to={REASON_HINT[1]} box={t.reason} scroll={scroll} color={AMBER}>
                Nghỉ học cũng có ghi rõ lý do cô đã nhập
              </Explain>
            </>
          ) : null
        }
      >
        <ReportPage studentKey={studentKey} />
      </AppScreen>
      {t?.chip ? <TapFinger frame={frame} taps={[{ at: TAP_CHIP, ...center({ ...t.chip, y: t.chip.y - scrollAt(TAP_CHIP, keys) }) }]} hideAt={TAP_CHIP + 10} /> : null}
    </>
  );
};

// the parent's view up front: Minh Anh's 01/10 lesson, score and photo
const HookSceneInner = () => {
  useDemoNow(DEMO_NOW);
  useMockApi(CREATED_API);
  const frame = useCurrentFrame();
  const pageRef = useRef<HTMLDivElement>(null);
  const [client] = useState(newClient);
  const t = useMeasure(() => (pageRef.current ? measureReport(pageRef.current) : null));
  const zoom = interpolate(frame, [0, 90], [1.06, 1], { ...clamp, easing: ease });

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.5} />
      <Sfx role="impact-soft" at={10} volume={0.8} />
      <StepCaption eyebrow="Báo cáo cho phụ huynh" from={-20}>
        <span style={{ color: colors.emerald }}>gửi 1 lần, xem cả khoá</span>
      </StepCaption>
      <div style={{ position: "absolute", inset: 0, scale: String(zoom), transformOrigin: "540px 285px" }}>
        <AppScreen client={client} pathname="/report" scroll={t?.card ? t.card.y - BAR_H - 10 + 120 : 0} pageRef={pageRef} fixed={<BrowserBar url={reportUrl("ma")} />}>
          <ReportPage studentKey="ma" />
        </AppScreen>
      </div>
    </>
  );
};

export const ReportScene = Interactive.create({ Component: ReportSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
export const HookScene = Interactive.create({ Component: HookSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
