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
    setSpotifyToken
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
    isSpotifyActive
  } = useAudioEngine();

  function onFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    loadFile(file);
  }

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
            <div className="font-medium">{currentTrack.title}</div>
            {currentTrack.artist && (
              <div className="opacity-75">{currentTrack.artist}</div>
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
        <p className="text-[10px] opacity-50 leading-snug">
          Token must include: streaming user-read-playback-state
          user-modify-playback-state user-read-email user-read-private
        </p>
      </div>

      {error && (
        <div className="text-[10px] p-2 rounded bg-rose-950/60 text-rose-300">
          {error}
        </div>
      )}
    </div>
  );
}