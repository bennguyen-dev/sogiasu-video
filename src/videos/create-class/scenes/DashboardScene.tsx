import { useRef, useState } from "react";
import { Interactive, spring, useCurrentFrame, useVideoConfig } from "remotion";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import { messages } from "@/shared/i18n/messages.generated";
import { useMockApi } from "../../../shared/app/AppProviders";
import { DEMO_NOW, useDemoNow } from "../../../shared/app/frozen-clock";
import { Sfx } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { colors } from "../../../shared/theme";
import { AppScreen, byText, center, Explain, newClient, pageBox, TapFinger, useMeasure } from "../../../shared/tutorial/AppScreen";
import { NEW_ACCOUNT_API } from "../data";

const onboarding = messages.vi.dashboard.onboarding;

// a new account's dashboard: the first-class card lists the wizard's three steps, its button opens the wizard
const STEPS_HINT = [22, 88] as const;
const TAP_CREATE = 106;
export const DASHBOARD_LENGTH = 120;

const DashboardSceneInner = () => {
  useDemoNow(DEMO_NOW);
  useMockApi(NEW_ACCOUNT_API);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pageRef = useRef<HTMLDivElement>(null);
  const [client] = useState(newClient);

  const t = useMeasure(() => {
    const page = pageRef.current;
    const title = page ? byText(page, "h2", onboarding.title) : null;
    if (!page || !title) return null;
    return { card: pageBox(page, title.closest('[data-slot="card"]')), create: pageBox(page, byText(page, "a, button", onboarding.cta)) };
  });
  const phoneIn = spring({ frame, fps, config: { damping: 200 } });

  return (
    <>
      <Sfx role="whoosh" at={4} volume={0.5} />
      <Sfx role="tick" at={STEPS_HINT[0] + 2} volume={0.6} />
      <Sfx role="click-firm" at={TAP_CREATE} volume={0.8} />
      <StepCaption eyebrow="Tài khoản mới?" from={6}>
        <span style={{ color: colors.emerald }}>Bắt đầu từ đây</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard"
        scroll={0}
        enter={phoneIn}
        pageRef={pageRef}
        nav
        overlay={
          t ? (
            <Explain frame={frame} from={STEPS_HINT[0]} to={STEPS_HINT[1]} box={t.card}>
              3 bước là xong lớp đầu tiên
            </Explain>
          ) : null
        }
      >
        <DashboardPage />
      </AppScreen>
      {t?.create ? <TapFinger frame={frame} taps={[{ at: TAP_CREATE, ...center(t.create) }]} hideAt={TAP_CREATE + 14} /> : null}
    </>
  );
};

export const DashboardScene = Interactive.create({
  Component: DashboardSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
