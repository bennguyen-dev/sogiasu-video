import { useLayoutEffect, useRef, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import type { QueryClient } from "@tanstack/react-query";
import { continueRender, delayRender, Interactive, interpolate, useCurrentFrame } from "remotion";
import { AttendanceStatus, LessonStatus } from "@prisma/client";
import { messages } from "@/shared/i18n/messages.generated";
import { useMockApi } from "../../../shared/app/AppProviders";
import { DEMO_NOW, useDemoNow } from "../../../shared/app/frozen-clock";
import { Sfx, typingCues } from "../../../shared/audio/sfx";
import { StepCaption } from "../../../shared/tutorial/StepCaption";
import { clamp, ease } from "../../../shared/motion";
import { colors } from "../../../shared/theme";
import {
  AppScreen,
  type Box,
  byText,
  center,
  Explain,
  newClient,
  pageBox,
  screenBox,
  SCREEN_H as SCREEN,
  scrollAt,
  SuccessToast,
  TapFinger,
  useClickState,
  useDriveForm,
  useFocus,
  useMeasure,
} from "../../../shared/tutorial/AppScreen";
import {
  attendanceFiles,
  CONTENT,
  DETAIL_API,
  type DetailState,
  detailCache,
  HOMEWORK,
  lessonAt,
  lessonFiles,
  QUICK_NOTES,
  REASON,
  type Row,
  rosterAt,
  UNMARKED,
} from "../data";
import { DetailPage } from "../DetailPage";

const AMBER = "#f59e0b";
const { vi } = messages;

// 1 · attendance
const BANNER = [8, 84] as const;
const STATUS_MA = [110, 176] as const;
const TAP_EXCUSED = 214;
const STATS = [246, 320] as const;
const TAP_REASON = 352;
const REASON_HINT = [388, 440] as const;
const TAP_SAVE_GH = 446;
// 2 · evaluation
const EVAL = 500;
const TAP_HW = 532;
const TAP_SCORE = 556;
const TAP_HALF = 576;
const SCORE_HINT = [584, 644] as const;
const NO_EVAL = [670, 732] as const;
const TAP_NOTE = 764;
const CHIPS = [772, 830] as const;
const TAP_CHIP_1 = 842;
const TAP_CHIP_2 = 866;
const PHOTO = 892;
const TAP_ATTACH = 918;
const DRIVE_HINT = [930, 990] as const;
const TAP_DROP = 1004;
const TILE_HINT = [1018, 1080] as const;
const UNSAVED_HINT = [1104, 1170] as const;
const TAP_SAVE_MA = 1202;
// 3 · lesson notes
const NOTES = 1260;
const MIC_HINT = [1284, 1340] as const;
const TAP_CONTENT = 1352;
const TAP_SAVE_CONTENT = 1394;
const TAP_HW_NOTE = 1420;
const TAP_SAVE_HW = 1460;
const TAP_ATTACH_HW = 1484;
const TAP_DROP_HW = 1514;
const SAMPLE_HINT = [1528, 1588] as const;
const OTHER_HINT = [1610, 1668] as const;
const CARD_HINT = [1676, 1736] as const;
// 4 · complete
const COMPLETE = 1740;
const DONE_HINT = [1766, 1846] as const;
const TAP_DONE = 1858;
const CONFIRM_HINT = [1868, 1928] as const;
const TAP_CONFIRM = 1940;
const FEE_MA = [1986, 2046] as const;
const FEE_GH = [2072, 2132] as const;
export const DETAIL_LENGTH = 2142;

const TYPE_DELAY = 6;
// characters typed per frame into a lesson note
const RATE = 1.5;

const typedAt = (frame: number, from: number, text: string) => text.slice(0, Math.max(0, Math.floor((frame - from) * RATE)));
const noteAt = (frame: number) =>
  frame >= TAP_CHIP_2 ? `${QUICK_NOTES[0]} ${QUICK_NOTES[1]}` : frame >= TAP_CHIP_1 ? QUICK_NOTES[0] : null;

// the whole screen at one frame: what the server holds, and what the two forms hold ahead of it
export const stateAt = (frame: number): DetailState => {
  const excused = frame >= TAP_EXCUSED;
  const ghStatus = excused ? AttendanceStatus.EXCUSED : AttendanceStatus.PRESENT;
  const ghReason = frame >= TAP_SAVE_GH ? REASON : null;
  const maForm: Row = {
    ...UNMARKED,
    homeworkPercent: frame >= TAP_HW ? 80 : null,
    score: frame >= TAP_HALF ? 6.5 : frame >= TAP_SCORE ? 6 : null,
    studentNote: noteAt(frame),
  };
  const maSaved = frame >= TAP_SAVE_MA;
  return {
    status: frame >= TAP_CONFIRM ? LessonStatus.COMPLETED : LessonStatus.SCHEDULED,
    content: frame >= TAP_SAVE_CONTENT ? CONTENT : null,
    homework: frame >= TAP_SAVE_HW ? HOMEWORK : null,
    // uploading a file for a student writes their attendance row, so the row (and its files) exists from then on
    ma: maSaved ? { ...maForm, marked: true } : { ...UNMARKED, marked: frame >= TAP_DROP },
    gh: { ...UNMARKED, status: ghStatus, reason: ghReason, marked: excused },
    maForm,
    ghForm: {
      ...UNMARKED,
      status: ghStatus,
      reason: frame >= TAP_SAVE_GH ? REASON : frame >= TAP_REASON + TYPE_DELAY ? typedAt(frame, TAP_REASON + TYPE_DELAY, REASON) || null : null,
    },
    essay: frame >= TAP_DROP,
    sample: frame >= TAP_DROP_HW,
  };
};

export const FINAL_STATE = stateAt(DETAIL_LENGTH);

// the app's own api answers for this lesson, from whatever the current frame holds
let live = FINAL_STATE;
const ok = (data: unknown) => ({ success: true, data });
const DETAIL_ROUTES = {
  ...DETAIL_API,
  "/api/lessons/new-class-0/attendance": () => ok(rosterAt(live)),
  "/api/lessons/new-class-0/previous-notes": () => ok(null),
  "/api/lessons/new-class-0": () => ok(lessonAt(live)),
  "/api/storage?": () => ok([...attendanceFiles(live), ...lessonFiles(live)]),
};

// push the frame's data into the query cache; react-query tells its subscribers a tick later, so hold the frame for it
export const useSeed = (client: QueryClient, state: DetailState) => {
  live = state;
  const key = JSON.stringify(state);
  useLayoutEffect(() => {
    const changed = detailCache(state).filter(([k, v]) => JSON.stringify(client.getQueryData(k)) !== JSON.stringify(v));
    if (changed.length === 0) return;
    changed.forEach(([k, v]) => client.setQueryData(k, v));
    const handle = delayRender("seed detail");
    setTimeout(() => requestAnimationFrame(() => continueRender(handle)), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
};

export const useDetailClient = (state: DetailState) => {
  const [client] = useState(() => {
    const c = newClient();
    detailCache(state).forEach(([k, v]) => c.setQueryData(k, v));
    return c;
  });
  return client;
};

export const useRowForms = (state: DetailState): UseFormReturn<Row>[] => {
  const ma = useForm({ defaultValues: state.maForm });
  const gh = useForm({ defaultValues: state.ghForm });
  useDriveForm(ma, state.maForm);
  useDriveForm(gh, state.ghForm);
  return [ma, gh];
};

type Targets = {
  banner: Box;
  done: Box | null;
  stats: Box;
  row0: Box;
  row1: Box;
  seg0: Box;
  excused1: Box;
  reason1: Box | null;
  save1: Box;
  hw80: Box | null;
  score6: Box | null;
  half: Box | null;
  scoreField: Box | null;
  note0: Box;
  chips: Box | null;
  attach0: Box;
  tile0: Box | null;
  unsaved0: Box | null;
  save0: Box;
  fee0: Box | null;
  header1: Box;
  notesCard: Box;
  notesTitle: Box;
  mic0: Box | null;
  composers: Box[];
  bodies: Box[];
  saveNote: Box | null;
  attachHw: Box | null;
  sample: Box | null;
  dialogDrive: Box | null;
  dropzone: Box | null;
  confirm: Box | null;
  confirmBody: Box | null;
};

const rowOf = (root: ParentNode, i: number) => root.querySelector<HTMLElement>(`[data-row="${i}"]`);
const composersOf = (root: ParentNode) => [...(root.querySelector("[data-tour=lesson-notes]")?.querySelectorAll<HTMLElement>("[data-composer]") ?? [])];
const attachDialog = (doc: Document) =>
  [...doc.querySelectorAll<HTMLElement>("[data-slot=dialog-content]")].find((d) => d.textContent?.includes(vi.storage.attachModal.title));
const confirmDialog = (doc: Document) => doc.querySelector<HTMLElement>("[data-confirm-dialog]");

const measure = (page: HTMLElement): Targets | null => {
  const doc = page.ownerDocument;
  const row0 = rowOf(page, 0);
  const row1 = rowOf(page, 1);
  const done = byText(page, "button", vi.lesson.banner.markDone);
  const banner = page.querySelector("[data-slot=alert]");
  const notesCard = page.querySelector("[data-tour=lesson-notes]");
  const composers = composersOf(page);
  if (!row0 || !row1 || !banner || !notesCard || composers.length < 4) return null;
  const pb = (el: Element | null | undefined) => pageBox(page, el);
  const scoreLabel = byText(row0, "label", vi.attendance.ui.scoreLabel);
  const chipButtons = [...row0.querySelectorAll(".group button")].filter((b) => (b as HTMLElement).offsetWidth > 0 && b.textContent?.trim());
  const tile = row0.querySelector("img");
  const editing = composers.find((c) => c.querySelector("textarea"));
  const dialog = attachDialog(doc);
  const confirmEl = confirmDialog(doc);
  const box = {
    banner: pb(banner),
    done: pb(done),
    stats: pb(page.querySelector("[data-stats]")),
    row0: pb(row0),
    row1: pb(row1),
    seg0: pb(row0.children[1]),
    excused1: pb(byText(row1, "button", vi.attendance.status.EXCUSED)),
    reason1: pb(row1.querySelector("input")),
    save1: pb(row1.querySelector("[data-save]")),
    hw80: pb(byText(row0, "button", "80%")),
    score6: pb(byText(row0, "button", "6")) ?? pb(byText(row0, "button", "6,5")),
    half: pb(byText(row0, "button", "+0.5")),
    scoreField: scoreLabel ? pb(scoreLabel.parentElement) : null,
    note0: pb(row0.querySelector("textarea")?.closest(".group")),
    chips: chipButtons.length ? pb(chipButtons[0].parentElement) : null,
    attach0: pb(byText(row0, "button", vi.storage.attach)),
    tile0: pb(tile?.closest("button, div")),
    unsaved0: pb(byText(row0, "[data-slot=badge]", vi.attendance.ui.unsaved)),
    save0: pb(row0.querySelector("[data-save]")),
    fee0: pb([...row0.querySelectorAll("span")].find((s) => /^300\.000/.test(s.textContent?.trim() ?? ""))),
    header1: pb(row1.children[0]),
    notesCard: pb(notesCard),
    notesTitle: pb(notesCard.querySelector("[data-slot=card-header]")),
    mic0: pb(composers[0].querySelector(".absolute.right-3")),
    composers: composers.map((c) => pb(c)!),
    bodies: composers.map((c) => pb(c.querySelector("button"))!),
    saveNote: pb(editing ? byText(editing, "button", vi.ui.save) : null),
    attachHw: pb(byText(composers[1], "button", vi.storage.attach)),
    sample: pb([...composers[1].querySelectorAll("a, div")].find((el) => el.textContent?.trim().startsWith("task2-sample-essay.pdf"))),
    dialogDrive: dialog ? screenBox(byText(dialog, "button", vi.storage.attachModal.tabDrive)) : null,
    dropzone: dialog ? screenBox(byText(dialog, "p", vi.ui.dropzone.label)?.parentElement) : null,
    confirm: confirmEl ? screenBox(byText(confirmEl, "button", vi.ui.confirm)) : null,
    confirmBody: confirmEl ? screenBox(confirmEl.querySelector("[data-slot=dialog-description]")) : null,
  };
  return box as Targets;
};


const DetailSceneInner = () => {
  useDemoNow(DEMO_NOW);
  useMockApi(DETAIL_ROUTES);
  const frame = useCurrentFrame();
  const pageRef = useRef<HTMLDivElement>(null);
  const state = stateAt(frame);
  const client = useDetailClient(state);
  useSeed(client, state);
  const forms = useRowForms(state);
  const t = useMeasure<Targets>(() => (pageRef.current ? measure(pageRef.current) : null));
  // a dialog opened by a click lands after this render: render once more so it gets measured
  const [, setRound] = useState(0);
  const settle = () => {
    const handle = delayRender("settle");
    setTimeout(() =>
      requestAnimationFrame(() => {
        setRound((r) => r + 1);
        requestAnimationFrame(() => continueRender(handle));
      }),
    );
  };
  const doc = pageRef.current?.ownerDocument;
  const page = pageRef.current;

  // the app's own dialogs and note editors, opened and closed by clicking them like the tutor would
  const attachWanted = (frame >= TAP_ATTACH && frame < TAP_DROP) || (frame >= TAP_ATTACH_HW && frame < TAP_DROP_HW);
  useClickState(
    attachWanted,
    () => (doc ? !!attachDialog(doc) : null),
    (want) => {
      if (!doc || !page) return;
      if (!want) {
        byText(attachDialog(doc) ?? doc, "button", vi.ui.close)?.click();
        return settle();
      }
      const host = frame < TAP_DROP ? rowOf(page, 0) : composersOf(page)[1];
      if (host) byText(host, "button", vi.storage.attach)?.click();
      // radix focuses a tab as the dialog opens, and a focused tab opens itself: hold on the upload one
      const handle = delayRender("upload tab");
      let tries = 0;
      const tick = () => {
        const tab = byText(attachDialog(doc) ?? doc, "button", vi.storage.attachModal.tabUpload);
        if (tab?.getAttribute("data-state") === "active" || ++tries > 120) {
          settle();
          return continueRender(handle);
        }
        tab?.focus();
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
  );
  const editAt = (i: number) => (i === 0 ? frame >= TAP_CONTENT && frame < TAP_SAVE_CONTENT : frame >= TAP_HW_NOTE && frame < TAP_SAVE_HW);
  [0, 1].forEach((i) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useClickState(
      editAt(i),
      () => (page ? !!composersOf(page)[i]?.querySelector("textarea") : null),
      (want) => {
        const c = page ? composersOf(page)[i] : null;
        if (!c) return;
        if (want) c.querySelector("button")?.click();
        else byText(c, "button", vi.ui.cancel)?.click();
      },
    ),
  );
  useClickState(
    frame >= TAP_DONE && frame < TAP_CONFIRM,
    () => (doc && page ? !!confirmDialog(doc) : null),
    (want) => {
      if (!doc || !page) return;
      if (want) byText(page, "button", vi.lesson.banner.markDone)?.click();
      else byText(confirmDialog(doc) ?? doc, "button", vi.ui.cancel)?.click();
      settle();
    },
  );
  // the open note editor shows exactly what has been typed by this frame
  const draft = editAt(0) ? typedAt(frame, TAP_CONTENT + TYPE_DELAY, CONTENT) : editAt(1) ? typedAt(frame, TAP_HW_NOTE + TYPE_DELAY, HOMEWORK) : null;
  const editor = page && draft !== null ? composersOf(page)[editAt(0) ? 0 : 1]?.querySelector("textarea") : null;
  useLayoutEffect(() => {
    if (!editor || draft === null || editor.value === draft) return;
    const win = editor.ownerDocument.defaultView as Window & typeof globalThis;
    Object.getOwnPropertyDescriptor(win.HTMLTextAreaElement.prototype, "value")?.set?.call(editor, draft);
    editor.dispatchEvent(new win.Event("input", { bubbles: true }));
  });
  // the dialog's focus trap holds focus on its first tab, which keeps the upload tab the open one
  const uploadTab = doc && attachWanted ? byText(attachDialog(doc) ?? doc, "button", vi.storage.attachModal.tabUpload) : null;
  const focused =
    uploadTab ? uploadTab
    : page && frame >= TAP_REASON && frame < TAP_SAVE_GH ? rowOf(page, 1)?.querySelector("input")
    : page && frame >= TAP_NOTE && frame < PHOTO ? rowOf(page, 0)?.querySelector("textarea")
    : editor ?? null;
  useFocus(focused);

  // the page scrolls to whatever is being worked on: a row's top, a field, the notes card
  const keys: [number, number][] = t
    ? [
        [BANNER[1] + 4, 0],
        [BANNER[1] + 18, t.row0.y - 10],
        [STATUS_MA[1] + 4, t.row0.y - 10],
        [STATUS_MA[1] + 18, t.row1.y - 10],
        [TAP_EXCUSED + 14, t.row1.y - 10],
        [TAP_EXCUSED + 28, t.stats.y - 140],
        [STATS[1] + 4, t.stats.y - 140],
        [STATS[1] + 18, t.row1.y - 10],
        [EVAL, t.row1.y - 10],
        [EVAL + 16, t.seg0.y - 16],
        [NO_EVAL[0] - 20, t.seg0.y - 16],
        [NO_EVAL[0] - 6, t.row1.y - 10],
        [NO_EVAL[1] + 4, t.row1.y - 10],
        [NO_EVAL[1] + 18, t.note0.y - 80],
        [PHOTO, t.note0.y - 80],
        [PHOTO + 14, t.attach0.y - 300],
        [TILE_HINT[1] + 6, t.attach0.y - 300],
        [TILE_HINT[1] + 20, t.row0.y - 10],
        [UNSAVED_HINT[1] + 4, t.row0.y - 10],
        [UNSAVED_HINT[1] + 18, t.save0.y + t.save0.h + 40 - SCREEN],
        [NOTES, t.save0.y + t.save0.h + 40 - SCREEN],
        [NOTES + 18, t.notesCard.y - 10],
        [TAP_SAVE_CONTENT + 6, t.notesCard.y - 10],
        [TAP_SAVE_CONTENT + 20, t.composers[1].y - 160],
        [SAMPLE_HINT[1] + 4, t.composers[1].y - 160],
        [SAMPLE_HINT[1] + 18, t.composers[2].y - 140],
        [OTHER_HINT[1] + 4, t.composers[2].y - 140],
        [OTHER_HINT[1] + 6, t.notesCard.y - 10],
        [COMPLETE, t.notesCard.y - 10],
        [COMPLETE + 20, 0],
        [TAP_CONFIRM + 30, 0],
        [TAP_CONFIRM + 44, t.stats.y - 20],
        [FEE_MA[1] + 4, t.stats.y - 20],
        [FEE_MA[1] + 18, t.row1.y - 200],
      ]
    : [[0, 0]];
  const scroll = Math.max(0, scrollAt(frame, keys));
  const tapOn = (b: Box | null | undefined, at: number) => (b ? { at, ...center({ ...b, y: b.y - Math.max(0, scrollAt(at, keys)) }) } : null);
  const tapScreen = (b: Box | null | undefined, at: number) => (b ? { at, ...center(b) } : null);
  // the chips sit in the note's focus row; each is found by its own label
  const chip = (text: string) => {
    const el = page ? byText(rowOf(page, 0) ?? page, "button", text) : null;
    return page && el ? pageBox(page, el) : null;
  };
  const taps = t
    ? [
        tapOn(t.excused1, TAP_EXCUSED),
        tapOn(t.reason1, TAP_REASON),
        tapOn(t.save1, TAP_SAVE_GH),
        tapOn(t.hw80, TAP_HW),
        tapOn(t.score6, TAP_SCORE),
        tapOn(t.half, TAP_HALF),
        tapOn(t.note0, TAP_NOTE),
        tapOn(chip(QUICK_NOTES[0]), TAP_CHIP_1),
        tapOn(chip(QUICK_NOTES[1]), TAP_CHIP_2),
        tapOn(t.attach0, TAP_ATTACH),
        tapScreen(t.dropzone, TAP_DROP),
        tapOn(t.save0, TAP_SAVE_MA),
        tapOn(t.bodies[0], TAP_CONTENT),
        tapOn(t.saveNote, TAP_SAVE_CONTENT),
        tapOn(t.bodies[1], TAP_HW_NOTE),
        tapOn(t.saveNote, TAP_SAVE_HW),
        tapOn(t.attachHw, TAP_ATTACH_HW),
        tapScreen(t.dropzone, TAP_DROP_HW),
        tapOn(t.done, TAP_DONE),
        tapScreen(t.confirm, TAP_CONFIRM),
      ].filter((tap): tap is NonNullable<typeof tap> => !!tap)
    : [];
  const beat = { frame, scroll };
  const union = (a: Box | null | undefined, b: Box | null | undefined): Box | null =>
    a && b ? { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.max(a.x + a.w, b.x + b.w) - Math.min(a.x, b.x), h: Math.max(a.y + a.h, b.y + b.h) - Math.min(a.y, b.y) } : null;

  const toast =
    frame >= TAP_SAVE_GH && frame < TAP_SAVE_GH + 56 ? { from: TAP_SAVE_GH, text: vi.attendance.toast.savedStudent.replace("{name}", "Gia Hân") }
    : frame >= TAP_SAVE_MA && frame < TAP_SAVE_MA + 56 ? { from: TAP_SAVE_MA, text: vi.attendance.toast.savedStudent.replace("{name}", "Minh Anh") }
    : frame >= TAP_CONFIRM && frame < TAP_CONFIRM + 64 ? { from: TAP_CONFIRM, text: vi.lesson.banner.completeSuccess }
    : null;
  const toastIn = toast ? interpolate(frame - toast.from, [2, 10, 46, 54], [0, 1, 1, 0], { ...clamp, easing: ease }) : 0;

  const explains = [DONE_HINT, CONFIRM_HINT, BANNER, STATUS_MA, STATS, REASON_HINT, SCORE_HINT, NO_EVAL, CHIPS, DRIVE_HINT, TILE_HINT, UNSAVED_HINT, MIC_HINT, SAMPLE_HINT, OTHER_HINT, CARD_HINT, FEE_MA, FEE_GH];
  const scrolls = keys.map(([f]) => f).filter((f, i) => i % 2 === 1 && f > 0);

  return (
    <>
      {explains.map(([from]) => (
        <Sfx key={`e${from}`} role="tick" at={from + 2} volume={0.6} />
      ))}
      {scrolls.map((f) => (
        <Sfx key={`s${f}`} role="whoosh" at={f - 8} volume={0.25} />
      ))}
      {[TAP_REASON, TAP_NOTE, TAP_CONTENT, TAP_HW_NOTE].map((at) => (
        <Sfx key={`c${at}`} role="click-soft" at={at} volume={0.8} />
      ))}
      {[TAP_EXCUSED, TAP_HW, TAP_SCORE, TAP_HALF, TAP_CHIP_1, TAP_CHIP_2].map((at) => (
        <Sfx key={`p${at}`} role="select" at={at} volume={0.8} />
      ))}
      {[TAP_SAVE_GH, TAP_SAVE_MA, TAP_SAVE_CONTENT, TAP_SAVE_HW, TAP_ATTACH, TAP_ATTACH_HW, TAP_DONE].map((at) => (
        <Sfx key={`f${at}`} role="click-firm" at={at} volume={0.8} />
      ))}
      {[TAP_DROP, TAP_DROP_HW].map((at) => (
        <Sfx key={`d${at}`} role="drop" at={at + 6} volume={0.7} />
      ))}
      <Sfx role="pop" at={TAP_ATTACH + 2} volume={0.6} />
      <Sfx role="pop" at={TAP_ATTACH_HW + 2} volume={0.6} />
      <Sfx role="pop" at={TAP_DONE + 2} volume={0.6} />
      <Sfx role="confirm" at={TAP_CONFIRM} volume={0.9} />
      {typingCues(TAP_REASON + TYPE_DELAY, TAP_REASON + TYPE_DELAY + Math.ceil(REASON.length / RATE), REASON.length).map((at) => (
        <Sfx key={`r${at}`} role="key" at={at} volume={0.55} />
      ))}
      {typingCues(TAP_CONTENT + TYPE_DELAY, TAP_CONTENT + TYPE_DELAY + Math.ceil(CONTENT.length / RATE), CONTENT.length).map((at) => (
        <Sfx key={`k${at}`} role="key" at={at} volume={0.55} />
      ))}
      {typingCues(TAP_HW_NOTE + TYPE_DELAY, TAP_HW_NOTE + TYPE_DELAY + Math.ceil(HOMEWORK.length / RATE), HOMEWORK.length).map((at) => (
        <Sfx key={`h${at}`} role="key" at={at} volume={0.55} />
      ))}

      <StepCaption eyebrow="Điểm danh" from={0} to={TAP_EXCUSED}>
        <span style={{ color: colors.emerald }}>1 chạm là lưu</span>
      </StepCaption>
      <StepCaption eyebrow="Nghỉ có phép?" from={TAP_EXCUSED} to={EVAL}>
        <span style={{ color: "#d97706" }}>Không tính tiền</span>
      </StepCaption>
      <StepCaption eyebrow="Đánh giá" from={EVAL} to={TAP_NOTE}>
        Từng em một
      </StepCaption>
      <StepCaption eyebrow="Không muốn gõ?" from={TAP_NOTE} to={PHOTO}>
        <span style={{ color: colors.emerald }}>Bấm câu có sẵn</span>
      </StepCaption>
      <StepCaption eyebrow="Chữa bài?" from={PHOTO} to={NOTES}>
        <span style={{ color: colors.emerald }}>Chụp gửi luôn</span>
      </StepCaption>
      <StepCaption eyebrow="Ghi chú buổi học" from={NOTES} to={COMPLETE}>
        Cả lớp cùng thấy
      </StepCaption>
      <StepCaption eyebrow="Bấm Đã dạy xong" from={COMPLETE}>
        <span style={{ color: colors.emerald }}>Học phí tự tạo</span>
      </StepCaption>

      <AppScreen
        client={client}
        pathname="/dashboard/lessons/new-class-0"
        scroll={scroll}
        pageRef={pageRef}
        fixed={toast ? <SuccessToast enter={toastIn}>{toast.text}</SuccessToast> : null}
        overlay={
          t ? (
            <>
              <Explain {...beat} from={BANNER[0]} to={BANNER[1]} box={t.banner}>
                Buổi chưa chốt. Điểm danh xong rồi bấm <b>Đã dạy xong</b> để tạo học phí
              </Explain>
              <Explain {...beat} from={STATUS_MA[0]} to={STATUS_MA[1]} box={t.seg0}>
                Mặc định ai cũng có mặt, chỉ cần sửa bạn nghỉ
              </Explain>
              <Explain {...beat} from={STATS[0]} to={STATS[1]} box={t.stats} color={AMBER}>
                Vắng vẫn tính tiền · Có phép thì không
              </Explain>
              <Explain {...beat} from={REASON_HINT[0]} to={REASON_HINT[1]} box={t.reason1}>
                Lý do nghỉ hiện trong báo cáo cho phụ huynh
              </Explain>
              <Explain {...beat} from={SCORE_HINT[0]} to={SCORE_HINT[1]} box={t.scoreField}>
                Chấm theo band hay thang 10 đều được
              </Explain>
              <Explain {...beat} from={NO_EVAL[0]} to={NO_EVAL[1]} box={union(t.header1, t.reason1)}>
                Học sinh nghỉ thì không chấm điểm
              </Explain>
              <Explain {...beat} from={CHIPS[0]} to={CHIPS[1]} box={t.chips} side="above">
                Bấm câu có sẵn, hoặc sửa lại cho đúng ý
              </Explain>
              <Explain frame={frame} from={DRIVE_HINT[0]} to={DRIVE_HINT[1]} box={t.dialogDrive}>
                Lấy file có sẵn trên Google Drive cũng được
              </Explain>
              <Explain {...beat} from={TILE_HINT[0]} to={TILE_HINT[1]} box={t.tile0} side="above">
                Chụp bài viết của con, phụ huynh xem được trong báo cáo
              </Explain>
              <Explain {...beat} from={UNSAVED_HINT[0]} to={UNSAVED_HINT[1]} box={t.unsaved0}>
                Nhận xét phải bấm Lưu (điểm danh thì tự lưu)
              </Explain>
              <Explain {...beat} from={MIC_HINT[0]} to={MIC_HINT[1]} box={t.mic0}>
                Lười gõ? Bấm mic để nói
              </Explain>
              <Explain {...beat} from={SAMPLE_HINT[0]} to={SAMPLE_HINT[1]} box={t.sample}>
                Gắn bài mẫu vào đúng ô Bài tập về nhà
              </Explain>
              <Explain {...beat} from={OTHER_HINT[0]} to={OTHER_HINT[1]} box={union(t.composers[2], t.composers[3])} side="above">
                Nhận xét cả lớp và việc buổi sau, điền khi cần
              </Explain>
              <Explain {...beat} from={CARD_HINT[0]} to={CARD_HINT[1]} box={t.notesTitle}>
                Mọi ghi chú và file đều vào báo cáo của từng em
              </Explain>
              <Explain {...beat} from={DONE_HINT[0]} to={DONE_HINT[1]} box={t.done}>
                Quan trọng: chưa bấm <b>Đã dạy xong</b> thì chưa có học phí
              </Explain>
              <Explain frame={frame} from={CONFIRM_HINT[0]} to={CONFIRM_HINT[1]} box={t.confirmBody} side="above">
                Chốt buổi = tạo học phí cho từng em theo điểm danh
              </Explain>
              <Explain {...beat} from={FEE_MA[0]} to={FEE_MA[1]} box={t.fee0}>
                Có mặt → tính theo giá riêng của em
              </Explain>
              <Explain {...beat} from={FEE_GH[0]} to={FEE_GH[1]} box={t.header1} color={AMBER}>
                Có phép → 0đ, không phải trừ tay
              </Explain>
            </>
          ) : null
        }
      >
        <DetailPage state={state} forms={forms} />
      </AppScreen>
      <TapFinger frame={frame} taps={taps} hideAt={TAP_CONFIRM + 12} />
    </>
  );
};

export const DetailScene = Interactive.create({ Component: DetailSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
