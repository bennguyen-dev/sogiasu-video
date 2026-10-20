import { useEffect, useRef, useState } from "react";
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
import MonthlyAttendanceGrid from "@/features/attendance/components/MonthlyAttendanceGrid";
import { AppProviders } from "../../../shared/app/AppProviders";
import { useDemoNow } from "../../../shared/app/frozen-clock";
import { SEPT_END } from "../../../shared/demo/september-data";
import { Sfx } from "../../../shared/audio/sfx";
import { clamp, ease } from "../../../shared/motion";
import { colors, fontFamily } from "../../../shared/theme";

const UI_W = 920;
const UI_X = 40;
const UI_Y = 470;
const S = (1080 - 2 * UI_X) / UI_W;

const NOTE_IN = 18;
const ZOOM = [40, 66] as const;
const MARK_EXCUSED = 74;
const MARK_ABSENT = 90;
const SOLVED = 108;



type Box = { x: number; y: number; w: number; h: number };
type Targets = { excused: Box; absent: Box };

// Gia Hân's cells on 19/09 and 28/09, in the page's layout px
const findTargets = (root: HTMLElement): Targets | null => {
  const r = root.getBoundingClientRect();
  const k = r.width / UI_W;
  const box = (el: Element | undefined): Box | null => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: (b.left - r.left) / k, y: (b.top - r.top) / k, w: b.width / k, h: b.height / k };
  };
  const heads = [...root.querySelectorAll<HTMLElement>("thead th")];
  const row = [...root.querySelectorAll("tbody tr")]
    // the class header row ("Gia Hân – Ôn thi vào 10") also matches; the student row is the last one
    .filter((tr) => tr.textContent?.includes("Gia Hân"))
    .at(-1);
  if (!row) return null;
  // body cells don't line up with head cells by index (sticky + summary columns), so match by x
  const cellOn = (day: number) => {
    const head = heads.find((th) => dayOf(th) === day);
    if (!head) return undefined;
    const h = head.getBoundingClientRect();
    const cx = h.left + h.width / 2;
    return [...row.children].find((td) => {
      const b = td.getBoundingClientRect();
      return b.left <= cx && cx < b.right;
    });
  };
  const excused = box(cellOn(19));
  const absent = box(cellOn(28));
  return excused && absent ? { excused, absent } : null;
};

// a day head reads "T7" + "19" (or "CN" + "20") as one string
const dayOf = (th: Element) => Number(th.textContent?.trim().match(/^(?:T\d|CN)(\d{1,2})$/)?.[1] ?? NaN);

// stands in for scrolling the table to the second half of the month: Remotion's capture doesn't
// paint a scrolled overflow box, so the first 16 day columns are hidden instead
const CROP_CSS = `
[data-grid-crop] thead tr > :nth-child(n+2):nth-child(-n+17),
[data-grid-crop] tbody tr > :nth-child(n+2):nth-child(-n+17) { display: none; }
`;

// the capture paints a scroll box at its origin regardless of scrollLeft, so keep the DOM agreeing with it
const unscroll = (root: HTMLElement) =>
  root.querySelectorAll<HTMLElement>("*").forEach((el) => {
    if (el.scrollLeft) el.scrollLeft = 0;
    if (el.scrollTop) el.scrollTop = 0;
  });

const Ring = ({ box, at, label, color, toScreen }: { readonly box: Box; readonly at: number; readonly label: string; readonly color: string; readonly toScreen: (x: number, y: number) => { left: number; top: number } }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 12 } });
  const tl = toScreen(box.x, box.y);
  const br = toScreen(box.x + box.w, box.y + box.h);
  const w = br.left - tl.left;
  const h = br.top - tl.top;

  return (
    <div style={{ position: "absolute", left: tl.left - 10, top: tl.top - 10, width: w + 20, height: h + 20, opacity: p, scale: String(1.3 - p * 0.3) }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 18, border: `7px solid ${color}`, boxShadow: `0 0 0 12px ${color}33` }} />
      <div
        style={{
          position: "absolute",
          // near the right edge the pill hangs leftwards so it stays in frame
          ...(tl.left > 700 ? { right: 0 } : { left: "50%", translate: "-50% -18px" }),
          bottom: "100%",
          marginBottom: tl.left > 700 ? 18 : 0,
          whiteSpace: "nowrap",
          padding: "10px 22px",
          borderRadius: 999,
          background: color,
          color: "white",
          fontFamily,
          fontSize: 38,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
    </div>
  );
};

const GridSceneInner = () => {
  useDemoNow(SEPT_END);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const uiRef = useRef<HTMLDivElement>(null);
  const [t, setT] = useState<Targets | null>(null);
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } }));

  useEffect(() => {
    const handle = delayRender("measure grid targets");
    let last = "";
    let tries = 0;
    let raf = 0;
    const tick = () => {
      if (uiRef.current) unscroll(uiRef.current);
      const next = uiRef.current ? findTargets(uiRef.current) : null;
      const key = JSON.stringify(next);
      if ((next && key === last) || ++tries > 150) {
        setT(next);
        continueRender(handle);
        return;
      }
      last = key;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const appear = spring({ frame, fps, config: { damping: 200 } });
  const zoom = interpolate(frame, [...ZOOM], [0, 1], { ...clamp, easing: ease });
  // fit the whole row, from the name column to 28/09, across the frame
  const rowEnd = t ? t.absent.x + t.absent.w : UI_W;
  const zoomTo = Math.min(1.6, 1000 / (rowEnd * S));
  const scale = 1 + (zoomTo - 1) * zoom;
  const mid = t ? { x: rowEnd / 2, y: t.excused.y + t.excused.h / 2 } : { x: UI_W / 2, y: 300 };
  const focus = { x: UI_X + mid.x * S, y: UI_Y + mid.y * S };
  const shift = { x: (540 - focus.x) * zoom, y: (1150 - focus.y) * zoom };
  const toScreen = (x: number, y: number) => {
    const px = UI_X + x * S;
    const py = UI_Y + y * S;
    return { left: focus.x + (px - focus.x) * scale + shift.x, top: focus.y + (py - focus.y) * scale + shift.y };
  };
  const note = spring({ frame: frame - NOTE_IN, fps, config: { damping: 14 } });
  const solved = interpolate(frame, [SOLVED, SOLVED + 10], [0, 1], clamp);

  return (
    <>
      <Sfx role="drop" at={NOTE_IN} volume={0.7} />
      <Sfx role="whoosh" at={(ZOOM[0] + ZOOM[1]) / 2} volume={0.8} />
      <Sfx role="pop" at={MARK_EXCUSED} volume={0.7} />
      <Sfx role="pop" at={MARK_ABSENT} volume={0.7} />
      <Sfx role="confirm" at={SOLVED} />
      <div style={{ position: "absolute", inset: 0, overflow: "clip" }}>
        <div style={{ position: "absolute", inset: 0, translate: `${shift.x}px ${shift.y}px`, scale: String(scale), transformOrigin: `${focus.x}px ${focus.y}px` }}>
          <div
            style={{
              position: "absolute",
              left: UI_X,
              top: UI_Y,
              width: UI_W,
              scale: String(S),
              transformOrigin: "top left",
              opacity: appear,
              translate: `0px ${(1 - appear) * 60}px`,
              overflow: "clip",
              borderRadius: 16,
              filter: "drop-shadow(0 30px 60px rgba(2,6,24,0.16))",
            }}
          >
            <AppProviders client={client}>
              <div ref={uiRef} data-grid-crop className="bg-muted/40 p-3">
                <style>{CROP_CSS}</style>
                <MonthlyAttendanceGrid />
              </div>
            </AppProviders>
          </div>
        </div>
      </div>

      {t ? (
        <>
          <Ring box={t.excused} at={MARK_EXCUSED} label="19/9 · Có phép" color="#d97706" toScreen={toScreen} />
          <Ring box={t.absent} at={MARK_ABSENT} label="28/9 · Vắng" color="#e11d48" toScreen={toScreen} />
        </>
      ) : null}

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 470,
          background: "linear-gradient(#f1f5f9 78%, rgba(241,245,249,0))",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 70,
          right: 70,
          textAlign: "center",
          fontFamily,
          fontSize: 80,
          fontWeight: 800,
          letterSpacing: "-0.035em",
          lineHeight: 1.1,
          color: colors.ink,
          opacity: appear,
        }}
      >
        Cả tháng ai học buổi nào,
        <br />
        <span style={{ color: colors.emerald }}>một bảng là thấy</span>
      </div>

      <div
        style={{
          position: "absolute",
          right: 70,
          bottom: 200,
          width: 420,
          padding: "28px 32px",
          borderRadius: 10,
          background: colors.note,
          borderBottom: `6px solid ${colors.noteEdge}`,
          boxShadow: "0 16px 40px rgba(120,53,15,0.18)",
          fontFamily,
          fontSize: 42,
          lineHeight: 1.3,
          fontWeight: 600,
          color: "#78350f",
          whiteSpace: "pre-line",
          opacity: interpolate(note, [0, 0.3], [0, 1], clamp),
          scale: String(note),
          rotate: `${6 - solved * 4}deg`,
        }}
      >
        <span style={{ textDecoration: solved > 0.5 ? "line-through" : "none", textDecorationThickness: 5 }}>{"Gia Hân nghỉ\n19/9 hay 28/9?"}</span>
        <div
          style={{
            position: "absolute",
            right: -26,
            top: -26,
            width: 84,
            height: 84,
            borderRadius: "50%",
            background: colors.emerald,
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 50,
            fontWeight: 800,
            scale: String(solved),
          }}
        >
          ✓
        </div>
      </div>
    </>
  );
};

export const GridScene = Interactive.create({
  Component: GridSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
