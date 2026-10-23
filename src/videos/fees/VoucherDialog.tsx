import { useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import { ImageDown, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { Form } from "@/shared/components/ui/form";
import {
  DynamicModal,
  DynamicModalContent,
  DynamicModalFooter,
  DynamicModalHeader,
  DynamicModalTitle,
} from "@/shared/components/ui/DynamicModal";
import ReportTablePreview from "@/features/payment/components/PaymentQRDialog/ReportTablePreview";
import VoucherOptions from "@/features/payment/components/PaymentQRDialog/VoucherOptions";
import VoucherPreview from "@/features/payment/components/PaymentQRDialog/VoucherPreview";
import type { QrTemplateId } from "@/features/payment/lib/voucher-v2/registry";
import type { VoucherOptionsInput } from "@/features/payment/types";
import { STUDENT_IDS } from "../attendance/data";
import { STUDENTS } from "../create-class/data";
import { reportStudents, voucherView } from "./data";

// PaymentQRDialog's markup around a form the scene owns: the app debounces the comment and reads its sticky
// options from localStorage, neither of which a frame-by-frame render can hold still. Options, preview and
// report card are the app's own components
export const VoucherDialog = ({
  open,
  form,
  student = { id: STUDENT_IDS.ma, name: STUDENTS[0].name },
  view: viewOf = voucherView,
}: {
  readonly open: boolean;
  readonly form: UseFormReturn<VoucherOptionsInput>;
  readonly student?: { readonly id: string; readonly name: string };
  readonly view?: typeof voucherView;
}) => {
  const t = useTranslations("payment");
  const voucherRef = useRef<HTMLDivElement>(null);
  const values = form.watch();
  const view = viewOf(values);
  const templateId = values.templateId as QrTemplateId;
  const files = values.includeReport ? 2 : 1;

  return (
    <DynamicModal open={open}>
      <DynamicModalContent className="md:max-w-6xl" data-voucher-dialog>
        <DynamicModalHeader>
          <DynamicModalTitle className="leading-snug">
            {t("qrDialog.title")} · {student.name}
          </DynamicModalTitle>
        </DynamicModalHeader>
        <div>
          <div className="grid gap-0 rounded-lg bg-muted py-4 max-md:-mx-4 max-md:rounded-none md:grid-cols-2">
            <div
              className="order-2 flex min-w-0 flex-col justify-start gap-6 px-4 max-md:pt-4 md:sticky md:top-0 md:self-start"
              data-previews
            >
              <VoucherPreview
                view={view}
                templateId={templateId}
                voucherRef={voucherRef}
                onDownload={async () => {}}
                title={t("qrDialog.previewTitle")}
              />
              {values.includeReport && (
                <ReportTablePreview
                  students={reportStudents()}
                  isLoading={false}
                  templateId={templateId}
                />
              )}
            </div>
            <div className="order-1 min-w-0 space-y-4 border-b-2 border-background px-4 md:border-b-0 md:border-r-2 max-md:pb-4">
              <Form {...form}>
                <VoucherOptions
                  bankStatus="ready"
                  control={form.control}
                  trigger={form.trigger}
                  studentIds={[student.id]}
                  studentNames={{ [student.id]: student.name }}
                  view={view}
                  allowedTemplateIds={null}
                />
              </Form>
            </div>
          </div>
        </div>
        <DynamicModalFooter>
          <div className="flex w-full justify-end gap-2 max-sm:[&>*]:flex-1">
            <Button variant="outline" data-share>
              <Share2 className="h-4 w-4" />
              {t("actions.share")}
              {files > 1 && ` (${files})`}
            </Button>
            <Button>
              <ImageDown className="h-4 w-4" />
              {t("actions.download")}
              {files > 1 && ` (${files})`}
            </Button>
          </div>
        </DynamicModalFooter>
      </DynamicModalContent>
    </DynamicModal>
  );
};
