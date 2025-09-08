# 🎶 The Immersive Music Room (16D Sound Chamber)

A fully interactive 3D WebGL experience combining:
- Three.js driven immersive chamber
- Simulated 16D multi-orbital spatial audio (Web Audio API)
- Music from local MP3 upload or Spotify Web Playback SDK
- Reactive visualizations (walls, beams, floor ripple, starfield)
- React + TailwindCSS UI overlays
- GitHub Pages automatic deployment via Actions

---

## ✅ Recent Fix (Build Error: "Could not resolve entry module 'index.html'")
If you encountered:
```
Could not resolve entry module "index.html"
```
The cause was that `index.html` was previously inside `public/`.  
Vite requires `index.html` at the project root.

Applied Fixes:
1. Moved `public/index.html` → `./index.html`
2. Updated asset & script paths to **relative** (`assets/icon.svg`, `src/index.js`)
3. Set `base: "./"` in `vite.config.js` for GitHub Pages compatibility
4. Ensure Tailwind scans the root `index.html`

If updating an existing clone:  
- Delete `public/index.html`  
- Add the new root-level `index.html` (see repository)  
- Re-run: `npm run dev` or `npm run build`

---

## 📁 Project Structure

```
immersive-music-room/
  index.html                # <-- Root Vite entry
  .github/workflows/deploy.yml
  public/
    assets/
      icon.svg
    robots.txt
  src/
    App.jsx
    index.js
    components/
    audio/
    three/
    state/
    styles/
  package.json
  tailwind.config.js
  vite.config.js
  README.md
```

(Other sections unchanged from previous version; see earlier README for complete details.)

---
## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

Build:

```bash
npm run build
npm run preview
```

---

## 🌐 Deployment

Push to `main` — GitHub Actions builds & deploys to Pages automatically.  
Because `base: "./"` is used, assets resolve correctly under `/<user>/<repo>/`.

---

## 🧠 Notes

If you later enable a custom domain for Pages, `base: "./"` continues to work.

---

## 📜 License

MIT © 2025

Enjoy the chamber. 🌌