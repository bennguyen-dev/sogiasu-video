import { useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { useMockApi } from "../../../shared/app/AppProviders";
import { useDemoNow } from "../../../shared/app/frozen-clock";
import { newClient } from "../../../shared/tutorial/AppScreen";
import { COURSE_FEE_API, TODAY_8 } from "../data";

// whether November's course is in yet, set by whichever scene renders
let live = false;
const API = COURSE_FEE_API(() => live);

// a scene's app on the frozen 12/11; once the course is added every query refetches, as after the app's own mutation
export const useCourseApp = (added: boolean) => {
  useDemoNow(TODAY_8);
  live = added;
  useMockApi(API);
  const [client] = useState(newClient);
  const seen = useRef(added);
  useLayoutEffect(() => {
    if (seen.current === added) return;
    seen.current = added;
    const handle = delayRender("refetch after adding the course");
    void client.invalidateQueries().then(() => requestAnimationFrame(() => continueRender(handle)));
  });
  return client;
};
