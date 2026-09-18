"use client";

import { useState } from "react";
import { useWarehouseStore } from "@/lib/domain/store";
import { Boxes, Search, ArrowRight, ShieldCheck, MapPin } from "lucide-react";

export default function FreightInventoryPage() {
  const { pallets, updatePalletLocation } = useWarehouseStore();
  const [search, setSearch] = useState("");

  const filteredPallets = pallets.filter((p) => {
    return (
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.jobId.toLowerCase().includes(search.toLowerCase()) ||
      (p.skuDescription && p.skuDescription.toLowerCase().includes(search.toLowerCase())) ||
      p.currentLocation.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
          Freight Unit Tracking
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
          Pallet Inventory & Condition
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Serialized unit tracking (DX-XXXXXX-PXX), weights, dimensions, restack states, and physical locations.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Pallet ID (e.g. DX-260918-033-P01), SKU, or Location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#060d17] border border-[#233f63] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
          />
        </div>
      </div>

      <div className="rounded-xl bg-[#0b192c] border border-[#1a3353] overflow-hidden">
        <div className="p-4 border-b border-[#1a3353] flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {filteredPallets.length} Pallet Units Registered
          </span>
          <span className="text-[11px] text-slate-400">Barcode & RFID Ready</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#081525] text-[11px] uppercase font-bold text-slate-400 border-b border-[#1a3353]">
              <tr>
                <th className="p-3">Pallet Unit ID</th>
                <th className="p-3">Work Order</th>
                <th className="p-3">Location</th>
                <th className="p-3">Weight (Lbs)</th>
                <th className="p-3">Dimensions (L×W×H)</th>
                <th className="p-3">Condition</th>
                <th className="p-3">Status</th>
                <th className="p-3">Relocate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a3353]">
              {filteredPallets.map((p) => (
                <tr key={p.id} className="hover:bg-[#102237]">
                  <td className="p-3 font-mono font-bold text-[#d4af37]">{p.id}</td>
                  <td className="p-3 font-mono text-slate-300">{p.jobId}</td>
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
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
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
                        const newLoc = p.currentLocation === "RW-01" ? "ST-03" : "RW-01";
                        updatePalletLocation(p.id, newLoc, "Forklift FL-01", "Routine rework restaging");
                      }}
                      className="px-2 py-1 rounded bg-[#162b45] hover:bg-[#203a5c] border border-[#233f63] text-[11px] font-bold text-slate-200 transition"
                    >
                      Move to {p.currentLocation === "RW-01" ? "ST-03" : "RW-01"} →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
