import { PHONE_W, type PhoneLayout } from "../components/Phone";
import type { Box } from "../tutorial/AppScreen";

// What's New media is 4:5 — the FB/IG feed's tallest frame, so a clip can be posted there as is
export const WIDTH = 1080;
export const HEIGHT = 1350;

// the caption sits on a band at the top; the phone slides under it when it pans
export const BAND = 280;
export const SCREEN_H = 844;

// the series' phone, large and cropped by the bottom edge (a whole phone at 4:5 is too small to read
// in the slide's ~360 px box); it pans up to reach lower content instead of shrinking
export const PHONE: PhoneLayout = (() => {
  const x = 110;
  const bezel = 18;
  const scale = (WIDTH - 2 * x - 2 * bezel) / PHONE_W;
  return { width: PHONE_W, x, y: 300, bezel, scale, screenH: SCREEN_H, height: SCREEN_H * scale + 2 * bezel, radius: 74, screenRadius: 58 };
})();
export const S = PHONE.scale;
const SCREEN_TOP = PHONE.y + PHONE.bezel;
const BAND_MID = (BAND + HEIGHT) / 2;
const MAX_PAN = SCREEN_TOP + SCREEN_H * S + PHONE.bezel - HEIGHT;

// pan (frame px) that centres a box (app css px) under the band, never past the phone's bottom
export const panTo = (b: Box) => Math.min(MAX_PAN, Math.max(0, SCREEN_TOP + (b.y + b.h / 2) * S - BAND_MID));

// an app css point → frame px, with the phone panned up by `pan`
export const toFrame = (pan: number, p: { x: number; y: number }) => ({
  left: PHONE.x + PHONE.bezel + p.x * S,
  top: SCREEN_TOP + p.y * S - pan,
});
