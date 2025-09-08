import React from "react";
import clsx from "clsx";

export default function Toggle({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "text-[11px] px-2 py-1 rounded-md border transition",
        active
          ? "bg-brand-500 text-black font-semibold"
          : "border-brand-600/40 hover:border-brand-400/70"
      )}
    >
      {label}
    </button>
  );
}