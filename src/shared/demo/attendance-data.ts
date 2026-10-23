import { AttendanceStatus, LessonStatus, type Lesson } from "@prisma/client";
import type { RosterItem, RosterResult } from "@/features/attendance/types";
import { attendanceKeys } from "@/features/attendance/hooks/attendance-keys";
import { storageKeys } from "@/features/storage/hooks/storage-keys";

// Gia Hân's 05/10 lesson as the demo account has it (public report /report/nguyen-thu-huong/gia-han)
export const LESSON_ID = "demo-lesson-gia-han-0510";
const ATTENDANCE_ID = "demo-attendance-gia-han-0510";
const STUDENT_ID = "demo-student-gia-han";

export const STUDENT_NOTE = "Nhớ cụm động từ tốt, cần luyện thêm cách dùng giới từ đi kèm.";

export const lesson = {
  id: LESSON_ID,
  classId: "demo-class-gia-han",
  userId: "demo-user",
  date: "2026-10-05",
  startTime: new Date("2026-10-05T09:00:00.000Z"),
  endTime: new Date("2026-10-05T11:00:00.000Z"),
  isOnline: false,
  location: "Nhà em Gia Hân",
  meetLink: null,
  linkSource: "NONE",
  googleCalendarEventId: null,
  status: LessonStatus.SCHEDULED,
  content: "Chữa lỗi đề thi thử, ôn cụm động từ thường gặp.",
  generalNote: "Em chủ động hỏi lại các câu sai.",
  nextPlan: "Luyện viết thư và đoạn văn nghị luận ngắn.",
  homework: "Làm đề số 4 và học 10 cụm động từ.",
  createdAt: new Date("2026-09-01T00:00:00.000Z"),
  updatedAt: new Date("2026-10-05T11:00:00.000Z"),
} as Lesson;

export type RowState = {
  status: AttendanceStatus | null;
  homeworkPercent: number | null;
  score: number | null;
  studentNote: string | null;
};

export const roster = (s: RowState): RosterResult => ({
  roster: [
    {
      id: s.status ? ATTENDANCE_ID : null,
      studentId: STUDENT_ID,
      student: { fullName: "Gia Hân", isShared: true, deletedAt: null },
      reason: null,
      studentFee: null,
      departed: false,
      ...s,
    } satisfies RosterItem,
  ],
  excludedByJoinDateCount: 0,
});

export const rosterKey = attendanceKeys.list({ lessonId: LESSON_ID });
export const filesKey = (s: RowState) =>
  storageKeys.list({
    targetType: "ATTENDANCE",
    ids: s.status ? [ATTENDANCE_ID] : [],
  });
