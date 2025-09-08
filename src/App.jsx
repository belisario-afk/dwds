import React, { useEffect, useState } from "react";
import SceneContainer from "./components/SceneContainer.jsx";
import ControlsPanel from "./components/ControlsPanel.jsx";
import TopBar from "./components/TopBar.jsx";
import StatusFooter from "./components/StatusFooter.jsx";
import Modal from "./components/Modal.jsx";
import { useAppState } from "./state/store.js";

export default function App() {
  const [ready, setReady] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { skin, spatialPreset } = useAppState();

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`w-full h-full overflow-hidden relative fade-in skin-${skin} font-display selection:bg-brand-500/40 selection:text-white`}
    >
      <SceneContainer />
      <TopBar onHelp={() => setShowHelp(true)} />
      <ControlsPanel />
      <StatusFooter />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-[120]">
          <div className="text-center space-y-4">
            <div className="animate-pulse text-lg tracking-wide text-brand-200">
              Initializing Chamber...
            </div>
            <div className="w-64 h-1.5 rounded bg-brand-900 overflow-hidden">
              <div className="w-1/3 h-full bg-gradient-to-r from-brand-400 to-brand-200 animate-[load_1.6s_ease_infinite]" />
            </div>
          </div>
        </div>
      )}
      <Modal open={showHelp} onClose={() => setShowHelp(false)} title="Quick Start">
        <ol className="list-decimal ml-5 space-y-2 text-sm leading-relaxed">
          <li>Upload MP3 or enter Spotify token.</li>
          <li>Select a Spatial Preset (e.g. Enveloping Sphere, Far Behind → Close).</li>
          <li>Enable Loudness / Enhancer cautiously (can get very loud).</li>
          <li>Adjust Intensity, Master Gain & Camera Mode.</li>
          <li>Restart a preset motion path anytime.</li>
        </ol>
        <p className="text-xs mt-4 opacity-70">
          New advanced psychoacoustic chain: enhancer bands + multi-stage dynamics for loud,
          clean immersion.
        </p>
        <div className="mt-3 text-[11px] font-mono opacity-50">
          Active Preset: {spatialPreset}
        </div>
      </Modal>
    </div>
  );
}