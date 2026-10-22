import {
  CheckCheck,
  CircleDollarSign,
  ClipboardList,
  Info,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import type { Lesson } from "@prisma/client";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { Form } from "@/shared/components/ui/form";
import RefreshButton from "@/shared/components/RefreshButton";
import DashboardHeader from "@/shared/components/layouts/dashboard/header";
import DashboardMain from "@/shared/components/layouts/dashboard/main";
import PageHeader from "@/shared/components/layouts/dashboard/PageHeader";
import { cn, formatCurrency } from "@/shared/lib/utils";
import LessonDetailHeader from "@/features/lesson/components/LessonDetailContent/LessonDetailHeader";
import LessonStatusBanner from "@/features/lesson/components/LessonDetailContent/LessonStatusBanner";
import LessonNotesCard from "@/features/lesson/components/LessonDetailContent/LessonNotesCard";
import PreviousLessonNotes from "@/features/lesson/components/LessonDetailContent/PreviousLessonNotes";
import AttachmentsField from "@/features/attendance/components/AttendanceStudentRow/AttachmentsField";
import AttendanceStudentHeader from "@/features/attendance/components/AttendanceStudentRow/AttendanceStudentHeader";
import HomeworkField from "@/features/attendance/components/AttendanceStudentRow/HomeworkField";
import ReasonField from "@/features/attendance/components/AttendanceStudentRow/ReasonField";
import ScoreField from "@/features/attendance/components/AttendanceStudentRow/ScoreField";
import StatusField from "@/features/attendance/components/AttendanceStudentRow/StatusField";
import StudentNoteField from "@/features/attendance/components/AttendanceStudentRow/StudentNoteField";
import { attendanceStatusKey } from "@/features/attendance/lib/labels";
import {
  QUICK_NOTE_IDS,
  quickNoteTextKey,
} from "@/features/attendance/lib/quick-notes";
import type { RosterItem } from "@/features/attendance/types";
import type { StorageFileItem } from "@/features/storage/types";
import {
  attendanceFiles,
  type DetailState,
  LESSON_ID,
  lessonAt,
  type Row,
  rosterAt,
} from "./data";

const STATS = [
  { key: "PRESENT" as const, charged: true, color: "text-success" },
  { key: "ABSENT" as const, charged: true, color: "text-destructive" },
  { key: "EXCUSED" as const, charged: false, color: "text-warning" },
];

// AttendanceStudentRow's markup around a form the scene owns, so each frame sets exactly what the row holds
const DrivenRow = ({
  roster,
  lesson,
  index,
  files,
  form,
}: {
  readonly roster: RosterItem;
  readonly lesson: Lesson;
  readonly index: number;
  readonly files: StorageFileItem[];
  readonly form: UseFormReturn<Row>;
}) => {
  const t = useTranslations("attendance");
  const tUi = useTranslations("ui");
  const saved: Row = {
    status: roster.status ?? "PRESENT",
    reason: roster.reason,
    studentNote: roster.studentNote,
    homeworkPercent: roster.homeworkPercent,
    score: roster.score,
  };
  const values = form.watch();
  const dirty =
    values.reason !== saved.reason ||
    values.studentNote !== saved.studentNote ||
    values.homeworkPercent !== saved.homeworkPercent ||
    values.score !== saved.score;
  const quickNotes =
    values.status === "PRESENT"
      ? QUICK_NOTE_IDS.map((id) => ({ id, text: t(quickNoteTextKey(id)) }))
      : undefined;

  return (
    <Form {...form}>
      <div data-row={index} className="flex flex-col gap-4 px-4 py-3.5 md:px-6">
        <AttendanceStudentHeader
          roster={roster}
          lesson={lesson}
          index={index}
          dirty={dirty}
        />
        <StatusField control={form.control} onChange={() => {}} />
        {values.status !== "PRESENT" && <ReasonField control={form.control} />}
        {values.status === "PRESENT" && (
          <>
            <HomeworkField control={form.control} />
            <ScoreField control={form.control} />
          </>
        )}
        <StudentNoteField control={form.control} quickFill={quickNotes} />
        <AttachmentsField
          lessonId={lesson.id}
          studentId={roster.studentId}
          files={files}
        />
        <div className="flex items-center justify-end gap-3">
          {dirty && (
            <Button type="button" variant="outline" size="sm">
              {t("ui.discard")}
            </Button>
          )}
          <Button type="button" size="sm" disabled={!dirty} data-save>
            {tUi("save")}
          </Button>
        </div>
      </div>
    </Form>
  );
};

// LessonAttendanceCard + AttendanceList, with the rows driven by the scene
const AttendanceCard = ({
  state,
  lesson,
  forms,
}: {
  readonly state: DetailState;
  readonly lesson: Lesson;
  readonly forms: UseFormReturn<Row>[];
}) => {
  const t = useTranslations("lesson");
  const tA = useTranslations("attendance");
  const tUi = useTranslations("ui");
  const rosters = rosterAt(state).roster;
  const files = attendanceFiles(state);
  const counts = { PRESENT: 0, ABSENT: 0, EXCUSED: 0 };
  rosters.forEach((r) => {
    counts[r.status ?? "PRESENT"] += 1;
  });
  const feeTotal = rosters.reduce(
    (sum, r) => sum + (r.studentFee?.amount ?? 0),
    0,
  );

  return (
    <Card className="gap-3" data-tour="lesson-attendance">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardList className="h-5 w-5 text-primary" />
          {t("attendanceCard.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="info">
          <Info />
          <AlertTitle>{tUi("alert.info")}</AlertTitle>
          <AlertDescription>
            <ul className="list-disc space-y-1 pl-4">
              <li>{t("attendanceCard.points.afterComplete")}</li>
              <li>{t("attendanceCard.points.shareButton")}</li>
              <li>{t("attendanceCard.points.visibility")}</li>
            </ul>
          </AlertDescription>
        </Alert>
        <div className="space-y-4">
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={counts.PRESENT === rosters.length}
            >
              <CheckCheck className="h-4 w-4" />
              {tA("ui.markAllPresent")}
            </Button>
            <RefreshButton onClick={() => {}} loading={false} size="icon-sm" />
          </div>
          <div className="rounded-lg border bg-card" data-stats>
            <div className="grid grid-cols-3 divide-x">
              {STATS.map((s) => (
                <div key={s.key} className="px-2 py-3 text-center">
                  <div
                    className={cn("text-3xl font-bold leading-none", s.color)}
                  >
                    {counts[s.key]}
                  </div>
                  <div className="mt-1.5 text-base font-medium">
                    {tA(attendanceStatusKey(s.key))}
                  </div>
                  <div
                    className={cn(
                      "mt-1 flex items-center justify-center gap-1 text-[11px]",
                      s.charged ? "text-muted-foreground" : "text-warning",
                    )}
                  >
                    <CircleDollarSign className="h-3 w-3" />
                    {s.charged ? tA("fee.charged") : tA("fee.notCharged")}
                  </div>
                </div>
              ))}
            </div>
            {feeTotal > 0 && (
              <div className="flex items-center justify-between border-t px-4 py-2.5">
                <span className="flex items-center gap-1.5 text-base font-medium">
                  <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                  {tA("ui.studentFee")}
                </span>
                <span className="text-base font-bold tabular-nums">
                  {formatCurrency(feeTotal)}
                </span>
              </div>
            )}
          </div>
          <div className="-mx-4 divide-y border-t md:-mx-6">
            {rosters.map((roster, i) => (
              <DrivenRow
                key={roster.studentId}
                roster={roster}
                lesson={lesson}
                index={i}
                files={files.filter((f) => f.targetId === roster.id)}
                form={forms[i]}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// LessonDetailPage (app/dashboard/lessons/[id]) laid out as LessonDetailContent lays it out
export const DetailPage = ({
  state,
  forms,
}: {
  readonly state: DetailState;
  readonly forms: UseFormReturn<Row>[];
}) => {
  const t = useTranslations("lesson");
  const lesson = lessonAt(state);

  return (
    <>
      <DashboardHeader>
        <PageHeader backHref="/dashboard/calendar">
          {t("detail.title")}
        </PageHeader>
      </DashboardHeader>
      <DashboardMain>
        <div data-tour="lesson-detail" className="space-y-6">
          <LessonDetailHeader lessonId={LESSON_ID} />
          <LessonStatusBanner lesson={lesson} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <AttendanceCard state={state} lesson={lesson} forms={forms} />
            </div>
            <div className="space-y-6 lg:col-span-2">
              <PreviousLessonNotes lessonId={LESSON_ID} />
              <LessonNotesCard lesson={lesson} />
            </div>
          </div>
        </div>
        <div className="h-24" />
      </DashboardMain>
      <ConfirmDialog />
    </>
  );
};

