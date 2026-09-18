"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { OperationsNav } from "./OperationsNav";
import { useWarehouseStore } from "@/lib/domain/store";
import {
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Search,
  Bell,
  Clock,
  MapPin,
} from "lucide-react";

export function OperationsShell({ children }: { children: ReactNode }) {
  const { resetToSeed, exceptions } = useWarehouseStore();
  const criticalExceptions = exceptions.filter((e) => e.severity === "critical" && e.approvalStatus === "pending");

  return (
    <div className="min-h-screen bg-[#060d17] text-slate-100 flex antialiased">
      {/* Left Operations Navigation Bar */}
      <OperationsNav />

      {/* Main Viewport Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Control Bar */}
        <header className="h-14 bg-[#0b192c]/90 backdrop-blur border-b border-[#1a3353] px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="font-semibold text-slate-200">Terminal 1: 6030 Washington St, Denver</span>
              <span className="text-slate-600">|</span>
              <span>I-25 Exit 215 / I-70 Jct</span>
            </div>
            {criticalExceptions.length > 0 && (
              <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold animate-pulse">
                <Bell className="w-3.5 h-3.5 text-rose-400" />
                <span>{criticalExceptions.length} Critical Exception Awaiting Client Approval</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm("Reset demo dataset back to original state?")) {
                  resetToSeed();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12243a] hover:bg-[#1a3353] border border-[#233f63] text-xs font-semibold text-slate-300 hover:text-white transition"
              title="Reset all demo data"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Reset Demo State</span>
            </button>

            <Link
              href="/office"
              target="_blank"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d4af37] hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-sm"
            >
              <span>Launch Rework Flow</span>
              <span>↗</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
