import type React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import {
  continueRender,
  delayRender,
  Easing,
  Interactive,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import RevenueSection from "@/features/analytics/components/RevenueSection";
import { analyticsKeys } from "@/features/analytics/hooks/analytics-keys";
import { AppProviders } from "./app-ui/AppProviders";
import { PhoneViewport } from "./app-ui/PhoneViewport";
import { useDemoNow } from "./app-ui/frozen-clock";
import { lessonActivity, potentialByClass, SEPT_END, septemberClassIds } from "./app-ui/september-data";
import { colors, fontFamily } from "./theme";
import { Sfx } from "./sfx";

// a tablet-width viewport: below lg the app lays the KPIs out 2×2, so amounts fit on one line
const UI_W = 768;
const UI_X = 40;
const UI_Y = 470;
const S = (1080 - 2 * UI_X) / UI_W;
const VIEW_H = (1920 - UI_Y) / S;

const COLLECT = [14, 96] as const;
const PAN = [58, 96] as const;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);

const MONTH = "2026-09";
const potentialKey = analyticsKeys.list({ resource: "revenue", chart: "potential", month: MONTH, classIds: septemberClassIds() });
const activityKey = analyticsKeys.list({ resource: "lesson", chart: "activity", month: MONTH, classIds: septemberClassIds() });

const seed = (client: QueryClient, progress: number) => {
  client.setQueryData(potentialKey, { success: true, data: potentialByClass(progress) });
  client.setQueryData(activityKey, { success: true, data: lessonActivity() });
};

const Caption = ({ children, from, to }: { readonly children: React.ReactNode; readonly from: number; readonly to: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - from, fps, config: { damping: 200 } });
  const exit = interpolate(frame, [to - 8, to], [1, 0], clamp);

  return (
    <div
      style={{
        position: "absolute",
        top: 150,
        left: 70,
        right: 70,
        textAlign: "center",
        fontFamily,
        fontSize: 84,
        fontWeight: 800,
        letterSpacing: "-0.035em",
        lineHeight: 1.08,
        color: colors.ink,
        opacity: enter * exit,
        translate: `0px ${(1 - enter) * 40 - (1 - exit) * 30}px`,
      }}
    >
      {children}
    </div>
  );
};

const AnalyticsSceneInner = () => {
  useDemoNow(SEPT_END);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const uiRef = useRef<HTMLDivElement>(null);
  const [chartTop, setChartTop] = useState<number | null>(null);
  // early-October collections replayed onto September: tutors tick "Đã thu tiền", the chart follows
  const progress = interpolate(frame, [...COLLECT], [0, 1], { ...clamp, easing: ease });
  const [client] = useState(() => {
    const c = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });
    seed(c, progress);
    return c;
  });

  useLayoutEffect(() => {
    seed(client, progress);
  }, [client, progress]);

  useEffect(() => {
    const handle = delayRender("measure analytics chart");
    let tries = 0;
    let raf = 0;
    const tick = () => {
      const root = uiRef.current;
      const title = root ? [...root.querySelectorAll('[data-slot="card-title"]')].find((el) => el.textContent?.includes("Tiềm năng")) : null;
      const card = title?.closest('[data-slot="card"]');
      if ((root && card) || ++tries > 150) {
        if (root && card) {
          const r = root.getBoundingClientRect();
          setChartTop((card.getBoundingClientRect().top - r.top) / (r.width / UI_W));
        }
        continueRender(handle);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const appear = spring({ frame, fps, config: { damping: 200 } });
  const pan = interpolate(frame, [...PAN], [0, chartTop ? chartTop - 20 : 0], { ...clamp, easing: ease });

  return (
    <>
      <Sfx role="whoosh" at={(PAN[0] + PAN[1]) / 2} volume={0.7} />
      <Sfx role="confirm" at={COLLECT[1]} />
      <div style={{ position: "absolute", inset: 0, overflow: "clip" }}>
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
            borderRadius: 16,
            overflow: "clip",
            filter: "drop-shadow(0 30px 60px rgba(2,6,24,0.16))",
          }}
        >
          <PhoneViewport width={UI_W} height={VIEW_H}>
            <AppProviders client={client}>
              <div ref={uiRef} className="bg-muted/40 p-4" style={{ position: "absolute", left: 0, right: 0, top: -pan }}>
                <RevenueSection />
              </div>
            </AppProviders>
          </PhoneViewport>
        </div>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 470, background: "linear-gradient(#f1f5f9 78%, rgba(241,245,249,0))" }} />
      <Caption from={0} to={PAN[0] + 10}>
        Ai đóng, ai chưa -
        <br />
        <span style={{ color: colors.emerald }}>nhìn là biết</span>
      </Caption>
      <Caption from={PAN[0] + 10} to={10_000}>
        Lớp nào thu
        <br />
        <span style={{ color: colors.emerald }}>nhiều nhất</span>
      </Caption>
    </>
  );
};

export const AnalyticsScene = Interactive.create({
  Component: AnalyticsSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
