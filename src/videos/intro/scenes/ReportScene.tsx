import { useEffect, useRef, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import {
  continueRender,
  delayRender,
  Interactive,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import PublicReport from "@/features/report/components/PublicReport";
import ReportLayout from "@/shared/components/layouts/report/layout";
import { AppProviders } from "../../../shared/app/AppProviders";
import { PhoneViewport } from "../../../shared/app/PhoneViewport";
import { DEMO_NOW, useDemoNow } from "../../../shared/app/frozen-clock";
import { Sfx } from "../../../shared/audio/sfx";
import { Caption } from "../../../shared/components/Caption";
import { IntegrationCard } from "../../../shared/components/IntegrationCard";
import { Finger } from "../../../shared/components/Finger";
import { BEZEL, PHONE_SCALE as S, PHONE_W, PHONE_X, PHONE_Y, PhoneFrame, SCREEN_H } from "../../../shared/components/Phone";
import { Bubble, ChatHeader } from "../../../shared/components/ZaloChat";
import { SHARE_MESSAGE } from "../../../shared/demo/report-data";
import { clamp, ease } from "../../../shared/motion";
import { colors, fontFamily } from "../../../shared/theme";
import { reportScreen } from "../data";

const BAR_H = 56;

const MSG_IN = 8;
const REPLY_IN = 40;
const TAP_LINK = 60;
const OPEN = [66, 84] as const;
const TO_LATEST = [96, 122] as const;
const TO_FILES = 140;


type Pt = { x: number; y: number };
type Targets = { link: Pt; latest: number };

// centre of el, in the css px of the 390-wide layer that contains it
const pointIn = (layer: HTMLElement, el: Element | null): Pt | null => {
  if (!el) return null;
  const r = layer.getBoundingClientRect();
  const k = r.width / PHONE_W;
  const b = el.getBoundingClientRect();
  return {
    x: (b.left + b.width / 2 - r.left) / k,
    y: (b.top + b.height / 2 - r.top) / k,
  };
};
const topIn = (layer: HTMLElement, el: Element | null) => {
  if (!el) return null;
  const r = layer.getBoundingClientRect();
  return (el.getBoundingClientRect().top - r.top) / (r.width / PHONE_W);
};

const Chat = ({
  linkRef,
}: {
  readonly linkRef: React.Ref<HTMLSpanElement>;
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      background: "#eef2f7",
      fontFamily,
    }}
  >
    <ChatHeader name="Mẹ Gia Hân" initials="MH" />
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "18px 12px",
      }}
    >
      <div style={{ alignSelf: "center", fontSize: 11, color: colors.muted }}>
        18:05
      </div>
      <Bubble mine at={MSG_IN}>
        {SHARE_MESSAGE.map((line, i) =>
          line.startsWith("- Gia Hân: ") ? (
            <div key={i}>
              - Gia Hân:{" "}
              <span
                ref={linkRef}
                style={{
                  color: "#2563eb",
                  textDecoration: "underline",
                  wordBreak: "break-all",
                }}
              >
                {line.slice("- Gia Hân: ".length)}
              </span>
            </div>
          ) : (
            <div key={i}>{line || " "}</div>
          ),
        )}
      </Bubble>
      <Bubble at={REPLY_IN}>Ok cô, chị lưu link rồi nha 👍</Bubble>
    </div>
  </div>
);

const BrowserBar = () => (
  <div
    style={{
      height: BAR_H,
      display: "flex",
      alignItems: "center",
      padding: "0 12px",
      background: "white",
      borderBottom: "1px solid #e2e8f0",
      fontFamily,
    }}
  >
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: 6,
        height: 36,
        padding: "0 12px",
        borderRadius: 999,
        background: "#f1f5f9",
        fontSize: 13,
        color: "#334155",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      <Lock size={13} color="#64748b" />
      sogiasu.com/report/nguyen-thu-huong/gia-han
    </div>
  </div>
);

const ReportSceneInner = () => {
  useDemoNow(DEMO_NOW);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chatRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLSpanElement>(null);
  const octRef = useRef<HTMLDivElement>(null);
  const [t, setT] = useState<Targets | null>(null);
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: Infinity, retry: false } },
      }),
  );

  // every target is measured once, after layout and images settle
  useEffect(() => {
    const handle = delayRender("measure report targets");
    let last = "";
    let tries = 0;
    let raf = 0;
    const tick = () => {
      const oct = octRef.current;
      const chat = chatRef.current;
      const next =
        oct && chat
          ? {
              link: pointIn(chat, linkRef.current),
              latest: topIn(oct, oct.querySelector('[id^="buoi-"]')),
            }
          : null;
      const ok = next && Object.values(next).every((v) => v !== null);
      const key = JSON.stringify(next);
      if ((ok && key === last) || ++tries > 120) {
        setT(ok ? (next as Targets) : null);
        continueRender(handle);
        return;
      }
      last = key;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const phoneIn = spring({ frame, fps, config: { damping: 200 } });
  const open = interpolate(frame, [...OPEN], [0, 1], {
    ...clamp,
    easing: ease,
  });
  const latestScroll = t ? Math.max(0, t.latest - 12) : 0;
  // land on 05/10, then drift on through its photo and files
  const octScroll = interpolate(
    frame,
    [TO_LATEST[0], TO_LATEST[1], TO_FILES, TO_FILES + 70],
    [0, latestScroll, latestScroll, latestScroll + 520],
    {
      ...clamp,
      easing: ease,
    },
  );

  const toScreen = (p: Pt, scroll: number, inReport: boolean) => ({
    left: PHONE_X + BEZEL + p.x * S,
    top: PHONE_Y + BEZEL + ((inReport ? BAR_H : 0) + p.y - scroll) * S,
  });
  const fingers = t
    ? [
        {
          at: TAP_LINK,
          ...toScreen(t.link, 0, false),
          show: [TAP_LINK - 18, OPEN[0] + 4],
        },
      ]
    : [];

  return (
    <>
      <Sfx role="pop" at={MSG_IN} volume={0.7} />
      <Sfx role="pop" at={REPLY_IN} volume={0.7} />
      <Sfx role="click-soft" at={TAP_LINK} volume={0.8} />
      <Sfx role="open" at={(OPEN[0] + OPEN[1]) / 2} volume={0.8} />
      <Sfx role="whoosh" at={(TO_LATEST[0] + TO_LATEST[1]) / 2} volume={0.5} />
      <Caption from={0} to={OPEN[1]}>
        Gửi link cho
        <br />
        <span style={{ color: colors.sky }}>phụ huynh qua Zalo</span>
      </Caption>
      <Caption from={OPEN[1]} to={TO_FILES}>
        Phụ huynh mở là thấy
        <br />
        <span style={{ color: colors.emerald }}>con học gì</span>
      </Caption>
      <Caption from={TO_FILES} to={10_000} top={105}>
        Kèm cả bài tập,
        <br />
        <span style={{ color: colors.emerald }}>video, tài liệu</span>
        <div style={{ marginTop: 10 }}>
          <IntegrationCard rows={[{ icon: "google-drive.svg", text: "Lấy thẳng từ Google Drive" }]} />
        </div>
      </Caption>

      <PhoneFrame enter={phoneIn}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: PHONE_W,
              height: SCREEN_H,
              scale: String(S),
              transformOrigin: "top left",
            }}
          >
            <PhoneViewport width={PHONE_W} height={SCREEN_H}>
            <div
              ref={chatRef}
              style={{
                position: "absolute",
                inset: 0,
                translate: `${-open * 30}% 0px`,
              }}
            >
              <Chat linkRef={linkRef} />
            </div>

            <div
              style={{
                position: "absolute",
                inset: 0,
                translate: `${(1 - open) * 100}% 0px`,
                boxShadow: "-20px 0 40px rgba(2,6,24,0.12)",
                background: "white",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: BAR_H,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  overflow: "hidden",
                }}
              >
                <AppProviders client={client}>
                  <div
                    ref={octRef}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: -octScroll,
                      width: PHONE_W,
                    }}
                  >
                    <ReportLayout>
                      <PublicReport report={reportScreen} />
                    </ReportLayout>
                  </div>
                </AppProviders>
              </div>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  zIndex: 50,
                }}
              >
                <BrowserBar />
              </div>
            </div>
            </PhoneViewport>
          </div>
      </PhoneFrame>

      {fingers.map((f) => (
        <Finger
          key={f.at}
          since={frame - f.at}
          left={f.left}
          top={f.top}
          opacity={interpolate(
            frame,
            [f.show[0], f.show[0] + 6, f.show[1] - 6, f.show[1]],
            [0, 1, 1, 0],
            clamp,
          )}
        />
      ))}
    </>
  );
};

export const ReportScene = Interactive.create({
  Component: ReportSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
