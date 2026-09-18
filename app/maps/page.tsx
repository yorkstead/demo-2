"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  Phone,
  Navigation,
  Share2,
  Bookmark,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Layers,
  ChevronLeft,
  Truck,
} from "lucide-react";

export default function GoogleMapsSimulationPage() {
  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const s = new URLSearchParams(window.location.search).get("session");
      if (s) return s;
    }
    return "demo-main";
  });

  return (
    <main className="min-h-screen bg-[#1c1f24] text-white flex flex-col items-center justify-center p-0 sm:p-4 font-sans">
      
      {/* Phone Frame Container */}
      <div className="relative w-full max-w-md h-[100dvh] sm:h-[844px] bg-[#121417] sm:rounded-[40px] sm:border-8 sm:border-[#2d3239] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Presenter Banner */}
        <div className="bg-[#0b192c] border-b border-[#233f63] px-3 py-2 flex items-center justify-between text-[11px] text-slate-300 z-30">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-[#d4af37]">DEMO MODE:</span>
            <span>Google Maps Driver Discovery</span>
          </div>
          <Link
            href={sessionId ? `/?session=${encodeURIComponent(sessionId)}` : "/"}
            className="text-[10px] text-slate-400 hover:text-white underline flex items-center gap-1"
          >
            <ChevronLeft className="w-3 h-3" /> Hub
          </Link>
        </div>

        {/* Simulated Google Maps Viewport */}
        <div className="relative flex-1 bg-[#1a2332] overflow-hidden">
          
          {/* SVG Map Background Mockup (Denver I-25 / I-70 Interchange "The Mousetrap") */}
          <div className="absolute inset-0 opacity-60 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#23344d" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Highway I-70 Horizontal */}
              <path d="M -20 220 C 150 210, 250 225, 450 215" fill="none" stroke="#475569" strokeWidth="14" />
              <path d="M -20 220 C 150 210, 250 225, 450 215" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6 4" />
              
              {/* Highway I-25 Vertical */}
              <path d="M 210 -20 C 215 150, 205 320, 220 500" fill="none" stroke="#475569" strokeWidth="14" />
              <path d="M 210 -20 C 215 150, 205 320, 220 500" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6 4" />

              {/* Mousetrap Interchange Loop */}
              <circle cx="212" cy="218" r="34" fill="none" stroke="#64748b" strokeWidth="5" />

              {/* River / Clear Creek */}
              <path d="M -20 310 Q 180 270, 420 330" fill="none" stroke="#1e3a8a" strokeWidth="8" opacity="0.4" />

              {/* Highway Shields / Labels */}
              <rect x="30" y="195" width="44" height="20" rx="4" fill="#1e293b" stroke="#64748b" />
              <text x="36" y="210" fill="#cbd5e1" fontSize="11" fontWeight="bold" fontFamily="monospace">I-70</text>

              <rect x="225" y="60" width="44" height="20" rx="4" fill="#1e293b" stroke="#64748b" />
              <text x="231" y="75" fill="#cbd5e1" fontSize="11" fontWeight="bold" fontFamily="monospace">I-25</text>

              {/* Competitor Pin A */}
              <circle cx="90" cy="180" r="6" fill="#64748b" />
              <text x="75" y="168" fill="#94a3b8" fontSize="9">Mile High CD</text>

              {/* Competitor Pin B */}
              <circle cx="340" cy="240" r="6" fill="#64748b" />
              <text x="310" y="260" fill="#94a3b8" fontSize="9">Roadrunner CO</text>

              {/* Denver Express Pulsing Target Pin */}
              <circle cx="230" cy="170" r="22" fill="#d4af37" opacity="0.25" className="animate-ping" />
              <circle cx="230" cy="170" r="14" fill="#d4af37" opacity="0.4" />
              <circle cx="230" cy="170" r="7" fill="#f59e0b" />
            </svg>
          </div>

          {/* Floating Search Bar */}
          <div className="absolute top-3 inset-x-3 z-20">
            <div className="bg-[#24292f] border border-[#373e47] rounded-full shadow-2xl px-4 py-2.5 flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400" />
              <div className="flex-1 text-xs">
                <span className="text-white font-medium">pallet rework near me</span>
                <span className="text-slate-500 ml-1">· Denver, CO</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow">
                D
              </div>
            </div>
            
            {/* Filter Pills */}
            <div className="flex items-center gap-2 mt-2 px-1 overflow-x-auto no-scrollbar">
              <span className="px-3 py-1 rounded-full bg-[#1e2329] border border-[#373e47] text-[10px] text-slate-300 font-medium whitespace-nowrap flex items-center gap-1">
                ⭐ 4.0+
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] text-amber-300 font-bold whitespace-nowrap flex items-center gap-1">
                ⚡ Instant Bay Booking
              </span>
              <span className="px-3 py-1 rounded-full bg-[#1e2329] border border-[#373e47] text-[10px] text-slate-300 font-medium whitespace-nowrap">
                Open Now
              </span>
            </div>
          </div>

          {/* Context Explainer Overlay (Top Right) */}
          <div className="absolute top-28 right-3 max-w-[190px] bg-black/85 backdrop-blur-md border border-[#d4af37]/40 rounded-xl p-2.5 text-[10px] text-slate-300 shadow-xl pointer-events-none z-10">
            <div className="flex items-center gap-1 text-[#d4af37] font-bold mb-1">
              <Zap className="w-3 h-3" />
              <span>The Driver&apos;s Reality:</span>
            </div>
            <p className="leading-snug text-slate-300">
              Driver shifted 8 pallets on Floyd Hill. They search Google Maps on the shoulder of I-70...
            </p>
          </div>

          {/* The Google Business Profile Card (Bottom Sheet) */}
          <div className="absolute bottom-0 inset-x-0 bg-[#1f242c] border-t border-[#343b47] rounded-t-3xl shadow-2xl p-4 sm:p-5 z-20">
            
            {/* Grab Bar */}
            <div className="w-10 h-1 rounded-full bg-slate-600 mx-auto mb-3"></div>

            {/* Header info */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                  <span>Denver Express Warehousing</span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Cross-Docking, Emergency Rework & Transload
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                Open
              </span>
            </div>

            {/* Ratings & Metadata */}
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-300">
              <div className="flex items-center text-amber-400 font-bold">
                <span>4.8</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 ml-0.5" />
              </div>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">(42 reviews)</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300 font-mono text-[11px]">6030 Washington St</span>
            </div>

            {/* Crucial Location Benefit */}
            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>Junction I-25 & I-70 (First exit off mountain corridor)</span>
            </div>

            {/* THE SECRET WEAPON: Yorkstead Custom Instant Action Button */}
            <div className="mt-4 pt-3 border-t border-[#2e3642]">
              <Link
                href={
                  sessionId
                    ? `/reserve?session=${encodeURIComponent(sessionId)}&bay=Bay%202`
                    : `/reserve?bay=Bay%202`
                }
                className="group relative flex items-center justify-between w-full p-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-500 hover:from-amber-400 hover:to-[#d4af37] text-slate-950 font-black shadow-lg shadow-amber-500/20 transition-all transform hover:scale-[1.02]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-950/15 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-slate-950" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs uppercase tracking-wider text-slate-900 font-bold flex items-center gap-1">
                      <span>⚡ Exclusive Fast-Track</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                    </div>
                    <div className="text-sm font-black leading-tight">
                      Reserve Dock Bay & Instant Quote
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition" />
              </Link>
            </div>

            {/* Standard Google Maps Action Buttons (Directions, Call, Share) */}
            <div className="grid grid-cols-4 gap-2 mt-3 text-center">
              <div className="p-2 rounded-xl bg-[#282f3a] text-slate-300 flex flex-col items-center gap-1 opacity-60">
                <Navigation className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-medium">Directions</span>
              </div>
              <div className="p-2 rounded-xl bg-[#282f3a] text-slate-300 flex flex-col items-center gap-1 opacity-60">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-medium">Call</span>
              </div>
              <div className="p-2 rounded-xl bg-[#282f3a] text-slate-300 flex flex-col items-center gap-1 opacity-60">
                <Bookmark className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-medium">Save</span>
              </div>
              <div className="p-2 rounded-xl bg-[#282f3a] text-slate-300 flex flex-col items-center gap-1 opacity-60">
                <Share2 className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-medium">Share</span>
              </div>
            </div>

            {/* Footer Notice */}
            <p className="mt-3 text-center text-[10px] text-slate-500">
              Simulated Google Maps interaction • Tap the gold button to test the trucker flow
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}
