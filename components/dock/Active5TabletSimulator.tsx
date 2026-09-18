"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  RotateCw,
  Maximize2,
  Minimize2,
  Sliders,
  CreditCard,
  X,
  Info,
  ExternalLink,
  Shield,
  Layers,
  ChevronLeft,
} from "lucide-react";

// Standard ISO/IEC 7810 ID-1 credit card dimensions in mm
const CARD_WIDTH_MM = 85.6;
const CARD_HEIGHT_MM = 53.98;

// Common laptop & monitor PPI presets (approximate CSS-pixel density)
const DISPLAY_PRESETS = [
  { label: "14″ Laptop (1080p, 16:9)", ppi: 157, scale: 1.05 },
  { label: "15.6″ Laptop (1080p, 16:9)", ppi: 141, scale: 0.94 },
  { label: "13.3″ Laptop (1080p, 16:9)", ppi: 166, scale: 1.11 },
  { label: "14″ MacBook Pro (Retina / M-series)", ppi: 127, scale: 0.85 },
  { label: "16″ MacBook Pro (Retina / M-series)", ppi: 126, scale: 0.84 },
  { label: "24″ Desktop Monitor (1080p)", ppi: 92, scale: 0.61 },
  { label: "27″ Desktop Monitor (1440p)", ppi: 109, scale: 0.73 },
];

interface Active5TabletSimulatorProps {
  sessionId?: string;
  onExit?: () => void;
  initialOrientation?: "portrait" | "landscape";
}

export function Active5TabletSimulator({
  sessionId,
  onExit,
  initialOrientation,
}: Active5TabletSimulatorProps) {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(() => {
    if (initialOrientation) return initialOrientation;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const o = params.get("orientation");
      if (o === "landscape" || o === "portrait") return o;
    }
    return "portrait";
  });
  const [sizeMode, setSizeMode] = useState<"1to1" | "fit">("1to1");
  const [calibrationScale, setCalibrationScale] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rework_active5_calibrated_scale");
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val > 0.3 && val < 3.0) return val;
      }
    }
    return 0.95;
  });
  const [cardSliderWidthPx, setCardSliderWidthPx] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rework_active5_calibrated_scale");
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val > 0.3 && val < 3.0) return Math.round(val * 323.5);
      }
    }
    return 320;
  });
  const [showCalibration, setShowCalibration] = useState<boolean>(false);
  const [showSpecs, setShowSpecs] = useState<boolean>(false);
  const [activeTabName, setActiveTabName] = useState<string>("presets");
  const [windowSize, setWindowSize] = useState(() =>
    typeof window !== "undefined"
      ? { width: window.innerWidth, height: window.innerHeight }
      : { width: 1200, height: 800 }
  );

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleToggleOrientation = (next: "portrait" | "landscape") => {
    setOrientation(next);
    if (typeof window !== "undefined") {
      const u = new URL(window.location.href);
      u.searchParams.set("orientation", next);
      window.history.replaceState(null, "", u.toString());
    }
  };

  // Monitor window resize to handle "fit" mode dynamically
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
    }
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Compute scale for "fit" mode
  const fitScale = useMemo(() => {
    // Leave room for top toolbar (approx 60px) and margins
    const availableWidth = Math.max(windowSize.width - 60, 320);
    const availableHeight = Math.max(windowSize.height - 110, 400);

    const baseWidth = orientation === "portrait" ? 480 : 810;
    const baseHeight = orientation === "portrait" ? 810 : 480;

    const scaleW = availableWidth / baseWidth;
    const scaleH = availableHeight / baseHeight;
    return Math.min(scaleW, scaleH, 1.1);
  }, [windowSize, orientation]);

  // Effective scale applied to tablet
  const effectiveScale = useMemo(() => {
    if (sizeMode === "1to1") return calibrationScale;
    return fitScale;
  }, [sizeMode, calibrationScale, fitScale]);

  // Handle credit card calibration
  // A card is 85.6 mm. The tablet is 126.8 mm (portrait width).
  // Standard CSS assumes 1in = 96px => 1mm = 3.78px. Standard card at 96 DPI is ~323.5px.
  const handleCardSliderChange = (newWidthPx: number) => {
    setCardSliderWidthPx(newWidthPx);
    const newScale = Number((newWidthPx / 323.5).toFixed(3));
    setCalibrationScale(newScale);
    if (typeof window !== "undefined") {
      localStorage.setItem("rework_active5_calibrated_scale", newScale.toString());
    }
  };

  const handleSelectPreset = (presetScale: number) => {
    setCalibrationScale(presetScale);
    setCardSliderWidthPx(Math.round(presetScale * 323.5));
    if (typeof window !== "undefined") {
      localStorage.setItem("rework_active5_calibrated_scale", presetScale.toString());
    }
  };

  // Build iframe URL for /dock with embedded flag, orientation, and session
  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams();
    if (sessionId) params.set("session", sessionId);
    params.set("embedded", "true");
    params.set("orientation", orientation);
    return `/dock?${params.toString()}`;
  }, [sessionId, orientation]);

  // Synchronize orientation change to embedded dock frame
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "DOCK_ORIENTATION", orientation },
        "*"
      );
    }
  }, [orientation]);

  const handleExitSimulator = React.useCallback(() => {
    if (onExit) {
      onExit();
    } else if (typeof window !== "undefined") {
      const u = new URL(window.location.href);
      u.searchParams.delete("frame");
      u.searchParams.delete("orientation");
      window.location.href = u.pathname + (u.searchParams.toString() ? `?${u.searchParams.toString()}` : "");
    }
  }, [onExit]);

  // Keyboard shortcut (Escape) and postMessage listener to exit tablet view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleExitSimulator();
      }
    };
    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === "EXIT_TABLET_FRAME") {
        handleExitSimulator();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("message", handleMsg);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("message", handleMsg);
    };
  }, [handleExitSimulator]);

  // Hardware navigation buttons click actions
  const handleHardwareHome = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "DOCK_NAV", action: "home" }, "*");
      iframeRef.current.contentWindow.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleHardwareBack = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "DOCK_NAV", action: "back" }, "*");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050b14] text-slate-100 select-none overflow-hidden font-sans">
      {/* TOP PRESENTATION TOOLBAR */}
      <header className="h-14 bg-[#0a1424]/95 border-b border-[#1f375b] px-3 sm:px-6 flex items-center justify-between gap-2 shrink-0 backdrop-blur z-20 shadow-lg">
        {/* Left: Device Name & Badge */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 bg-[#d4af37]/15 border border-[#d4af37]/40 px-2.5 py-1 rounded-lg shrink-0">
            <Shield className="w-4 h-4 text-[#d4af37]" />
            <span className="text-xs font-black tracking-wider text-[#d4af37] uppercase">
              Tab Active5
            </span>
          </div>
          <span className="hidden md:inline text-xs text-slate-400 font-medium">
            8.0″ WUXGA (16:10) • Forklift Terminal Simulator
          </span>
        </div>

        {/* Center: Controls Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Orientation Switcher: Portrait vs Landscape */}
          <div className="bg-[#0f1d30] p-0.5 rounded-lg border border-[#1f375b] flex items-center text-xs">
            <button
              type="button"
              onClick={() => handleToggleOrientation("portrait")}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                orientation === "portrait"
                  ? "bg-[#38bdf8] text-[#071322] shadow-sm font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
              title="Handheld trailer walkaround & driver signature (Portrait)"
            >
              <span>Portrait</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleOrientation("landscape")}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                orientation === "landscape"
                  ? "bg-[#38bdf8] text-[#071322] shadow-sm font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
              title="Forklift RAM® Powered Pogo Dock mount (Landscape)"
            >
              <RotateCw className="w-3 h-3" />
              <span>Landscape</span>
            </button>
          </div>

          {/* Size Mode Segmented Control */}
          <div className="bg-[#0f1d30] p-0.5 rounded-lg border border-[#1f375b] flex items-center text-xs">
            <button
              type="button"
              onClick={() => setSizeMode("1to1")}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                sizeMode === "1to1"
                  ? "bg-[#d4af37] text-[#0b192c] shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
              title="Calibrate to exact physical 8.0-inch tablet size on your laptop screen"
            >
              1:1 True Size
            </button>
            <button
              type="button"
              onClick={() => setSizeMode("fit")}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                sizeMode === "fit"
                  ? "bg-[#d4af37] text-[#0b192c] shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
              title="Scale tablet to fit comfortably inside your laptop screen"
            >
              Fit Screen
            </button>
          </div>

          {/* Sizing / Calibration Trigger */}
          <button
            type="button"
            onClick={() => setShowCalibration((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
              showCalibration
                ? "bg-[#38bdf8]/20 border-[#38bdf8] text-[#38bdf8]"
                : "bg-[#162a45] hover:bg-[#203c63] border-[#274873] text-slate-300"
            }`}
            title="Calibrate exact screen size using credit card or monitor presets"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="hidden md:inline">Calibrate 1:1</span>
          </button>

          {/* Hardware Specs Info Button */}
          <button
            type="button"
            onClick={() => setShowSpecs((prev) => !prev)}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              showSpecs
                ? "bg-amber-500/20 border-amber-500 text-amber-300"
                : "bg-[#162a45] hover:bg-[#203c63] border-[#274873] text-slate-300"
            }`}
            title="Tab Active5 hardware specifications & RAM dock details"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Office Screen Link & Exit */}
        <div className="flex items-center gap-2">
          {sessionId && (
            <a
              href={`/office?session=${encodeURIComponent(sessionId)}`}
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1 text-xs bg-[#162a45] hover:bg-[#203c63] text-slate-200 border border-[#274873] px-2.5 py-1.5 rounded-lg font-semibold"
            >
              <span>Office Board</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}

          <button
            type="button"
            onClick={handleExitSimulator}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-md transition cursor-pointer"
            title="Exit tablet simulator and return to full browser view (or press Esc)"
          >
            <X className="w-3.5 h-3.5 stroke-[3]" />
            <span>Exit Tablet View</span>
          </button>
        </div>
      </header>

      {/* CALIBRATION MODAL / POPOVER */}
      {showCalibration && (
        <div className="absolute top-16 right-4 sm:right-16 z-40 w-84 sm:w-96 bg-[#0f2238] border-2 border-[#2b5182] rounded-2xl p-4 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-[#233f63] pb-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#d4af37]" />
              <h3 className="text-sm font-bold text-white">1:1 Physical Sizing Calibration</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowCalibration(false)}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Displays differ in pixel density (PPI). Calibrate once so the tablet matches the <b>exact 8.0-inch physical dimensions</b> of a real Active5 on your laptop.
          </p>

          {/* Tab buttons */}
          <div className="grid grid-cols-2 gap-1 bg-[#091524] p-1 rounded-lg border border-[#1b3457] text-xs">
            <button
              type="button"
              onClick={() => setActiveTabName("presets")}
              className={`py-1.5 rounded font-semibold transition cursor-pointer ${
                activeTabName === "presets" ? "bg-[#203f6b] text-white" : "text-slate-400"
              }`}
            >
              Laptop Presets
            </button>
            <button
              type="button"
              onClick={() => setActiveTabName("card")}
              className={`py-1.5 rounded font-semibold transition cursor-pointer ${
                activeTabName === "card" ? "bg-[#203f6b] text-white" : "text-slate-400"
              }`}
            >
              Credit Card Match
            </button>
          </div>

          {activeTabName === "presets" ? (
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {DISPLAY_PRESETS.map((p) => {
                const isSelected = Math.abs(calibrationScale - p.scale) < 0.02;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleSelectPreset(p.scale)}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-xs flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? "bg-[#38bdf8]/15 border-[#38bdf8] text-[#38bdf8] font-bold"
                        : "bg-[#14263d] hover:bg-[#1a3352] border-[#224168] text-slate-300"
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className="font-mono text-[10px] text-slate-400">{p.ppi} PPI</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-[#0a1524] border border-[#1f375b] rounded-xl p-3 text-center space-y-2">
                <span className="text-[11px] text-slate-300 block">
                  Hold any standard credit card / ID against the box below and drag the slider until they match:
                </span>
                <div className="flex justify-center py-2">
                  <div
                    style={{
                      width: `${cardSliderWidthPx}px`,
                      height: `${(cardSliderWidthPx * (CARD_HEIGHT_MM / CARD_WIDTH_MM)).toFixed(1)}px`,
                    }}
                    className="border-2 border-dashed border-[#d4af37] bg-[#d4af37]/10 rounded-lg flex items-center justify-center text-[#d4af37] font-bold text-xs tracking-wider transition-all"
                  >
                    STANDARD CREDIT CARD (85.6 mm)
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Smaller</span>
                    <span className="font-mono text-[#d4af37]">Scale: {(calibrationScale * 100).toFixed(0)}%</span>
                    <span>Larger</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="450"
                    value={cardSliderWidthPx}
                    onChange={(e) => handleCardSliderChange(parseInt(e.target.value))}
                    className="w-full accent-[#d4af37] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-[#233f63] pt-2">
            <span>Calibrated Scale: <b>{(calibrationScale * 100).toFixed(0)}%</b></span>
            <button
              type="button"
              onClick={() => {
                setSizeMode("1to1");
                setShowCalibration(false);
              }}
              className="bg-[#d4af37] hover:bg-[#b5952f] text-[#0b192c] px-3 py-1 rounded font-bold transition cursor-pointer"
            >
              Apply 1:1
            </button>
          </div>
        </div>
      )}

      {/* HARDWARE SPECS MODAL */}
      {showSpecs && (
        <div className="absolute top-16 right-4 sm:right-28 z-40 w-80 bg-[#0f2238] border-2 border-amber-500/50 rounded-2xl p-4 shadow-2xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[#233f63] pb-2">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Tab Active5 Specifications</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowSpecs(false)}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs space-y-2 text-slate-300">
            <div className="flex justify-between border-b border-[#1b3457] py-1">
              <span className="text-slate-400">Display:</span>
              <span className="font-semibold text-white">8.0″ WUXGA (1920×1200), 120Hz</span>
            </div>
            <div className="flex justify-between border-b border-[#1b3457] py-1">
              <span className="text-slate-400">Chassis Dimensions:</span>
              <span className="font-semibold text-white">213.8 × 126.8 × 10.1 mm</span>
            </div>
            <div className="flex justify-between border-b border-[#1b3457] py-1">
              <span className="text-slate-400">Rugged Rating:</span>
              <span className="font-semibold text-amber-300">MIL-STD-810H &amp; IP68</span>
            </div>
            <div className="flex justify-between border-b border-[#1b3457] py-1">
              <span className="text-slate-400">Forklift Dock:</span>
              <span className="font-semibold text-white">RAM® Powered Pogo Dock</span>
            </div>
            <div className="flex justify-between border-b border-[#1b3457] py-1">
              <span className="text-slate-400">Battery:</span>
              <span className="font-semibold text-white">5,050 mAh (Replaceable)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Touch Mode:</span>
              <span className="font-semibold text-emerald-400">Heavy Glove Sensitivity</span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT: STAGED TABLET CONTAINER */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-auto bg-[radial-gradient(#182f4d_1px,transparent_1px)] [background-size:20px_20px] relative">
        {/* PHYSICAL TABLET SHELL */}
        <div
          style={{
            transform: `scale(${effectiveScale})`,
            transformOrigin: "center center",
            transition: "transform 0.15s ease-out",
          }}
          className="relative shrink-0 flex items-center justify-center"
        >
          {/* THE RUGGED OUTER CASING */}
          <div
            className={`relative bg-[#15191e] border-4 border-[#242930] rounded-[36px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_0_2px_#323b47] flex flex-col items-center justify-between transition-all duration-300 ${
              orientation === "portrait"
                ? "w-[480px] h-[810px] p-3"
                : "w-[810px] h-[480px] p-3 flex-row"
            }`}
          >
            {/* CORNER BUMPERS (Active5 Rugged Protective Corners) */}
            <div className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-tl-[20px] border-t-4 border-l-4 border-[#3f4754] pointer-events-none"></div>
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-tr-[20px] border-t-4 border-r-4 border-[#3f4754] pointer-events-none"></div>
            <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 rounded-bl-[20px] border-b-4 border-l-4 border-[#3f4754] pointer-events-none"></div>
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-br-[20px] border-b-4 border-r-4 border-[#3f4754] pointer-events-none"></div>

            {/* POGO PIN CHARGING DOCK CONTACTS (Edge) */}
            {orientation === "portrait" ? (
              <div
                className="absolute -left-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-1 bg-[#101317] rounded-r border border-[#2d343f]"
                title="RAM® Forklift Pogo Pin Contacts"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shadow-[0_0_3px_gold]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shadow-[0_0_3px_gold]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shadow-[0_0_3px_gold]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shadow-[0_0_3px_gold]"></div>
              </div>
            ) : (
              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex flex-row gap-2 p-1 bg-[#101317] rounded-t border border-[#2d343f]"
                title="RAM® Forklift Pogo Pin Contacts"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shadow-[0_0_3px_gold]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shadow-[0_0_3px_gold]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shadow-[0_0_3px_gold]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shadow-[0_0_3px_gold]"></div>
              </div>
            )}

            {/* ACTIVE PHYSICAL KEY (Accent button on side) */}
            <div
              className={`absolute bg-gradient-to-r from-orange-600 to-amber-500 rounded-sm shadow cursor-pointer ${
                orientation === "portrait"
                  ? "-right-1.5 top-28 w-1 h-10"
                  : "-top-1.5 right-28 h-1 w-10"
              }`}
              title="Custom Active Key (Wake / Foreground)"
            ></div>

            {/* TOP / LEFT BEZEL: Camera, Speaker & Ambient Sensor */}
            <div
              className={`flex items-center justify-center shrink-0 ${
                orientation === "portrait"
                  ? "h-9 w-full flex-row gap-4"
                  : "w-9 h-full flex-col gap-4"
              }`}
            >
              {/* Speaker Slit */}
              <div
                className={`bg-[#0d1014] rounded-full border border-[#282f3a] ${
                  orientation === "portrait" ? "w-14 h-1.5" : "h-14 w-1.5"
                }`}
              ></div>
              {/* Front Camera */}
              <div
                className="w-3.5 h-3.5 rounded-full bg-[#05070a] border border-[#2e3745] flex items-center justify-center relative shadow-inner"
                title="Front-facing Camera"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#1b3b6f]"></div>
              </div>
              {/* Ambient Sensor */}
              <div className="w-1.5 h-1.5 rounded-full bg-[#0d1014]"></div>
            </div>

            {/* INNER SCREEN FRAME (16:10 Aspect Ratio Display Glass) */}
            <div
              className={`relative bg-black rounded-2xl overflow-hidden border-2 border-[#1c222b] shadow-inner ${
                orientation === "portrait"
                  ? "flex-1 w-full min-h-0"
                  : "flex-1 h-full min-w-0"
              }`}
            >
              <iframe
                ref={iframeRef}
                src={iframeSrc}
                title="Denver Express Dock Terminal - Galaxy Tab Active5"
                className="w-full h-full border-0 bg-[#060d17]"
              />
            </div>

            {/* BOTTOM / RIGHT BEZEL: Physical Glove-Friendly Navigation Keys */}
            <div
              className={`flex items-center justify-center shrink-0 ${
                orientation === "portrait"
                  ? "h-11 w-full flex-row gap-12"
                  : "w-11 h-full flex-col gap-12"
              }`}
            >
              {/* Recents Key */}
              <button
                type="button"
                className="text-slate-500 hover:text-slate-300 transition p-1 cursor-pointer"
                title="Android Recents Button"
              >
                <Layers className="w-4 h-4" />
              </button>

              {/* Physical Home Key */}
              <button
                type="button"
                onClick={handleHardwareHome}
                className="px-4 py-1 rounded-full bg-[#20252e] hover:bg-[#2c3442] border border-[#374150] text-slate-400 hover:text-white transition shadow-sm cursor-pointer"
                title="Physical Home Key"
              >
                <div className="w-4 h-2 border-2 border-current rounded-sm"></div>
              </button>

              {/* Back Key */}
              <button
                type="button"
                onClick={handleHardwareBack}
                className="text-slate-500 hover:text-slate-300 transition p-1 cursor-pointer"
                title="Android Back Button"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER BAR: LIVE STATUS & QUICK TIP */}
      <footer className="h-7 bg-[#070e1a] border-t border-[#162740] px-4 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>
            Active Mode: <b>{orientation === "portrait" ? "Handheld (Portrait)" : "RAM Dock (Landscape)"}</b>
          </span>
          <span className="text-slate-600">|</span>
          <span>Physical Dimensions: <b>{orientation === "portrait" ? "126.8 × 213.8 mm" : "213.8 × 126.8 mm"}</b></span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-slate-500">
          <span>Tip: Tap &quot;1:1 True Size&quot; to show actual physical scale to your client</span>
        </div>
      </footer>
    </div>
  );
}
