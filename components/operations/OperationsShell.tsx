"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { OperationsNav } from "./OperationsNav";
import { useWarehouseStore } from "@/lib/domain/store";
import {
  RotateCcw,
  Bell,
  MapPin,
  Info,
} from "lucide-react";

export function OperationsShell({ children }: { children: ReactNode }) {
  const { resetToSeed, exceptions, jobs } = useWarehouseStore();
  const criticalExceptions = exceptions.filter((e) => e.severity === "critical" && e.approvalStatus === "pending");

  return (
    <div className="min-h-screen bg-[#060d17] text-slate-100 flex antialiased">
      {/* Left Operations Navigation Bar */}
      <OperationsNav />

      {/* Main Viewport Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Control Bar */}
        <header className="h-14 bg-[#0b192c]/95 backdrop-blur border-b border-[#1a3353] px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="font-semibold text-slate-200">Terminal 1: 6030 Washington St, Suite 130</span>
              <span className="text-slate-600">|</span>
              <span className="hidden sm:inline">60,000+ sq. ft. Facility • I-25 Exit 215 / I-70 Jct</span>
            </div>
            {criticalExceptions.length > 0 && (
              <Link
                href="/operations/exceptions"
                className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold hover:bg-rose-500/25 transition animate-pulse"
              >
                <Bell className="w-3.5 h-3.5 text-rose-400" />
                <span>{criticalExceptions.length} Critical Action Required (Job DX-260918-037)</span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm("Reset demo dataset back to canonical presentation state?")) {
                  resetToSeed();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12243a] hover:bg-[#1a3353] border border-[#233f63] text-xs font-semibold text-slate-300 hover:text-white transition"
              title="Reset all demo data to canonical state"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Reset Demo State</span>
            </button>

            <Link
              href="/dock"
              target="_blank"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d4af37] hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-sm"
            >
              <span>Forklift Tablet</span>
              <span>↗</span>
            </Link>
          </div>
        </header>

        {/* Subtle demo configuration disclaimer banner */}
        <div className="bg-[#081525] border-b border-[#1a3353] px-6 py-1.5 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
            <span>
              Illustrative facility configuration — final layout, doors, and racks to be mapped with Denver Express operations.
            </span>
          </div>
          <Link href="/operations/jobs?job=DX-260918-037" className="text-[#d4af37] hover:underline font-medium">
            Flagship Scenario: Job DX-260918-037 →
          </Link>
        </div>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
