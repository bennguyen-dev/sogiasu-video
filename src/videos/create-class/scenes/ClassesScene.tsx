import { useRef, useState } from "react";
import { Interactive, spring, useCurrentFrame, useVideoConfig } from "remotion";
import ClassesPage from "@/features/class/pages/ClassesPage";
import { messages } from "@/shared/i18n/messages.generated";
import { useMockApi } from "../../../shared/app/AppProviders";
import { DEMO_NOW, useDemoNow } from "../../../shared/app/frozen-clock";
import { Sfx } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { colors } from "../../../shared/theme";
import { AppScreen, byText, center, newClient, pageBox, TapFinger, useMeasure } from "../../../shared/tutorial/AppScreen";
import { NEW_ACCOUNT_API } from "../data";

// the empty state's own big button, the one a brand-new tutor sees first
const TAP_ADD = 52;

const ClassesSceneInner = () => {
  useDemoNow(DEMO_NOW);
  useMockApi(NEW_ACCOUNT_API);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pageRef = useRef<HTMLDivElement>(null);
  const [client] = useState(newClient);

  const add = useMeasure(() => {
    const page = pageRef.current;
    return page ? pageBox(page, byText(page, "a, button", messages.vi.class.table.createFirst)) : null;
  });
  const phoneIn = spring({ frame, fps, config: { damping: 200 } });

  return (
    <>
      <Sfx role="whoosh" at={4} volume={0.5} />
      <Sfx role="click-firm" at={TAP_ADD} volume={0.8} />
      <StepCaption eyebrow="Lớp học trống?" from={6}>
        <span style={{ color: colors.emerald }}>Bắt đầu từ đây</span>
      </StepCaption>
      <AppScreen client={client} pathname="/dashboard/classes" scroll={0} enter={phoneIn} pageRef={pageRef} nav>
        <ClassesPage />
      </AppScreen>
      {add ? <TapFinger frame={frame} taps={[{ at: TAP_ADD, ...center(add) }]} hideAt={TAP_ADD + 14} /> : null}
    </>
  );
};

export const ClassesScene = Interactive.create({
  Component: ClassesSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
