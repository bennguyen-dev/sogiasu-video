import { format } from "date-fns";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { DatePicker } from "@/shared/components/ui/date-picker";
import {
  DynamicModal,
  DynamicModalContent,
  DynamicModalDescription,
  DynamicModalFooter,
  DynamicModalHeader,
  DynamicModalTitle,
} from "@/shared/components/ui/DynamicModal";
import { MoneyInput } from "@/shared/components/ui/money-input";
import { PercentInput } from "@/shared/components/ui/percent-input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import type { EnrollmentDetail } from "@/features/enrollment/types";
import { useFormatters } from "@/shared/hooks/use-formatters";
import { DATE_TIME_FORMAT } from "@/shared/lib/date";
import { cn, formatCurrency } from "@/shared/lib/utils";
import { CLASS_NAME } from "../create-class/data";

// SessionRateDialog's (or HourRateDialog's) markup around values the frame hands in: its react-hook-form lives inside it,
// so typing the price and picking the date can't be driven per frame on the real one
export const RateDialog = ({
  open,
  history,
  price,
  effectiveFrom,
  hourly = false,
  student = "Minh Anh",
  className = CLASS_NAME,
}: {
  readonly open: boolean;
  readonly history: EnrollmentDetail["priceHistory"];
  readonly price: number | null;
  readonly effectiveFrom: string;
  readonly hourly?: boolean;
  readonly student?: string;
  readonly className?: string;
}) => {
  const t = useTranslations("enrollment");
  const tUi = useTranslations("ui");
  const { formatDate } = useFormatters();
  const today = format(new Date(), DATE_TIME_FORMAT.DEFAULT);
  const toDay = (d: string | Date) => format(new Date(d), DATE_TIME_FORMAT.DEFAULT);

  return (
    <DynamicModal open={open}>
      <DynamicModalContent onOpenAutoFocus={(e) => e.preventDefault()} data-rate-dialog>
        <DynamicModalHeader>
          <DynamicModalTitle>{t(hourly ? "priceDialog.titleHour" : "priceDialog.title")}</DynamicModalTitle>
          <DynamicModalDescription>{t("dialog.subtitle", { student, class: className })}</DynamicModalDescription>
        </DynamicModalHeader>
        <form className="min-w-0 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <h3 className="text-base font-medium">{t("priceDialog.historyTitle")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("priceDialog.historyHint")}</p>
            <div className="mt-4 rounded-md border" data-history>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t(hourly ? "priceDialog.colPriceHour" : "priceDialog.colPrice")}</TableHead>
                    <TableHead>{t("priceDialog.colEffectiveFrom")}</TableHead>
                    <TableHead>{t("priceDialog.colEnd")}</TableHead>
                    <TableHead className="w-0" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((ph) => {
                    const isActive =
                      (ph.effectiveFrom === null || toDay(ph.effectiveFrom) <= today) &&
                      (ph.effectiveTo === null || toDay(ph.effectiveTo) >= today);
                    return (
                      <TableRow key={ph.id} className={cn(isActive && "bg-muted/40")}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {formatCurrency(ph.price)}
                            {isActive && (
                              <Badge variant="success" size="sm">
                                {t("priceDialog.activeRate")}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{ph.effectiveFrom ? formatDate(ph.effectiveFrom) : t("priceDialog.fromBeginning")}</TableCell>
                        <TableCell>{ph.effectiveTo ? formatDate(ph.effectiveTo) : t("priceDialog.noEnd")}</TableCell>
                        <TableCell className="text-right" />
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <Card className="border-dashed bg-muted shadow-none">
            <CardHeader>
              <CardTitle className="text-base">{t("priceDialog.changeTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-2" data-price>
                  <label className="flex items-center gap-2 text-sm leading-none font-medium select-none">
                    {t(hourly ? "priceDialog.feePerHour" : "priceDialog.feePerSession")}
                    <span className="text-destructive">*</span>
                  </label>
                  <MoneyInput placeholder={t("priceDialog.feePlaceholder")} value={price} onChange={() => {}} />
                </div>
                <div className="grid gap-2">
                  <label className="flex items-center gap-2 text-sm leading-none font-medium select-none">{t("discountField.label")}</label>
                  <PercentInput value={null} onChange={() => {}} />
                </div>
                <div className="grid gap-2" data-effective-from>
                  <label className="flex items-center gap-2 text-sm leading-none font-medium select-none">
                    {t("priceDialog.effectiveFrom")}
                    <span className="text-destructive">*</span>
                  </label>
                  <DatePicker placeholder={t("priceDialog.effectiveFrom")} value={effectiveFrom} onChange={() => {}} />
                </div>
              </div>

              <Alert variant="info" data-note>
                <Info />
                <AlertTitle>{tUi("alert.info")}</AlertTitle>
                <AlertDescription>
                  <p>{t("priceDialog.note")}</p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <DynamicModalFooter>
            <Button type="button" variant="outline">
              {t("dialog.cancel")}
            </Button>
            <Button type="submit" data-save>
              {t("priceDialog.save")}
            </Button>
          </DynamicModalFooter>
        </form>
      </DynamicModalContent>
    </DynamicModal>
  );
};
