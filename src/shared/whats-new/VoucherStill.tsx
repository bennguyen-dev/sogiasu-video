import { AbsoluteFill } from "remotion";
import { QR_TEMPLATES, type QrTemplateId } from "@/features/payment/lib/voucher-v2/registry";
import type { VoucherView } from "@/features/payment/lib/voucher-v2/types";
import { fontFamily } from "../theme";

// a still image is 4:5 too (880×1100), the same box as a clip
export const STILL_W = 880;
export const STILL_H = 1100;

// a fee voucher rendered by the app's own template, filling the 4:5 still from its header down.
// Build `view` with no `payment` so there's never a QR or a bank account in the image. The app
// exports vouchers at 440 css px; a short one (one section) needs a narrower width to fill 4:5
export const VoucherStill = ({
  view,
  template,
  cssWidth = 440,
}: {
  readonly view: VoucherView;
  readonly template: QrTemplateId;
  readonly cssWidth?: number;
}) => {
  const html = QR_TEMPLATES.find((t) => t.id === template)!.render(view);
  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff", overflow: "hidden" }}>
      <div
        style={{
          width: cssWidth,
          scale: String(STILL_W / cssWidth),
          transformOrigin: "top left",
          ["--font-inter" as string]: fontFamily,
          fontFamily,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </AbsoluteFill>
  );
};
