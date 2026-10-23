import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  DynamicModal,
  DynamicModalContent,
  DynamicModalDescription,
  DynamicModalFooter,
  DynamicModalHeader,
  DynamicModalTitle,
} from "@/shared/components/ui/DynamicModal";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { MoneyInput } from "@/shared/components/ui/money-input";
import SelectAllCheckbox from "@/shared/components/SelectAllCheckbox";
import { useFormatters } from "@/shared/hooks/use-formatters";
import { STUDENTS } from "../create-class/data";
import { DISCOUNT, OVERRIDE_FEE_BEFORE } from "./data";

const FIELD = "flex items-center gap-2 text-sm leading-none font-medium select-none";

// OverrideFeeDialog's markup around values the frame hands in: its react-hook-form lives inside it,
// so retyping the amount and the reason can't be driven per frame on the real one
export const OverrideDialog = ({ open, amount, reason }: { readonly open: boolean; readonly amount: number | null; readonly reason: string }) => {
  const t = useTranslations("fee");
  const tUi = useTranslations("ui");
  const { formatSession } = useFormatters();

  return (
    <DynamicModal open={open}>
      <DynamicModalContent className="sm:max-w-lg" onOpenAutoFocus={(e) => e.preventDefault()} data-override-dialog>
        <DynamicModalHeader>
          <DynamicModalTitle>{t("override.title")}</DynamicModalTitle>
          <DynamicModalDescription>{formatSession(OVERRIDE_FEE_BEFORE)}</DynamicModalDescription>
        </DynamicModalHeader>
        <form className="flex min-w-0 flex-1 flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-2" data-amount>
            <label className={FIELD}>
              {t("override.amount")}
              <span className="text-destructive">*</span>
            </label>
            <MoneyInput value={amount} onChange={() => {}} />
          </div>
          <div className="grid gap-2" data-reason>
            <label className={FIELD}>
              {t("override.reason")}
              <span className="text-destructive">*</span>
            </label>
            <Input maxLength={100} placeholder={t("override.reasonPlaceholder")} value={reason} readOnly />
            <p className="text-sm text-muted-foreground">{t("override.reasonHint")}</p>
          </div>
          <Alert variant="info">
            <Info />
            <AlertTitle>{tUi("alert.info")}</AlertTitle>
            <AlertDescription>{t("override.discountNote", { percent: DISCOUNT })}</AlertDescription>
          </Alert>
          <DynamicModalFooter>
            <Button type="button" variant="outline">
              {t("override.cancel")}
            </Button>
            <Button type="submit" data-save>
              {t("override.save")}
            </Button>
          </DynamicModalFooter>
        </form>
      </DynamicModalContent>
    </DynamicModal>
  );
};

// BulkOtherFeeDialog's markup, the same way
export const OtherFeeDialog = ({ open, label, amount }: { readonly open: boolean; readonly label: string; readonly amount: number | null }) => {
  const t = useTranslations("enrollment");

  return (
    <DynamicModal open={open}>
      <DynamicModalContent onOpenAutoFocus={(e) => e.preventDefault()} data-other-dialog>
        <DynamicModalHeader>
          <DynamicModalTitle>{t("bulkOtherFeeDialog.title")}</DynamicModalTitle>
          <DynamicModalDescription>{t("bulkOtherFeeDialog.note")}</DynamicModalDescription>
        </DynamicModalHeader>
        <form className="min-w-0 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Card className="border-dashed bg-muted shadow-none">
            <CardHeader>
              <CardTitle className="text-base">{t("otherFeeDialog.addTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2" data-label>
                <label className={FIELD}>
                  {t("otherFeeDialog.label")}
                  <span className="text-destructive">*</span>
                </label>
                <Input placeholder={t("otherFeeDialog.labelPlaceholder")} value={label} readOnly />
              </div>
              <div className="grid gap-2" data-amount>
                <label className={FIELD}>
                  {t("bulkOtherFeeDialog.amountPerStudent")}
                  <span className="text-destructive">*</span>
                </label>
                <MoneyInput placeholder={t("otherFeeDialog.amountPlaceholder")} value={amount} onChange={() => {}} />
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-2">
            <label className={FIELD}>
              {t("bulkOtherFeeDialog.studentsTitle")}
              <span className="text-destructive">*</span>
            </label>
            <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
              <SelectAllCheckbox selected={STUDENTS.length} total={STUDENTS.length} onToggleAll={() => {}} className="sticky top-0 z-10 border-b bg-card px-3 py-2.5" />
              {STUDENTS.map((s) => (
                <Label key={s.name} className="cursor-pointer items-start gap-3 border-b px-3 py-3 last:border-b-0">
                  <Checkbox checked className="mt-1" />
                  <span className="text-base font-medium">{s.name}</span>
                </Label>
              ))}
            </div>
          </div>
          <DynamicModalFooter>
            <Button type="button" variant="outline">
              {t("dialog.cancel")}
            </Button>
            <Button type="submit" data-save>
              {t("bulkOtherFeeDialog.submit")}
            </Button>
          </DynamicModalFooter>
        </form>
      </DynamicModalContent>
    </DynamicModal>
  );
};
