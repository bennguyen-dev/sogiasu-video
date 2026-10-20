import type React from "react";
import { Caption } from "../components/Caption";
import { colors } from "../theme";

// the series' caption above the phone: an eyebrow and one headline line, below TikTok's top tabs and clear of the phone
export const StepCaption = ({
  eyebrow,
  children,
  from,
  to = 10_000,
}: {
  readonly eyebrow: string;
  readonly children: React.ReactNode;
  readonly from: number;
  readonly to?: number;
}) => (
  <Caption from={from} to={to} fontSize={76} inset={60} top={110}>
    <div style={{ fontSize: 40, fontWeight: 700, color: colors.muted, letterSpacing: 0, marginBottom: 6 }}>{eyebrow}</div>
    {children}
  </Caption>
);
