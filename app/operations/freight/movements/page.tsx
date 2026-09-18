"use client";

import { useWarehouseStore } from "@/lib/domain/store";
import { History, ShieldCheck, ArrowRight, User } from "lucide-react";

export default function MovementHistoryPage() {
  const { pallets } = useWarehouseStore();

  const allMovements = pallets
    .flatMap((p) => p.movementHistory)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
          Chain of Custody
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
          Freight Movement Audit History
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Cryptographic chain-of-custody tracking every forklift movement, location shift, and operator handoff.
        </p>
      </div>

      <div className="rounded-xl bg-[#0b192c] border border-[#1a3353] overflow-hidden">
        <div className="p-4 border-b border-[#1a3353] flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {allMovements.length} Physical Movements Logged
          </span>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Immutable Audit Log
          </span>
        </div>

        <div className="divide-y divide-[#1a3353]">
          {allMovements.map((mov) => (
            <div key={mov.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#102237]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#060d17] border border-[#233f63] flex items-center justify-center text-[#d4af37] shrink-0">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#d4af37]">{mov.palletId}</span>
                    <span className="text-xs text-slate-400">moved from</span>
                    <span className="font-mono text-xs font-semibold text-slate-300">{mov.fromLocation}</span>
                    <span className="text-xs text-slate-400">to</span>
                    <span className="font-mono text-xs font-bold text-emerald-400">{mov.toLocation}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Reason: <span className="text-slate-200">{mov.reason}</span>
                  </div>
                </div>
              </div>

              <div className="text-right text-xs">
                <div className="font-semibold text-slate-300 flex items-center gap-1 justify-end">
                  <User className="w-3 h-3 text-slate-500" />
                  <span>{mov.operator}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {new Date(mov.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
