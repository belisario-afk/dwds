import React, { createContext, useContext, useRef, useEffect } from "react";
import create from "zustand";

const useStoreBase = create((set) => ({
  skin: "cosmic",
  setSkin: (skin) => set({ skin }),
  intensity: 0.5,
  setIntensity: (intensity) => set({ intensity }),
  cameraMode: "seated",
  setCameraMode: (cameraMode) => set({ cameraMode }),
  spotifyToken: "",
  setSpotifyToken: (spotifyToken) => set({ spotifyToken }),
  fps: 0,
  setFps: (fps) => set({ fps }),
  audioMode: "None",
  setAudioMode: (audioMode) => set({ audioMode }),
  isAnalyserActive: false,
  setAnalyserActive: (isAnalyserActive) => set({ isAnalyserActive })
}));

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const storeRef = useRef();
  if (!storeRef.current) {
    storeRef.current = useStoreBase;
  }

  // Simple FPS meter
  useEffect(() => {
    let last = performance.now();
    let frames = 0;
    let accum = 0;
    let rafId;
    const loop = (t) => {
      const dt = t - last;
      last = t;
      frames++;
      accum += dt;
      if (accum >= 1000) {
        storeRef.current
          .getState()
          .setFps(frames * (1000 / accum));
        frames = 0;
        accum = 0;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Return without JSX to avoid Vite parse errors in .js files
  return React.createElement(
    AppStateContext.Provider,
    { value: storeRef.current },
    children
  );
}

export function useAppState(selector = (s) => s) {
  const store = useContext(AppStateContext);
  if (!store) {
    throw new Error("useAppState must be used within provider");
  }
  return store(selector);
}