# 🎶 The Immersive Music Room (16D Sound Chamber)

Enhanced version with advanced 16‑channel spatial audio presets.

## ✨ What's New (v1.1.0)
- True 16-channel multi-orbital panner network (was 8)
- Spatial Preset System:
  - `Orbit (Default)` – original swirling multi-ring orbit
  - `Inside You` – ultra-near “internal” psychoacoustic clustering
  - `Far Behind → Close` – dramatic approach from ~6m behind listener toward center & back
  - `Ascending Spiral` – vertical helix ascent
  - `Pulse In-Out` – breathing radial modulation
- UI selector + “Restart Preset Motion” button
- Expanded FFT (1024) for smoother spectral envelope
- More stable time-delta based motion paths
- Readme & version update

---

## 🚀 Features

| Area        | Description |
|-------------|-------------|
| 16D Audio   | 16 independent `PannerNode`s animated by configurable spatial presets. |
| Presets     | Re-initializable motion controllers with evolving distance/height envelopes. |
| Visuals     | Shader walls, reactive beams, starfield, ripple floor, procedural chair. |
| Audio Input | MP3 upload or Spotify Web Playback (Premium + token). |
| UI          | Skins, intensity, camera modes, spatial preset selection. |
| Performance | Analyser-driven updates, minimal allocations, dynamic path math. |
| Deployment  | Automatic via GitHub Pages workflow. |

---

## 🧠 16-Channel Spatial Engine

Each preset defines:
```
init() -> sets starting state
update(panners[], dt, intensity, analyserLevel)
```

Common illusions:
- Depth travel: z-axis interpolation with eased exponential approach.
- Internal sensation: extremely small radii + high swirl rate.
- Spiral ascent: per-index progressive radius & vertical mapping.

### Audio Graph
```
SourceBuffer
  -> N taps (Gain: 1/N each)
    -> PannerNode[i]
       -> Group Gain
          -> Analyser
            -> Master Gain
              -> Destination
```

---

## 🎛 Spatial Presets

| ID | Experience |
|----|------------|
| orbit | Balanced rotational field with vertical oscillation. |
| inside_you | Ultra-close rotating micro-swarm (quasi bone-conduct feel). |
| far_behind_to_close | Long approach cycle (≈18s) from -6m Z toward listener then retreat. |
| spiral | Helical vertical climb; index-based radius scaling. |
| pulse_in_out | Dynamic radial breathing synchronized to time and intensity. |

Use "Restart Preset Motion" to re-trigger approach-style sequences.

---

## 🔧 Development

```bash
npm install
npm run dev
```
Open: http://localhost:5173

Prod build:
```bash
npm run build
npm run preview
```

---

## 🌐 Deployment

Push to `main` → GitHub Actions builds & deploys to Pages.
`base: "./"` ensures compatibility under repo subpath.

---

## 🎧 Spotify Usage

1. Acquire OAuth token (scopes: `streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state`)
2. Paste token → Connect
3. Choose track in any client; playback transfers automatically (if allowed)

---

## 🧪 Future Spatial Ideas (Optional Upgrades)
- Convolution IR presets for environment sense
- Dynamic pattern cycling with event scripting
- Partial ambisonic decode for height realism
- Doppler micro-accents (subtle playbackRate modulation)

---

## 🐞 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Enable Audio" needed | Click button (browser gesture requirement). |
| Spotify silent | Ensure Premium token + device transfer success. |
| Preset seems static | Restart preset or pick different intensity. |
| Performance dips | Lower intensity or switch to Seated camera. |

---

## 📜 License

MIT © 2025

Enjoy the expanded chamber & dimensional presets. 🌌