// FullCalendar places events from getBoundingClientRect, which includes every CSS scale above it
// (our layout scale, the camera zoom, the Studio preview). Inside .fc, report rects in layout px.
const raw = Element.prototype.getBoundingClientRect;

export const rawRect = (el: Element) => raw.call(el);

if (!(raw as { __fcPatched?: boolean }).__fcPatched) {
  const patched = function (this: Element) {
    const r = raw.call(this);
    const root = this.closest(".fc") as HTMLElement | null;
    if (!root || !root.offsetWidth) return r;
    const k = raw.call(root).width / root.offsetWidth;
    return k === 1 ? r : new DOMRect(r.x / k, r.y / k, r.width / k, r.height / k);
  };
  (patched as { __fcPatched?: boolean }).__fcPatched = true;
  Element.prototype.getBoundingClientRect = patched;
}
