import { useRef } from "react";
import { Interactive, useCurrentFrame } from "remotion";
import { useTranslations } from "next-intl";
import PasswordCard from "@/features/auth/components/PasswordCard";
import ConnectionsPage from "@/features/connections/pages/ConnectionsPage";
import BankAccountCard from "@/features/payment/components/BankAccountCard";
import ProfileInfo from "@/features/profile/components/ProfileInfo";
import DashboardHeader from "@/shared/components/layouts/dashboard/header";
import DashboardMain from "@/shared/components/layouts/dashboard/main";
import PageHeader from "@/shared/components/layouts/dashboard/PageHeader";
import { messages } from "@/shared/i18n/messages.generated";
import { Sfx } from "../../../shared/audio/sfx";
import { colors } from "../../../shared/theme";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { AppScreen, Explain, pageBox, scrollAt, useMeasure } from "../../../shared/tutorial/AppScreen";
import { useSettingsApp } from "./shared";

const { vi } = messages;
const cards = (page: HTMLElement) => [...page.querySelectorAll<HTMLElement>('[data-slot="card"]')];

// ProfilePage is a server component (getTranslations); the same layout around its client cards
const SettingsPage = () => {
  const tUi = useTranslations("ui");
  return (
    <>
      <DashboardHeader>
        <PageHeader>{tUi("nav.settings")}</PageHeader>
      </DashboardHeader>
      <DashboardMain>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="min-w-0 space-y-8">
            <ProfileInfo />
            <PasswordCard />
          </div>
          <div className="min-w-0 space-y-8">
            <BankAccountCard />
          </div>
        </div>
      </DashboardMain>
    </>
  );
};

// 2 · settings: down to the bank account card
const BANK_SCROLL = [16, 46] as const;
const BANK_HINT = [52, 140] as const;
export const PROFILE_LENGTH = 150;

const ProfileSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useSettingsApp();
  const pageRef = useRef<HTMLDivElement>(null);
  const t = useMeasure(() => {
    const page = pageRef.current;
    const bank = page ? pageBox(page, cards(page).at(-1)) : null;
    // the card runs on into a tall QR preview: ring the account fields, so the bubble fits below
    return bank ? { bank: { ...bank, h: Math.min(bank.h, 330) } } : null;
  });
  const scroll = scrollAt(frame, [
    [BANK_SCROLL[0], 0],
    [BANK_SCROLL[1], t?.bank ? Math.max(0, t.bank.y - 70) : 0],
  ]);

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="whoosh" at={BANK_SCROLL[0] + 4} volume={0.35} />
      <Sfx role="tick" at={BANK_HINT[0] + 2} volume={0.6} />
      <StepCaption eyebrow={vi.ui.nav.settings} from={0}>
        <span style={{ color: colors.emerald }}>tài khoản ngân hàng</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/profile"
        scroll={scroll}
        pageRef={pageRef}
        overlay={
          t ? (
            <Explain frame={frame} from={BANK_HINT[0]} to={BANK_HINT[1]} box={t.bank} scroll={scroll}>
              Gắn tài khoản ngân hàng để phiếu học phí có mã QR
            </Explain>
          ) : null
        }
      >
        <SettingsPage />
      </AppScreen>
    </>
  );
};

export const ProfileScene = Interactive.create({ Component: ProfileSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });

// 3 · connections: Google Calendar + Meet, then Drive
const CAL_HINT = [14, 78] as const;
const DRIVE_SCROLL = [80, 104] as const;
const DRIVE_HINT = [108, 168] as const;
export const CONNECT_LENGTH = 176;

const ConnectSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useSettingsApp();
  const pageRef = useRef<HTMLDivElement>(null);
  const t = useMeasure(() => {
    const page = pageRef.current;
    const [calendar, drive] = page ? cards(page) : [];
    return page && calendar && drive ? { calendar: pageBox(page, calendar), drive: pageBox(page, drive) } : null;
  });
  const scroll = scrollAt(frame, [
    [DRIVE_SCROLL[0], 0],
    [DRIVE_SCROLL[1], t?.drive ? Math.max(0, t.drive.y - 70) : 0],
  ]);

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      <Sfx role="tick" at={CAL_HINT[0] + 2} volume={0.6} />
      <Sfx role="whoosh" at={DRIVE_SCROLL[0] + 4} volume={0.35} />
      <Sfx role="tick" at={DRIVE_HINT[0] + 2} volume={0.6} />
      <StepCaption eyebrow={vi.ui.nav.connections} from={0}>
        <span style={{ color: colors.emerald }}>Calendar, Meet, Drive</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/connections"
        scroll={scroll}
        pageRef={pageRef}
        overlay={
          t ? (
            <>
              <Explain frame={frame} from={CAL_HINT[0]} to={CAL_HINT[1]} box={t.calendar} scroll={scroll} side="above">
                Lịch lên Google Calendar, phòng Meet cố định
              </Explain>
              <Explain frame={frame} from={DRIVE_HINT[0]} to={DRIVE_HINT[1]} box={t.drive} scroll={scroll} side="above">
                Đính kèm tệp từ Google Drive vào buổi học
              </Explain>
            </>
          ) : null
        }
      >
        <ConnectionsPage />
      </AppScreen>
    </>
  );
};

export const ConnectScene = Interactive.create({ Component: ConnectSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
