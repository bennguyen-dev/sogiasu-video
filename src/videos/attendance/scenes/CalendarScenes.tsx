import { useRef, useState } from "react";
import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { useMockApi } from "../../../shared/app/AppProviders";
import { DEMO_NOW, useDemoNow } from "../../../shared/app/frozen-clock";
import { Sfx } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { clamp, ease } from "../../../shared/motion";
import { colors } from "../../../shared/theme";
import { AppScreen, center, Explain, newClient, pageBox, Ring, scrollAt, TapFinger, useMeasure } from "../../../shared/tutorial/AppScreen";
import { CalendarPage, useMonthView } from "../../create-class/scenes/CalendarScenes";
import { EndCard } from "../../create-class/scenes/EndScene";
import { calendarApi } from "../data";
import { DetailPage } from "../DetailPage";
import { FINAL_STATE, useDetailClient, useRowForms, useSeed } from "./DetailScene";

export const TAP_LESSON = 96;
const FIRST = '.fc-dayGridMonth-view [data-date="2026-10-01"] .fc-daygrid-event-harness';

// the month as tutorial 1 left it: 01/10 already taught but still open, its clock badge amber
const OpenSceneInner = () => {
  useDemoNow(DEMO_NOW);
  useMockApi(calendarApi(false));
  const frame = useCurrentFrame();
  const [page, setPage] = useState<HTMLDivElement | null>(null);
  const [client] = useState(newClient);
  const monthScroll = useMonthView(page) ?? 0;
  const lesson = useMeasure(() => (page ? pageBox(page, page.querySelector(FIRST)) : null));

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="tick" at={16} volume={0.6} />
      <Sfx role="click-soft" at={TAP_LESSON} volume={0.8} />
      <StepCaption eyebrow="Buổi đã dạy?" from={0}>
        <span style={{ color: colors.emerald }}>Chạm vào để chốt</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/calendar"
        scroll={monthScroll}
        pageRef={setPage}
        overlay={
          <Explain frame={frame} from={14} to={TAP_LESSON - 4} box={lesson} scroll={monthScroll} color="#f59e0b">
            Đồng hồ cam: buổi đã qua nhưng chưa chốt
          </Explain>
        }
      >
        <CalendarPage />
      </AppScreen>
      {lesson ? <TapFinger frame={frame} taps={[{ at: TAP_LESSON, ...center({ ...lesson, y: lesson.y - monthScroll }) }]} hideAt={TAP_LESSON + 10} /> : null}
    </>
  );
};

// the finished lesson up front: the fee is already there, the excused student costs nothing
const HookSceneInner = () => {
  useDemoNow(DEMO_NOW);
  useMockApi(calendarApi(true));
  const frame = useCurrentFrame();
  const pageRef = useRef<HTMLDivElement>(null);
  const client = useDetailClient(FINAL_STATE);
  useSeed(client, FINAL_STATE);
  const forms = useRowForms(FINAL_STATE);
  const stats = useMeasure(() => (pageRef.current ? pageBox(pageRef.current, pageRef.current.querySelector("[data-stats]")) : null));
  const zoom = interpolate(frame, [0, 90], [1.06, 1], { ...clamp, easing: ease });

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.5} />
      <Sfx role="impact-soft" at={10} volume={0.8} />
      <StepCaption eyebrow="Dạy xong 1 buổi" from={-20}>
        <span style={{ color: colors.emerald }}>chốt sổ trong 1 phút</span>
      </StepCaption>
      <div style={{ position: "absolute", inset: 0, scale: String(zoom), transformOrigin: "540px 285px" }}>
        <AppScreen client={client} pathname="/dashboard/lessons/new-class-0" scroll={stats ? stats.y - 60 : 0} pageRef={pageRef}>
          <DetailPage state={FINAL_STATE} forms={forms} />
        </AppScreen>
      </div>
    </>
  );
};

// back on the calendar: 01/10 has lost its amber clock
const DoneSceneInner = () => {
  useDemoNow(DEMO_NOW);
  useMockApi(calendarApi(true));
  const frame = useCurrentFrame();
  const [page, setPage] = useState<HTMLDivElement | null>(null);
  const [client] = useState(newClient);
  const monthScroll = useMonthView(page) ?? 0;
  const lesson = useMeasure(() => (page ? pageBox(page, page.querySelector(FIRST)) : null));
  const scroll = scrollAt(frame, [[0, monthScroll]]);
  const glow = interpolate(frame, [14, 24, 90, 100], [0, 1, 1, 0], clamp);

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="confirm" at={16} volume={0.8} />
      <StepCaption eyebrow="Xong buổi đầu tiên" from={0}>
        <span style={{ color: colors.emerald }}>8 buổi còn lại y hệt</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/calendar"
        scroll={scroll}
        pageRef={setPage}
        overlay={lesson ? <Ring box={{ ...lesson, y: lesson.y - scroll }} opacity={glow} /> : null}
      >
        <CalendarPage />
      </AppScreen>
    </>
  );
};

const EndSceneInner = () => (
  <EndCard
    episode="Tập 2 · Điểm danh buổi đầu tiên"
    title={
      <>
        Chốt buổi,
        <br />
        học phí tự tính.
      </>
    }
    next={{ episode: "Tập 3", title: "Gửi báo cáo cho phụ huynh" }}
  />
);

const schema = { ...Interactive.backgroundSchema };
export const OpenScene = Interactive.create({ Component: OpenSceneInner, layout: "absolute-fill", schema });
export const HookScene = Interactive.create({ Component: HookSceneInner, layout: "absolute-fill", schema });
export const DoneScene = Interactive.create({ Component: DoneSceneInner, layout: "absolute-fill", schema });
export const EndScene = Interactive.create({ Component: EndSceneInner, layout: "absolute-fill", schema });
