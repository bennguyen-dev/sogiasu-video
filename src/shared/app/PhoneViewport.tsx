import type React from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { continueRender, delayRender } from "remotion";
import { PortalContainer } from "./portal-container";

const SRC_DOC = '<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;overflow:hidden;background:#f8fafc"></body></html>';

// Tailwind breakpoints answer to the viewport, and the video's viewport is 1080 px wide — so the
// app would lay out as desktop. An iframe gives the phone screen its own 390 px viewport; the
// React tree stays in this window (same fetch mock, clock and providers), only the DOM moves in.
// `still` turns off the app's css animations and caret: they run on wall-clock time, not on the frame
export const PhoneViewport = ({
  width,
  height,
  still = false,
  children,
}: {
  readonly width: number;
  readonly height: number;
  readonly still?: boolean;
  readonly children: React.ReactNode;
}) => {
  const [body, setBody] = useState<HTMLElement | null>(null);
  const [handle] = useState(() => delayRender("phone viewport"));

  // the iframe's document only exists once srcDoc has loaded; anything written earlier is replaced
  const onLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    const doc = e.currentTarget.contentDocument;
    if (!doc) return;
    document.head.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => doc.head.appendChild(node.cloneNode(true)));
    document.fonts.forEach((font) => doc.fonts.add(font));
    if (still) doc.body.classList.add("still");
    setBody(doc.body);
  };

  useEffect(() => {
    if (body) continueRender(handle);
  }, [body, handle]);

  return (
    <iframe title="phone" srcDoc={SRC_DOC} onLoad={onLoad} style={{ width, height, border: 0, display: "block", background: "transparent" }}>
      {null}
      {body ? createPortal(<PortalContainer.Provider value={body}>{children}</PortalContainer.Provider>, body) : null}
    </iframe>
  );
};
