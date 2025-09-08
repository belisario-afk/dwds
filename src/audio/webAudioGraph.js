import { buildSpatialPreset } from "./spatialPresets.js";

/**
 * Build core audio graph with psychoacoustic enhancement & dynamics.
 * Returns nodes and helpers so UI can retune.
 */
export function createAudioGraph(audioCtx) {
  // Nodes
  const preGain = audioCtx.createGain(); // Input from spatial bus
  preGain.gain.value = 1;

  const lowShelf = audioCtx.createBiquadFilter();
  lowShelf.type = "lowshelf";
  lowShelf.frequency.value = 180;
  lowShelf.gain.value = 0;

  const highShelf = audioCtx.createBiquadFilter();
  highShelf.type = "highshelf";
  highShelf.frequency.value = 5200;
  highShelf.gain.value = 0;

  const compressor = audioCtx.createDynamicsCompressor();
  compressor.threshold.value = -22;
  compressor.knee.value = 24;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.25;

  const limiter = audioCtx.createDynamicsCompressor();
  limiter.threshold.value = -4;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.001;
  limiter.release.value = 0.12;

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.65;

  const masterOut = audioCtx.createGain();
  masterOut.gain.value = 1;

  // Chain
  preGain
    .connect(lowShelf)
    .connect(highShelf)
    .connect(compressor)
    .connect(limiter)
    .connect(analyser)
    .connect(masterOut)
    .connect(audioCtx.destination);

  function applyTuning({ enhancerAmount, loudnessBoost, masterGain }) {
    if (enhancerAmount != null) {
      // Gentle psychoacoustic smile curve
      lowShelf.gain.value = enhancerAmount * 7; // Boost bass
      highShelf.gain.value = enhancerAmount * 5; // Boost air
    }
    if (loudnessBoost != null) {
      if (loudnessBoost) {
        preGain.gain.value = 1.3;
        compressor.threshold.value = -26;
        compressor.ratio.value = 5;
        limiter.threshold.value = -3.5;
      } else {
        preGain.gain.value = 1;
        compressor.threshold.value = -22;
        compressor.ratio.value = 4;
        limiter.threshold.value = -4;
      }
    }
    if (masterGain != null) {
      masterOut.gain.value = masterGain;
    }
  }

  return {
    preGain,
    analyser,
    masterOut,
    applyTuning
  };
}

/**
 * 16-channel spatial panner system with motion presets.
 */
export function create16DPannerSystem(audioCtx, destinationNode, getPresetId) {
  const CHANNELS = 16;
  const panners = [];
  const sources = [];
  const groupGain = audioCtx.createGain();
  groupGain.gain.value = 1;
  groupGain.connect(destinationNode); // destinationNode is preGain from main graph

  for (let i = 0; i < CHANNELS; i++) {
    const p = audioCtx.createPanner();
    p.panningModel = "HRTF";
    p.distanceModel = "inverse";
    p.refDistance = 1;
    p.maxDistance = 90;
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
      gainTap.gain.value = 1 / panners.length;
      bufferSource.connect(gainTap);
      gainTap.connect(panners[i]);
      sources.push(gainTap);
    }
  }

  let lastPresetId = getPresetId();
  let timeAccum = audioCtx.currentTime;

  function update(intensity, analyserLevel, dt) {
    const currentId = getPresetId();
    if (currentId !== lastPresetId) {
      lastPresetId = currentId;
      reinitPreset(currentId);
    }
    activePresetController.update(panners, dt, intensity, analyserLevel);
    timeAccum += dt;
  }

  return { connectSource, update, reinitPreset };
}