import { useLayoutEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import viLocale from "@fullcalendar/core/locales/vi";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { continueRender, delayRender } from "remotion";
import { Card, CardContent } from "@/shared/components/ui/card";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import RefreshButton from "@/shared/components/RefreshButton";
import DashboardHeader from "@/shared/components/layouts/dashboard/header";
import DashboardMain from "@/shared/components/layouts/dashboard/main";
import PageHeader from "@/shared/components/layouts/dashboard/PageHeader";
import { LOCAL_STORAGE_KEYS } from "@/shared/constants/local-storage";
import CreateLessonDialog from "@/features/lesson/components/CreateLessonDialog";
import LessonDetailDialog from "@/features/lesson/components/LessonDetailDialog";
import CalendarEventCard from "@/features/calendar/components/CalendarEventCard";
import ScheduleShareButton from "@/features/calendar/components/ScheduleShareButton";
import CalendarToolbar, {
  type ViewType,
} from "@/features/calendar/components/CalendarView/CalendarToolbar";
import {
  toSlotTimes,
  type ViewWindow,
} from "@/features/calendar/lib/view-window";
import type { CalendarFilterValue } from "@/features/calendar/lib/calendar-filter";
import type { CalendarLesson } from "@/features/calendar/types";
import "@/features/calendar/components/fullcalendar-shadcn.css";

const HH_MM = { hour: "2-digit", minute: "2-digit", hour12: false } as const;

const toEvents = (lessons: CalendarLesson[]) =>
  lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.className,
    start: lesson.startTime ?? lesson.date,
    end: lesson.endTime ?? undefined,
    extendedProps: {
      status: lesson.status,
      isOnline: lesson.isOnline,
      location: lesson.location,
      meetLink: lesson.meetLink,
      synced: lesson.synced,
      studentCount: lesson.studentCount,
      presentCount: lesson.presentCount,
      absentCount: lesson.absentCount,
      excusedCount: lesson.excusedCount,
      noStudents: lesson.noStudents,
      className: lesson.className,
      startTime: lesson.startTime,
    },
    backgroundColor: lesson.classColor,
  }));

export type CreateSlot = {
  date: string;
  startTime: string;
  endTime: string;
} | null;

// the window the app keeps in localStorage, which the share dialog reads on its own
const syncWindow = (w: ViewWindow) => {
  const key = LOCAL_STORAGE_KEYS.calendarViewWindow;
  const next = JSON.stringify(w);
  if (window.localStorage.getItem(key) === next) return;
  window.localStorage.setItem(key, next);
  window.dispatchEvent(new Event(`local-storage:${key}`));
};

// CalendarView's own layout and FullCalendar setup, with everything its state would hold handed in by the
// scene: which view and date, the hour window, the class filter, an open lesson or new-lesson slot
export const CalendarScreen = ({
  lessons,
  view,
  date,
  viewWindow,
  filter,
  detailId = null,
  createSlot = null,
}: {
  readonly lessons: CalendarLesson[];
  readonly view: ViewType;
  readonly date: string;
  readonly viewWindow: ViewWindow;
  readonly filter: CalendarFilterValue;
  readonly detailId?: string | null;
  readonly createSlot?: CreateSlot;
}) => {
  const t = useTranslations("calendar");
  const calendarRef = useRef<FullCalendar | null>(null);
  const [anchor, setAnchor] = useState(date);
  const events = useMemo(() => toEvents(lessons), [lessons]);
  const { slotMinTime, slotMaxTime } = toSlotTimes(viewWindow);
  useLayoutEffect(() => syncWindow(viewWindow));

  // the view and date the frame asks for; FullCalendar redraws on its own clock, so hold the frame for it
  useLayoutEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    const shown = format(api.view.currentStart, "yyyy-MM-dd");
    if (api.view.type === view && shown === date) return;
    const handle = delayRender("calendar view");
    api.changeView(view, date);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => continueRender(handle)),
    );
  });

  return (
    <>
      <DashboardHeader>
        <PageHeader>{t("title")}</PageHeader>
      </DashboardHeader>
      <DashboardMain>
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 text-sm text-muted-foreground">
              {t("subtitle")}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <ScheduleShareButton
                visibleStart={anchor}
                filter={filter}
                defaultPeriod={view === "dayGridMonth" ? "month" : "week"}
              />
              <RefreshButton onClick={() => {}} loading={false} />
            </div>
          </div>
          <Card
            data-tour="calendar"
            className="mt-4 relative max-md:overflow-hidden max-md:pb-0"
          >
            <CardContent className="px-0 md:px-6">
              <div className="px-4 md:px-0">
                <CalendarToolbar
                  api={null}
                  view={view}
                  anchor={anchor}
                  viewWindow={viewWindow}
                  onViewWindowChange={() => {}}
                  filter={filter}
                  onFilterChange={() => {}}
                />
              </div>
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={view}
                initialDate={date}
                headerToolbar={false}
                locale={viLocale}
                firstDay={1}
                slotMinTime={slotMinTime}
                slotMaxTime={slotMaxTime}
                scrollTime={slotMinTime}
                slotDuration="01:00:00"
                allDaySlot={false}
                nowIndicator={true}
                events={events}
                eventDisplay="block"
                eventTimeFormat={HH_MM}
                slotLabelFormat={HH_MM}
                eventContent={(info) => <CalendarEventCard info={info} />}
                dayHeaderContent={(arg) =>
                  arg.view.type === "dayGridMonth" ? (
                    arg.text
                  ) : (
                    <span className="fc-dayhead-cell">
                      <span>
                        {arg.date.toLocaleDateString("vi", {
                          weekday: "short",
                        })}
                      </span>
                      <span className="fc-dayhead-date">
                        {arg.date.toLocaleDateString("vi", {
                          month: "numeric",
                          day: "numeric",
                        })}
                      </span>
                    </span>
                  )
                }
                views={{
                  threeDay: {
                    type: "timeGrid",
                    duration: { days: 3 },
                    buttonText: t("views.threeDay"),
                  },
                  dayGridMonth: { displayEventTime: false, dayMaxEventRows: 3 },
                }}
                datesSet={(info) =>
                  setAnchor(format(info.view.currentStart, "yyyy-MM-dd"))
                }
                height="auto"
                stickyHeaderDates={true}
              />
              <LessonDetailDialog
                lessonId={detailId}
                open={detailId !== null}
                onOpenChange={() => {}}
              />
              <CreateLessonDialog
                open={createSlot !== null}
                onOpenChange={() => {}}
                initialValues={createSlot ?? undefined}
              />
            </CardContent>
          </Card>
        </div>
      </DashboardMain>
      {/* a confirm asked from inside the lesson dialog has to sit above it, as it does in the app's own stacking */}
      <style>{`[data-slot=dialog-overlay]:has(+ [data-confirm-dialog]) { z-index: 60; } [data-confirm-dialog] { z-index: 61; }`}</style>
      <style>{`.animate-ping { display: none; }`}</style>
      <ConfirmDialog />
    </>
  );
};
