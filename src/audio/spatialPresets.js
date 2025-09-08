/**
 * Spatial Preset System (16-channel).
 * Each preset returns an object: { init(), update(panners, dt, intensity, level) }.
 */
const TAU = Math.PI * 2;

function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}
function smoothstep(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
function hash(i) {
  let x = Math.sin(i * 999.13) * 43758.5453;
  return x - Math.floor(x);
}

export const spatialPresetFactories = {
  orbit: () => {
    let t = 0;
    return {
      init() {},
      update(panners, dt, intensity, level) {
        t += dt;
        const baseR = 2.4 + intensity * 3.2;
        const verticalAmp = 1 + intensity * 1.4;
        panners.forEach((p, i) => {
          const phase = t * (0.25 + i * 0.007);
          const angle = phase + (TAU * i) / panners.length;
          const r = baseR * (0.88 + 0.18 * Math.sin(phase * 0.9 + i));
          const y = Math.sin(phase * 0.75 + i * 0.5) * verticalAmp * 0.55;
          p.setPosition(Math.cos(angle) * r, y, Math.sin(angle) * r);
        });
      }
    };
  },

  inside_you: () => {
    const jitterSeeds = [];
    return {
      init() {
        jitterSeeds.length = 0;
        for (let i = 0; i < 16; i++) jitterSeeds.push(hash(i) * 9999);
      },
      update(panners, dt, intensity, level) {
        const swirl = (performance.now() * 0.001) * (3 + intensity * 4);
        const microR = 0.04 + level * 0.15 + intensity * 0.05;
        panners.forEach((p, i) => {
          const a = swirl + (TAU * i) / panners.length;
          const seed = jitterSeeds[i];
          const jitter =
            (Math.sin(a * 3 + seed) + Math.cos(a * 4.1 + seed * 0.37)) * 0.01;
          const yJitter = Math.sin(a * 5.2 + seed) * 0.015;
          p.setPosition(
            Math.cos(a) * microR + jitter,
            yJitter,
            Math.sin(a) * microR - jitter
          );
        });
      }
    };
  },

  far_behind_to_close: () => {
    let time = 0;
    const cycle = 20;
    return {
      init() {
        time = 0;
      },
      update(panners, dt, intensity, level) {
        time += dt;
        const phase = (time % cycle) / cycle;
        const forwardPhase =
          phase < 0.6 ? smoothstep(0, 0.6, phase) : 1 - smoothstep(0.6, 1, phase);
        const eased = easeOutExpo(forwardPhase);
        const farZ = -7 - intensity * 2;
        const targetZ = 0.35 + intensity * 0.9;
        const currentZ = farZ + (targetZ - farZ) * eased;

        const swirl = time * (0.3 + 0.4 * intensity);
        const lateralBase = 1.5 + intensity * 2.8;
        const verticalSpan = 0.4 + intensity * 1.4;
        panners.forEach((p, i) => {
          const a = swirl + (TAU * i) / panners.length;
          const spread = lateralBase * (0.4 + eased * 0.9);
          const x = Math.cos(a) * spread;
          const y =
            Math.sin(a * 2 + eased * 4 + i) *
            verticalSpan *
            (0.25 + 0.75 * eased);
          const depthWobble =
            Math.sin(a * 1.7 + phase * TAU) * 0.6 * (1 - forwardPhase * 0.5);
          p.setPosition(x, y, currentZ + depthWobble);
        });
      }
    };
  },

  spiral: () => {
    let t = 0;
    return {
      init() {
        t = 0;
      },
      update(panners, dt, intensity) {
        t += dt * (0.55 + intensity * 0.9);
        const len = panners.length;
        const height = 3.2 + intensity * 3.4;
        const baseR = 1.4 + intensity * 2.6;
        panners.forEach((p, i) => {
          const a = t + (TAU * i) / len;
          const ring = (i / len) * baseR * (0.8 + 0.4 * Math.sin(t * 0.5 + i));
          const x = Math.cos(a) * ring;
          const y =
            -1 +
            (i / len) * height -
            Math.sin(t * 0.45 + i * 0.7) * 0.25 * (0.4 + intensity);
          const z = Math.sin(a) * ring;
          p.setPosition(x, y, z);
        });
      }
    };
  },

  pulse_in_out: () => {
    let t = 0;
    return {
      init() {
        t = 0;
      },
      update(panners, dt, intensity, level) {
        t += dt;
        const len = panners.length;
        const beat = 0.5 + Math.sin(t * 3.5) * 0.5;
        const pulse = 0.35 + beat * 0.4 * (0.4 + level);
        const baseR = 1.1 + intensity * 3.2;
        panners.forEach((p, i) => {
          const a = (TAU * i) / len + t * 0.55;
          const localR = baseR * (0.55 + pulse);
          const x = Math.cos(a) * localR;
          const y = Math.sin(t * 1.6 + i) * 0.9 * (0.25 + intensity);
          const z = Math.sin(a) * localR;
          p.setPosition(x, y, z);
        });
      }
    };
  },

  enveloping_sphere: () => {
    // Panners form a breathing sphere that occasionally collapses inside-out.
    let t = 0;
    return {
      init() {
        t = 0;
      },
      update(panners, dt, intensity, level) {
        t += dt;
        const collapse = (Math.sin(t * 0.35) * 0.5 + 0.5) ** 2;
        const radius = 2 + intensity * 3.2;
        panners.forEach((p, i) => {
          const phi = Math.acos(2 * (i / panners.length) - 1);
          const theta = (i * 137.5 * (Math.PI / 180) + t * 0.9) % TAU;
          const rMod =
            radius *
            (0.4 + 0.6 * collapse) *
            (0.7 + 0.3 * Math.sin(t * 1.3 + i));
            const x = Math.sin(phi) * Math.cos(theta) * rMod;
          const y =
            Math.cos(phi) * rMod * (0.6 + 0.4 * Math.sin(t * 0.5 + i * 2));
          const z = Math.sin(phi) * Math.sin(theta) * rMod;
          p.setPosition(x, y, z);
        });
      }
    };
  },

  overhead_rain: () => {
    // Majority overhead, occasional downward sweeps simulating falling points.
    let t = 0;
    return {
      init() {
        t = 0;
      },
      update(panners, dt, intensity, level) {
        t += dt;
        const ringR = 2.2 + intensity * 2.8;
        panners.forEach((p, i) => {
          const baseAngle = (TAU * i) / panners.length + t * 0.4;
          const sweep = Math.sin(t * 0.7 + i) * 0.5 + 0.5;
          const y =
            1.4 +
            Math.sin(baseAngle * 2 + t * 1.3) * 0.4 * (0.5 + intensity) -
            sweep * (i % 4 === 0 ? 1.6 * (0.2 + level) : 0);
          const modR = ringR * (0.7 + 0.3 * Math.sin(t * 0.8 + i));
          const x = Math.cos(baseAngle) * modR;
          const z = Math.sin(baseAngle) * modR;
          p.setPosition(x, y, z);
        });
      }
    };
  }
};

export function buildSpatialPreset(id) {
  const factory =
    spatialPresetFactories[id] || spatialPresetFactories["orbit"];
  return factory();
}

export const PRESET_IDS = Object.keys(spatialPresetFactories);