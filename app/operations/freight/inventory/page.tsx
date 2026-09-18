"use client";

import { useState } from "react";
import Link from "next/link";
import { useWarehouseStore } from "@/lib/domain/store";
import { Boxes, Search, ArrowRight, ShieldCheck, MapPin, MoveRight, X, User, CheckCircle2 } from "lucide-react";

export default function FreightInventoryPage() {
  const { pallets, locations, updatePalletLocation } = useWarehouseStore();
  const [search, setSearch] = useState("");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");

  // Move Modal State
  const [activePalletToMove, setActivePalletToMove] = useState<string | null>(null);
  const [targetLocation, setTargetLocation] = useState<string>("ST-03");
  const [selectedOperator, setSelectedOperator] = useState<string>("Marco S. (FL-01)");
  const [moveReason, setMoveReason] = useState<string>("Restack complete — shifted to outbound stage");

  const palletBeingMoved = pallets.find((p) => p.id === activePalletToMove);

  const filteredPallets = pallets.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.jobId.toLowerCase().includes(search.toLowerCase()) ||
      (p.skuDescription && p.skuDescription.toLowerCase().includes(search.toLowerCase())) ||
      p.currentLocation.toLowerCase().includes(search.toLowerCase());

    const matchesCondition = conditionFilter === "all" || p.condition === conditionFilter;
    const matchesJob = jobFilter === "all" || p.jobId === jobFilter;

    return matchesSearch && matchesCondition && matchesJob;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
            Freight Unit Tracking • 60,000 Sq. Ft. Facility
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Pallet Inventory &amp; Condition
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Serialized unit tracking (DX-XXXXXX-PXX), condition triage, restack states, and physical facility locations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/operations/freight/movements"
            className="px-3.5 py-2 rounded-lg bg-[#162b45] hover:bg-[#1f3b5f] border border-[#233f63] text-xs font-bold text-slate-200 transition flex items-center gap-1.5"
          >
            <span>Movement Audit History</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#d4af37]" />
          </Link>
          <button
            onClick={() => setJobFilter("DX-260918-037")}
            className="px-3.5 py-2 rounded-lg bg-[#d4af37] hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <span>★ Flagship Units (P01–P06)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353] flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Pallet ID (e.g. DX-260918-037-P01), Work Order, SKU, or Location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#060d17] border border-[#233f63] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="bg-[#060d17] border border-[#233f63] rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#d4af37]"
          >
            <option value="all">All Conditions</option>
            <option value="leaning">Leaning (&gt;15°)</option>
            <option value="restacked">Restacked &amp; Wrapped</option>
            <option value="good">Good / Intact</option>
            <option value="broken_runner">Broken Runner</option>
            <option value="crushed_cartons">Crushed Cartons</option>
          </select>

          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="bg-[#060d17] border border-[#233f63] rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#d4af37]"
          >
            <option value="all">All Work Orders</option>
            <option value="DX-260918-037">DX-260918-037 (Flagship)</option>
            <option value="DX-260918-033">DX-260918-033 (Swift)</option>
            <option value="DX-260918-034">DX-260918-034 (Knight)</option>
            <option value="DX-260918-035">DX-260918-035 (Werner)</option>
            <option value="DX-260918-036">DX-260918-036 (JB Hunt)</option>
          </select>

          {jobFilter !== "all" && (
            <button
              onClick={() => setJobFilter("all")}
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
            {filteredPallets.length} Pallet Units Registered
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Barcode &amp; RFID Serialized Tracking</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#081525] text-[11px] uppercase font-bold text-slate-400 border-b border-[#1a3353]">
              <tr>
                <th className="p-3">Pallet Unit ID</th>
                <th className="p-3">Work Order</th>
                <th className="p-3">Location</th>
                <th className="p-3">Weight (Lbs)</th>
                <th className="p-3">Dimensions</th>
                <th className="p-3">Condition</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a3353]">
              {filteredPallets.map((p) => {
                const isFlagship = p.jobId === "DX-260918-037";
                return (
                  <tr
                    key={p.id}
                    className={`transition ${
                      isFlagship ? "bg-[#102237] hover:bg-[#132a44]" : "hover:bg-[#102237]"
                    }`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[#d4af37]">{p.id}</span>
                        {isFlagship && (
                          <span className="text-[8px] font-bold uppercase bg-amber-500/20 text-[#d4af37] px-1 rounded border border-amber-500/40">
                            Flagship
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/operations/jobs?job=${p.jobId}`}
                        className="font-mono text-slate-300 hover:text-white hover:underline"
                      >
                        {p.jobId}
                      </Link>
                    </td>
                    <td className="p-3">
                      <span className="font-mono px-2 py-0.5 rounded bg-[#060d17] border border-[#233f63] text-emerald-400 font-bold">
                        {p.currentLocation}
                      </span>
                    </td>
                    <td className="p-3 font-mono">{p.weightLbs.toLocaleString()} lbs</td>
                    <td className="p-3 font-mono text-slate-400">
                      {p.dimensions.lengthIn}&quot; × {p.dimensions.widthIn}&quot; × {p.dimensions.heightIn}&quot;
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.condition === "leaning"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            : p.condition === "restacked"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {p.condition.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-xs text-slate-200 uppercase">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setActivePalletToMove(p.id);
                          setTargetLocation(p.currentLocation === "RW-01" ? "ST-03" : "RW-01");
                        }}
                        className="px-2.5 py-1.5 rounded bg-[#162b45] hover:bg-[#203a5c] border border-[#233f63] text-xs font-bold text-slate-200 transition flex items-center gap-1"
                      >
                        <span>Relocate</span>
                        <MoveRight className="w-3 h-3 text-[#d4af37]" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Relocate Modal */}
      {activePalletToMove && palletBeingMoved && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b192c] border border-[#233f63] rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1a3353] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MoveRight className="w-4 h-4 text-[#d4af37]" />
                <span>Move Pallet: {activePalletToMove}</span>
              </h3>
              <button
                onClick={() => setActivePalletToMove(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded bg-[#060d17] border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Location:</span>
                  <span className="font-mono font-bold text-emerald-400">{palletBeingMoved.currentLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Work Order:</span>
                  <span className="font-mono text-white">{palletBeingMoved.jobId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Weight &amp; Dims:</span>
                  <span className="text-slate-300 font-mono">
                    {palletBeingMoved.weightLbs} lbs • {palletBeingMoved.dimensions.heightIn}&quot; H
                  </span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Destination Slot / Zone:</label>
                <select
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                  className="w-full bg-[#060d17] border border-[#233f63] rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-[#d4af37]"
                >
                  <optgroup label="Dedicated Rework Bays">
                    <option value="RW-01">RW-01 (Orion Turntable Stretch Bay 1)</option>
                    <option value="RW-02">RW-02 (Heavy Pallet Rebuild Bay 2)</option>
                  </optgroup>
                  <optgroup label="Floor Staging Corridors">
                    <option value="ST-01">ST-01 (Inbound Breakout Stage)</option>
                    <option value="ST-02">ST-02 (Inspection Staging)</option>
                    <option value="ST-03">ST-03 (Outbound Staged / Ready for Reload)</option>
                    <option value="ST-04">ST-04 (Cross-Dock Fast Lane)</option>
                  </optgroup>
                  <optgroup label="Dock Bay Aprons">
                    <option value="D-03">D-03 (Door 3 Active Unloading Apron)</option>
                    <option value="D-02">D-02 (Door 2 Active Apron)</option>
                  </optgroup>
                  <optgroup label="High-Bay Racks">
                    <option value="A-01">A-01 (Climate Food-Grade Rack Tier 1)</option>
                    <option value="B-01">B-01 (Ambient Rack Tier 1)</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Forklift Operator:</label>
                <select
                  value={selectedOperator}
                  onChange={(e) => setSelectedOperator(e.target.value)}
                  className="w-full bg-[#060d17] border border-[#233f63] rounded-lg p-2 text-white text-xs focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="Marco S. (FL-01)">Marco S. (FL-01 - Toyota Electric 5,000lb)</option>
                  <option value="Bill V. (FL-02)">Bill V. (FL-02 - Yale Cushion Tire)</option>
                  <option value="Carlos R. (FL-03)">Carlos R. (FL-03 - Crown High-Reach)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Reason for Movement:</label>
                <input
                  type="text"
                  value={moveReason}
                  onChange={(e) => setMoveReason(e.target.value)}
                  className="w-full bg-[#060d17] border border-[#233f63] rounded-lg p-2 text-white text-xs focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1a3353]">
              <button
                onClick={() => setActivePalletToMove(null)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updatePalletLocation(activePalletToMove, targetLocation, selectedOperator, moveReason);
                  setActivePalletToMove(null);
                }}
                className="px-4 py-1.5 rounded bg-[#d4af37] hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow"
              >
                Execute Move &amp; Record Audit →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
