// the demo account (docs/demo-seed/RESULT-2026-10-02-thu-huong.md): 10 classes, 16 students, prices, timetable
export type DemoStudent = { id: string; name: string; price: number };
export type DemoClass = {
  id: string;
  name: string;
  color: string;
  billing: "PER_SESSION" | "PER_HOUR" | "PER_COURSE";
  students: DemoStudent[];
  online: boolean;
  location?: string;
  start: string;
  end: string;
  // 0 = Monday
  days: number[];
};

const st = (id: string, name: string, price: number): DemoStudent => ({
  id: `demo-student-${id}`,
  name,
  price,
});

export const CLASSES: DemoClass[] = [
  {
    id: "demo-class-mit",
    name: "Mít – Starters",
    color: "#f6bf26",
    billing: "PER_SESSION",
    students: [st("mit", "Mít", 120_000)],
    online: true,
    start: "14:00",
    end: "15:30",
    days: [0, 2],
  },
  {
    id: "demo-class-em-bao",
    name: "Em Bảo – Movers",
    color: "#33b679",
    billing: "PER_SESSION",
    students: [st("em-bao", "Em Bảo", 120_000)],
    online: true,
    start: "14:30",
    end: "16:00",
    days: [1, 4],
  },
  {
    id: "demo-class-pre-starters",
    name: "Nhóm Pre-Starters",
    color: "#f06292",
    billing: "PER_SESSION",
    students: [
      st("bo", "Bơ", 80_000),
      st("su", "Su", 80_000),
      st("na", "Na", 70_000),
    ],
    online: false,
    location: "Nhà cô giáo",
    start: "09:00",
    end: "10:30",
    days: [5, 6],
  },
  {
    id: "demo-class-cun",
    name: "Cún – Giao tiếp",
    color: "#ff7043",
    billing: "PER_SESSION",
    students: [st("cun", "Cún", 120_000)],
    online: false,
    location: "Nhà bé Cún",
    start: "17:30",
    end: "19:00",
    days: [2, 6],
  },
  {
    id: "demo-class-gia-han",
    name: "Gia Hân – Ôn thi vào 10",
    color: "#10b981",
    billing: "PER_SESSION",
    students: [st("gia-han", "Gia Hân", 150_000)],
    online: false,
    location: "Nhà em Gia Hân",
    start: "16:00",
    end: "18:00",
    days: [0, 5],
  },
  {
    id: "demo-class-ielts-teens",
    name: "IELTS Teens 5.5",
    color: "#039be5",
    billing: "PER_SESSION",
    students: [
      st("minh-quan", "Minh Quân", 180_000),
      st("thao-vy", "Thảo Vy", 180_000),
    ],
    online: true,
    start: "19:30",
    end: "21:30",
    days: [2, 5],
  },
  {
    id: "demo-class-ielts-65",
    name: "IELTS 6.5 nhóm tối",
    color: "#3f51b5",
    billing: "PER_SESSION",
    students: [
      st("hoang-anh", "Nguyễn Hoàng Anh", 220_000),
      st("quynh-chi", "Trần Quỳnh Chi", 220_000),
      st("duc-thang", "Lê Đức Thắng", 220_000),
      st("ngoc-diep", "Phạm Ngọc Diệp", 200_000),
    ],
    online: true,
    start: "19:30",
    end: "21:30",
    days: [0, 3],
  },
  {
    id: "demo-class-speaking",
    name: "IELTS Speaking 1-1",
    color: "#00897b",
    billing: "PER_HOUR",
    students: [st("khanh-linh", "Đỗ Khánh Linh", 250_000)],
    online: true,
    start: "10:00",
    end: "11:30",
    days: [0, 3],
  },
  {
    id: "demo-class-office",
    name: "Giao tiếp công sở",
    color: "#546e7a",
    billing: "PER_SESSION",
    students: [st("tuan-kiet", "Vũ Tuấn Kiệt", 220_000)],
    online: true,
    start: "20:00",
    end: "22:00",
    days: [1, 4],
  },
  {
    id: "demo-class-foundation",
    name: "IELTS Foundation (khóa tháng)",
    color: "#e67c73",
    billing: "PER_COURSE",
    students: [st("thu-trang", "Bùi Thu Trang", 2_500_000)],
    online: true,
    start: "09:30",
    end: "11:30",
    days: [1, 4],
  },
];

// September exceptions from the seed: cancelled lessons by day → class, absences by student → day
const CANCELLED: Record<number, string> = {
  12: "demo-class-gia-han",
  14: "demo-class-speaking",
  16: "demo-class-mit",
  20: "demo-class-cun",
  23: "demo-class-ielts-teens",
};

type Absence = { status: "EXCUSED" | "ABSENT"; reason: string | null };
const ABSENCES: Record<string, Record<number, Absence>> = {
  "Gia Hân": {
    19: {
      status: "EXCUSED",
      reason: "Em có lịch thi thử ở trường, xin nghỉ trước",
    },
    28: {
      status: "ABSENT",
      reason: "Em báo muộn sau giờ học, chưa sắp xếp được buổi bù",
    },
  },
  "Em Bảo": {
    11: { status: "EXCUSED", reason: "Bé bị sốt, gia đình xin nghỉ" },
    22: { status: "ABSENT", reason: "Gia đình quên lịch học, không báo trước" },
  },
  Mít: { 14: { status: "EXCUSED", reason: null } },
  Su: { 12: { status: "EXCUSED", reason: null } },
  Bơ: { 27: { status: "EXCUSED", reason: null } },
  Cún: { 16: { status: "EXCUSED", reason: null } },
  "Minh Quân": { 9: { status: "EXCUSED", reason: "Em có lịch thi ở trường" } },
  "Trần Quỳnh Chi": { 17: { status: "EXCUSED", reason: null } },
  "Đỗ Khánh Linh": { 21: { status: "EXCUSED", reason: null } },
  "Bùi Thu Trang": { 18: { status: "EXCUSED", reason: null } },
  Na: { 20: { status: "ABSENT", reason: null } },
  "Thảo Vy": { 19: { status: "ABSENT", reason: null } },
  "Nguyễn Hoàng Anh": { 14: { status: "ABSENT", reason: null } },
  "Phạm Ngọc Diệp": { 24: { status: "ABSENT", reason: null } },
  "Vũ Tuấn Kiệt": { 22: { status: "ABSENT", reason: null } },
};

const iso = (date: string, hhmm: string) =>
  new Date(`${date}T${hhmm}:00+07:00`).toISOString();

export type SeptLesson = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  cancelled: boolean;
};

// 01/09 is a Tuesday; 02/09 (Quốc khánh) has no lessons
export const septemberLessons = (c: DemoClass): SeptLesson[] =>
  Array.from({ length: 30 }, (_, i) => i + 1)
    .filter((d) => d !== 2 && c.days.includes(d % 7))
    .map((d) => {
      const date = `2026-09-${String(d).padStart(2, "0")}`;
      return {
        id: `${c.id}-${date}`,
        date,
        startTime: iso(date, c.start),
        endTime: iso(date, c.end),
        cancelled: CANCELLED[d] === c.id,
      };
    });

export const absenceOn = (student: string, date: string): Absence | null =>
  ABSENCES[student]?.[Number(date.slice(8))] ?? null;

export const hoursOf = (c: DemoClass) => {
  const [sh, sm] = c.start.split(":").map(Number);
  const [eh, em] = c.end.split(":").map(Number);
  return (eh * 60 + em - sh * 60 - sm) / 60;
};
