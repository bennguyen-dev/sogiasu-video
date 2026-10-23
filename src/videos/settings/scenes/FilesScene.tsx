import { useRef } from "react";
import { Interactive, useCurrentFrame } from "remotion";
import StorageManagerPage from "@/features/storage/pages/StorageManagerPage";
import { messages } from "@/shared/i18n/messages.generated";
import { setDemoSearch } from "../../../shared/app/stubs/next-navigation";
import { Sfx } from "../../../shared/audio/sfx";
import { colors } from "../../../shared/theme";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { AppScreen, type Box, center, Explain, SCREEN_H, screenBox, TapFinger, useClickState, useMeasure } from "../../../shared/tutorial/AppScreen";
import { FILES_CLASS, FILES_LESSON_ID, FILES_MONTH } from "../data";
import { useRerenderWhen } from "../../../shared/tutorial/fee-page";
import { useSettingsApp } from "./shared";

const s = messages.vi.storage;

// one tap per level on the main pane: region → class → month → lesson
const TAPS = [30, 66, 102, 138] as const;
const FILES_HINT = [156, 236] as const;
const TAP_TREE = 252;
const TREE_HINT = [266, 352] as const;
export const FILES_LENGTH = 366;

const PATHS = [
  "region:by-class",
  `region:by-class/class:${FILES_CLASS.id}`,
  `region:by-class/class:${FILES_CLASS.id}/month:${FILES_MONTH}`,
  `region:by-class/class:${FILES_CLASS.id}/month:${FILES_MONTH}/lesson:${FILES_LESSON_ID}`,
];
const level = (frame: number) => TAPS.filter((t) => frame >= t + 2).length;

// the tile the next tap lands on, at each level
const LABELS = [s.tree.byClass, FILES_CLASS.name, "Tháng 9", "21/09"];
const tileOf = (root: HTMLElement, label: string) =>
  [...root.querySelectorAll<HTMLElement>("button")].filter((b) => b.textContent?.includes(label) && !b.closest("nav")).at(-1) ?? null;
const sheet = (doc: Document) => doc.querySelector<HTMLElement>("[data-slot=sheet-content]");

const FilesSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useSettingsApp();
  const depth = level(frame);
  // the page reads its folder from the url, as a tap pushes it
  setDemoSearch(depth ? new URLSearchParams({ path: PATHS[depth - 1] }).toString() : "");
  const treeOpen = frame >= TAP_TREE;
  const pageRef = useRef<HTMLDivElement>(null);
  const doc = pageRef.current?.ownerDocument;
  const menu = pageRef.current?.querySelector<HTMLElement>(`button[aria-label="${s.tree.open}"]`);
  useClickState(treeOpen, () => (doc && menu ? !!sheet(doc) : null), () => menu?.click());
  useRerenderWhen(treeOpen, () => !!(doc && sheet(doc)?.querySelector(".bg-accent")));
  const t = useMeasure(() => {
    const page = pageRef.current;
    if (!page) return null;
    const card = page.querySelector('[data-slot="card"]');
    const box = screenBox(card);
    return {
      next: depth < LABELS.length ? screenBox(tileOf(page, LABELS[depth])) : null,
      files: box ? { ...box, h: Math.min(box.h, SCREEN_H - 110 - box.y) } : null,
      menu: screenBox(page.querySelector(`button[aria-label="${s.tree.open}"]`)),
      tree: screenBox(sheet(page.ownerDocument)?.querySelector(".bg-accent")),
    };
  });
  const last = useRef<Box[]>([]);
  if (t?.next) last.current[depth] = t.next;
  const tap = (b: Box | null | undefined, at: number) => (b ? [{ at, ...center(b) }] : []);

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      {TAPS.map((f) => (
        <Sfx key={f} role="click-soft" at={f} volume={0.8} />
      ))}
      <Sfx role="tick" at={FILES_HINT[0] + 2} volume={0.6} />
      <Sfx role="click-soft" at={TAP_TREE} volume={0.8} />
      <Sfx role="whoosh" at={TAP_TREE + 2} volume={0.4} />
      <Sfx role="tick" at={TREE_HINT[0] + 2} volume={0.6} />
      <StepCaption eyebrow={s.page.title} from={0}>
        <span style={{ color: colors.emerald }}>tìm theo lớp, tháng, buổi</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/storage"
        scroll={0}
        pageRef={pageRef}
        overlay={
          t ? (
            <>
              <Explain frame={frame} from={FILES_HINT[0]} to={FILES_HINT[1]} box={t.files} side="above">
                Ảnh, PDF, cả tệp từ Google Drive
              </Explain>
              <Explain frame={frame} from={TREE_HINT[0]} to={TREE_HINT[1]} box={t.tree} side="below">
                Cây thư mục: nhảy nhanh sang buổi khác
              </Explain>
            </>
          ) : null
        }
      >
        {/* the explorer seeds its open branches from the url once, on mount: remount it as the tree opens */}
        <StorageManagerPage key={treeOpen ? "tree" : "pane"} />
      </AppScreen>
      {t ? (
        <TapFinger
          frame={frame}
          taps={[...TAPS.flatMap((f, i) => tap(last.current[i], f)), ...tap(t.menu, TAP_TREE)]}
          hideAt={TAP_TREE + 10}
        />
      ) : null}
    </>
  );
};

export const FilesScene = Interactive.create({ Component: FilesSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
