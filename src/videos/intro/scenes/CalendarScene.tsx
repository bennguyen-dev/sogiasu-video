import type React from "react";
import { useEffect, useRef, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import { continueRender, delayRender, Easing, Interactive, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CalendarView } from "@/features/calendar/components/CalendarView";
import { AppProviders } from "../../../shared/app/AppProviders";
import { DEMO_NOW, useDemoNow } from "../../../shared/app/frozen-clock";
import { calendarKey, calendarLessons } from "../../../shared/demo/calendar-data";
import { rawRect } from "../../../shared/app/fc-measure-patch";
import { colors, fontFamily } from "../../../shared/theme";
import { Sfx } from "../../../shared/audio/sfx";

const UI_W = 780;
const UI_X = 40;
const UI_Y = 470;
const S = (1080 - 2 * UI_X) / UI_W;

const REVEAL = [8, 44] as const;
const ZOOM = [78, 108] as const;
const TAP = 124;
const ZOOM_SCALE = 2.3;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);

type Box = { x: number; y: number; w: number; h: number };

// Monday's Gia Hân lesson: the next one up at the pinned "now", and the lesson the attendance scene opens
const findTarget = (root: HTMLElement): Box | null => {
  const r = rawRect(root);
  const k = r.width / UI_W;
  const events = [...root.querySelectorAll<HTMLElement>(".fc-timegrid-event-harness")]
    .filter((el) => el.textContent?.includes("Gia Hân"))
    .map((el) => rawRect(el))
    .sort((a, b) => a.left - b.left);
  const b = events[0];
  return b ? { x: (b.left - r.left) / k, y: (b.top - r.top) / k, w: b.width / k, h: b.height / k } : null;
};

const Caption = ({ children, style }: { readonly children: React.ReactNode; readonly style?: React.CSSProperties }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });

  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        textAlign: "center",
        fontFamily,
        opacity: enter,
        translate: `0px ${(1 - enter) * 40}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const CalendarSceneInner = () => {
  useDemoNow(DEMO_NOW);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const uiRef = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState<Box | null>(null);
  const [client] = useState(() => {
    const c = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });
    c.setQueryData(calendarKey, { success: true, data: calendarLessons() });
    return c;
  });

  // FullCalendar lays events out over several of its own commits; hold the frame until the target stops moving
  useEffect(() => {
    const handle = delayRender("measure calendar target");
    let last = "";
    let raf = 0;
    let tries = 0;
    const tick = () => {
      const next = uiRef.current ? findTarget(uiRef.current) : null;
      const key = JSON.stringify(next);
      if ((next && key === last) || ++tries > 90) {
        setTarget(next);
        continueRender(handle);
        return;
      }
      last = key;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const reveal = interpolate(frame, [...REVEAL], [0, 100], { ...clamp, easing: Easing.bezier(0.33, 1, 0.68, 1) });
  const zoom = interpolate(frame, [...ZOOM], [0, 1], { ...clamp, easing: ease });
  const scale = 1 + (ZOOM_SCALE - 1) * zoom;
  // keep the target event at the frame centre while zooming
  const focus = target ? { x: UI_X + (target.x + target.w / 2) * S, y: UI_Y + (target.y + target.h / 2) * S } : { x: 540, y: 960 };
  const shift = { x: (540 - focus.x) * zoom, y: (1080 - focus.y) * zoom };
  const since = frame - TAP;
  const fingerIn = interpolate(frame, [ZOOM[1] - 4, TAP - 4], [0, 1], { ...clamp, easing: ease });
  const captionOut = interpolate(frame, [ZOOM[0], ZOOM[0] + 12], [1, 0], clamp);
  const tapCaption = spring({ frame: frame - TAP - 4, fps, config: { damping: 200 } });

  return (
    <>
      <Sfx role="whoosh" at={REVEAL[0] + 4} volume={0.6} />
      <Sfx role="whoosh" at={(ZOOM[0] + ZOOM[1]) / 2} volume={0.8} />
      <Sfx role="click-soft" at={TAP} volume={0.8} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          translate: `${shift.x}px ${shift.y}px`,
          scale: String(scale),
          transformOrigin: `${focus.x}px ${focus.y}px`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: UI_X,
            top: UI_Y,
            width: UI_W,
            scale: String(S),
            transformOrigin: "top left",
            clipPath: `inset(0 ${100 - reveal}% 0 0 round 16px)`,
            filter: "drop-shadow(0 30px 60px rgba(2,6,24,0.16))",
          }}
        >
          <AppProviders client={client}>
            <div ref={uiRef} className="bg-muted/40 p-3">
              <CalendarView />
            </div>
          </AppProviders>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 560,
          background: "linear-gradient(#f1f5f9 72%, rgba(241,245,249,0))",
          opacity: zoom,
        }}
      />
      <Caption style={{ top: 150, opacity: captionOut }}>
        <div style={{ fontSize: 92, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.08, color: colors.ink }}>
          Lịch dạy
          <br />
          <span style={{ color: colors.sky }}>cả tuần</span>
        </div>
        <div style={{ marginTop: 22, fontSize: 44, fontWeight: 600, color: colors.muted }}>Đồng bộ Google Calendar + Meet</div>
      </Caption>

      <div
        style={{
          position: "absolute",
          top: 170,
          left: 80,
          right: 80,
          textAlign: "center",
          fontFamily,
          fontSize: 80,
          fontWeight: 800,
          letterSpacing: "-0.035em",
          lineHeight: 1.1,
          color: colors.ink,
          opacity: tapCaption,
          translate: `0px ${(1 - tapCaption) * 40}px`,
        }}
      >
        Sắp tới giờ dạy?
        <br />
        <span style={{ color: colors.emerald }}>Chạm vào buổi học</span>
      </div>

      <div style={{ position: "absolute", left: 540, top: 1080 + (1 - fingerIn) * 260, opacity: fingerIn }}>
        <div
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            left: -110,
            top: -110,
            borderRadius: "50%",
            border: "6px solid rgba(5,150,105,0.65)",
            opacity: since < 0 ? 0 : interpolate(since, [0, 18], [1, 0], clamp),
            scale: String(interpolate(since, [0, 18], [0.3, 1.15], clamp)),
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 104,
            height: 104,
            left: -52,
            top: -52,
            borderRadius: "50%",
            background: "rgba(2,6,24,0.28)",
            border: "4px solid rgba(255,255,255,0.9)",
            boxShadow: "0 10px 30px rgba(2,6,24,0.25)",
            scale: String(interpolate(since, [0, 4, 10], [0.8, 0.8, 1], clamp)),
          }}
        />
      </div>
    </>
  );
};

export const CalendarScene = Interactive.create({
  Component: CalendarSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
