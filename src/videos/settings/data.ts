import { staticFile } from "remotion";
import type { StorageFileItem } from "@/features/storage/types";
import type { PlanOverview, PromoOffer } from "@/features/billing/types";
import { BYTES_PER_MB } from "@/shared/lib/utils";
import { CLASSES, septemberLessons } from "../../shared/demo/demo-school";
import { classesList } from "../../shared/demo/september-data";
import fixtures from "../../shared/demo/report-fixtures.json";
import { BANK } from "../fees/data";
import { TODAY_10 } from "../attendance-grid/data";

// tutorial 12: the demo account's own pages on Thu 12/11 afternoon, as tutorials 6-11
export { TODAY_10 as TODAY_12 };

// Gia Hân's 21/09 lesson: the one in the report fixtures carrying every kind of attachment
export const FILES_CLASS = CLASSES.find((c) => c.id === "demo-class-gia-han")!;
const SESSION = fixtures["2026-09"].sessions.find(
  (s) => s.date === "2026-09-21",
)!;
export const FILES_LESSON_ID = SESSION.lessonId;
export const FILES_MONTH = "2026-09";
const files = Object.values(SESSION.files)
  .flat()
  .map((f) => ({
    ...f,
    url: f.url.startsWith("demo/") ? staticFile(f.url) : f.url,
  })) as StorageFileItem[];
const ATTENDANCE_ID = files.find((f) => f.field === "studentNote")!.targetId;

const lessonsOf = (month: string) =>
  month === FILES_MONTH
    ? septemberLessons(FILES_CLASS)
        .filter((l) => !l.cancelled)
        .map((l) => ({
          id: l.date === SESSION.date ? FILES_LESSON_ID : l.id,
          date: l.date,
          startTime: l.startTime,
          endTime: l.endTime,
          status: "COMPLETED",
        }))
    : [];

const roster = {
  roster: [
    {
      id: ATTENDANCE_ID,
      studentId: FILES_CLASS.students[0].id,
      student: {
        fullName: FILES_CLASS.students[0].name,
        isShared: true,
        deletedAt: null,
      },
      status: "PRESENT",
      reason: null,
      studentNote: null,
      homeworkPercent: null,
      score: null,
      studentFee: null,
      departed: false,
    },
  ],
  excludedByJoinDateCount: 0,
};

const storageFiles = (url: string) => {
  const q = new URL(url, "http://x").searchParams;
  return q.get("targetType") === "ATTENDANCE"
    ? files.filter((f) => f.field === "studentNote")
    : files.filter((f) => f.field !== "studentNote");
};

// a Pro trial running to the end of November: 16 students fit, and the page offers to renew
const OVERVIEW: PlanOverview = {
  plan: "PRO",
  reason: "TRIAL",
  source: "TRIAL",
  isActive: true,
  validUntil: "2026-11-30T16:59:59.000Z",
  giftUntil: "2026-11-30T16:59:59.000Z",
  signupAt: "2026-08-28T02:00:00.000Z",
  usage: {
    student: { used: 16, limit: null },
    storageMb: {
      used: Math.round(38.6 * BYTES_PER_MB),
      limit: 5120 * BYTES_PER_MB,
    },
    driveAccounts: { used: 1, limit: null },
  },
  qrTemplateIds: null,
};

export const PROMO_CODE = "NHA_GIAO_VN_20_11";
const PROMO: PromoOffer = {
  code: PROMO_CODE,
  description: "Chào mừng ngày Nhà giáo Việt Nam 20/11",
  value: 20,
  maxDiscount: 50_000,
  validFrom: "2026-11-01T00:00:00.000+07:00",
  validUntil: "2026-11-20T23:59:59.000+07:00",
  eligible: true,
  reason: null,
};
const PRICE = { QUARTER: 179_000, YEAR: 499_000 } as const;
const promoPreview = (init?: RequestInit) => {
  const { period } = JSON.parse(String(init?.body ?? "{}")) as {
    period: keyof typeof PRICE;
  };
  const originalAmount = PRICE[period] ?? PRICE.QUARTER;
  const off = Math.min(
    Math.round((originalAmount * PROMO.value) / 100),
    PROMO.maxDiscount,
  );
  return {
    code: PROMO.code,
    description: PROMO.description,
    value: PROMO.value,
    maxDiscount: PROMO.maxDiscount,
    originalAmount,
    discountedAmount: originalAmount - off,
  };
};

const ok = (data: unknown) => ({ success: true, data });

export const SETTINGS_API = {
  "/api/classes?": () => ok(classesList()),
  "/api/lessons/months/": (url: string) =>
    ok(lessonsOf(new URL(url, "http://x").pathname.split("/").pop()!)),
  "/api/lessons/months?": () => ok(["2026-11", "2026-10", FILES_MONTH]),
  [`/api/lessons/${FILES_LESSON_ID}/attendance`]: () => ok(roster),
  "/api/storage?": (url: string) => ok(storageFiles(url)),
  "/api/billing/overview": () => ok(OVERVIEW),
  "/api/billing/promo/validate": (_: string, init?: RequestInit) =>
    ok(promoPreview(init)),
  "/api/billing/promo": () => ok([PROMO]),
  "/api/billing/transactions": () => ({
    success: true,
    data: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    origin: { reason: OVERVIEW.reason, signupAt: OVERVIEW.signupAt, giftUntil: OVERVIEW.giftUntil, isActive: true },
  }),
  "/api/profile": () =>
    ok({
      id: "demo-user",
      name: "Nguyễn Thu Hương",
      email: "huong@sogiasu.com",
      image: null,
      loginMethods: ["google"],
      createdAt: "2026-08-28T02:00:00.000Z",
    }),
  "/api/auth/password": () => ok({ hasPassword: false }),
  "/api/bank-account": () => ok(BANK),
  "/api/auth/google/calendar/connection": () =>
    ok({
      connected: true,
      provider: "google",
      account: "huong@sogiasu.com",
      hasCalendarScope: true,
      hasMeetScope: true,
    }),
  "/api/auth/google/calendar/profile": () =>
    ok({ email: "huong@sogiasu.com", name: "Nguyễn Thu Hương", picture: null }),
  "/api/auth/google/drive/accounts": () =>
    ok([
      {
        providerAccountId: "demo-drive",
        email: "huong@sogiasu.com",
        name: "Nguyễn Thu Hương",
        picture: null,
        scopes: ["https://www.googleapis.com/auth/drive.file"],
        hasDriveScope: true,
        status: "ok",
      },
    ]),
};
