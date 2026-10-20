import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import {
  continueRender,
  delayRender,
  Interactive,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import LessonAttendanceCard from "@/features/lesson/components/LessonDetailContent/LessonAttendanceCard";
import { AppProviders } from "../../../shared/app/AppProviders";
import { PhoneViewport } from "../../../shared/app/PhoneViewport";
import { DEMO_NOW, useDemoNow } from "../../../shared/app/frozen-clock";
import {
  filesKey,
  lesson,
  roster,
  rosterKey,
  STUDENT_NOTE,
  type RowState,
} from "../../../shared/demo/attendance-data";
import { Sfx, typingCues } from "../../../shared/audio/sfx";
import { Caption } from "../../../shared/components/Caption";
import { Finger } from "../../../shared/components/Finger";
import { BEZEL, PHONE_SCALE as S, PHONE_W, PHONE_X, PHONE_Y, PhoneFrame, SCREEN_H as VIEWPORT_H } from "../../../shared/components/Phone";
import { clamp, ease } from "../../../shared/motion";
import { colors } from "../../../shared/theme";

const TAP_STATUS = 34;
const TAP_HOMEWORK = 72;
const TAP_SCORE = 106;
const TAP_NOTE = 136;
const TYPE_START = 146;
const SCROLL_BACK = 196;
const HIGHLIGHT = 212;


const stateAt = (frame: number): RowState => ({
  status: frame >= TAP_STATUS ? "PRESENT" : null,
  homeworkPercent: frame >= TAP_HOMEWORK ? 90 : null,
  score: frame >= TAP_SCORE ? 9 : null,
  studentNote:
    STUDENT_NOTE.slice(
      0,
      Math.max(0, Math.floor((frame - TYPE_START) * 1.5)),
    ) || null,
});

const seed = (client: QueryClient, s: RowState) => {
  client.setQueryData(rosterKey, { success: true, data: roster(s) });
  client.setQueryData(filesKey(s), { success: true, data: [] });
};

type Box = { x: number; y: number; w: number; h: number };
type Targets = {
  stats: Box;
  excused: Box;
  status: Box;
  homework: Box;
  score: Box;
  note: Box;
};

const byText = (root: HTMLElement, selector: string, text: string) =>
  [...root.querySelectorAll<HTMLElement>(selector)].find(
    (el) => el.textContent?.trim() === text,
  );

// positions in the component's own css px, independent of every scale applied on top
const measure = (root: HTMLElement): Targets | null => {
  const r = root.getBoundingClientRect();
  const k = r.width / PHONE_W;
  const box = (el: Element | null | undefined): Box | null => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return {
      x: (b.left - r.left) / k,
      y: (b.top - r.top) / k,
      w: b.width / k,
      h: b.height / k,
    };
  };
  const grid = root.querySelector(".grid.grid-cols-3.divide-x");
  const t = {
    stats: box(grid?.parentElement),
    excused: box(grid?.children[2]),
    status: box(byText(root, "button", "Có mặt")),
    homework: box(byText(root, "button", "90%")),
    score: box(byText(root, "button", "9")),
    note: box(root.querySelector("textarea")?.closest(".group")),
  };
  return Object.values(t).every(Boolean) ? (t as Targets) : null;
};

const center = (b: Box) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });

const AttendanceSceneInner = () => {
  useDemoNow(DEMO_NOW);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const state = stateAt(frame);
  const contentRef = useRef<HTMLDivElement>(null);
  const [targets, setTargets] = useState<Targets | null>(null);
  const [client] = useState(() => {
    const c = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity, retry: false } },
    });
    seed(c, state);
    return c;
  });

  // the frame is the single source of truth; pushing it into the cache is how the real component re-renders
  useLayoutEffect(() => {
    seed(client, state);
  }, [
    client,
    state.status,
    state.homeworkPercent,
    state.score,
    state.studentNote,
  ]);

  // the card mounts inside the phone iframe after the first render; hold the frame until it is measured
  useEffect(() => {
    const handle = delayRender("measure attendance targets");
    let tries = 0;
    let raf = 0;
    const tick = () => {
      const next = contentRef.current ? measure(contentRef.current) : null;
      if (next || ++tries > 150) {
        if (next) setTargets(next);
        continueRender(handle);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useLayoutEffect(() => {
    const next = contentRef.current ? measure(contentRef.current) : null;
    if (next && JSON.stringify(next) !== JSON.stringify(targets))
      setTargets(next);
  });

  const phoneIn = spring({ frame, fps, config: { damping: 200 } });
  const top = targets ? targets.stats.y - 14 : 0;
  const bottom = targets
    ? Math.max(top, targets.note.y + targets.note.h + 24 - VIEWPORT_H)
    : 0;
  const scroll = interpolate(
    frame,
    [0, TAP_NOTE - 12, TAP_NOTE, SCROLL_BACK, SCROLL_BACK + 14],
    [top, top, bottom, bottom, top],
    {
      ...clamp,
      easing: ease,
    },
  );

  const taps = targets
    ? [
        { at: TAP_STATUS, ...center(targets.status) },
        { at: TAP_HOMEWORK, ...center(targets.homework) },
        { at: TAP_SCORE, ...center(targets.score) },
        { at: TAP_NOTE, ...center(targets.note) },
      ]
    : [];
  const leg = taps.findIndex((tap) => frame < tap.at);
  const to = taps[leg === -1 ? taps.length - 1 : leg];
  const from =
    leg > 0 ? taps[leg - 1] : leg === 0 ? { x: to.x + 80, y: to.y + 160 } : to;
  const move = to
    ? interpolate(frame, [to.at - 16, to.at - 2], [0, 1], {
        ...clamp,
        easing: ease,
      })
    : 0;
  const finger = to
    ? { x: from.x + (to.x - from.x) * move, y: from.y + (to.y - from.y) * move }
    : null;
  const lastTap = [...taps].reverse().find((tap) => frame >= tap.at);
  const sinceTap = lastTap ? frame - lastTap.at : 99;
  const fingerOpacity = interpolate(
    frame,
    [10, 20, TYPE_START + 30, TYPE_START + 40],
    [0, 1, 1, 0],
    clamp,
  );
  const toScreen = (p: { x: number; y: number }) => ({
    left: PHONE_X + BEZEL + p.x * S,
    top: PHONE_Y + BEZEL + (p.y - scroll) * S,
  });
  const ring = interpolate(frame, [HIGHLIGHT, HIGHLIGHT + 12], [0, 1], {
    ...clamp,
    easing: ease,
  });

  return (
    <>
      <Sfx role="click-soft" at={TAP_STATUS} volume={0.8} />
      <Sfx role="click-soft" at={TAP_HOMEWORK} volume={0.8} />
      <Sfx role="click-soft" at={TAP_SCORE} volume={0.8} />
      <Sfx role="click-soft" at={TAP_NOTE} volume={0.8} />
      {typingCues(TYPE_START, TYPE_START + Math.ceil(STUDENT_NOTE.length / 1.5), STUDENT_NOTE.length).map((f) => (
        <Sfx key={f} role="key" at={f} volume={0.6} />
      ))}
      <Sfx role="pop" at={HIGHLIGHT} volume={0.7} />
      <Caption from={0} to={SCROLL_BACK} fontSize={92} inset={80}>
        Điểm danh
        <br />
        <span style={{ color: colors.emerald }}>1 chạm</span>
      </Caption>
      <Caption from={SCROLL_BACK + 4} to={10_000} fontSize={92} inset={80}>
        Có phép thì
        <br />
        <span style={{ color: "#d97706" }}>không tính tiền</span>
      </Caption>

      <PhoneFrame
        enter={phoneIn}
        overlay={
          targets ? (
          <div
            style={{
              position: "absolute",
              left: BEZEL + (targets.excused.x - 4) * S,
              top: BEZEL + (targets.excused.y - 4 - scroll) * S,
              width: (targets.excused.w + 8) * S,
              height: (targets.excused.h + 8) * S,
              borderRadius: 28,
              border: "8px solid #f59e0b",
              boxShadow: "0 0 0 14px rgba(245,158,11,0.18)",
              opacity: ring,
              scale: String(1.15 - ring * 0.15),
            }}
          />
        ) : null
        }
      >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: PHONE_W,
              scale: String(S),
              transformOrigin: "top left",
            }}
          >
            <PhoneViewport width={PHONE_W} height={VIEWPORT_H}>
              <AppProviders client={client}>
                <div ref={contentRef} className="bg-muted/40 p-3" style={{ position: "absolute", left: 0, right: 0, top: -scroll }}>
                  <LessonAttendanceCard lesson={lesson} />
                </div>
              </AppProviders>
            </PhoneViewport>
          </div>
      </PhoneFrame>

      {finger ? (
        <Finger {...toScreen(finger)} opacity={fingerOpacity * phoneIn} since={sinceTap} />
      ) : null}
    </>
  );
};

export const AttendanceScene = Interactive.create({
  Component: AttendanceSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
