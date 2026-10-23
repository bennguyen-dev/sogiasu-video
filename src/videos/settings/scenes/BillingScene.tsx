import { useRef } from "react";
import { Interactive, useCurrentFrame } from "remotion";
import BillingPage from "@/features/billing/pages/BillingPage";
import { messages } from "@/shared/i18n/messages.generated";
import { Sfx } from "../../../shared/audio/sfx";
import { colors } from "../../../shared/theme";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { AppScreen, type Box, byText, center, Explain, pageBox, scrollAt, TapFinger, useClickState, useMeasure } from "../../../shared/tutorial/AppScreen";
import { PROMO_CODE } from "../data";
import { useRerenderWhen } from "../../../shared/tutorial/fee-page";
import { useSettingsApp } from "./shared";

const b = messages.vi.billing;

const TABLE_SCROLL = [18, 46] as const;
const TABLE_HINT = [52, 120] as const;
const PROMO_SCROLL = [124, 150] as const;
const PROMO_HINT = [156, 228] as const;
const ORDER_SCROLL = [232, 256] as const;
const TAP_YEAR = 272;
const ORDER_HINT = [288, 348] as const;
const PAY_HINT = [352, 436] as const;
export const BILLING_LENGTH = 446;

const radiosOf = (group: Element | null | undefined) => [...(group?.querySelectorAll<HTMLElement>('[role="radio"]') ?? [])];
const yearRadio = (page: HTMLElement) => radiosOf(page.querySelector(".bg-muted.rounded-xl [role=radiogroup]")).at(-1) ?? null;

const BillingSceneInner = () => {
  const frame = useCurrentFrame();
  const client = useSettingsApp();
  const pageRef = useRef<HTMLDivElement>(null);
  const page = pageRef.current;
  const year = page ? yearRadio(page) : null;
  useClickState(
    frame >= TAP_YEAR,
    () => (year ? year.getAttribute("data-state") === "checked" : null),
    () => year?.click(),
  );
  // the code re-applies to the new period after the click: measure once the total has moved
  useRerenderWhen(frame >= TAP_YEAR, () => !!page?.querySelector(".rounded-xl.bg-muted")?.textContent?.includes("449.000"));
  const t = useMeasure(() => {
    const p = pageRef.current;
    if (!p) return null;
    const summary = p.querySelector<HTMLElement>(".rounded-xl.bg-muted");
    const promo = [...p.querySelectorAll<HTMLElement>("[role=radiogroup]")].find((g) => g.textContent?.includes(PROMO_CODE));
    return {
      table: pageBox(p, p.querySelector("#upgrade .overflow-x-auto")),
      promo: pageBox(p, promo),
      summary: pageBox(p, summary),
      year: pageBox(p, yearRadio(p)),
      pay: pageBox(p, summary ? byText(summary, "button", b.payment.pay) : null),
    };
  });
  const y = (box: Box | null | undefined, above: number) => (box ? Math.max(0, box.y - above) : 0);
  const scroll = scrollAt(frame, [
    [TABLE_SCROLL[0], 0],
    [TABLE_SCROLL[1], y(t?.table, 90)],
    [PROMO_SCROLL[0], y(t?.table, 90)],
    [PROMO_SCROLL[1], y(t?.promo, 230)],
    [ORDER_SCROLL[0], y(t?.promo, 230)],
    [ORDER_SCROLL[1], y(t?.summary, 40)],
  ]);
  const tap = (box: Box | null | undefined, at: number) => (box ? [{ at, ...center({ ...box, y: box.y - scroll }) }] : []);

  return (
    <>
      <Sfx role="whoosh" at={2} volume={0.4} />
      {[TABLE_SCROLL, PROMO_SCROLL, ORDER_SCROLL].map(([f]) => (
        <Sfx key={f} role="whoosh" at={f + 4} volume={0.35} />
      ))}
      {[TABLE_HINT, PROMO_HINT, ORDER_HINT, PAY_HINT].map(([f]) => (
        <Sfx key={f} role="tick" at={f + 2} volume={0.6} />
      ))}
      <Sfx role="select" at={TAP_YEAR} volume={0.8} />
      <StepCaption eyebrow="Free và Pro" from={0} to={PROMO_SCROLL[0]}>
        <span style={{ color: colors.emerald }}>khác nhau ở đâu</span>
      </StepCaption>
      <StepCaption eyebrow={b.upgrade.promoLabel} from={PROMO_SCROLL[0]} to={PAY_HINT[0]}>
        <span style={{ color: colors.emerald }}>tự động áp dụng</span>
      </StepCaption>
      <StepCaption eyebrow={b.payment.pay} from={PAY_HINT[0]}>
        <span style={{ color: colors.emerald }}>bằng QR chuyển khoản</span>
      </StepCaption>
      <AppScreen
        client={client}
        pathname="/dashboard/billing"
        scroll={scroll}
        pageRef={pageRef}
        overlay={
          t ? (
            <>
              <Explain frame={frame} from={TABLE_HINT[0]} to={TABLE_HINT[1]} box={t.table} scroll={scroll} side="above">
                Free và Pro khác nhau ở đâu
              </Explain>
              <Explain frame={frame} from={PROMO_HINT[0]} to={PROMO_HINT[1]} box={t.promo} scroll={scroll} side="above">
                Mã khả dụng tự động được áp dụng
              </Explain>
              <Explain frame={frame} from={ORDER_HINT[0]} to={ORDER_HINT[1]} box={t.summary} scroll={scroll} side="above">
                Gói năm, mã giảm thêm 50.000 ₫
              </Explain>
              <Explain frame={frame} from={PAY_HINT[0]} to={PAY_HINT[1]} box={t.pay} scroll={scroll}>
                Thanh toán bằng mã QR chuyển khoản, không cần thẻ
              </Explain>
            </>
          ) : null
        }
      >
        <BillingPage />
      </AppScreen>
      {t ? <TapFinger frame={frame} taps={tap(t.year, TAP_YEAR)} hideAt={TAP_YEAR + 10} /> : null}
    </>
  );
};

export const BillingScene = Interactive.create({ Component: BillingSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
