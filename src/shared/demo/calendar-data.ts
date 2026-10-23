import type { CalendarLesson } from "@/features/calendar/types";
import { calendarKeys } from "@/features/calendar/hooks/calendar-keys";
import { DEMO_NOW } from "../app/frozen-clock";

// the demo account's weekly timetable (docs/demo-seed/RESULT-2026-10-02-thu-huong.md), colors from APP_COLORS
export type DemoClass = {
  name: string;
  color: string;
  students: number;
  online: boolean;
  location?: string;
  start: string;
  end: string;
  days: number[];
};

export const CLASSES: DemoClass[] = [
  { name: "Mít – Starters", color: "#f6bf26", students: 1, online: true, start: "14:00", end: "15:30", days: [0, 2] },
  { name: "Em Bảo – Movers", color: "#33b679", students: 1, online: true, start: "14:30", end: "16:00", days: [1, 4] },
  { name: "Nhóm Pre-Starters", color: "#f06292", students: 3, online: false, location: "Nhà cô giáo", start: "09:00", end: "10:30", days: [5, 6] },
  { name: "Cún – Giao tiếp", color: "#ff7043", students: 1, online: false, location: "Nhà bé Cún", start: "17:30", end: "19:00", days: [2, 6] },
  { name: "Gia Hân – Ôn thi vào 10", color: "#10b981", students: 1, online: false, location: "Nhà em Gia Hân", start: "16:00", end: "18:00", days: [0, 5] },
  { name: "IELTS Teens 5.5", color: "#039be5", students: 2, online: true, start: "19:30", end: "21:30", days: [2, 5] },
  { name: "IELTS 6.5 nhóm tối", color: "#3f51b5", students: 4, online: true, start: "19:30", end: "21:30", days: [0, 3] },
  { name: "IELTS Speaking 1-1", color: "#00897b", students: 1, online: true, start: "10:00", end: "11:30", days: [0, 3] },
  { name: "Giao tiếp công sở", color: "#546e7a", students: 1, online: true, start: "20:00", end: "22:00", days: [1, 4] },
  { name: "IELTS Foundation (khóa tháng)", color: "#e67c73", students: 1, online: true, start: "09:30", end: "11:30", days: [1, 4] },
];

export const WEEK_START = "2026-10-05";
export const WEEK_END = "2026-10-12";

const at = (day: number, hhmm: string) => new Date(`2026-10-${String(5 + day).padStart(2, "0")}T${hhmm}:00+07:00`);

export const calendarLessons = (): CalendarLesson[] =>
  CLASSES.flatMap((c, ci) =>
    c.days.map((day) => {
      const start = at(day, c.start);
      const end = at(day, c.end);
      const done = end.getTime() < DEMO_NOW;
      return {
        id: `demo-${ci}-${day}`,
        date: start.toISOString().slice(0, 10),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        status: done ? "COMPLETED" : "SCHEDULED",
        isOnline: c.online,
        location: c.location ?? null,
        meetLink: c.online ? "https://meet.google.com/abc-defg-hij" : null,
        synced: true,
        studentCount: c.students,
        presentCount: done ? c.students : 0,
        absentCount: 0,
        excusedCount: 0,
        noStudents: false,
        className: c.name,
        classColor: c.color,
        matchedStudentIds: [],
      };
    }),
  );

export const calendarKey = calendarKeys.list({ start: WEEK_START, end: WEEK_END, classIds: [], studentIds: [] });
