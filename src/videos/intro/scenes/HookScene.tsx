import type React from "react";
import { Easing, Interactive, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fontFamily } from "../../../shared/theme";
import { Sfx } from "../../../shared/audio/sfx";

type ClutterItem = {
  kind: "note" | "chat";
  text: string;
  sender?: string;
  x: number;
  y: number;
  rotate: number;
  delay: number;
};

// the mess a tutor scrolls through at month end; positions keep the centre clear for the headline.
// negative delays are already settled on frame 0, so the first frame (the video thumbnail) is never blank
const CLUTTER: ClutterItem[] = [
  { kind: "note", text: "T9: Bảo 8 buổi\n× 120k = ???", x: 90, y: 170, rotate: -8, delay: -40 },
  { kind: "chat", sender: "Mẹ bé Mít", text: "Cô ơi chị chuyển khoản rồi nha", x: 560, y: 230, rotate: 4, delay: -34 },
  { kind: "chat", sender: "Chị Lan", text: "Cô gửi chị STK nhé", x: 620, y: 520, rotate: -3, delay: -28 },
  { kind: "note", text: "Gia Hân nghỉ\n19/9 hay 28/9?", x: 70, y: 1300, rotate: 6, delay: -22 },
  { kind: "chat", sender: "Anh Tuấn", text: "Tháng này con học mấy buổi vậy cô?", x: 520, y: 1380, rotate: 3, delay: -16 },
  { kind: "note", text: "1.440.000?\n1.320.000??", x: 600, y: 1640, rotate: -7, delay: 34 },
  { kind: "note", text: "Thứ 3 - 18h\nBảo hay Bơ?", x: 110, y: 1610, rotate: -4, delay: 46 },
];

const COLLAPSE_START = 96;

const Clutter = ({ item }: { readonly item: ClutterItem }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const pop = spring({ frame: frame - item.delay, fps, config: { damping: 12, mass: 0.6 } });
  const collapse = interpolate(frame, [COLLAPSE_START, COLLAPSE_START + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.7, 0, 0.84, 0),
  });
  const wobble = Math.sin((frame + item.delay * 7) / 9) * 2.5;
  const isNote = item.kind === "note";

  const base: React.CSSProperties = isNote
    ? {
        background: colors.note,
        borderBottom: `6px solid ${colors.noteEdge}`,
        borderRadius: 10,
        padding: "28px 32px",
        width: 360,
        fontSize: 40,
        lineHeight: 1.3,
        fontWeight: 600,
        color: "#78350f",
        whiteSpace: "pre-line",
      }
    : {
        background: "white",
        borderRadius: "34px 34px 34px 8px",
        padding: "24px 30px",
        width: 400,
        fontSize: 36,
        lineHeight: 1.3,
        fontWeight: 500,
        color: colors.ink,
        boxShadow: "0 20px 50px rgba(2,6,24,0.12)",
      };

  return (
    <div
      style={{
        ...base,
        position: "absolute",
        left: item.x,
        top: item.y,
        fontFamily,
        opacity: 1 - collapse,
        scale: String(pop * (1 - collapse * 0.9)),
        rotate: `${item.rotate + wobble + collapse * 40}deg`,
        translate: `${(width / 2 - item.x - 200) * collapse}px ${(height / 2 - item.y - 60) * collapse}px`,
        boxShadow: isNote ? "0 16px 40px rgba(120,53,15,0.15)" : base.boxShadow,
      }}
    >
      {item.sender ? (
        <div style={{ fontSize: 28, fontWeight: 700, color: colors.sky, marginBottom: 6 }}>{item.sender}</div>
      ) : null}
      {item.text}
    </div>
  );
};

const HeadlineLine = ({
  children,
  at,
  color = colors.ink,
  shake = false,
}: {
  readonly children: React.ReactNode;
  readonly at: number;
  readonly color?: string;
  readonly shake?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - at, fps, config: { damping: 14 } });
  const shakeX = shake ? Math.sin((frame - at) * 1.6) * interpolate(frame - at, [6, 22], [14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  return (
    <div
      style={{
        fontFamily,
        fontSize: 124,
        fontWeight: 800,
        letterSpacing: "-0.035em",
        lineHeight: 1.08,
        color,
        textAlign: "center",
        whiteSpace: "pre-line",
        opacity: interpolate(pop, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
        translate: `${shakeX}px ${(1 - pop) * 60}px`,
      }}
    >
      {children}
    </div>
  );
};

const HookSceneInner = () => {
  const frame = useCurrentFrame();

  return (
    <>
      {CLUTTER.filter((item) => item.delay >= 0).map((item) => (
        <Sfx key={item.delay} role={item.kind === "chat" ? "pop" : "drop"} at={item.delay} volume={0.6} />
      ))}
      <Sfx role="impact-soft" at={20} volume={1} />
      <Sfx role="whoosh" at={COLLAPSE_START + 16} volume={0.8} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          backgroundImage: `radial-gradient(circle at 2px 2px, ${colors.ink} 2px, transparent 0)`,
          backgroundSize: "44px 44px",
        }}
      />
      {CLUTTER.map((item) => (
        <Clutter key={item.text} item={item} />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 18,
          padding: "0 80px",
          opacity: interpolate(frame, [COLLAPSE_START, COLLAPSE_START + 14], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: String(interpolate(frame, [COLLAPSE_START, COLLAPSE_START + 14], [1, 0.85], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })),
        }}
      >
        <HeadlineLine at={-40}>Cuối tháng.</HeadlineLine>
        <HeadlineLine at={-24}>{"Ai đóng\nhọc phí rồi?"}</HeadlineLine>
        <HeadlineLine at={20} color={colors.rose} shake>
          Ai chưa?
        </HeadlineLine>
      </div>
    </>
  );
};

export const HookScene = Interactive.create({
  Component: HookSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
