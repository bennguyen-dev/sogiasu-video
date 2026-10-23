import { useSyncExternalStore } from "react";

export { useIsTouch } from "../../../../../studying-report/src/shared/hooks/use-mobile";

// the app reads the window's width, which is the video's 1080 px; a phone scene sets its screen width instead
let demoWidth: number | null = null;
export const setDemoViewportWidth = (width: number | null) => {
  demoWidth = width;
};

const BREAKPOINTS = { smallMobile: 480, mobile: 768, tablet: 1024 } as const;

export function useBreakpoint() {
  const width = useSyncExternalStore(
    () => () => {},
    () => demoWidth ?? window.innerWidth,
    () => BREAKPOINTS.tablet,
  );
  return {
    isSmallMobile: width < BREAKPOINTS.smallMobile,
    isMobile: width < BREAKPOINTS.mobile,
    isTablet: width < BREAKPOINTS.tablet,
  };
}
