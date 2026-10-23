import { useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { useMockApi } from "../../../shared/app/AppProviders";
import { useDemoNow } from "../../../shared/app/frozen-clock";
import { newClient } from "../../../shared/tutorial/AppScreen";
import { FEE_ADJUST_API, type Stage, TODAY_9 } from "../data";

// how far the episode's changes have got, set by whichever scene renders
let live: Stage = 0;
const API = FEE_ADJUST_API(() => live);

// a scene's app on the frozen 12/11; when the stage moves on every query refetches, as after the app's own mutation
export const useAdjustApp = (stage: Stage) => {
  useDemoNow(TODAY_9);
  live = stage;
  useMockApi(API);
  const [client] = useState(newClient);
  const seen = useRef(stage);
  useLayoutEffect(() => {
    if (seen.current === stage) return;
    seen.current = stage;
    const handle = delayRender("refetch after the change");
    void client
      .invalidateQueries()
      .then(() => requestAnimationFrame(() => continueRender(handle)));
  });
  return client;
};
