import { useLayoutEffect, useRef, useState } from "react";
import { Interactive, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import LessonReportExport from "@/features/report/components/LessonReportExport";
import { messages } from "@/shared/i18n/messages.generated";
import { useMockApi } from "../../../shared/app/AppProviders";
import { DEMO_NOW, useDemoNow } from "../../../shared/app/frozen-clock";
import { Sfx } from "../../../shared/audio/sfx";
import { Bubble, ChatHeader } from "../../../shared/components/ZaloChat";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { clamp, ease } from "../../../shared/motion";
import { colors, fontFamily } from "../../../shared/theme";
import {
  AppScreen,
  byText,
  center,
  Explain,
  pageBox,
  SCREEN_H,
  SuccessToast,
  TapFinger,
  SCREEN_W,
  useMeasure,
} from "../../../shared/tutorial/AppScreen";
import { calendarApi } from "../../attendance/data";
import { DetailPage } from "../../attendance/DetailPage";
import { FINAL_STATE, useDetailClient, useRowForms, useSeed } from "../../attendance/scenes/DetailScene";
import { exportData, PARENTS } from "../data";

const { vi } = messages;
export const TAP_EXPORT = 92;

// the 01/10 lesson as tutorial 2 left it, on Minh Anh's row: the "Xuất ảnh" button turns the lesson into one picture
const ExportSceneInner = () => {
  useDemoNow(DEMO_NOW);
  useMockApi(calendarApi(true));
  const frame = useCurrentFrame();
  const pageRef = useRef<HTMLDivElement>(null);
  const client = useDetailClient(FINAL_STATE);
  useSeed(client, FINAL_STATE);
  const forms = useRowForms(FINAL_STATE);
  const t = useMeasure(() => {
    const page = pageRef.current;
    const row = page?.querySelector("[data-row='0']");
    const button = row ? byText(row, "button", vi.report.export.action) : null;
    return page && row && button ? { row: pageBox(page, row)!, button: pageBox(page, button)! } : null;
  });
  const scroll = t ? t.row.y - 10 : 0;
  const toastIn = interpolate(frame, [TAP_EXPORT + 4, TAP_EXPORT + 12], [0, 1], { ...clamp, easing: ease });

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="tick" at={14} volume={0.6} />
      <Sfx role="click-firm" at={TAP_EXPORT} volume={0.8} />
      <Sfx role="pop" at={TAP_EXPORT + 6} volume={0.6} />
      <StepCaption eyebrow="Gửi báo cáo sau mỗi buổi?" from={0}>
        <span style={{ color: colors.emerald }}>Xuất ảnh, gửi Zalo</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/lessons/new-class-0"
        scroll={scroll}
        pageRef={pageRef}
        fixed={frame >= TAP_EXPORT + 4 ? <SuccessToast enter={toastIn}>{vi.report.export.downloaded}</SuccessToast> : null}
        overlay={
          <Explain frame={frame} from={12} to={TAP_EXPORT - 6} box={t?.button} scroll={scroll}>
            Xuất ảnh: gói nhận xét, điểm, bài tập của buổi thành 1 tấm ảnh
          </Explain>
        }
      >
        <DetailPage state={FINAL_STATE} forms={forms} />
      </AppScreen>
      {t ? <TapFinger frame={frame} taps={[{ at: TAP_EXPORT, ...center({ ...t.button, y: t.button.y - scroll }) }]} hideAt={TAP_EXPORT + 12} /> : null}
    </>
  );
};

const THUMB_W = 250;
// a chat photo keeps the picture's own proportions; only a very tall one is capped (and cut at the bottom)
const THUMB_MAX_H = 420;
const CARD_W = 650;
const K = THUMB_W / CARD_W;

// the image LessonReportExport downloads: its own off-screen card, pulled on screen at thumbnail size
const ExportThumb = ({ data, at }: { readonly data: ReturnType<typeof exportData>; readonly at: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = useState(0);
  useLayoutEffect(() => {
    const h = ref.current?.querySelector<HTMLElement>("div[aria-hidden] > div")?.offsetHeight ?? 0;
    if (h !== cardH) setCardH(h);
  });

  return (
    <Bubble mine bare at={at}>
      <div style={{ position: "relative", width: THUMB_W, height: Math.min(cardH * K, THUMB_MAX_H), overflow: "hidden", borderRadius: 12, boxShadow: "0 1px 3px rgba(2,6,24,0.14)" }}>
        <div ref={ref} className="export-thumb" style={{ position: "absolute", left: 0, top: 0, width: CARD_W, scale: String(K), transformOrigin: "top left", whiteSpace: "normal", lineHeight: 1.5 }}>
          <LessonReportExport data={data} />
        </div>
      </div>
    </Bubble>
  );
};

const THUMB_CSS = `
.export-thumb > button { display: none !important; }
.export-thumb > div[aria-hidden] { position: static !important; left: auto !important; }
.export-thumb img[src="/logo.svg"] { content: url("${staticFile("logo.svg")}"); }
`;

const TIME = ({ children }: { readonly children: string }) => (
  <div style={{ alignSelf: "center", fontSize: 11, color: colors.muted, background: "rgba(255,255,255,0.7)", borderRadius: 999, padding: "2px 10px" }}>{children}</div>
);

const Chat = ({
  parent,
  day,
  data,
  at,
  reply,
}: {
  readonly parent: string;
  readonly day: string;
  readonly data: ReturnType<typeof exportData>;
  readonly at: number;
  readonly reply?: number;
}) => (
  <div style={{ position: "absolute", inset: 0, background: "#e2e8f0", display: "flex", flexDirection: "column", fontFamily }}>
    <ChatHeader name={parent} initials={parent.split(" ").map((w) => w[0]).join("").slice(0, 2)} />
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "16px 12px" }}>
      <TIME>{day}</TIME>
      <ExportThumb data={data} at={at} />
      <Bubble mine at={at + 12}>
        Chị xem nhận xét buổi hôm nay của {data.studentName} nha
      </Bubble>
      {reply !== undefined ? <Bubble at={reply}>Dạ cảm ơn cô</Bubble> : null}
    </div>
  </div>
);

const REPLY = 58;
export const PILE_AT = 100;
const PILE_EVERY = 22;
const PILE = [
  { parent: PARENTS.gh, day: "19:45 · Thứ Năm 01/10", data: exportData("gh") },
  { parent: PARENTS.ma, day: "19:40 · Thứ Ba 06/10", data: exportData("ma", "2026-10-06") },
  { parent: PARENTS.gh, day: "19:42 · Thứ Ba 06/10", data: exportData("gh", "2026-10-06") },
  { parent: PARENTS.ma, day: "19:38 · Thứ Năm 08/10", data: exportData("ma", "2026-10-08") },
];

// the photo lands in Zalo; then the same chat again for the next student, the next lesson, the next...
const ZaloSceneInner = () => {
  useDemoNow(DEMO_NOW);
  useMockApi(calendarApi(true));
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pageRef = useRef<HTMLDivElement>(null);
  const client = useDetailClient(FINAL_STATE);

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="pop" at={8} volume={0.7} />
      <Sfx role="pop" at={20} volume={0.6} />
      <Sfx role="pop" at={REPLY} volume={0.6} />
      {PILE.map((_, i) => (
        <Sfx key={i} role="drop" at={PILE_AT + i * PILE_EVERY} volume={0.55} />
      ))}
      <StepCaption eyebrow="Gửi báo cáo sau mỗi buổi?" from={0} to={PILE_AT}>
        <span style={{ color: colors.emerald }}>Xuất ảnh, gửi Zalo</span>
      </StepCaption>
      <StepCaption eyebrow="Buổi nào, em nào" from={PILE_AT}>
        <span style={{ color: "#d97706" }}>cũng phải gửi lại</span>
      </StepCaption>
      <AppScreen client={client} pathname="/dashboard/lessons/new-class-0" scroll={0} pageRef={pageRef}>
        <style>{THUMB_CSS}</style>
        <div style={{ position: "relative", width: SCREEN_W, height: SCREEN_H, overflow: "hidden", background: "#cbd5e1" }}>
          <Chat parent={PARENTS.ma} day="19:35 · Thứ Năm 01/10" data={exportData("ma")} at={8} reply={REPLY} />
          {PILE.map((c, i) => {
            const p = spring({ frame: frame - (PILE_AT + i * PILE_EVERY), fps, config: { damping: 16, mass: 0.6 } });
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  translate: `${(1 - p) * 110 + (i + 1) * 2.5}% ${(i + 1) * 16}px`,
                  rotate: `${(i % 2 ? -1 : 1) * 1.5}deg`,
                  boxShadow: "-12px 0 40px rgba(2,6,24,0.25)",
                  opacity: p > 0.01 ? 1 : 0,
                }}
              >
                <Chat parent={c.parent} day={c.day} data={c.data} at={-30} />
              </div>
            );
          })}
        </div>
      </AppScreen>
    </>
  );
};

export const ExportScene = Interactive.create({ Component: ExportSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
export const ZaloScene = Interactive.create({ Component: ZaloSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
