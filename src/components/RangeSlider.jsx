import React from "react";

export default function RangeSlider({ label, value, min, max, step, onChange }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] uppercase tracking-wider opacity-70">
        <span>{label}</span>
        <span className="font-medium">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        className="w-full accent-brand-400"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}