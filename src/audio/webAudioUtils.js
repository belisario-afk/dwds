export function loadAudioBuffer(audioCtx, arrayBuffer) {
  return new Promise((resolve, reject) => {
    audioCtx.decodeAudioData(
      arrayBuffer.slice(0),
      (decoded) => resolve(decoded),
      (err) => reject(err)
    );
  });
}