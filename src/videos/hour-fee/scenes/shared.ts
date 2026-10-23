import { useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { useMockApi } from "../../../shared/app/AppProviders";
import { useDemoNow } from "../../../shared/app/frozen-clock";
import { newClient } from "../../../shared/tutorial/AppScreen";
import { HOUR_FEE_API, type HourState, TODAY_7 } from "../data";

// what the api answers from, set by whichever scene renders
let live: HourState = { raised: false, todayDone: false };
const API = HOUR_FEE_API(() => live);

// a scene's app on the frozen 12/11; when `state` moves on, every query refetches, as after the app's own mutation
export const useHourApp = (state: HourState) => {
  useDemoNow(TODAY_7);
  live = state;
  useMockApi(API);
  const [client] = useState(newClient);
  const seen = useRef(JSON.stringify(state));
  useLayoutEffect(() => {
    const key = JSON.stringify(state);
    if (seen.current === key) return;
    seen.current = key;
    const handle = delayRender("refetch after change");
    void client.invalidateQueries().then(() => requestAnimationFrame(() => continueRender(handle)));
  });
  return client;
};
