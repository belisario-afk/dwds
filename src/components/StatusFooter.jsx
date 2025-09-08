import React from "react";
import { useAppState } from "../state/store.js";

export default function StatusFooter() {
  const { fps, audioMode, isAnalyserActive } = useAppState();

  return (
    <div className="absolute bottom-3 right-4 z-[70] text-[10px] font-mono bg-black/40 rounded-md px-3 py-2 leading-tight space-y-1">
      <div className="flex gap-2">
        <span className="opacity-60">FPS:</span>
        <span className="text-brand-300">{fps.toFixed(0)}</span>
      </div>
      <div className="flex gap-2">
        <span className="opacity-60">Audio:</span>
        <span className="text-brand-200">{audioMode}</span>
      </div>
      <div className="flex gap-2">
        <span className="opacity-60">Analyser:</span>
        <span className={isAnalyserActive ? "text-emerald-300" : "text-rose-300"}>
          {isAnalyserActive ? "Active" : "Idle"}
        </span>
      </div>
    </div>
  );
}