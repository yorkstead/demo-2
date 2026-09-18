"use client";

import React, { RefObject } from "react";
import { Lock } from "lucide-react";

interface DockIdleScreensaverProps {
  screensaverRef: RefObject<HTMLDialogElement | null>;
  idleMinutes: number;
  setIdleMinutes: (minutes: number) => void;
  onDismiss: () => void;
  lastActivityRef: RefObject<number>;
  wakeGuardRef: RefObject<any>;
}

export function DockIdleScreensaver({
  screensaverRef,
  idleMinutes,
  setIdleMinutes,
  onDismiss,
}: DockIdleScreensaverProps) {
  return (
    <dialog
      ref={screensaverRef}
      tabIndex={-1}
      aria-label="Screen rest"
      onClick={onDismiss}
      className="fixed inset-0 m-0 h-full w-full max-h-none max-w-none border-0 bg-[#020617]/95 p-0 text-slate-100 backdrop:bg-black/80"
    >
      <div className="flex h-full w-full flex-col justify-between p-6 sm:p-10 select-none">
        <header className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-2 font-mono uppercase tracking-widest text-[#d4af37]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            Denver Express • Dock Stationary
          </span>
          <span className="flex items-center gap-1 font-mono">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            Touch-Guarded
          </span>
        </header>

        <section className="flex flex-col items-center justify-center text-center gap-3">
          <div className="rounded-2xl border border-[#233f63] bg-[#0b192c]/80 p-6 shadow-2xl backdrop-blur max-w-md w-full">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">
              Forklift Terminal Sleep Guard
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Screen Rest Active
            </h1>
            <p className="mt-2 text-xs text-slate-300">
              OLED burn-in protection enabled. Tap anywhere with work glove or stylus to resume.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Timeout:</span>
              {[15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIdleMinutes(mins);
                    try {
                      localStorage.setItem("dock-idle-minutes", String(mins));
                    } catch {}
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition ${
                    idleMinutes === mins
                      ? "bg-[#d4af37] text-[#0b192c] border-[#d4af37]"
                      : "bg-[#162b45] text-slate-300 border-[#233f63] hover:border-slate-500"
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        </section>

        <footer className="text-center text-xs text-slate-500 font-mono">
          First tap wakes terminal and arms 500ms phantom-touch rejection.
        </footer>
      </div>
    </dialog>
  );
}
