import React, { useEffect, useRef } from "react";
import { initScene, disposeScene, resizeRenderer } from "../three/scene.js";
import { useAppState } from "../state/store.js";
import { useAudioEngine } from "../audio/useAudioEngine.js";

export default function SceneContainer() {
  const mountRef = useRef(null);
  const { intensity, skin, cameraMode } = useAppState();
  const { analyserData } = useAudioEngine();

  useEffect(() => {
    if (!mountRef.current) return;
    const { updateProps } = initScene(mountRef.current, {
      skin,
      intensity,
      cameraMode,
      getAnalyser: () => analyserData.current
    });

    function handleResize() {
      resizeRenderer();
    }
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      disposeScene();
    };
  }, []);

  // Update props
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("scene:update", {
        detail: { skin, intensity, cameraMode }
      })
    );
  }, [skin, intensity, cameraMode]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none"
      aria-label="3D immersive scene"
    />
  );
}