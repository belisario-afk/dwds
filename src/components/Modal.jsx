import React from "react";

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md glass rounded-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-brand-700/50 hover:bg-brand-600/80"
        >
          Close
        </button>
        <h2 className="text-lg font-semibold mb-4 skin-gradient">{title}</h2>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}