export function createAudioGraph(audioCtx) {
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.7;
  const gainNode = audioCtx.createGain();
  gainNode.gain.value = 1.0;
  const masterOut = audioCtx.createGain();
  gainNode.connect(analyser);
  analyser.connect(masterOut);
  masterOut.connect(audioCtx.destination);
  return { analyser, gainNode, masterOut };
}

/**
 * Simulated 16D (multi-orbital) panner system.
 * We create multiple PannerNodes orbiting listener with cascading lat/long & vertical offsets.
 */
export function create16DPannerSystem(audioCtx, destination) {
  const ORBIT_COUNT = 8; // doubling with reflections
  const panners = [];
  const sources = [];
  const groupGain = audioCtx.createGain();
  groupGain.gain.value = 0.9;
  groupGain.connect(destination);

  for (let i = 0; i < ORBIT_COUNT; i++) {
    const p = audioCtx.createPanner();
    p.panningModel = "HRTF";
    p.distanceModel = "inverse";
    p.refDistance = 1;
    p.maxDistance = 50;
    p.rolloffFactor = 1;
    p.coneInnerAngle = 360;
    p.coneOuterAngle = 0;
    p.coneOuterGain = 0;
    p.connect(groupGain);
    panners.push(p);
  }

  function connectSource(bufferSource) {
    // Create parallel sends for each panner
    for (let i = 0; i < panners.length; i++) {
      const gainTap = audioCtx.createGain();
      gainTap.gain.value = 1 / panners.length;
      bufferSource.connect(gainTap);
      gainTap.connect(panners[i]);
      sources.push(gainTap);
    }
  }

  let timeStart = audioCtx.currentTime;

  function update(intensity) {
    const t = audioCtx.currentTime - timeStart;
    const baseRadius = 2.5 + intensity * 4;
    const verticalRange = 1.5 + intensity * 2.5;

    panners.forEach((p, i) => {
      const phase = t * (0.15 + (i * 0.02 + intensity * 0.3));
      const angle = phase + (Math.PI * 2 * i) / panners.length;
      const yOsc = Math.sin(phase * 0.7 + i) * 0.5;
      const radiusMod = baseRadius * (0.9 + 0.15 * Math.sin(phase * 0.5 + i));
      const x = Math.cos(angle) * radiusMod;
      const z = Math.sin(angle) * radiusMod;
      const y = yOsc * verticalRange * (i % 2 === 0 ? 1 : -1);
      p.setPosition(x, y, z);
    });
  }

  return { connectSource, update };
}