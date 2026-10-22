import { Img, staticFile } from "remotion";
import { colors, fontFamily } from "../theme";

// a white card of Google logos + what each one does, under a caption
export const IntegrationCard = ({
  rows,
}: {
  readonly rows: readonly { readonly icon: string; readonly text: string }[];
}) => (
  <div
    style={{
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 14,
      padding: "18px 34px",
      borderRadius: 32,
      background: "white",
      boxShadow: "0 18px 50px rgba(2,6,24,0.12)",
      fontFamily,
      fontSize: 40,
      fontWeight: 700,
      letterSpacing: "-0.02em",
      lineHeight: 1.2,
      color: colors.ink,
      whiteSpace: "nowrap",
    }}
  >
    {rows.map((r) => (
      <div
        key={r.icon}
        style={{ display: "flex", alignItems: "center", gap: 18 }}
      >
        <Img src={staticFile(r.icon)} style={{ width: 50, height: 50 }} />
        {r.text}
      </div>
    ))}
  </div>
);
