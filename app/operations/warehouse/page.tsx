"use client";

import { useWarehouseStore } from "@/lib/domain/store";
import { Building2, Boxes, Layers, CheckCircle } from "lucide-react";

export default function WarehouseLocationsPage() {
  const { locations, pallets } = useWarehouseStore();

  const rackLocations = locations.filter((l) => l.zone === "rack_storage");
  const reworkLocations = locations.filter((l) => l.zone === "rework_bay");
  const stagingLocations = locations.filter((l) => l.zone === "floor_staging");

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
          Facility Slotting • 60,000 Sq. Ft. Food-Grade Warehouse
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
          Warehouse Zones & Slotting
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          30ft clear-height high-bay racks (A/B), dedicated rework bays (RW), and floor staging slots.
        </p>
      </div>

      {/* Facility Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Total Floor Capacity</div>
          <div className="mt-2 text-2xl font-black text-white">60,000+ sq ft</div>
          <div className="mt-1 text-[11px] text-slate-400">30ft vertical clearance, food-grade certified</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">High-Bay Rack Positions</div>
          <div className="mt-2 text-2xl font-black text-[#d4af37]">384 Pallet Slots</div>
          <div className="mt-1 text-[11px] text-slate-400">Racks A-01..A-04 (Climate) & B-01..B-04 (Ambient)</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Dedicated Rework Bays</div>
          <div className="mt-2 text-2xl font-black text-emerald-400">2 Active Zones</div>
          <div className="mt-1 text-[11px] text-slate-400">Equipped with Orion turntable stretch wrappers</div>
        </div>
      </div>

      {/* Dedicated Rework Bays Section */}
      <div className="p-5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Dedicated Rework & Restacking Zones</span>
          </h2>
          <span className="text-xs text-[#d4af37] font-semibold">Climate-Controlled Work Area</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reworkLocations.map((bay) => (
            <div key={bay.id} className="p-4 rounded-lg bg-[#060d17] border border-[#233f63] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-sm font-bold text-white">{bay.name}</span>
                  <div className="text-[11px] text-slate-400">{bay.notes}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {bay.status}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Occupancy:</span>
                <span className="font-mono text-slate-200">
                  {bay.currentPalletIds.length} / {bay.capacityPallets} pallets
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* High-Bay Rack Storage Grid */}
      <div className="p-5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Boxes className="w-4 h-4 text-blue-400" />
            <span>High-Bay Rack Positions (30ft Clear Height - 4 Tier)</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Zones A (Climate) & B (Ambient)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {rackLocations.map((rack) => (
            <div
              key={rack.id}
              className={`p-3.5 rounded-lg border transition ${
                rack.status === "partial"
                  ? "bg-[#162b45] border-blue-500/40"
                  : "bg-[#060d17]/50 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-white">{rack.id}</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">
                  {rack.temperature === "climate_controlled" ? "Climate" : "Ambient"}
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-300 font-medium truncate">
                {rack.name}
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
                <span>Slots: {rack.capacityPallets}</span>
                <span className="font-mono text-slate-300">
                  {rack.currentPalletIds.length} plts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
