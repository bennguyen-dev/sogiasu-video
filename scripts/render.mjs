import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";

// usage: node scripts/render.mjs <compositionId> <outName> → out/<outName>.mp4, loudness-normalised
const [id, name] = process.argv.slice(2);
if (!id || !name) throw new Error("usage: node scripts/render.mjs <compositionId> <outName>");

// TikTok / Reels: -14 LUFS integrated, true peak under -1 dBTP
const TARGET_LUFS = -14;
const MAX_TRUE_PEAK = -1;

mkdirSync("out", { recursive: true });
const raw = `out/${name}.raw.mp4`;
const final = `out/${name}.mp4`;

// system ffmpeg on purpose: Remotion's bundled one lacks loudnorm
const measure = (file) => {
  const { stderr } = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-vn", "-af", "loudnorm=print_format=json", "-f", "null", "-"], { encoding: "utf8" });
  const json = JSON.parse(stderr.slice(stderr.lastIndexOf("{"), stderr.lastIndexOf("}") + 1));
  return { lufs: Number(json.input_i), truePeak: Number(json.input_tp) };
};

const encode = (gainDb, limitDb) =>
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-i", raw,
    "-c:v", "copy",
    "-af", `volume=${gainDb}dB,alimiter=limit=${limitDb}dB:attack=1:release=60:level=false,aresample=48000`,
    "-c:a", "aac", "-b:a", "192k",
    final,
  ]);

execFileSync("npx", ["remotion", "render", id, raw], { stdio: "inherit" });

// sparse sound effects carry sharp peaks, so the limiter eats part of each gain step: re-measure and top up
// the AAC encode can push inter-sample peaks back over the limiter's ceiling, so that is re-measured too
let gain = TARGET_LUFS - measure(raw).lufs;
let limit = -2.5;
let result;
for (let pass = 0; pass < 6; pass++) {
  encode(gain.toFixed(2), limit.toFixed(1));
  result = measure(final);
  const peakOk = result.truePeak <= MAX_TRUE_PEAK;
  if (Math.abs(result.lufs - TARGET_LUFS) < 0.3 && peakOk) break;
  if (!peakOk) limit -= result.truePeak - MAX_TRUE_PEAK + 0.3;
  gain += TARGET_LUFS - result.lufs;
}
rmSync(raw);
console.log(`→ ${final}: ${result.lufs} LUFS, true peak ${result.truePeak} dBTP`);
