import { useEffect, useRef, useState, useCallback } from "react";
import { useAppState } from "../state/store.js";
import { createAudioGraph, create16DPannerSystem } from "./webAudioGraph.js";
import { loadAudioBuffer } from "./webAudioUtils.js";
import { SpotifyManager } from "./SpotifyManager.js";

export function useAudioEngine() {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isSpotifyActive, setSpotifyActive] = useState(false);

  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const bufferRef = useRef(null);
  const analyserData = useRef({ array: new Uint8Array(256), level: 0 });
  const analyserRef = useRef(null);
  const pannerSystemRef = useRef(null);
  const spotifyRef = useRef(null);
  const frameRef = useRef(0);

  const { intensity, setAudioMode, spotifyToken, setAnalyserActive } = useAppState();

  const initUserAudio = useCallback(async () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)({
          latencyHint: "interactive"
        });
      }
      if (audioCtxRef.current.state === "suspended") {
        await audioCtxRef.current.resume();
      }
      if (!analyserRef.current) {
        const { analyser, gainNode, masterOut } = createAudioGraph(audioCtxRef.current);
        analyserRef.current = analyser;
        pannerSystemRef.current = create16DPannerSystem(audioCtxRef.current, masterOut);
      }
      setIsReady(true);
      setAudioMode("Local");
      setAnalyserActive(true);
    } catch (e) {
      setError(e.message);
    }
  }, [setAudioMode, setAnalyserActive]);

  const stopExistingSource = () => {
    try {
      if (sourceRef.current) {
        sourceRef.current.stop(0);
        sourceRef.current.disconnect();
      }
    } catch {}
    sourceRef.current = null;
  };

  const startPlayback = useCallback(() => {
    if (!audioCtxRef.current || !bufferRef.current) return;
    stopExistingSource();
    const src = audioCtxRef.current.createBufferSource();
    src.buffer = bufferRef.current;
    src.loop = true;
    pannerSystemRef.current.connectSource(src);
    const now = audioCtxRef.current.currentTime;
    src.start(now + 0.05);
    sourceRef.current = src;
    setIsPlaying(true);
    setCurrentTrack((t) => t || { title: "Local Audio", artist: "" });
  }, []);

  const togglePlay = () => {
    if (!isReady) return;
    if (!audioCtxRef.current) return;
    if (isSpotifyActive) {
      spotifyRef.current?.togglePlay();
      setIsPlaying((p) => !p);
      return;
    }
    if (!isPlaying) {
      if (!sourceRef.current) startPlayback();
      else {
        audioCtxRef.current.resume();
        setIsPlaying(true);
      }
    } else {
      audioCtxRef.current.suspend();
      setIsPlaying(false);
    }
  };

  const loadFile = async (file) => {
    setError("");
    try {
      await initUserAudio();
      const arrayBuf = await file.arrayBuffer();
      bufferRef.current = await loadAudioBuffer(audioCtxRef.current, arrayBuf);
      setCurrentTrack({ title: file.name.replace(/\.[a-z0-9]+$/i, ""), artist: "Local File" });
      startPlayback();
    } catch (e) {
      setError("Failed to load file: " + e.message);
    }
  };

  // Spotify integration
  const connectSpotifyPlayback = async () => {
    if (!spotifyToken) {
      setError("Spotify token required.");
      return;
    }
    await initUserAudio();
    if (!spotifyRef.current) {
      spotifyRef.current = new SpotifyManager({
        token: spotifyToken,
        onError: (m) => setError(m),
        onTrack: (meta) => setCurrentTrack(meta),
        audioCtx: audioCtxRef.current,
        pannerSystem: pannerSystemRef.current
      });
    } else {
      spotifyRef.current.setToken(spotifyToken);
    }
    try {
      await spotifyRef.current.connect();
      setSpotifyActive(true);
      setAudioMode("Spotify");
      setIsPlaying(true);
    } catch (e) {
      setError(e.message);
    }
  };

  const disconnectSpotify = () => {
    spotifyRef.current?.disconnect();
    setSpotifyActive(false);
    setAudioMode("Local");
    setIsPlaying(false);
  };

  // Per-frame analyser
  useEffect(() => {
    let mounted = true;
    function update() {
      if (!mounted) return;
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(analyserData.current.array);
        let sum = 0;
        const arr = analyserData.current.array;
        for (let i = 0; i < arr.length; i++) sum += arr[i];
        analyserData.current.level = sum / (arr.length * 255);
        if (pannerSystemRef.current) {
          pannerSystemRef.current.update(intensity);
        }
      }
      frameRef.current = requestAnimationFrame(update);
    }
    frameRef.current = requestAnimationFrame(update);
    return () => {
      mounted = false;
      cancelAnimationFrame(frameRef.current);
    };
  }, [intensity]);

  return {
    isReady,
    isPlaying,
    togglePlay,
    loadFile,
    initUserAudio,
    error,
    analyserData,
    connectSpotifyPlayback,
    disconnectSpotify,
    currentTrack,
    isSpotifyActive
  };
}