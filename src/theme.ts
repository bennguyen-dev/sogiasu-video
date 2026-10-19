import { loadFont } from "@remotion/google-fonts/Inter";

export const { fontFamily } = loadFont("normal", {
  weights: ["500", "600", "700", "800"],
  subsets: ["latin", "vietnamese"],
});

export const colors = {
  ink: "#020618",
  paper: "#f8fafc",
  muted: "#64748b",
  emerald: "#059669",
  emeraldSoft: "#6ee7b7",
  sky: "#0284c7",
  skySoft: "#7dd3fc",
  rose: "#e11d48",
  note: "#fef3c7",
  noteEdge: "#fcd34d",
};
