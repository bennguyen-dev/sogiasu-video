import { useRef } from "react";
import { Interactive, useCurrentFrame } from "remotion";
import MoreMenuPage from "@/shared/components/layouts/dashboard/MoreMenuPage";
import { messages } from "@/shared/i18n/messages.generated";
import { Sfx } from "../../../shared/audio/sfx";
import { colors } from "../../../shared/theme";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { AppScreen, type Box, center, Explain, pageBox, scrollAt, screenBox, TapFinger, useMeasure } from "../../../shared/tutorial/AppScreen";
import { linkTo, useSettingsApp } from "./shared";

const nav = messages.vi.ui.nav;

// 0 · hook: everything below lives behind the "Khác" tab
const TAB_HINT = [14, 74] as const;
const TAP_FILES = 92;
export const HOOK_LENGTH = 104;

const HookSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useSettingsApp();
  const pageRef = useRef<HTMLDivElement>(null);
  const t = useMeasure(() => {
    const page = pageRef.current;
    if (!page) return null;
    const doc = page.ownerDocument;
    const tab = [...doc.querySelectorAll<HTMLElement>("nav a")].find((a) => a.textContent?.includes(nav.more));
    return { tab: screenBox(tab), files: pageBox(page, linkTo(page, nav.storage)) };
  });
  const tap = (b: Box | null | undefined, at: number) => (b ? [{ at, ...center(b) }] : []);

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="tick" at={TAB_HINT[0] + 2} volume={0.6} />
      <Sfx role="click-soft" at={TAP_FILES} volume={0.8} />
      <StepCaption eyebrow="Gắn ngân hàng, kết nối Google" from={-20}>
        <span style={{ color: colors.emerald }}>ở đâu?</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/more"
        scroll={0}
        pageRef={pageRef}
        nav
        overlay={
          t ? (
            <Explain frame={frame} from={TAB_HINT[0]} to={TAB_HINT[1]} box={t.tab} side="above">
              Tất cả nằm ở tab Khác
            </Explain>
          ) : null
        }
      >
        <MoreMenuPage />
      </AppScreen>
      {t ? <TapFinger frame={frame} taps={tap(t.files, TAP_FILES)} hideAt={TAP_FILES + 10} /> : null}
    </>
  );
};

export const HookScene = Interactive.create({ Component: HookSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });

// 5 · support: back on "Khác", down to the help corner
const SCROLL = [8, 34] as const;
const INSTALL_HINT = [40, 100] as const;
const HELP_HINT = [104, 180] as const;
export const SUPPORT_LENGTH = 190;

const SupportSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useSettingsApp();
  const pageRef = useRef<HTMLDivElement>(null);
  const t = useMeasure(() => {
    const page = pageRef.current;
    const head = page ? [...page.querySelectorAll("h2")].find((h) => h.textContent === nav.groupSupport) : null;
    const section = head?.closest("section");
    const channels = [nav.contactEmail, nav.contactMessenger, nav.contactZalo].map((label) => (page && section ? pageBox(page, linkTo(section, label)) : null));
    if (!page || !section || channels.some((c) => !c)) return null;
    const [first, , lastChannel] = channels as Box[];
    const top = Math.min(...(channels as Box[]).map((c) => c.y));
    const bottom = Math.max(...(channels as Box[]).map((c) => c.y + c.h));
    return { section: pageBox(page, section), install: pageBox(page, linkTo(section, nav.installApp)), channels: { x: first.x, y: top, w: lastChannel.x + lastChannel.w - first.x, h: bottom - top } };
  });
  const target = t?.section ? Math.max(0, t.section.y - 160) : 0;
  const scroll = scrollAt(frame, [
    [SCROLL[0], 0],
    [SCROLL[1], target],
  ]);

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="whoosh" at={SCROLL[0] + 4} volume={0.35} />
      <Sfx role="tick" at={INSTALL_HINT[0] + 2} volume={0.6} />
      <Sfx role="tick" at={HELP_HINT[0] + 2} volume={0.6} />
      <StepCaption eyebrow={nav.groupSupport} from={0}>
        <span style={{ color: colors.emerald }}>cài app, liên hệ</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/more"
        scroll={scroll}
        pageRef={pageRef}
        nav
        overlay={
          t ? (
            <>
              <Explain frame={frame} from={INSTALL_HINT[0]} to={INSTALL_HINT[1]} box={t.install} scroll={scroll} side="above">
                Cài app ra màn hình chính
              </Explain>
              <Explain frame={frame} from={HELP_HINT[0]} to={HELP_HINT[1]} box={t.channels} scroll={scroll} side="above">
                Cần hỗ trợ hoặc có thắc mắc, liên hệ qua email, Messenger hoặc Zalo
              </Explain>
            </>
          ) : null
        }
      >
        <MoreMenuPage />
      </AppScreen>
    </>
  );
};

export const SupportScene = Interactive.create({ Component: SupportSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
