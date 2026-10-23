import { useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { messages } from "@/shared/i18n/messages.generated";
import { useClickState } from "./AppScreen";

const { vi } = messages;

// a student's card on the Fees page or a class's Students tab: the smallest card naming them
export const studentCardOf = (root: ParentNode, name: string) =>
  [...root.querySelectorAll<HTMLElement>("[data-slot=card]")]
    .filter((c) => c.textContent?.includes(name))
    .sort((a, b) => a.textContent!.length - b.textContent!.length)[0];

// the Fees page card's "Chọn buổi" / "Chọn kỳ" / "Thu gọn" toggle
const PICK_LABELS: string[] = [vi.fee.card.selectSessions, vi.fee.card.selectCourses, vi.fee.card.collapse];
export const pickButton = (card: HTMLElement) =>
  [...card.querySelectorAll<HTMLElement>("button")].find((b) => PICK_LABELS.includes(b.textContent?.trim() ?? ""));
const expanded = (card: HTMLElement | null | undefined) => (card ? pickButton(card)?.textContent?.trim() === vi.fee.card.collapse : null);

// the card's lesson rows once opened, and the one dated `ddmm`
export const rowsOf = (card: HTMLElement) => card.querySelector<HTMLElement>(".space-y-1.pl-6");
export const rowOn = (card: HTMLElement, ddmm: string) => [...card.querySelectorAll<HTMLElement>("label")].find((l) => l.textContent?.includes(ddmm));

// the history tab: a student's October collection, and its lesson rows once opened
export const dayRowOf = (card: HTMLElement) => [...card.querySelectorAll<HTMLElement>("button")].find((b) => b.textContent?.includes("thg 10"));
export const paidRowsOf = (card: HTMLElement) => card.querySelector<HTMLElement>(".mt-1.space-y-1.pl-4");

// something mounts after this render (a popover's content): wait for it, then render once more so it gets measured
export const useRerenderWhen = (active: boolean, ready: () => boolean) => {
  const [, setRound] = useState(0);
  const done = useRef(false);
  useLayoutEffect(() => {
    if (!active) {
      done.current = false;
      return;
    }
    if (done.current) return;
    done.current = true;
    const handle = delayRender("rerender when ready");
    let tries = 0;
    const tick = () => {
      if (ready() || ++tries > 120) {
        setRound((n) => n + 1);
        requestAnimationFrame(() => continueRender(handle));
      } else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
};

// opens a student's lesson list with "Chọn buổi", as a tap does; the rows mount after this render,
// so render once more to measure them
export const useOpenCard = (page: HTMLElement | null, open: boolean, name: string) => {
  const [, setRound] = useState(0);
  useClickState(
    open,
    () => expanded(page ? studentCardOf(page, name) : null),
    () => {
      const card = page ? studentCardOf(page, name) : null;
      if (card) pickButton(card)?.click();
      const handle = delayRender("lesson rows");
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setRound((n) => n + 1);
          continueRender(handle);
        }),
      );
    },
  );
};
