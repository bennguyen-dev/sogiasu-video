import { Check, Copy, ExternalLink, EyeOff, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Textarea } from "@/shared/components/ui/textarea";
import CopyButton from "@/shared/components/CopyButton";
import {
  DynamicModal,
  DynamicModalContent,
  DynamicModalDescription,
  DynamicModalFooter,
  DynamicModalHeader,
  DynamicModalTitle,
} from "@/shared/components/ui/DynamicModal";
import { cn } from "@/shared/lib/utils";
import { STUDENTS } from "../create-class/data";
import { STUDENT_IDS } from "../attendance/data";
import { reportUrl } from "./data";

const KEYS = ["ma", "gh"] as const;

// ShareClassMessageButton's dialog: the app builds each link from window.location.origin, which in a render is
// localhost, so the scene lays the same markup around sogiasu.com links. `included`: rows ticked; `linked`: links made
export const ClassShareDialog = ({ open, included, linked }: { readonly open: boolean; readonly included: boolean; readonly linked: boolean }) => {
  const t = useTranslations("report");
  const tUi = useTranslations("ui");
  const rows = KEYS.map((key, i) => ({ key, studentId: STUDENT_IDS[key], name: STUDENTS[i].name, link: included && linked ? reportUrl(key) : null }));
  const message = [
    t("share.classMessage.defaultIntro"),
    "",
    ...(included ? rows.map((r) => `- ${r.name}: ${r.link ?? t("share.classMessage.creatingLink")}`) : []),
    "",
    t("share.classMessage.outro"),
  ].join("\n");

  return (
    <DynamicModal open={open}>
      <DynamicModalContent data-class-share>
        <DynamicModalHeader>
          <DynamicModalTitle>{t("share.classMessage.dialogTitle")}</DynamicModalTitle>
        </DynamicModalHeader>
        <div className="min-w-0 space-y-4">
          <div>
            <Label>{t("share.classMessage.studentsTitle")}</Label>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("share.classMessage.selectedCount", { selected: included ? rows.length : 0, total: rows.length })}
            </p>
            <div className="mt-2 rounded-lg border bg-card shadow-sm">
              <Table className="table-fixed">
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-10">
                      <Checkbox checked={included} aria-label={t("share.classMessage.selectAll")} data-select-all />
                    </TableHead>
                    <TableHead>{t("share.classMessage.nameColumn")}</TableHead>
                    <TableHead className="w-1/3 md:w-1/2">{t("share.classMessage.linkColumn")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.studentId} className={cn("cursor-pointer", included && "bg-success/10 hover:bg-success/10")}>
                      <TableCell>
                        <Checkbox checked={included} />
                      </TableCell>
                      <TableCell className="truncate font-medium">{row.name}</TableCell>
                      <TableCell className="w-1/3 md:w-1/2">
                        {row.link ? (
                          <a href={row.link} className="block truncate text-primary hover:underline">
                            {row.link}
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {included ? t("share.classMessage.creatingLink") : t("share.classMessage.clickToCreate")}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="space-y-1.5" data-message>
            <Label>{t("share.classMessage.messageLabel")}</Label>
            <p className="text-sm text-muted-foreground">{t("share.classMessage.messageHint")}</p>
            <Textarea
              value={message}
              readOnly
              rows={6}
              className="rounded-l-2xl rounded-tr-2xl rounded-br-none! border-none bg-info! text-white! text-base! px-4 py-3 shadow-none"
            />
          </div>
        </div>
        <DynamicModalFooter>
          <Button type="button">
            <Share2 className="h-4 w-4" />
            {t("share.classMessage.share")}
          </Button>
          <CopyButton variant="outline" value={message} copiedMessage={t("share.classMessage.copied")}>
            {t("share.classMessage.copyMessage")}
          </CopyButton>
          <Button type="button" variant="outline">
            {tUi("close")}
          </Button>
        </DynamicModalFooter>
      </DynamicModalContent>
    </DynamicModal>
  );
};

// StudentShareDialog + StudentShareContent for a student whose link is on, around a sogiasu.com link
export const StudentShareDialog = ({ open, studentKey, copied }: { readonly open: boolean; readonly studentKey: "ma" | "gh"; readonly copied: boolean }) => {
  const t = useTranslations("report");
  const url = reportUrl(studentKey);

  return (
    <DynamicModal open={open}>
      <DynamicModalContent data-student-share>
        <DynamicModalHeader>
          <DynamicModalTitle className="flex items-center gap-2">
            {t("share.dialogTitle")}
            <Badge variant="success">{t("share.sharingBadge")}</Badge>
          </DynamicModalTitle>
          <DynamicModalDescription>{t("share.description")}</DynamicModalDescription>
        </DynamicModalHeader>
        <div className="flex-1 space-y-5 overflow-y-auto">
          <ul className="list-disc space-y-1.5 pl-5 text-base leading-relaxed text-muted-foreground">
            <li>{t("share.points.own")}</li>
            <li data-point-sees>{t("share.points.sees")}</li>
            <li>{t("share.points.off")}</li>
          </ul>
          <div className="space-y-1.5 pb-4" data-link>
            <Label>{t("share.linkLabel")}</Label>
            <div className="flex gap-2">
              <Input readOnly value={url} className="text-base" />
              <Button type="button" className="shrink-0" data-copy-link>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {t("share.copyLink")}
              </Button>
            </div>
          </div>
        </div>
        <DynamicModalFooter>
          <Button asChild variant="outline">
            <a href={url}>
              <ExternalLink className="h-4 w-4" />
              {t("share.preview")}
            </a>
          </Button>
          <Button type="button" variant="destructive" data-stop-share>
            <EyeOff className="h-4 w-4" />
            {t("share.stopShare")}
          </Button>
        </DynamicModalFooter>
      </DynamicModalContent>
    </DynamicModal>
  );
};
