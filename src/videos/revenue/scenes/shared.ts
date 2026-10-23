import { useState } from "react";
import { useMockApi } from "../../../shared/app/AppProviders";
import { useDemoNow } from "../../../shared/app/frozen-clock";
import { newClient } from "../../../shared/tutorial/AppScreen";
import { REVENUE_API, TODAY_11 } from "../data";

// a scene's app on the frozen 12/11 afternoon, answering from the episode's figures
export const useRevenueApp = () => {
  useDemoNow(TODAY_11);
  useMockApi(REVENUE_API);
  const [client] = useState(newClient);
  return client;
};
