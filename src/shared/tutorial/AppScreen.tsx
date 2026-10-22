import type React from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { CircleCheckIcon } from "lucide-react";
import { continueRender, delayRender, interpolate } from "remotion";
import DashboardBottomNav from "@/shared/components/layouts/dashboard/bottom-nav";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import { AppProviders } from "../app/AppProviders";
import { PhoneViewport } from "../app/PhoneViewport";
import { setDemoPathname } from "../app/stubs/next-navigation";
import { Finger } from "../components/Finger";
import { PhoneFrame, TUTORIAL_PHONE as L } from "../components/Phone";

// the tutorial series' app screen: L.width × L.screenH css px, no bottom nav unless a scene asks for it
export const SCREEN_H = L.screenH;
const PHONE_W = L.width;
const S = L.scale;
import { clamp, ease } from "../motion";
import { fontFamily } from "../theme";


export type Box = { x: number; y: number; w: number; h: number };
export type Point = { x: number; y: number };
export type Tap = Point & { at: number };

export const center = (b: Box): Point => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });

export const newClient = () =>
  new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });

// an element's box in the scrolled page's own px, so it doesn't move when the page scrolls
export const pageBox = (page: HTMLElement, el: Element | null | undefined): Box | null => {
  if (!el) return null;
  const r = page.getBoundingClientRect();
  const b = el.getBoundingClientRect();
  return { x: b.left - r.left, y: b.top - r.top, w: b.width, h: b.height };
};

// a fixed element's box on the phone screen
export const screenBox = (el: Element | null | undefined): Box | null => {
  if (!el) return null;
  const b = el.getBoundingClientRect();
  return { x: b.left, y: b.top, w: b.width, h: b.height };
};

export const byText = (root: ParentNode, selector: string, text: string) =>
  [...root.querySelectorAll<HTMLElement>(selector)].find((el) => el.textContent?.trim() === text);

// measure once the app has laid out and stopped moving (holding the frame till then), then after every commit
export const useMeasure = <T,>(measure: () => T | null) => {
  const [value, setValue] = useState<T | null>(null);

  useEffect(() => {
    const handle = delayRender("measure app targets");
    let tries = 0;
    let raf = 0;
    let last = "";
    let same = 0;
    // the layout keeps settling for a few frames after the first paint (fonts, async queries)
    const tick = () => {
      const next = measure();
      const key = JSON.stringify(next);
      same = next && key === last ? same + 1 : 0;
      last = key;
      if (same >= 4 || ++tries > 150) {
        if (next) setValue(next);
        continueRender(handle);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    const next = measure();
    if (next && JSON.stringify(next) !== JSON.stringify(value)) setValue(next);
  });

  return value;
};

// the frame owns the form: whatever frame renders, the fields show exactly that frame's values
// (checked after every commit: a click on the real app, e.g. a preset button, may have written the form itself)
export const useDriveForm = <T extends FieldValues>(form: UseFormReturn<T>, values: T) => {
  const key = JSON.stringify(values);
  useLayoutEffect(() => {
    if (JSON.stringify(form.getValues()) !== key) form.reset(values);
  });
};

// focus the field the finger is typing into (its focus ring), blur everything otherwise
export const useFocus = (el: HTMLElement | null | undefined) => {
  useLayoutEffect(() => {
    if (el) {
      if (el.ownerDocument.activeElement !== el) el.focus({ preventScroll: true });
    } else {
      const active = document.querySelector("iframe")?.contentDocument?.activeElement as HTMLElement | null | undefined;
      active?.blur();
    }
  });
};

// for app state only a click can set (a component's own useState): click until the screen shows `want`
export const useClickState = (want: boolean, shows: () => boolean | null, click: (want: boolean) => void) => {
  useLayoutEffect(() => {
    const now = shows();
    if (now === null || now === want) return;
    const handle = delayRender("click state");
    click(want);
    let tries = 0;
    const tick = () => {
      if (shows() === want || ++tries > 120) continueRender(handle);
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
};

// open or close a popover by clicking its trigger, holding the frame until radix has placed it
export const usePopover = (trigger: HTMLElement | null | undefined, open: boolean) => {
  useLayoutEffect(() => {
    if (!trigger) return;
    const doc = trigger.ownerDocument;
    const content = () => doc.querySelector<HTMLElement>("[data-slot=popover-content]");
    const placed = () => {
      const wrapper = content()?.parentElement;
      return !!wrapper && !wrapper.style.transform.includes("-200%");
    };
    if (!!content() === open) return;
    const handle = delayRender("popover");
    trigger.click();
    let tries = 0;
    const tick = () => {
      if ((open ? placed() : !content()) || ++tries > 120) continueRender(handle);
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
};

// eased piecewise scroll: [frame, y] keys, held flat between them
export const scrollAt = (frame: number, keys: [number, number][]) =>
  keys.length === 1
    ? keys[0][1]
    : interpolate(
        frame,
        keys.map(([f]) => f),
        keys.map(([, y]) => y),
        { ...clamp, easing: ease },
      );

export const toScreen = (p: Point) => ({ left: L.x + L.bezel + p.x * S, top: L.y + L.bezel + p.y * S });

// taps further apart than this: the finger lifts off after one and comes back in for the next
const LIFT_GAP = 45;

// the fingertip glides 14 frames into each tap, fading in before the first and out after `hideAt`
export const TapFinger = ({ frame, taps, hideAt }: { readonly frame: number; readonly taps: Tap[]; readonly hideAt: number }) => {
  if (taps.length === 0) return null;
  const leg = taps.findIndex((t) => frame < t.at);
  const to = taps[leg === -1 ? taps.length - 1 : leg];
  const prev = leg > 0 ? taps[leg - 1] : leg === -1 ? taps[taps.length - 1] : null;
  const lifted = !prev || to.at - prev.at > LIFT_GAP;
  const from = leg === -1 ? to : lifted ? { x: to.x + 70, y: to.y + 140 } : prev!;
  const move = interpolate(frame, [to.at - 14, to.at - 2], [0, 1], { ...clamp, easing: ease });
  const p = { x: from.x + (to.x - from.x) * move, y: from.y + (to.y - from.y) * move };
  const comeIn = leg === -1 || !lifted ? 1 : interpolate(frame, [to.at - 22, to.at - 12], [0, 1], clamp);
  const liftOff = prev && lifted && leg !== -1 ? interpolate(frame, [prev.at + 10, prev.at + 18], [1, 0], clamp) : 0;
  const end = interpolate(frame, [hideAt, hideAt + 8], [1, 0], clamp);
  // while lifting off it stays where it tapped
  const at = liftOff > 0 && frame < to.at - 22 ? prev! : p;
  return <Finger {...toScreen(at)} opacity={Math.max(comeIn, liftOff) * end} since={prev ? frame - prev.at : -1} />;
};

// a ring drawn on the bezel around a box on the phone screen
export const Ring = ({ box, opacity, color = "#059669" }: { readonly box: Box | null; readonly opacity: number; readonly color?: string }) =>
  box ? (
    <div
      style={{
        position: "absolute",
        left: L.bezel + (box.x - 5) * S,
        top: L.bezel + (box.y - 5) * S,
        width: (box.w + 10) * S,
        height: (box.h + 10) * S,
        borderRadius: 26,
        border: `7px solid ${color}`,
        boxShadow: `0 0 0 14px ${color}2e`,
        opacity,
        scale: String(1.12 - opacity * 0.12),
      }}
    />
  ) : null;

// the dashboard on a phone: the page scrolls, `fixed` stays put; the bottom nav only where a scene teaches navigation
export const AppScreen = ({
  client,
  pathname,
  scroll,
  enter = 1,
  pageRef,
  nav = false,
  fixed,
  overlay,
  children,
}: {
  readonly client: QueryClient;
  readonly pathname: string;
  readonly scroll: number;
  readonly enter?: number;
  readonly pageRef: React.Ref<HTMLDivElement>;
  readonly nav?: boolean;
  readonly fixed?: React.ReactNode;
  readonly overlay?: React.ReactNode;
  readonly children: React.ReactNode;
}) => {
  useState(() => setDemoPathname(pathname));

  return (
    <PhoneFrame enter={enter} layout={L} overlay={overlay}>
      <div style={{ position: "absolute", left: 0, top: 0, width: PHONE_W, scale: String(S), transformOrigin: "top left" }}>
        <PhoneViewport width={PHONE_W} height={SCREEN_H} still>
          <AppProviders client={client}>
            <SidebarProvider>
              <div ref={pageRef} className="bg-background" style={{ position: "absolute", left: 0, right: 0, top: -scroll, minHeight: SCREEN_H }}>
                {children}
              </div>
              {fixed}
              {nav ? <DashboardBottomNav /> : null}
            </SidebarProvider>
          </AppProviders>
        </PhoneViewport>
      </div>
    </PhoneFrame>
  );
};

// a dark speech bubble on the phone screen explaining the ringed box, pointing at it from below or above
export const Callout = ({
  box,
  opacity,
  side = "below",
  children,
}: {
  readonly box: Box | null;
  readonly opacity: number;
  readonly side?: "below" | "above";
  readonly children: React.ReactNode;
}) => {
  if (!box || opacity <= 0) return null;
  const left = L.bezel + 14 * S;
  const width = (PHONE_W - 28) * S;
  const arrowX = Math.min(Math.max(L.bezel + (box.x + box.w / 2) * S - left, 40), width - 40);
  const below = side === "below";
  const edge = below ? L.bezel + (box.y + box.h + 10) * S + 22 : L.bezel + (box.y - 10) * S - 22;
  return (
    <div
      style={{
        position: "absolute",
        left,
        width,
        top: edge,
        translate: `0px ${below ? (1 - opacity) * 16 : (1 - opacity) * -16}px`,
        transform: below ? undefined : "translateY(-100%)",
        opacity,
        zIndex: 5,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: arrowX - 16,
          [below ? "top" : "bottom"]: -14,
          width: 32,
          height: 32,
          rotate: "45deg",
          borderRadius: 6,
          background: "#020618",
        }}
      />
      <div
        style={{
          position: "relative",
          padding: "20px 28px",
          borderRadius: 26,
          background: "#020618",
          color: "white",
          fontFamily,
          fontSize: 33,
          fontWeight: 600,
          lineHeight: 1.3,
          boxShadow: "0 24px 50px rgba(2,6,24,0.3)",
        }}
      >
        {children}
      </div>
    </div>
  );
};

// the app's sonner success toast (shared/components/ui/sonner.tsx) as it sits on a phone, slid in by `enter`
export const SuccessToast = ({ enter, children }: { readonly enter: number; readonly children: React.ReactNode }) => (
  <div
    className="fixed top-4 inset-x-4 z-[100] flex items-start gap-1.5 rounded-md border border-l-4 border-emerald-200 border-l-emerald-600 bg-emerald-50 p-4 text-emerald-700 shadow-xl"
    style={{ opacity: enter, translate: `0px ${(enter - 1) * 60}px` }}
  >
    <CircleCheckIcon className="size-4 shrink-0 translate-y-1" />
    <div className="text-base font-medium">{children}</div>
  </div>
);

// one explanation beat: the ring and its bubble fade in at `from` and out by `to`; `box` is in page px
export const Explain = ({
  frame,
  from,
  to,
  box,
  scroll = 0,
  side = "below",
  color,
  children,
}: {
  readonly frame: number;
  readonly from: number;
  readonly to: number;
  readonly box: Box | null | undefined;
  readonly scroll?: number;
  readonly side?: "below" | "above";
  readonly color?: string;
  readonly children: React.ReactNode;
}) => {
  if (!box || frame < from || frame > to) return null;
  const opacity = interpolate(frame, [from, from + 8, to - 8, to], [0, 1, 1, 0], clamp);
  const onScreen = { ...box, y: box.y - scroll };
  return (
    <>
      <Ring box={onScreen} opacity={opacity} color={color} />
      <Callout box={onScreen} opacity={opacity} side={side}>
        {children}
      </Callout>
    </>
  );
};
