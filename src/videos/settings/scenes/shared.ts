import { useState } from "react";
import { useMockApi } from "../../../shared/app/AppProviders";
import { useDemoNow } from "../../../shared/app/frozen-clock";
import { setDemoViewportWidth } from "../../../shared/app/stubs/use-mobile";
import { newClient, SCREEN_W } from "../../../shared/tutorial/AppScreen";
import { SETTINGS_API, TODAY_12 } from "../data";

// a scene's app on the frozen 12/11 afternoon, answering for the "Khác" pages
export const useSettingsApp = () => {
  useDemoNow(TODAY_12);
  useMockApi(SETTINGS_API);
  useState(() => setDemoViewportWidth(SCREEN_W));
  const [client] = useState(newClient);
  return client;
};

// a link or tile on the page by its visible label
export const linkTo = (root: ParentNode, label: string) =>
  [...root.querySelectorAll<HTMLElement>("a, button")].filter((el) => el.textContent?.trim() === label || el.textContent?.includes(label)).at(-1) ?? null;
