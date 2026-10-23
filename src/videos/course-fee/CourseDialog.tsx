import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { DatePicker } from "@/shared/components/ui/date-picker";
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
import { PercentInput } from "@/shared/components/ui/percent-input";
import SelectAllCheckbox from "@/shared/components/SelectAllCheckbox";
import { coursePeriodText } from "@/features/enrollment/lib/course-fee";
import { useFormatters } from "@/shared/hooks/use-formatters";
import { STUDENTS_8 } from "./data";

const LATEST = { periodStart: "2026-10-01", periodEnd: "2026-10-31" };

// BulkCourseFeeDialog's markup around values the frame hands in: its react-hook-form lives inside it,
// so typing the name and amount and picking the end date can't be driven per frame on the real one
export const CourseDialog = ({
  open,
  label,
  amount,
  periodStart,
  periodEnd,
}: {
  readonly open: boolean;
  readonly label: string;
  readonly amount: number | null;
  readonly periodStart: string;
  readonly periodEnd: string;
}) => {
  const t = useTranslations("enrollment");
  const { formatDate } = useFormatters();
  const latest = t("bulkCourseDialog.latestTerm", {
    term: ["Khóa tháng 10", coursePeriodText(LATEST, formatDate)].join(" · "),
  });
  const field =
    "flex items-center gap-2 text-sm leading-none font-medium select-none";

  return (
    <DynamicModal open={open}>
      <DynamicModalContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        data-course-dialog
      >
        <DynamicModalHeader>
          <DynamicModalTitle>{t("bulkCourseDialog.title")}</DynamicModalTitle>
          <DynamicModalDescription>
            {t("bulkCourseDialog.note")}
          </DynamicModalDescription>
        </DynamicModalHeader>
        <form
          className="min-w-0 space-y-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <Card className="border-dashed bg-muted shadow-none">
            <CardHeader>
              <CardTitle className="text-base">
                {t("courseDialog.addTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2" data-label>
                <label className={field}>
                  {t("courseFeeDialog.label")}
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder={t("courseFeeDialog.labelPlaceholder")}
                  value={label}
                  readOnly
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-2" data-amount>
                  <label className={field}>
                    {t("bulkCourseDialog.amountPerStudent")}
                    <span className="text-destructive">*</span>
                  </label>
                  <MoneyInput
                    placeholder={t("courseFeeDialog.amountPlaceholder")}
                    value={amount}
                    onChange={() => {}}
                  />
                </div>
                <div className="grid gap-2">
                  <label className={field}>{t("discountField.label")}</label>
                  <PercentInput value={null} onChange={() => {}} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className={field}>
                    {t("courseFeeDialog.periodStart")}
                  </label>
                  <DatePicker
                    placeholder={t("courseFeeDialog.datePlaceholder")}
                    value={periodStart}
                    onChange={() => {}}
                  />
                </div>
                <div className="grid gap-2" data-period-end>
                  <label className={field}>
                    {t("courseFeeDialog.periodEnd")}
                  </label>
                  <DatePicker
                    placeholder={t("courseFeeDialog.datePlaceholder")}
                    value={periodEnd}
                    onChange={() => {}}
                    minDate={periodStart}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-2" data-students>
            <label className={field}>
              {t("bulkCourseDialog.studentsTitle")}
              <span className="text-destructive">*</span>
            </label>
            <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
              <SelectAllCheckbox
                selected={STUDENTS_8.length}
                total={STUDENTS_8.length}
                onToggleAll={() => {}}
                className="sticky top-0 z-10 border-b bg-card px-3 py-2.5"
              />
              {STUDENTS_8.map((s) => (
                <Label
                  key={s.id}
                  className="cursor-pointer items-start gap-3 border-b px-3 py-3 last:border-b-0"
                >
                  <Checkbox checked className="mt-1" />
                  <div className="min-w-0 flex-1">
                    <span className="text-base font-medium">{s.name}</span>
                    <div className="text-sm font-normal text-muted-foreground">
                      {latest}
                    </div>
                  </div>
                </Label>
              ))}
            </div>
          </div>

          <DynamicModalFooter>
            <Button type="button" variant="outline">
              {t("dialog.cancel")}
            </Button>
            <Button type="submit" data-save>
              {t("bulkCourseDialog.submit")}
            </Button>
          </DynamicModalFooter>
        </form>
      </DynamicModalContent>
    </DynamicModal>
  );
};
