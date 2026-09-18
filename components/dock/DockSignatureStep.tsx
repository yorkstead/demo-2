"use client";

import React, { RefObject } from "react";
import { CheckCircle, Maximize2, AlertTriangle, Send } from "lucide-react";

interface DockSignatureStepProps {
  liveTotal: number;
  driverName: string;
  afterPhoto: string;
  setAfterPhoto: (p: string) => void;
  fileInputAfterRef: RefObject<HTMLInputElement | null>;
  handlePhotoCapture: (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => void;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  hasDrawnSignature: boolean;
  savedSignature: string | null;
  startDrawing: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  draw: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
  loadSampleSignature: () => void;
  clearCanvas: () => void;
  setIsFullScreenSig: (b: boolean) => void;
  submitError: string | null;
  submitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
  isLandscape?: boolean;
}

export function DockSignatureStep({
  liveTotal,
  driverName,
  afterPhoto,
  setAfterPhoto,
  fileInputAfterRef,
  handlePhotoCapture,
  canvasRef,
  hasDrawnSignature,
  savedSignature,
  startDrawing,
  draw,
  stopDrawing,
  loadSampleSignature,
  clearCanvas,
  setIsFullScreenSig,
  submitError,
  submitting,
  onBack,
  onSubmit,
  isLandscape = false,
}: DockSignatureStepProps) {
  return (
    <div
      className={`bg-[#0f2238] border border-[#233f63] rounded-2xl shadow-xl ${
        isLandscape ? "p-3 sm:p-4 space-y-2.5" : "p-4 sm:p-5 space-y-4"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            Step 4: &quot;After&quot; Proof &amp; Sign-Off
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400">Road-ready proof &amp; driver sign on glass</p>
        </div>
        <span className="text-xs font-mono font-bold text-[#d4af37] bg-[#d4af37]/15 px-2 py-0.5 rounded border border-[#d4af37]/30">
          ${liveTotal.toFixed(2)}
        </span>
      </div>

      {/* Content Grid: 2 columns in landscape, 1 col in mobile portrait */}
      <div className={`grid gap-3 ${isLandscape ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2"}`}>
        {/* Left Column: After Photo Proof & Disclaimer */}
        <div className="space-y-1.5 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider truncate">
                Restacked &amp; Road-Ready Photo
              </span>
              <span className="text-[10px] text-emerald-400 font-medium shrink-0">Tap to retake</span>
            </div>

            <input
              type="file"
              ref={fileInputAfterRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handlePhotoCapture(e, setAfterPhoto)}
            />

            <div
              onClick={() => fileInputAfterRef.current?.click()}
              className={`group w-full rounded-xl overflow-hidden border-2 border-emerald-500/50 hover:border-emerald-400 bg-[#060d17] relative cursor-pointer transition ${
                isLandscape ? "h-32 sm:h-38" : "h-48 sm:h-56"
              }`}
              title="Tap to snap photo directly with tablet camera"
            >
              {afterPhoto ? (
                <img src={afterPhoto} alt="After rework completed" className="w-full h-full object-contain" />
              ) : (
                <span className="p-4 text-slate-400 text-xs">No after photo added</span>
              )}
              <div className="absolute top-1.5 left-1.5 text-[9px] sm:text-[10px] bg-black/85 px-1.5 py-0.5 rounded text-emerald-300 font-mono font-bold">
                Location not captured
              </div>
              <div className="absolute bottom-1.5 right-1.5 text-[9px] sm:text-[10px] bg-black/80 px-1.5 py-0.5 rounded text-emerald-400 font-mono">
                {afterPhoto ? "Photo added" : "Awaiting photo"}
              </div>
            </div>
          </div>

          <p className="text-[9px] sm:text-[10px] text-slate-400 leading-tight bg-[#060d17] p-1.5 sm:p-2 rounded-lg border border-[#233f63]">
            &ldquo;Driver certifies cargo has been inspected, restacked on GMA pallets, shrinkwrapped, and released in road-ready condition.&rdquo;
          </p>
        </div>

        {/* Right Column: Signature Canvas */}
        <div className="space-y-1.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider truncate">
                Driver Sign: <strong className="text-white">{driverName}</strong>
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFullScreenSig(true)}
                  className="inline-flex items-center gap-1 text-[10px] text-[#d4af37] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 px-1.5 py-0.5 rounded border border-[#d4af37]/30 font-bold transition cursor-pointer"
                  title="Sign full screen"
                >
                  <Maximize2 className="w-2.5 h-2.5" />
                  Full
                </button>
                <button
                  type="button"
                  onClick={loadSampleSignature}
                  className="text-[10px] text-sky-400 hover:text-sky-300 hover:underline cursor-pointer"
                >
                  Demo
                </button>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-[10px] text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div
              className={`bg-slate-900 border-2 border-[#233f63] rounded-xl overflow-hidden touch-none relative group ${
                isLandscape ? "h-32 sm:h-38" : "h-36 sm:h-44"
              }`}
            >
              <canvas
                ref={canvasRef}
                width={600}
                height={180}
                className="w-full h-full bg-slate-950 cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {!hasDrawnSignature && !savedSignature && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-[11px] text-slate-500 gap-1 px-4 text-center">
                  <span>Sign with finger or stylus here</span>
                  <span className="text-[9px] text-slate-600">💡 Tap &ldquo;Demo&rdquo; to fill sample</span>
                </div>
              )}
            </div>
          </div>

          {!hasDrawnSignature && !savedSignature && (
            <span className="text-[10px] text-amber-400 font-medium block text-center">
              ⚠️ Driver signature required before dispatch
            </span>
          )}
        </div>
      </div>

      {/* Submission Error Banner */}
      {submitError && (
        <div className="p-2.5 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-start gap-2 animate-shake">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block text-white">Submission Failed</span>
            <span className="text-[11px]">{submitError}</span>
          </div>
          <button
            type="button"
            onClick={onSubmit}
            className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold shrink-0 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

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
          disabled={submitting || (!hasDrawnSignature && !savedSignature)}
          onClick={onSubmit}
          className={`w-2/3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-[#0b192c] font-black flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer ${
            isLandscape ? "py-2.5 text-xs sm:text-sm" : "py-4 sm:py-5 text-base sm:text-lg"
          }`}
        >
          {submitting ? (
            <span>DISPATCHING...</span>
          ) : (
            <>
              <Send className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span>DISPATCH CERTIFICATE</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
