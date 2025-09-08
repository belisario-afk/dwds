import React, { useRef } from "react";
import { useAppState } from "../state/store.js";
import { useAudioEngine } from "../audio/useAudioEngine.js";
import RangeSlider from "./RangeSlider.jsx";
import Toggle from "./Toggle.jsx";

export default function ControlsPanel() {
  const fileInputRef = useRef(null);
  const {
    intensity,
    setIntensity,
    cameraMode,
    setCameraMode,
    spotifyToken,
    setSpotifyToken,
    spatialPreset,
    setSpatialPreset,
    masterGain,
    setMasterGain,
    loudnessBoost,
    setLoudnessBoost,
    enhancerAmount,
    setEnhancerAmount
  } = useAppState();
  const {
    isReady,
    isPlaying,
    togglePlay,
    loadFile,
    initUserAudio,
    connectSpotifyPlayback,
    error,
    currentTrack,
    disconnectSpotify,
    isSpotifyActive,
    restartSpatialPreset,
    applyAudioTuning
  } = useAudioEngine();

  function onFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    loadFile(file);
  }

  const presets = [
    { id: "orbit", label: "Orbit" },
    { id: "inside_you", label: "Inside You" },
    { id: "far_behind_to_close", label: "Far → Close" },
    { id: "spiral", label: "Spiral" },
    { id: "pulse_in_out", label: "Pulse In-Out" },
    { id: "enveloping_sphere", label: "Envelop Sphere" },
    { id: "overhead_rain", label: "Overhead Rain" }
  ];

  return (
    <div className="absolute bottom-4 left-4 z-[70] w-80 glass rounded-xl p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold tracking-wide opacity-80">Controls</h3>
        <span
          className={`badge ${
            isPlaying ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
          }`}
        >
          {isPlaying ? "Playing" : "Idle"}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            className="button-primary flex-1 text-xs"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload MP3
          </button>
          <input
            ref={fileInputRef}
            onChange={onFileSelected}
            type="file"
            accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
            className="hidden"
          />
          <button
            className="text-xs px-3 py-2 rounded-md bg-brand-700 hover:bg-brand-600 transition"
            onClick={togglePlay}
            disabled={!isReady}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>
        {!isReady && (
          <button
            className="w-full mt-1 text-xs px-3 py-2 rounded-md bg-brand-800 hover:bg-brand-700 transition"
            onClick={initUserAudio}
          >
            Enable Audio
          </button>
        )}
        {currentTrack && (
          <div className="text-[11px] leading-tight p-2 rounded bg-black/30">
            <div className="opacity-60">Track</div>
            <div className="font-medium truncate">{currentTrack.title}</div>
            {currentTrack.artist && (
              <div className="opacity-75 truncate">{currentTrack.artist}</div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <RangeSlider
          label="Intensity"
          min={0}
          max={1}
          step={0.01}
          value={intensity}
          onChange={setIntensity}
        />
        <div className="flex items-center justify-between text-xs">
          <span>Camera Mode</span>
          <div className="flex gap-2">
            <Toggle
              active={cameraMode === "seated"}
              onClick={() => setCameraMode("seated")}
              label="Seated"
            />
            <Toggle
              active={cameraMode === "free"}
              onClick={() => setCameraMode("free")}
              label="Free"
            />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-white/10 space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider opacity-60">
          Spatial Presets
        </div>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => setSpatialPreset(p.id)}
              className={`text-[10px] px-2 py-1 rounded border transition ${
                spatialPreset === p.id
                  ? "bg-gradient-to-r from-brand-500 to-brand-300 text-black font-semibold"
                  : "border-brand-600/40 hover:border-brand-400/80"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <button
          onClick={restartSpatialPreset}
          className="mt-1 w-full text-[11px] px-3 py-1.5 rounded bg-brand-700 hover:bg-brand-600 transition"
        >
          Restart Motion
        </button>
      </div>

      <div className="pt-2 border-t border-white/10 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider opacity-60">
          Audio Engine
        </div>
        <RangeSlider
          label="Master Gain"
          min={0}
          max={2}
          step={0.01}
          value={masterGain}
          onChange={(v) => {
            setMasterGain(v);
            applyAudioTuning({ masterGain: v });
          }}
        />
        <RangeSlider
          label="Enhancer"
          min={0}
          max={1}
          step={0.01}
          value={enhancerAmount}
          onChange={(v) => {
            setEnhancerAmount(v);
            applyAudioTuning({ enhancerAmount: v });
          }}
        />
        <div className="flex items-center justify-between text-xs">
          <span>Loudness Boost</span>
          <Toggle
            active={loudnessBoost}
            onClick={() => {
              const next = !loudnessBoost;
              setLoudnessBoost(next);
              applyAudioTuning({ loudnessBoost: next });
            }}
            label={loudnessBoost ? "On" : "Off"}
          />
        </div>
        <p className="text-[10px] opacity-50 leading-snug">
          Loudness & enhancer apply multi-band shelving + compression. Protect your ears—monitor levels.
        </p>
      </div>

      <div className="pt-2 border-t border-white/10 space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider opacity-60">
          Spotify
        </div>
        <input
          type="password"
          placeholder="Paste OAuth Token"
          value={spotifyToken}
          onChange={(e) => setSpotifyToken(e.target.value)}
          className="w-full bg-black/40 text-xs rounded px-2 py-1.5 outline-none focus:ring-1 ring-brand-400 placeholder:text-[10px]"
        />
        <div className="flex gap-2">
          <button
            onClick={() => connectSpotifyPlayback()}
            disabled={!spotifyToken}
            className="flex-1 text-xs px-3 py-2 rounded-md bg-gradient-to-r from-emerald-600 to-teal-500 disabled:opacity-40"
          >
            Connect
          </button>
          <button
            onClick={disconnectSpotify}
            disabled={!isSpotifyActive}
            className="flex-1 text-xs px-3 py-2 rounded-md bg-gradient-to-r from-rose-700 to-rose-500 disabled:opacity-40"
          >
            Disconnect
          </button>
        </div>
      </div>

      {error && (
        <div className="text-[10px] p-2 rounded bg-rose-950/60 text-rose-300">
          {error}
        </div>
      )}
    </div>
  );
}