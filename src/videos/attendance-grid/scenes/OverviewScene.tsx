import { useEffect, useRef, useState } from "react";
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
import { messages } from "@/shared/i18n/messages.generated";
import { AppProviders } from "../../../shared/app/AppProviders";
import { Sfx } from "../../../shared/audio/sfx";
import { clamp, ease } from "../../../shared/motion";
import { colors, fontFamily } from "../../../shared/theme";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { OPEN_CLASS_NAME } from "../data";
import { hideDays, useGridApp } from "./shared";

const { vi } = messages;

// the grid as a floating card, as the intro shows it: 920 px of layout, days 15-30 dropped
const UI_W = 920;
const UI_X = 40;
const UI_Y = 430;
const S = (1080 - 2 * UI_X) / UI_W;
// where a beat's focus lands on the frame
const TARGET = { x: 540, y: 1150 };

// beats: the camera moves in over [move, move + 24], the rings pop after it, everything clears by `end`
const STATUS = { move: 96, ring: 124, end: 166 };
const MARKS = { move: 172, ring: 200, ring2: 214, end: 258 };
const COUNT = { move: 264, ring: 292, end: 334 };
const EXPORT = { move: 340, ring: 368, end: 412 };
const EXIT = [418, 446] as const;
export const OVERVIEW_LENGTH = 452;

type Box = { x: number; y: number; w: number; h: number };
type Targets = {
  status: Box;
  excused: Box;
  absent: Box;
  count: Box;
  excel: Box;
};

const dayOf = (th: Element) =>
  Number(th.textContent?.trim().match(/^(?:T\d|CN)(\d{1,2})$/)?.[1] ?? NaN);

// every target in the card's own layout px
const findTargets = (root: HTMLElement): Targets | null => {
  const r = root.getBoundingClientRect();
  const k = r.width / UI_W;
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
  const heads = [...root.querySelectorAll<HTMLElement>("thead th")];
  const rows = [...root.querySelectorAll<HTMLTableRowElement>("tbody tr")];
  const classRow = (name: string) =>
    rows.find((tr) => tr.cells[0]?.getAttribute("title") === name);
  const studentRow = (name: string) =>
    rows.filter((tr) => tr.cells[0]?.textContent?.includes(name)).at(-1);
  // body cells don't line up with head cells by index (sticky + summary columns), so match by x
  const cellOn = (row: HTMLTableRowElement | undefined, day: number) => {
    const head = heads.find((th) => dayOf(th) === day);
    if (!row || !head) return undefined;
    const h = head.getBoundingClientRect();
    const cx = h.left + h.width / 2;
    return [...row.cells].find((td) => {
      const b = td.getBoundingClientRect();
      return b.left <= cx && cx < b.right;
    });
  };
  const groupRows = rows.filter((tr) =>
    [
      "Nguyễn Hoàng Anh",
      "Trần Quỳnh Chi",
      "Lê Đức Thắng",
      "Phạm Ngọc Diệp",
    ].some((n) => tr.cells[0]?.textContent?.includes(n)),
  );
  const first = box(groupRows[0]?.cells[groupRows[0].cells.length - 1]);
  const last = box(groupRows.at(-1)?.cells[groupRows.at(-1)!.cells.length - 1]);
  const t = {
    status: box(cellOn(classRow(OPEN_CLASS_NAME), 11)),
    excused: box(cellOn(studentRow("Gia Hân"), 7)),
    absent: box(cellOn(studentRow("Em Bảo"), 3)),
    count: first && last ? { ...first, h: last.y + last.h - first.y } : null,
    excel: box(
      root.querySelector(
        `button[aria-label="${vi.attendance.grid.export.button}"]`,
      ),
    ),
  };
  return Object.values(t).every(Boolean) ? (t as Targets) : null;
};

// the table scrolls itself to today on mount; the capture paints a scroll box at its origin, so keep the DOM there too
const unscroll = (root: HTMLElement) =>
  root.querySelectorAll<HTMLElement>("*").forEach((el) => {
    if (el.scrollLeft) el.scrollLeft = 0;
    if (el.scrollTop) el.scrollTop = 0;
  });

type Shot = { z: number; x: number; y: number };
// the whole card, as laid: the focus that maps onto TARGET at zoom 1
const WIDE: Shot = { z: 1, x: (TARGET.x - UI_X) / S, y: (TARGET.y - UI_Y) / S };
const centre = (b: Box) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });

const Ring = ({
  box,
  at,
  end,
  label,
  color,
  toScreen,
  above = true,
}: {
  readonly box: Box;
  readonly at: number;
  readonly end: number;
  readonly label: string;
  readonly color: string;
  readonly toScreen: (x: number, y: number) => { left: number; top: number };
  readonly above?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 12 } });
  const out = interpolate(frame, [end - 8, end], [1, 0], clamp);
  const tl = toScreen(box.x, box.y);
  const br = toScreen(box.x + box.w, box.y + box.h);
  const w = br.left - tl.left;
  const h = br.top - tl.top;
  const hang =
    tl.left + w / 2 > 640
      ? { right: 0 }
      : tl.left + w / 2 < 440
        ? { left: 0 }
        : { left: "50%", translate: "-50% 0" };
  if (frame < at || frame > end) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: tl.left - 10,
        top: tl.top - 10,
        width: w + 20,
        height: h + 20,
        opacity: p * out,
        scale: String(1.3 - p * 0.3),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 18,
          border: `7px solid ${color}`,
          boxShadow: `0 0 0 12px ${color}33`,
        }}
      />
      <div
        style={{
          position: "absolute",
          ...hang,
          ...(above
            ? { bottom: "100%", marginBottom: 18 }
            : { top: "100%", marginTop: 18 }),
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

const OverviewSceneInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const client = useGridApp(0);
  const uiRef = useRef<HTMLDivElement>(null);
  const [t, setT] = useState<Targets | null>(null);

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

  const shots: [number, Shot][] = t
    ? (() => {
        const status = centre(t.status);
        const marks = {
          x: (t.excused.x + t.excused.w) / 2,
          y: (t.excused.y + t.absent.y + t.absent.h) / 2,
        };
        const count = centre(t.count);
        const excel = centre(t.excel);
        // keep the shot inside the card: half the frame's width, in layout px at that zoom
        const fit = (z: number, x: number) => Math.min(Math.max(x, 540 / (z * S)), UI_W - 540 / (z * S));
        const statusShot = { z: 1.25, x: fit(1.25, 0), y: status.y };
        const marksShot = { z: 1.4, x: fit(1.4, marks.x), y: marks.y };
        const countShot = { z: 1.5, x: fit(1.5, count.x), y: count.y };
        const excelShot = { z: 1.6, x: fit(1.6, excel.x), y: excel.y + 140 };
        return [
          [STATUS.move, WIDE],
          [STATUS.move + 24, statusShot],
          [MARKS.move, statusShot],
          [MARKS.move + 24, marksShot],
          [COUNT.move, marksShot],
          [COUNT.move + 24, countShot],
          [EXPORT.move, countShot],
          [EXPORT.move + 24, excelShot],
          [EXIT[0], excelShot],
          [EXIT[0] + 20, WIDE],
        ];
      })()
    : [[0, WIDE]];
  const at = (key: keyof Shot) =>
    shots.length === 1
      ? shots[0][1][key]
      : interpolate(
          frame,
          shots.map(([f]) => f),
          shots.map(([, s]) => s[key]),
          { ...clamp, easing: ease },
        );
  const shot = { z: at("z"), x: at("x"), y: at("y") };
  const tx = TARGET.x - shot.z * (UI_X + shot.x * S);
  const ty = TARGET.y - shot.z * (UI_Y + shot.y * S);
  const toScreen = (x: number, y: number) => ({
    left: tx + shot.z * (UI_X + x * S),
    top: ty + shot.z * (UI_Y + y * S),
  });

  const appear = spring({ frame, fps, config: { damping: 200 } });
  const exit = interpolate(
    frame,
    [EXIT[1] - 6, OVERVIEW_LENGTH],
    [1, 0],
    clamp,
  );
  const shrink = interpolate(frame, [...EXIT], [1, 0.92], {
    ...clamp,
    easing: ease,
  });

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.5} />
      <Sfx role="impact-soft" at={12} volume={0.8} />
      {[STATUS, MARKS, COUNT, EXPORT].map((b) => (
        <Sfx key={b.move} role="whoosh" at={b.move + 4} volume={0.35} />
      ))}
      <Sfx role="pop" at={STATUS.ring} volume={0.7} />
      <Sfx role="pop" at={MARKS.ring} volume={0.7} />
      <Sfx role="pop" at={MARKS.ring2} volume={0.7} />
      <Sfx role="pop" at={COUNT.ring} volume={0.7} />
      <Sfx role="pop" at={EXPORT.ring} volume={0.7} />
      <Sfx role="whoosh" at={EXIT[0] + 6} volume={0.5} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "clip",
          opacity: exit,
          scale: String(shrink),
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transformOrigin: "0 0",
            translate: `${tx}px ${ty}px`,
            scale: String(shot.z),
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
              opacity: appear,
              translate: `0px ${(1 - appear) * 60}px`,
              overflow: "clip",
              borderRadius: 16,
              filter: "drop-shadow(0 30px 60px rgba(2,6,24,0.16))",
            }}
          >
            <AppProviders client={client}>
              <div ref={uiRef} data-grid-crop className="bg-card p-3">
                <style>{hideDays("[data-grid-crop]", 15, 30)}</style>
                <MonthlyAttendanceGrid />
              </div>
            </AppProviders>
          </div>
        </div>
        {t ? (
          <>
            <Ring
              box={t.status}
              at={STATUS.ring}
              end={STATUS.end}
              label="11/11 · Chưa hoàn thành"
              color="#d97706"
              toScreen={toScreen}
            />
            <Ring
              box={t.excused}
              at={MARKS.ring}
              end={MARKS.end}
              label="7/11 · Có phép"
              color="#d97706"
              toScreen={toScreen}
              above={false}
            />
            <Ring
              box={t.absent}
              at={MARKS.ring2}
              end={MARKS.end}
              label="3/11 · Vắng"
              color="#e11d48"
              toScreen={toScreen}
            />
            <Ring
              box={t.count}
              at={COUNT.ring}
              end={COUNT.end}
              label="Số buổi tính phí"
              color="#059669"
              toScreen={toScreen}
            />
            <Ring
              box={t.excel}
              at={EXPORT.ring}
              end={EXPORT.end}
              label="Xuất Excel"
              color="#059669"
              toScreen={toScreen}
              above={false}
            />
          </>
        ) : null}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 400,
          background: "linear-gradient(#f1f5f9 80%, rgba(241,245,249,0))",
        }}
      />
      <StepCaption eyebrow="Cả tháng, mọi lớp" from={-20} to={STATUS.move}>
        <span style={{ color: colors.emerald }}>trên một bảng</span>
      </StepCaption>
      <StepCaption
        eyebrow="Hàng đầu mỗi lớp"
        from={STATUS.move}
        to={MARKS.move}
      >
        <span style={{ color: colors.emerald }}>buổi đã chốt chưa</span>
      </StepCaption>
      <StepCaption eyebrow="Ai nghỉ, ai vắng" from={MARKS.move} to={COUNT.move}>
        <span style={{ color: colors.emerald }}>nhìn là thấy</span>
      </StepCaption>
      <StepCaption eyebrow="Cột Buổi" from={COUNT.move} to={EXPORT.move}>
        <span style={{ color: colors.emerald }}>số buổi tính phí</span>
      </StepCaption>
      <StepCaption eyebrow="Cần gửi trung tâm?" from={EXPORT.move}>
        <span style={{ color: colors.emerald }}>Xuất Excel</span>
      </StepCaption>
    </>
  );
};

export const OverviewScene = Interactive.create({
  Component: OverviewSceneInner,
  layout: "absolute-fill",
  schema: { ...Interactive.backgroundSchema },
});
