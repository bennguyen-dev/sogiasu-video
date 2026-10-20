# Sổ Gia Sư - promo video

Remotion project that renders the app's real components (from the sibling `../studying-report` checkout) with demo data.

```bash
npm install
npm run dev      # Remotion Studio
npm run render         # out/intro-sfx.mp4   (sound effects only)
npm run render:music   # out/intro-music.mp4 (sound effects + music bed)
```

Both are normalised to -14 LUFS / under -1 dBTP (TikTok, Reels) after the Remotion render, which needs `ffmpeg` on the PATH.
The default is the SFX-only cut: platforms can flag a stock track, so add music in their own editor; render the music cut only when asked.

Needs `../studying-report` next to this folder, with its `node_modules` installed.
