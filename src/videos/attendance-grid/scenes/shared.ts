import { useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { useMockApi } from "../../../shared/app/AppProviders";
import { useDemoNow } from "../../../shared/app/frozen-clock";
import { newClient } from "../../../shared/tutorial/AppScreen";
import { GRID_API, type Stage, TODAY_10 } from "../data";

// how far the episode has got, set by whichever scene renders
let live: Stage = 0;
const API = GRID_API(() => live);

// a scene's app on the frozen 12/11; when the stage moves on every query refetches, as after the app's own mutation
export const useGridApp = (stage: Stage) => {
  useDemoNow(TODAY_10);
  live = stage;
  useMockApi(API);
  const [client] = useState(newClient);
  const seen = useRef(stage);
  useLayoutEffect(() => {
    if (seen.current === stage) return;
    seen.current = stage;
    const handle = delayRender("refetch after the change");
    void client.invalidateQueries().then(() => requestAnimationFrame(() => continueRender(handle)));
  });
  return client;
};

// hides the grid's day columns from..to (1-based days): the capture paints a scroll box at its origin, so the
// days a scene needs are brought into view by dropping the ones before them
export const hideDays = (scope: string, from: number, to: number) => {
  const cols = `:nth-child(n+${from + 1}):nth-child(-n+${to + 1})`;
  return `${scope} thead tr > ${cols}, ${scope} tbody tr > ${cols} { display: none; }`;
};
