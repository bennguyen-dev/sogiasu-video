import { useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender } from "remotion";

// one click-driven change to the app's own state: `done` says whether the screen already shows it
export type Step = { at: number; done: () => boolean; act: () => void };

// the app keeps some state only a click can set (a dialog's open flag, a menu, a picked option). Steps play in
// order up to the current frame, each waiting until the screen shows it, so a render that starts mid-scene
// still reaches the same screen; then the scene renders once more to measure what opened
// a step that throws (its element not mounted yet) counts as not done, and is tried again
const isDone = (s: Step) => {
  try {
    return s.done();
  } catch {
    return false;
  }
};
const tryAct = (s: Step) => {
  try {
    s.act();
  } catch {
    // the target isn't there yet; the next tick retries
  }
};

export const useSteps = (frame: number, steps: Step[]) => {
  const [, setRound] = useState(0);
  // a step still not done after a few full rounds is skipped, so a wrong target shows on the frame instead of hanging it
  const failed = useRef(new Map<number, number>());
  useLayoutEffect(() => {
    const due = steps.filter((s) => s.at <= frame && (failed.current.get(s.at) ?? 0) < 3);
    if (due.every(isDone)) return;
    const handle = delayRender("steps");
    let i = 0;
    let tries = 0;
    const tick = () => {
      while (i < due.length && isDone(due[i])) {
        i++;
        tries = 0;
      }
      if (i < due.length && tries > 120) failed.current.set(due[i].at, (failed.current.get(due[i].at) ?? 0) + 1);
      if (i >= due.length || tries > 120) {
        setRound((r) => r + 1);
        requestAnimationFrame(() => continueRender(handle));
        return;
      }
      if (tries % 20 === 0) tryAct(due[i]);
      tries++;
      requestAnimationFrame(tick);
    };
    // start a frame later: the app's own effects (e.g. ConfirmDialog registering itself) run after this one
    requestAnimationFrame(tick);
  });
};

// open a Radix menu from its trigger: ArrowDown opens it (pointerdown would toggle), sent from the element's own
// window (the phone iframe)
export const openMenu = (el: Element | null | undefined) => {
  if (!el) return;
  const win = el.ownerDocument.defaultView as Window & typeof globalThis;
  (el as HTMLElement).focus();
  el.dispatchEvent(new win.KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "ArrowDown" }));
};

// set a text input as typing would: the native setter, then an input event React listens for
export const typeInto = (el: HTMLInputElement | HTMLTextAreaElement | null | undefined, value: string) => {
  if (!el) return;
  const win = el.ownerDocument.defaultView as Window & typeof globalThis;
  const proto = el.tagName === "TEXTAREA" ? win.HTMLTextAreaElement.prototype : win.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, value);
  el.dispatchEvent(new win.Event("input", { bubbles: true }));
};
