import { buildSpatialPreset } from "./spatialPresets.js";

/**
 * Base analyser & gain graph.
 */
export function createAudioGraph(audioCtx) {
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.65;

  const gainNode = audioCtx.createGain();
  gainNode.gain.value = 1;

  const masterOut = audioCtx.createGain();
  masterOut.gain.value = 0.95;

  gainNode.connect(analyser);
  analyser.connect(masterOut);
  masterOut.connect(audioCtx.destination);

  return { analyser, gainNode, masterOut };
}

/**
 * 16-channel spatial panner system with presets.
 */
export function create16DPannerSystem(audioCtx, destination, getPresetId) {
  const CHANNELS = 16;
  const panners = [];
  const sources = [];
  const groupGain = audioCtx.createGain();
  groupGain.gain.value = 1;
  groupGain.connect(destination);

  for (let i = 0; i < CHANNELS; i++) {
    const p = audioCtx.createPanner();
    p.panningModel = "HRTF";
    p.distanceModel = "inverse";
    p.refDistance = 1;
    p.maxDistance = 80;
    p.rolloffFactor = 1.05;
    p.coneInnerAngle = 360;
    p.coneOuterAngle = 0;
    p.coneOuterGain = 0;
    p.positionX.value = 0;
    p.positionY.value = 0;
    p.positionZ.value = 0;
    p.connect(groupGain);
    panners.push(p);
  }

  let activePresetController = buildSpatialPreset(getPresetId());
  activePresetController.init?.();

  function reinitPreset(id) {
    activePresetController = buildSpatialPreset(id);
    activePresetController.init?.();
  }

  function connectSource(bufferSource) {
    for (let i = 0; i < panners.length; i++) {
      const gainTap = audioCtx.createGain();
      // Balanced distribution (optionally weight center channels differently per preset)
      gainTap.gain.value = 1 / panners.length;
      bufferSource.connect(gainTap);
      gainTap.connect(panners[i]);
      sources.push(gainTap);
    }
  }

  let lastPresetId = getPresetId();

  function update(intensity, analyserLevel, dt) {
    const currentId = getPresetId();
    if (currentId !== lastPresetId) {
      lastPresetId = currentId;
      reinitPreset(currentId);
    }
    activePresetController.update(
      panners,
      dt,
      intensity,
      analyserLevel
    );
  }

  return { connectSource, update, reinitPreset };
}