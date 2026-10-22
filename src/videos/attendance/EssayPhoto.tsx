import type React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont } from "@remotion/google-fonts/Caveat";

const { fontFamily: hand } = loadFont("normal", { weights: ["500", "700"], subsets: ["latin"] });

const LINE = 64;
const TOP = 250;
const RED = "#d62839";

const Fix = ({ wrong, right }: { readonly wrong: string; readonly right: string }) => (
  <span style={{ position: "relative", display: "inline-block" }}>
    <span style={{ textDecoration: `line-through ${RED} 4px` }}>{wrong}</span>
    <span style={{ position: "absolute", left: 4, top: -40, color: RED, fontSize: 40, fontWeight: 700, whiteSpace: "nowrap" }}>{right}</span>
  </span>
);

// Minh Anh's handwritten Task 2, photographed by the tutor: rendered once to public/demo/minh-anh-essay.jpg
const LINES: React.ReactNode[] = [
  "Some people think children should start learning a foreign",
  "language at primary school. Do you agree or disagree?",
  "",
  "Nowadays, many parents want their children to learn English",
  "as early as possible. In my opinion, starting at primary school",
  <>
    brings more benefits than <Fix wrong="drawback" right="drawbacks" />.
  </>,
  <>
    Firstly, young children can remember new <Fix wrong="word" right="words" /> very <Fix wrong="quick" right="quickly" />.
  </>,
  "They also copy the pronunciation of their teacher more easily",
  "than adults, so they can speak more naturally later.",
  <>
    Secondly, <Fix wrong="learn" right="learning" /> a language early helps children feel
  </>,
  "confident when they talk with foreigners or travel abroad.",
  "However, some people worry that children will have too many",
  "subjects to study and feel tired.",
  "In conclusion, I believe the advantages are more important,",
  "so children should learn a foreign language from primary school.",
];

export const EssayPhoto = () => (
  <AbsoluteFill style={{ background: "#3f3a33" }}>
    <div
      style={{
        position: "absolute",
        left: 40,
        top: 50,
        width: 1120,
        height: 1500,
        rotate: "-1.2deg",
        background: "#fbf8ef",
        boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
        backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${LINE - 2}px, #b9cfe6 ${LINE - 2}px, #b9cfe6 ${LINE}px)`,
        backgroundPosition: `0 ${TOP + 14}px`,
        fontFamily: hand,
        color: "#1f3a8a",
      }}
    >
      <div style={{ position: "absolute", left: 120, top: 0, bottom: 0, width: 3, background: "#e9a3a3" }} />
      <div style={{ position: "absolute", left: 150, top: 90, fontSize: 64, fontWeight: 700 }}>Writing Task 2 - Minh Anh</div>
      <div style={{ position: "absolute", left: 150, top: 168, fontSize: 40, color: "#475569" }}>01/10/2026</div>
      <div
        style={{
          position: "absolute",
          right: 70,
          top: 60,
          width: 170,
          height: 170,
          borderRadius: "50%",
          border: `6px solid ${RED}`,
          color: RED,
          rotate: "-8deg",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 700 }}>Band</div>
        <div style={{ fontSize: 76, fontWeight: 700 }}>6.5</div>
      </div>
      <div style={{ position: "absolute", left: 150, right: 60, top: TOP, fontSize: 46, lineHeight: `${LINE}px`, fontWeight: 500 }}>
        {LINES.map((line, i) => (
          <div key={i} style={{ height: LINE, whiteSpace: "nowrap" }}>
            {line}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 150, top: TOP + LINES.length * LINE + 40, fontSize: 48, fontWeight: 700, color: RED, rotate: "-2deg" }}>
        Good ideas! Check plural nouns &amp; adverbs.
      </div>
    </div>
  </AbsoluteFill>
);
