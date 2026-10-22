import type React from "react";
import { useLayoutEffect, useState } from "react";
import { AppProviders } from "../app/AppProviders";
import { PhoneViewport } from "../app/PhoneViewport";
import { PHONE_W, PhoneFrame } from "../components/Phone";
import { fontFamily } from "../theme";
import { newClient } from "../tutorial/AppScreen";
import { appDoc } from "./app-driver";
import { PHONE, S, SCREEN_H } from "./layout";

// the app on the series' phone, panned up by `pan` frame px; `enter` 0 → 1 slides it in from below
export const WhatsNewPhone = ({
  pan,
  enter = 1,
  children,
}: {
  readonly pan: number;
  readonly enter?: number;
  readonly children: React.ReactNode;
}) => {
  const [client] = useState(newClient);
  // dialogs portal to the iframe's body, outside the providers' font wrapper
  useLayoutEffect(() => {
    const body = appDoc()?.body;
    if (!body) return;
    body.style.fontFamily = fontFamily;
    body.style.setProperty("--font-inter", fontFamily);
  });
  return (
    <div style={{ position: "absolute", inset: 0, translate: `0px ${-pan}px` }}>
      <PhoneFrame enter={enter} layout={PHONE}>
        <div style={{ position: "absolute", left: 0, top: 0, width: PHONE_W, scale: String(S), transformOrigin: "top left" }}>
          <PhoneViewport width={PHONE_W} height={SCREEN_H} still>
            <AppProviders client={client}>
              <div className="bg-background p-4" style={{ minHeight: SCREEN_H }}>
                {children}
              </div>
            </AppProviders>
          </PhoneViewport>
        </div>
      </PhoneFrame>
    </div>
  );
};
