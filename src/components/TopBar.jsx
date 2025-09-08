import React from "react";
import { useAppState } from "../state/store.js";

export default function TopBar({ onHelp }) {
  const { skin, setSkin } = useAppState();

  const skins = [
    { id: "cosmic", label: "Cosmic" },
    { id: "grid", label: "Neon Grid" },
    { id: "cyber", label: "Cyberpunk" },
    { id: "nature", label: "Nature Temple" }
  ];

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[60] flex gap-3 items-center glass rounded-2xl px-5 py-2">
      <div className="text-xs uppercase tracking-widest font-semibold opacity-70">
        IMMERSIVE MUSIC ROOM
      </div>
      <div className="flex gap-2">
        {skins.map((s) => (
          <button
            key={s.id}
            onClick={() => setSkin(s.id)}
            className={`text-xs px-3 py-1 rounded-full border transition ${
              skin === s.id
                ? "bg-gradient-to-r from-brand-500 to-brand-300 text-black font-semibold"
                : "border-brand-600/40 hover:border-brand-400/80"
            }`}
            aria-label={`Select ${s.label} skin`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <button
        onClick={onHelp}
        className="ml-2 text-xs px-3 py-1 rounded-full border border-brand-600/40 hover:border-brand-400/80 transition"
      >
        Help
      </button>
    </div>
  );
}