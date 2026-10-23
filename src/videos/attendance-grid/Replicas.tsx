import { useTranslations } from "next-intl";
import type { AttendanceStatus } from "@prisma/client";
import CellMark, { TOKENS } from "@/features/attendance/components/MonthlyAttendanceGrid/CellMark";
import { attendanceStatusKey } from "@/features/attendance/lib/labels";
import { Button } from "@/shared/components/ui/button";
import {
  DynamicModal,
  DynamicModalContent,
  DynamicModalDescription,
  DynamicModalFooter,
  DynamicModalHeader,
  DynamicModalTitle,
} from "@/shared/components/ui/DynamicModal";
import { Textarea } from "@/shared/components/ui/textarea";
import { useFormatters } from "@/shared/hooks/use-formatters";
import { messages } from "@/shared/i18n/messages.generated";
import { cn } from "@/shared/lib/utils";
import type { Box } from "../../shared/tutorial/AppScreen";

const MARKED_PREFIX = messages.vi.attendance.toast.marked.split("<status>")[0];
const OPTIONS: AttendanceStatus[] = ["PRESENT", "EXCUSED", "ABSENT"];

// GridCell's status menu (a DropdownMenu at this width), hung under the tapped cell, kept on screen as radix does
export const StatusMenu = ({ cell, student, date }: { readonly cell: Box; readonly student: string; readonly date: Date }) => {
  const t = useTranslations("attendance");
  const { formatDate } = useFormatters();
  return (
    <div
      data-status-menu
      className="fixed z-50 min-w-44 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      style={{ top: cell.y + cell.h + 4, left: Math.max(8, cell.x + cell.w - 266) }}
    >
      <div className="max-w-64 truncate px-2 py-1.5 text-sm font-medium">{`${student} - ${formatDate(date, "long")}`}</div>
      <div className="-mx-1 my-1 h-px bg-border" />
      {OPTIONS.map((option) => (
        <div key={option} data-option={option} className="relative flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm">
          <span className={cn("inline-flex size-6 shrink-0 items-center justify-center rounded-md", TOKENS[option].fill)}>
            <CellMark kind={option} />
          </span>
          {t(attendanceStatusKey(option))}
        </div>
      ))}
    </div>
  );
};

// AbsenceReasonDialog's markup around the reason the frame has typed
export const ReasonDialog = ({ open, student, date, reason }: { readonly open: boolean; readonly student: string; readonly date: Date; readonly reason: string }) => {
  const t = useTranslations("attendance");
  const tUi = useTranslations("ui");
  const { formatDate } = useFormatters();
  return (
    <DynamicModal open={open}>
      <DynamicModalContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()} data-reason-dialog>
        <form className="flex flex-1 flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <DynamicModalHeader>
            <DynamicModalTitle>{t("grid.reasonDialog.absentTitle", { student })}</DynamicModalTitle>
            <DynamicModalDescription>{formatDate(date, "long")}</DynamicModalDescription>
          </DynamicModalHeader>
          <div className="grid gap-2">
            <label className="flex items-center gap-2 text-sm leading-none font-medium select-none">{t("grid.reasonDialog.reasonLabel")}</label>
            <Textarea rows={3} placeholder={t("grid.reasonDialog.reasonPlaceholder")} value={reason} readOnly data-reason />
          </div>
          <DynamicModalFooter>
            <Button type="button" variant="outline">
              {tUi("cancel")}
            </Button>
            <Button type="submit" variant="destructive" data-save>
              {t(attendanceStatusKey("ABSENT"))}
            </Button>
          </DynamicModalFooter>
        </form>
      </DynamicModalContent>
    </DynamicModal>
  );
};

// the app's plain sonner toast for a marked cell, slid in by `enter`
export const MarkedToast = ({
  enter,
  student,
  start,
  end,
  className,
  classColor,
  reason,
}: {
  readonly enter: number;
  readonly student: string;
  readonly start: Date;
  readonly end: Date;
  readonly className: string;
  readonly classColor: string;
  readonly reason: string;
}) => {
  const t = useTranslations("attendance");
  const { formatDate, formatTime } = useFormatters();
  const lessonLine = `${formatTime(start)} - ${formatTime(end)} · ${formatDate(start, "long")}`;
  return (
    <div
      className="fixed inset-x-4 top-4 z-[100] flex flex-col gap-1 rounded-md border bg-popover p-4 text-popover-foreground shadow-xl"
      style={{ opacity: enter, translate: `0px ${(enter - 1) * 60}px` }}
    >
      <div className="text-base font-medium">
        {MARKED_PREFIX}
        <span className={cn("font-medium", TOKENS.ABSENT.glyph)}>{t(attendanceStatusKey("ABSENT"))}</span>
      </div>
      <div className="flex flex-col gap-0.5 text-sm">
        <span>
          <span className="text-muted-foreground">{t("toast.studentLabel")}:</span> <span className="font-medium">{student}</span>
        </span>
        <span>
          <span className="text-muted-foreground">{t("toast.lessonLabel")}:</span> {lessonLine}
        </span>
        <span className="flex items-center gap-1">
          <span className="text-muted-foreground">{t("toast.classLabel")}:</span>
          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: classColor }} />
          <span>{className}</span>
        </span>
        <span>
          <span className="text-muted-foreground">{t("ui.reasonLabel")}:</span> {reason}
        </span>
      </div>
    </div>
  );
};
