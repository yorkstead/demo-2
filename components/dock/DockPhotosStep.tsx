"use client";

import React, { RefObject } from "react";
import { Camera, ArrowRight } from "lucide-react";

interface DockPhotosStepProps {
  rescueContext?: any;
  before1: string;
  setBefore1: (p: string) => void;
  before2: string;
  setBefore2: (p: string) => void;
  fileInputBefore1Ref: RefObject<HTMLInputElement | null>;
  fileInputBefore2Ref: RefObject<HTMLInputElement | null>;
  handlePhotoCapture: (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => void;
  onBack: () => void;
  onContinue: () => void;
  isLandscape?: boolean;
}

export function DockPhotosStep({
  rescueContext,
  before1,
  setBefore1,
  before2,
  setBefore2,
  fileInputBefore1Ref,
  fileInputBefore2Ref,
  handlePhotoCapture,
  onBack,
  onContinue,
  isLandscape = false,
}: DockPhotosStepProps) {
  return (
    <div
      className={`bg-[#0f2238] border border-[#233f63] rounded-2xl shadow-xl ${
        isLandscape ? "p-3 sm:p-4 space-y-2.5" : "p-4 sm:p-5 space-y-4"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4af37]" />
            Step 2: &quot;Before&quot; Damage Photos
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Record inbound condition for office review</p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
          Location not captured
        </span>
      </div>

      {rescueContext && (
        <aside className="rounded-lg border border-amber-400/30 p-2.5 text-xs text-amber-100">
          <strong>Demo intake: {rescueContext.details.problem}</strong>
          <p>{rescueContext.details.receiverRequirements || "No receiver requirements supplied."}</p>
        </aside>
      )}

      {/* Photos Grid: 2 columns in landscape, 1 col in mobile portrait */}
      <div className={`grid gap-3 ${isLandscape ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
        {/* Photo 1: Wide Shot */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider truncate">
              Shot 1: Cargo Shift (Wide)
            </span>
            <span className="text-[10px] text-amber-400 font-medium shrink-0">Tap to retake</span>
          </div>

          <input
            type="file"
            ref={fileInputBefore1Ref}
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handlePhotoCapture(e, setBefore1)}
          />

          <div
            onClick={() => fileInputBefore1Ref.current?.click()}
            className={`group w-full rounded-xl overflow-hidden border-2 border-dashed border-[#233f63] hover:border-[#d4af37] bg-[#060d17] relative cursor-pointer transition ${
              isLandscape ? "h-32 sm:h-40" : "h-44 sm:h-60"
            }`}
            title="Tap to snap photo directly with tablet camera"
          >
            {before1 ? (
              <img src={before1} alt="Before shifted cargo" className="w-full h-full object-cover transition group-hover:scale-105 duration-300" />
            ) : (
              <span className="p-4 text-slate-400 text-xs">No before photo added</span>
            )}
            <div className="absolute top-1.5 left-1.5 text-[9px] sm:text-[10px] bg-black/85 px-1.5 py-0.5 rounded text-amber-300 font-mono font-bold">
              Location not captured
            </div>
            <div className="absolute bottom-1.5 right-1.5 text-[9px] sm:text-[10px] bg-black/80 px-1.5 py-0.5 rounded text-emerald-400 font-mono">
              {before1 ? "Photo added" : "Awaiting photo"}
            </div>
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition backdrop-blur-[1px]">
              <div className="w-8 h-8 rounded-full bg-[#d4af37] text-slate-950 flex items-center justify-center shadow-lg">
                <Camera className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Snap Photo</span>
            </div>
          </div>
        </div>

        {/* Photo 2: Close Up */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider truncate">
              Shot 2: Detail Defect (Close-Up)
            </span>
            <span className="text-[10px] text-amber-400 font-medium shrink-0">Tap to retake</span>
          </div>

          <input
            type="file"
            ref={fileInputBefore2Ref}
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handlePhotoCapture(e, setBefore2)}
          />

          <div
            onClick={() => fileInputBefore2Ref.current?.click()}
            className={`group w-full rounded-xl overflow-hidden border-2 border-dashed border-[#233f63] hover:border-[#d4af37] bg-[#060d17] relative cursor-pointer transition ${
              isLandscape ? "h-32 sm:h-40" : "h-44 sm:h-60"
            }`}
            title="Tap to snap photo directly with tablet camera"
          >
            {before2 ? (
              <img src={before2} alt="Detail defect" className="w-full h-full object-cover transition group-hover:scale-105 duration-300" />
            ) : (
              <span className="p-4 text-slate-400 text-xs">No detail photo added</span>
            )}
            <div className="absolute top-1.5 left-1.5 text-[9px] sm:text-[10px] bg-black/85 px-1.5 py-0.5 rounded text-rose-300 font-mono font-bold">
              Location not captured
            </div>
            <div className="absolute bottom-1.5 right-1.5 text-[9px] sm:text-[10px] bg-black/80 px-1.5 py-0.5 rounded text-emerald-400 font-mono">
              {before2 ? "Photo added" : "Awaiting photo"}
            </div>
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition backdrop-blur-[1px]">
              <div className="w-8 h-8 rounded-full bg-[#d4af37] text-slate-950 flex items-center justify-center shadow-lg">
                <Camera className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Snap Photo</span>
            </div>
          </div>
        </div>
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
          <span>Log Supplies &amp; Labor</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
