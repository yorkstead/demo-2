"use client";

import React from "react";
import { Layers, ArrowRight } from "lucide-react";

interface DockSuppliesStepProps {
  liveTotal: number;
  pallets: number;
  setPallets: (n: number | ((prev: number) => number)) => void;
  wrap: number;
  setWrap: (n: number | ((prev: number) => number)) => void;
  corners: number;
  setCorners: (n: number | ((prev: number) => number)) => void;
  labor: number;
  setLabor: (n: number | ((prev: number) => number)) => void;
  scaleCheck: boolean;
  setScaleCheck: (b: boolean) => void;
  debrisFee: boolean;
  setDebrisFee: (b: boolean) => void;
  onBack: () => void;
  onContinue: () => void;
  isLandscape?: boolean;
}

export function DockSuppliesStep({
  liveTotal,
  pallets,
  setPallets,
  wrap,
  setWrap,
  corners,
  setCorners,
  labor,
  setLabor,
  scaleCheck,
  setScaleCheck,
  debrisFee,
  setDebrisFee,
  onBack,
  onContinue,
  isLandscape = false,
}: DockSuppliesStepProps) {
  return (
    <div
      className={`bg-[#0f2238] border border-[#233f63] rounded-2xl shadow-xl ${
        isLandscape ? "p-3 sm:p-4 space-y-2.5" : "p-4 sm:p-5 space-y-4"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4af37]" />
            Step 3: Supplies &amp; Labor Tally
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400">Tap to log items used on dock</p>
        </div>
        <div className="text-right">
          <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block">Live Invoice</span>
          <span className="text-lg sm:text-xl font-black text-[#d4af37] font-mono">${liveTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Counters Grid: 2 columns in landscape, stacked or 2 cols on tablet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
        {/* Pallets */}
        <div
          className={`bg-[#060d17] border border-[#233f63] rounded-xl flex items-center justify-between ${
            isLandscape ? "p-2 sm:p-2.5" : "p-3 sm:p-4"
          }`}
        >
          <div className="min-w-0 pr-2">
            <div className="text-xs sm:text-sm font-bold text-white truncate">New GMA Pallets</div>
            <div className="text-[10px] text-slate-400">$18.50 per wood pallet</div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setPallets((p) => Math.max(0, p - 1))}
              className={`rounded-lg bg-[#162b45] active:bg-[#233f63] text-white font-bold flex items-center justify-center hover:bg-[#233f63] transition cursor-pointer ${
                isLandscape ? "w-8 h-8 text-base" : "w-10 h-10 text-xl"
              }`}
            >
              -
            </button>
            <span className="w-7 text-center font-mono font-bold text-white text-sm sm:text-base">{pallets}</span>
            <button
              type="button"
              onClick={() => setPallets((p) => p + 1)}
              className={`rounded-lg bg-[#162b45] active:bg-[#233f63] text-white font-bold flex items-center justify-center hover:bg-[#233f63] transition cursor-pointer ${
                isLandscape ? "w-8 h-8 text-base" : "w-10 h-10 text-xl"
              }`}
            >
              +
            </button>
          </div>
        </div>

        {/* Stretch Wrap */}
        <div
          className={`bg-[#060d17] border border-[#233f63] rounded-xl flex items-center justify-between ${
            isLandscape ? "p-2 sm:p-2.5" : "p-3 sm:p-4"
          }`}
        >
          <div className="min-w-0 pr-2">
            <div className="text-xs sm:text-sm font-bold text-white truncate">Stretch Wrap (80ga)</div>
            <div className="text-[10px] text-slate-400">$25.00 per roll</div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setWrap((w) => Math.max(0, w - 1))}
              className={`rounded-lg bg-[#162b45] active:bg-[#233f63] text-white font-bold flex items-center justify-center hover:bg-[#233f63] transition cursor-pointer ${
                isLandscape ? "w-8 h-8 text-base" : "w-10 h-10 text-xl"
              }`}
            >
              -
            </button>
            <span className="w-7 text-center font-mono font-bold text-white text-sm sm:text-base">{wrap}</span>
            <button
              type="button"
              onClick={() => setWrap((w) => w + 1)}
              className={`rounded-lg bg-[#162b45] active:bg-[#233f63] text-white font-bold flex items-center justify-center hover:bg-[#233f63] transition cursor-pointer ${
                isLandscape ? "w-8 h-8 text-base" : "w-10 h-10 text-xl"
              }`}
            >
              +
            </button>
          </div>
        </div>

        {/* Corner Boards */}
        <div
          className={`bg-[#060d17] border border-[#233f63] rounded-xl flex items-center justify-between ${
            isLandscape ? "p-2 sm:p-2.5" : "p-3 sm:p-4"
          }`}
        >
          <div className="min-w-0 pr-2">
            <div className="text-xs sm:text-sm font-bold text-white truncate">Corner Boards (48&quot;)</div>
            <div className="text-[10px] text-slate-400">$3.00 each</div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setCorners((c) => Math.max(0, c - 2))}
              className={`rounded-lg bg-[#162b45] active:bg-[#233f63] text-white font-bold flex items-center justify-center hover:bg-[#233f63] transition cursor-pointer ${
                isLandscape ? "w-8 h-8 text-base" : "w-10 h-10 text-xl"
              }`}
            >
              -
            </button>
            <span className="w-7 text-center font-mono font-bold text-white text-sm sm:text-base">{corners}</span>
            <button
              type="button"
              onClick={() => setCorners((c) => c + 2)}
              className={`rounded-lg bg-[#162b45] active:bg-[#233f63] text-white font-bold flex items-center justify-center hover:bg-[#233f63] transition cursor-pointer ${
                isLandscape ? "w-8 h-8 text-base" : "w-10 h-10 text-xl"
              }`}
            >
              +
            </button>
          </div>
        </div>

        {/* Labor */}
        <div
          className={`bg-[#060d17] border border-[#233f63] rounded-xl flex items-center justify-between ${
            isLandscape ? "p-2 sm:p-2.5" : "p-3 sm:p-4"
          }`}
        >
          <div className="min-w-0 pr-2">
            <div className="text-xs sm:text-sm font-bold text-white truncate">Forklift &amp; Labor</div>
            <div className="text-[10px] text-slate-400">$125/hr (0.25h steps)</div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setLabor((l) => Math.max(0.25, l - 0.25))}
              className={`rounded-lg bg-[#162b45] active:bg-[#233f63] text-white font-bold flex items-center justify-center hover:bg-[#233f63] transition cursor-pointer ${
                isLandscape ? "w-8 h-8 text-base" : "w-10 h-10 text-xl"
              }`}
            >
              -
            </button>
            <span className="w-11 text-center font-mono font-bold text-white text-xs sm:text-sm">{labor.toFixed(2)}h</span>
            <button
              type="button"
              onClick={() => setLabor((l) => l + 0.25)}
              className={`rounded-lg bg-[#162b45] active:bg-[#233f63] text-white font-bold flex items-center justify-center hover:bg-[#233f63] transition cursor-pointer ${
                isLandscape ? "w-8 h-8 text-base" : "w-10 h-10 text-xl"
              }`}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label
          className={`flex items-center justify-between rounded-xl bg-[#060d17] border border-[#233f63] cursor-pointer hover:border-slate-500 transition ${
            isLandscape ? "p-2 text-xs" : "p-3 text-xs sm:text-sm"
          }`}
        >
          <span className="text-slate-300">Weight check ticket ($35.00)</span>
          <input
            type="checkbox"
            checked={scaleCheck}
            onChange={(e) => setScaleCheck(e.target.checked)}
            className="w-4 h-4 accent-[#d4af37] cursor-pointer"
          />
        </label>
        <label
          className={`flex items-center justify-between rounded-xl bg-[#060d17] border border-[#233f63] cursor-pointer hover:border-slate-500 transition ${
            isLandscape ? "p-2 text-xs" : "p-3 text-xs sm:text-sm"
          }`}
        >
          <span className="text-slate-300">Debris Disposal Fee (+$45.00)</span>
          <input
            type="checkbox"
            checked={debrisFee}
            onChange={(e) => setDebrisFee(e.target.checked)}
            className="w-4 h-4 accent-[#d4af37] cursor-pointer"
          />
        </label>
      </div>

      <div className={`flex gap-2.5 ${isLandscape ? "pt-1" : "pt-2"}`}>
        <button
          type="button"
          onClick={onBack}
          className={`w-1/3 rounded-xl border-2 border-[#233f63] hover:bg-[#162b45] text-slate-300 font-bold transition cursor-pointer ${
            isLandscape ? "py-2.5 text-xs sm:text-sm" : "py-4 sm:py-5 text-sm sm:text-base"
          }`}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          className={`w-2/3 rounded-xl bg-[#d4af37] hover:bg-[#b89628] active:scale-[0.99] text-[#0b192c] font-black flex items-center justify-center gap-2 transition shadow-xl shadow-[#d4af37]/20 cursor-pointer ${
            isLandscape ? "py-2.5 text-xs sm:text-sm" : "py-4 sm:py-5 text-base sm:text-lg"
          }`}
        >
          <span>Driver Glass Sign-Off</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
