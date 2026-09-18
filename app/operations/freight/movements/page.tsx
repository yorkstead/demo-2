"use client";

import { useState } from "react";
import Link from "next/link";
import { useWarehouseStore } from "@/lib/domain/store";
import { History, ShieldCheck, ArrowRight, User, Search, Filter, MoveRight } from "lucide-react";

export default function MovementHistoryPage() {
  const { pallets } = useWarehouseStore();
  const [search, setSearch] = useState("");
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>("all");

  const allMovements = pallets
    .flatMap((p) =>
      p.movementHistory.map((m) => ({
        ...m,
        jobId: p.jobId,
      }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredMovements = allMovements.filter((m) => {
    const matchesSearch =
      m.palletId.toLowerCase().includes(search.toLowerCase()) ||
      m.fromLocation.toLowerCase().includes(search.toLowerCase()) ||
      m.toLocation.toLowerCase().includes(search.toLowerCase()) ||
      m.operator.toLowerCase().includes(search.toLowerCase()) ||
      m.reason.toLowerCase().includes(search.toLowerCase());

    const matchesJob = selectedJobFilter === "all" || m.jobId === selectedJobFilter;

    return matchesSearch && matchesJob;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
            Chain of Custody • Audit Registry
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Freight Movement Audit History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Cryptographic chain-of-custody tracking every forklift movement, location shift, and operator handoff.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedJobFilter("DX-260918-037")}
            className="px-3.5 py-2 rounded-lg bg-[#d4af37] hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <span>★ Filter Flagship (DX-260918-037)</span>
          </button>
          <Link
            href="/operations/freight/inventory"
            className="px-3.5 py-2 rounded-lg bg-[#162b45] hover:bg-[#1f3b5f] border border-[#233f63] text-xs font-bold text-slate-200 transition"
          >
            Pallet Inventory →
          </Link>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353] flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Pallet ID, Operator, Bay, or Reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#060d17] border border-[#233f63] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedJobFilter}
            onChange={(e) => setSelectedJobFilter(e.target.value)}
            className="bg-[#060d17] border border-[#233f63] rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#d4af37]"
          >
            <option value="all">All Work Orders</option>
            <option value="DX-260918-037">DX-260918-037 (Flagship)</option>
            <option value="DX-260918-033">DX-260918-033 (Swift)</option>
            <option value="DX-260918-034">DX-260918-034 (Knight)</option>
          </select>

          {selectedJobFilter !== "all" && (
            <button
              onClick={() => setSelectedJobFilter("all")}
              className="px-2.5 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-[#0b192c] border border-[#1a3353] overflow-hidden">
        <div className="p-4 border-b border-[#1a3353] flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {filteredMovements.length} Physical Movements Logged
          </span>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Immutable Audit Log
          </span>
        </div>

        <div className="divide-y divide-[#1a3353]">
          {filteredMovements.map((mov) => {
            const isFlagship = mov.jobId === "DX-260918-037";
            return (
              <div
                key={mov.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                  isFlagship ? "bg-[#0d1c2e] hover:bg-[#11243a]" : "hover:bg-[#102237]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#060d17] border border-[#233f63] flex items-center justify-center text-[#d4af37] shrink-0">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#d4af37]">{mov.palletId}</span>
                      {isFlagship && (
                        <span className="text-[9px] font-bold uppercase bg-amber-500/20 text-[#d4af37] px-1 py-0.2 rounded border border-amber-500/40">
                          Flagship
                        </span>
                      )}
                      <span className="text-xs text-slate-400">shifted from</span>
                      <span className="font-mono text-xs font-semibold text-slate-300 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {mov.fromLocation}
                      </span>
                      <MoveRight className="w-3 h-3 text-slate-500" />
                      <span className="font-mono text-xs font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
                        {mov.toLocation}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
