import { useState } from "react";

// the app reads "today" from the clock; pin it per scene so every render shows the same moment.
// Date.now keeps ticking from the pinned moment so Remotion's own timers still measure real elapsed time.
export const DEMO_NOW = new Date("2026-10-05T15:40:00+07:00").getTime();

const RealDate = Date;
let pinned = DEMO_NOW;
let pinnedAt = RealDate.now();
const now = () => pinned + (RealDate.now() - pinnedAt);

// a scene calls this before its app components mount (they read "today" in their initial state)
export const setDemoNow = (t: number) => {
  pinned = t;
  pinnedAt = RealDate.now();
};

if (typeof window !== "undefined" && !(RealDate as { __frozen?: boolean }).__frozen) {
  class DemoDate extends RealDate {
    constructor(...args: ConstructorParameters<typeof Date> | []) {
      if (args.length === 0) super(now());
      else super(...(args as ConstructorParameters<typeof Date>));
    }
    static now() {
      return now();
    }
  }
  (DemoDate as unknown as { __frozen: boolean }).__frozen = true;
  window.Date = DemoDate as DateConstructor;
}

// runs during the scene's first render, before any child's initial state reads the clock
export const useDemoNow = (t: number) => {
  useState(() => setDemoNow(t));
};
