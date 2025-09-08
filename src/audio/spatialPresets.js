/**
 * Spatial Preset System
 * Each preset returns an updater that positions 16 panners over time.
 * Signature: (context) => ({ init(panners), update(panners, dt, intensity, analyserLevel), dispose? })
 *
 * Panner coordinate system: listener at (0,0,0).
 * Distances in meters (approx psychoacoustic scaling).
 */

const TAU = Math.PI * 2;

/**
 * Utility to smooth approach value (ease out)
 */
function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

function clamp(v, a, b) {
  return Math.min(b, Math.max(a, v));
}

export const spatialPresetFactories = {
  orbit: () => {
    let tAccum = 0;
    return {
      init() {},
      update(panners, dt, intensity, level) {
        tAccum += dt;
        const baseRadius = 2.5 + intensity * 3;
        const verticalAmp = 1 + intensity * 1.5;
        const len = panners.length;
        for (let i = 0; i < len; i++) {
          const p = panners[i];
            const phase = tAccum * (0.2 + 0.015 * i);
          const angle = phase + (TAU * i) / len;
          const radiusJitter = 0.15 * Math.sin(phase * 0.9 + i);
          const r = baseRadius * (0.9 + radiusJitter);
          const y = Math.sin(phase * 0.8 + i * 0.5) * verticalAmp * 0.6;
          p.setPosition(Math.cos(angle) * r, y, Math.sin(angle) * r);
        }
      }
    };
  },

  inside_you: () => {
    // Extremely small radius modulated by level
    return {
      init() {},
      update(panners, dt, intensity, level) {
        const micro = 0.05 + level * 0.15 + intensity * 0.05;
        const swirl = level * 4 + intensity * 2;
        const len = panners.length;
        for (let i = 0; i < len; i++) {
          const angle = swirl + (TAU * i) / len;
          // cluster around head with slight vertical ring variance
          const ring = (i % 4) * 0.015;
          panners[i].setPosition(
            Math.cos(angle) * micro,
            (Math.sin(angle * 2 + i) * 0.05 + ring) * 0.6,
            Math.sin(angle) * micro
          );
        }
      }
    };
  },

  far_behind_to_close: () => {
    // Start ~6m behind listener and travel through center, looping softly
    let time = 0;
    const cycle = 18; // seconds per full approach & retreat
    return {
      init() {
        time = 0;
      },
      update(panners, dt, intensity, level) {
        time += dt;
        const phase = (time % cycle) / cycle; // 0..1
        // Approach (0 -> 0.5), retreat (0.5 ->1)
        const forwardPhase = phase < 0.5 ? phase / 0.5 : 1 - (phase - 0.5) / 0.5;
        const eased = easeOutExpo(forwardPhase);
        const baseZ = -6; // far behind
        const targetZ = 0.4 + intensity * 0.8;
        const currentZ = baseZ + (targetZ - baseZ) * eased;

        const lateralSpread = 2 + intensity * 2;
        const verticalSpread = 0.4 + intensity * 1.2;
        const swirl = time * 0.6;
        const len = panners.length;

        for (let i = 0; i < len; i++) {
          const angle = swirl + (TAU * i) / len;
          const x = Math.cos(angle) * lateralSpread * (0.2 + forwardPhase * 0.8);
          const y =
            Math.sin(angle * 2 + forwardPhase * 4) *
            verticalSpread *
            (0.3 + 0.7 * forwardPhase);
          const depthOffset =
            Math.sin(angle * 1.5 + phase * TAU) * 0.6 * (1 - forwardPhase * 0.5);
          panners[i].setPosition(x, y, currentZ + depthOffset);
        }
      }
    };
  },

  spiral: () => {
    let t = 0;
    return {
      init() {
        t = 0;
      },
      update(panners, dt, intensity, level) {
        t += dt * (0.6 + intensity * 0.8);
        const len = panners.length;
        const height = 3 + intensity * 3;
        const baseR = 1.5 + intensity * 2.5;
        for (let i = 0; i < len; i++) {
          const a = t + (TAU * i) / len;
          const r = baseR * (0.6 + (i / len) * 0.8);
          const x = Math.cos(a) * r;
          const y = -1 + (i / len) * height - Math.sin(t * 0.5 + i) * 0.2;
          const z = Math.sin(a) * r;
          panners[i].setPosition(x, y, z);
        }
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
        const pulse = 0.4 + Math.sin(t * 2.2) * 0.4 * (0.5 + level);
        const baseR = 1 + intensity * 3;
        for (let i = 0; i < len; i++) {
          const a = (TAU * i) / len + t * 0.5;
          const localR = baseR * (0.6 + pulse);
          const x = Math.cos(a) * localR;
          const y = Math.sin(t * 1.3 + i) * 0.8 * (0.3 + intensity);
          const z = Math.sin(a) * localR;
          panners[i].setPosition(x, y, z);
        }
      }
    };
  }
};

/**
 * Build a preset controller given a preset id.
 */
export function buildSpatialPreset(id) {
  const factory =
    spatialPresetFactories[id] || spatialPresetFactories["orbit"];
  return factory();
}

export const PRESET_IDS = Object.keys(spatialPresetFactories);