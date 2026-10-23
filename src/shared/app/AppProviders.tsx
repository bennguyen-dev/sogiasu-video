import type React from "react";
import { useEffect, useState } from "react";
import { QueryClientProvider, useIsFetching, type QueryClient } from "@tanstack/react-query";
import { continueRender, delayRender } from "remotion";
import { NextIntlClientProvider } from "next-intl";
import { SessionProvider } from "next-auth/react";
import { messages } from "@/shared/i18n/messages.generated";
import { fontFamily } from "../theme";
import { calendarLessons } from "../demo/calendar-data";
import { classesList, pendingFeesResponse, septemberGrid } from "../demo/september-data";
import "./app.css";

// a route may read the request url (query params) or its body to shape its answer
type MockRoutes = Record<string, (url: string, init?: RequestInit) => unknown>;
// mounted scenes' answers, newest last: the scene being cut to mounts before the one it replaces unmounts
const sceneRoutes: { routes: MockRoutes }[] = [];

// a scene's own api answers, matched by url prefix ahead of the defaults below; set before its app mounts
export const useMockApi = (routes: MockRoutes) => {
  const [entry] = useState(() => {
    const e = { routes };
    sceneRoutes.push(e);
    return e;
  });
  // re-registers after a strict-mode remount, which runs this cleanup once without unmounting
  useEffect(() => {
    if (!sceneRoutes.includes(entry)) sceneRoutes.push(entry);
    return () => {
      const i = sceneRoutes.indexOf(entry);
      if (i !== -1) sceneRoutes.splice(i, 1);
    };
  }, [entry]);
};

const sceneAnswer = (url: string) => {
  for (let i = sceneRoutes.length - 1; i >= 0; i--) {
    const prefix = Object.keys(sceneRoutes[i].routes).find((p) => url.startsWith(p));
    if (prefix) return sceneRoutes[i].routes[prefix];
  }
  return null;
};

// a component never reaches the network in a render: unknown requests get an empty payload and are logged
if (
  typeof window !== "undefined" &&
  !(window as { __mockFetch?: boolean }).__mockFetch
) {
  (window as { __mockFetch?: boolean }).__mockFetch = true;
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    if (url.startsWith("/api/")) {
      console.log("[mock-fetch]", init?.method ?? "GET", url);
      const own = sceneAnswer(url);
      const body = own
        ? own(url, init)
        : url.startsWith("/api/calendar?")
        ? { success: true, data: calendarLessons() }
        : url.startsWith("/api/attendance/monthly-grid")
          ? { success: true, data: septemberGrid() }
          : url.startsWith("/api/fees/pending")
            ? pendingFeesResponse()
            : url.startsWith("/api/classes?")
              ? { success: true, data: classesList() }
              : { success: true, data: [] };
      return new Response(JSON.stringify(body), {
        headers: { "Content-Type": "application/json" },
      });
    }
    return realFetch(input, init);
  };
}

// a frame is captured only once the app's queries have answered, never mid-spinner
const HoldUntilSettled = () => {
  const fetching = useIsFetching();
  const [handle] = useState(() => delayRender("app queries"));
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (done || fetching > 0) return;
    const raf = requestAnimationFrame(() => {
      setDone(true);
      continueRender(handle);
    });
    return () => cancelAnimationFrame(raf);
  }, [fetching, done, handle]);
  return null;
};

// a signed-in demo tutor, handed over up front so next-auth never asks the network
const DEMO_SESSION = {
  user: { id: "demo-user", name: "Nguyễn Thu Hương", email: "huong@sogiasu.com" },
  expires: "2099-01-01T00:00:00.000Z",
};

export const AppProviders = ({
  client,
  children,
}: {
  readonly client: QueryClient;
  readonly children: React.ReactNode;
}) => (
  <SessionProvider session={DEMO_SESSION} refetchOnWindowFocus={false} refetchInterval={0}>
  <QueryClientProvider client={client}>
    <NextIntlClientProvider
      locale="vi"
      messages={messages.vi}
      timeZone="Asia/Ho_Chi_Minh"
    >
      <div
        className="bg-background text-foreground antialiased"
        style={{ ["--font-inter" as string]: fontFamily, fontFamily }}
      >
        <HoldUntilSettled />
        {children}
      </div>
    </NextIntlClientProvider>
  </QueryClientProvider>
  </SessionProvider>
);
