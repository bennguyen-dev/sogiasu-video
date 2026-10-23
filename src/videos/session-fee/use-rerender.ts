import { useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender } from "remotion";

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
