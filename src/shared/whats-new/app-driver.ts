import { useLayoutEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import type { Box } from "../tutorial/AppScreen";

// the app's document: the first (and in a What's New clip, only) iframe
export const appDoc = () => document.querySelector("iframe")?.contentDocument ?? null;

// an element's box in the app's own css px
export const rect = (el: Element | null | undefined): Box | null => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};

export const union = (...boxes: Box[]): Box => {
  const x = Math.min(...boxes.map((b) => b.x));
  const y = Math.min(...boxes.map((b) => b.y));
  return { x, y, w: Math.max(...boxes.map((b) => b.x + b.w)) - x, h: Math.max(...boxes.map((b) => b.y + b.h)) - y };
};

export const openDialog = (doc: Document) => doc.querySelector<HTMLElement>("[data-slot=dialog-content]");

// the app's own children change after a click (a dialog opens), which doesn't re-render the scene:
// keep applying `apply` until it reports done for a few frames running (the app may still reset
// itself when a query lands), holding the frame meanwhile, then re-render the scene once
export const useSettle = (apply: () => boolean, key: unknown) => {
  const [, bump] = useState(0);
  useLayoutEffect(() => {
    if (apply()) return;
    const handle = delayRender("settle app state");
    let done = false;
    let tries = 0;
    let held = 0;
    let raf = 0;
    const finish = () => {
      if (done) return;
      done = true;
      continueRender(handle);
    };
    const tick = () => {
      held = apply() ? held + 1 : 0;
      if (held >= 6 || ++tries > 200) {
        finish();
        bump((n) => n + 1);
      } else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      finish();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
};

// type into an app input the way a keystroke would: the input lives in the iframe's realm, so its
// own prototype setter and Event, or React never sees the change
export const typeInto = (input: HTMLInputElement, value: string) => {
  const win = input.ownerDocument.defaultView as (Window & typeof globalThis) | null;
  if (!win) return;
  Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, "value")?.set?.call(input, value);
  input.dispatchEvent(new win.Event("input", { bubbles: true }));
};

// only `input` looks focused (dialogs autofocus their first field); null blurs whatever has focus
export const focusOnly = (doc: Document, input: HTMLElement | null) => {
  if (input) {
    if (doc.activeElement !== input) input.focus({ preventScroll: true });
  } else if (doc.activeElement instanceof (doc.defaultView as Window & typeof globalThis).HTMLElement) {
    (doc.activeElement as HTMLElement).blur();
  }
};
