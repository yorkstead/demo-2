"use client";

import Link from "next/link";
import { useWarehouseStore } from "@/lib/domain/store";
import { Building2, Boxes, Layers, CheckCircle, ShieldCheck, Snowflake, Sun, AlertTriangle, ArrowRight, MoveRight } from "lucide-react";

export default function WarehouseLocationsPage() {
  const { locations, pallets, jobs } = useWarehouseStore();

  const reworkLocations = locations.filter((l) => l.zone === "REWORK");
  const stagingLocations = locations.filter((l) => l.zone === "STAGING");
  const rackLocations = locations.filter((l) => l.zone === "STORAGE");
  const holdLocations = locations.filter((l) => l.zone === "HOLD");
  const crossDockLocations = locations.filter((l) => l.zone === "CROSS-DOCK");

  const totalCapacity = locations.reduce((sum, l) => sum + l.capacityPallets, 0);
  const currentOccupancy = locations.reduce((sum, l) => sum + l.currentPalletIds.length, 0);
  const occupancyRate = Math.round((currentOccupancy / totalCapacity) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
            Facility Slotting • 60,000 Sq. Ft. Food-Grade Warehouse
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Warehouse Zones &amp; Slotting
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            30ft clear-height high-bay racks, dedicated rework bays (RW), and floor staging slots at 6030 Washington St.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/operations/jobs?job=DX-260918-037"
            className="px-3.5 py-2 rounded-lg bg-[#162b45] hover:bg-[#1f3b5f] border border-[#233f63] text-xs font-bold text-[#d4af37] transition flex items-center gap-1.5"
          >
            <span>★ Locate Flagship Pallets (P01–P06)</span>
          </Link>
          <Link
            href="/operations/freight/inventory"
            className="px-4 py-2 rounded-lg bg-[#d4af37] hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <span>Pallet Inventory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Facility Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Total Floor Capacity</div>
          <div className="mt-2 text-2xl font-black text-white">60,000+ sq ft</div>
          <div className="mt-1 text-[11px] text-slate-400">30ft clear vertical clearance, food-grade certified</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">High-Bay Rack Positions</div>
          <div className="mt-2 text-2xl font-black text-[#d4af37]">384 Pallet Slots</div>
          <div className="mt-1 text-[11px] text-slate-400">Racks A-01..A-04 (Climate) &amp; B-01..B-04 (Ambient)</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Dedicated Rework Bays</div>
          <div className="mt-2 text-2xl font-black text-amber-400">2 Active Bays</div>
          <div className="mt-1 text-[11px] text-slate-400">Equipped with Orion turntable stretch wrappers</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Floor Utilization</div>
          <div className="mt-2 text-2xl font-black text-emerald-400">{occupancyRate}% Active</div>
          <div className="mt-1 text-[11px] text-slate-400">{currentOccupancy} of {totalCapacity} mapped slots active</div>
        </div>
      </div>

      {/* 7 Operational Zones Navigation Banner */}
      <div className="p-3.5 rounded-lg bg-[#060d17] border border-[#233f63] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white">7 Operational Facility Zones:</span>
          <span className="text-slate-400">Inbound • Rework • Staging • Cross-Dock • Storage • Hold • Outbound</span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          Illustrative facility layout — fully configurable for Denver Express
        </span>
      </div>

      {/* Zone 1: Dedicated Rework & Restacking Bays */}
      <div className="p-5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Dedicated Rework &amp; Restacking Bays (RW-01, RW-02)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Reinforced floor zone with Orion heavy-duty rotary stretch wrappers, hand-stack tables, and banding stations.
            </p>
          </div>
          <span className="text-xs text-[#d4af37] font-semibold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded">
            Climate-Controlled Work Area
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reworkLocations.map((bay) => {
            const bayPallets = pallets.filter((p) => bay.currentPalletIds.includes(p.id));
            const hasFlagshipPallets = bayPallets.some((p) => p.jobId === "DX-260918-037");

            return (
              <div
                key={bay.id}
                className={`p-4 rounded-lg border space-y-3 transition ${
                  hasFlagshipPallets
                    ? "bg-[#182e4b] border-[#d4af37] ring-1 ring-[#d4af37]/40 shadow-lg shadow-amber-500/10"
                    : "bg-[#060d17] border-[#233f63]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white">{bay.name}</span>
                      {hasFlagshipPallets && (
                        <span className="text-[9px] font-bold uppercase bg-amber-500/20 text-[#d4af37] border border-amber-500/40 px-1 rounded">
                          ★ Flagship Rework Active
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{bay.notes}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      bay.status === "full"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : bay.status === "partial"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {bay.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Occupancy:</span>
                    <span className="font-mono text-white font-bold">
                      {bay.currentPalletIds.length} / {bay.capacityPallets} pallets
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${(bay.currentPalletIds.length / bay.capacityPallets) * 100}%` }}
                    />
                  </div>

                  {/* List Pallets Inside */}
                  {bayPallets.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Current Units in Bay:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {bayPallets.map((p) => (
                          <Link
                            key={p.id}
                            href="/operations/freight/inventory"
                            className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#102237] border border-[#233f63] text-emerald-400 hover:border-[#d4af37] transition flex items-center gap-1"
                          >
                            <span>{p.id.split("-").slice(-1)[0]}</span>
                            <span className="text-slate-400">({p.condition.replace("_", " ")})</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zone 2: Floor Staging Slots */}
      <div className="p-5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-blue-400" />
              <span>Floor Staging Slots (ST-01 – ST-04)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Staging corridors adjacent to dock doors for inbound breakout, transload sorting, and ready-to-reload freight.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Floor Level • Fast Transit</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stagingLocations.map((slot) => {
            const slotPallets = pallets.filter((p) => slot.currentPalletIds.includes(p.id));
            const hasFlagship = slotPallets.some((p) => p.jobId === "DX-260918-037");

            return (
              <div
                key={slot.id}
                className={`p-3.5 rounded-lg border space-y-2 transition ${
                  hasFlagship
                    ? "bg-[#182e4b] border-[#d4af37]/70"
                    : slot.status === "partial"
                    ? "bg-[#162b45] border-blue-500/40"
                    : "bg-[#060d17]/60 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">{slot.name}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">{slot.status}</span>
                </div>
                <div className="text-[11px] text-slate-400">{slot.notes}</div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Pallets:</span>
                  <span className="font-mono text-white font-bold">
                    {slot.currentPalletIds.length} / {slot.capacityPallets}
                  </span>
                </div>
                {hasFlagship && (
                  <div className="text-[10px] text-[#d4af37] font-semibold">
                    Contains P05, P06 (Staged Outbound)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Zone 3: High-Bay Rack Storage Grid */}
      <div className="p-5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#d4af37]" />
              <span>High-Bay Rack Positions (30ft Clear Height - 4 Tier)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Heavy-duty selective pallet racking. A-Racks climate-controlled (50-68°F); B-Racks ambient dry storage.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-cyan-300">
              <Snowflake className="w-3.5 h-3.5" /> Racks A (Climate)
            </span>
            <span className="flex items-center gap-1 text-amber-300">
              <Sun className="w-3.5 h-3.5" /> Racks B (Ambient)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {rackLocations.map((rack) => {
            const isClimate = rack.temperature === "climate_controlled";
            return (
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
                  <span className={`text-[10px] font-bold uppercase flex items-center gap-1 ${isClimate ? "text-cyan-300" : "text-amber-300"}`}>
                    {isClimate ? <Snowflake className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                    <span>{isClimate ? "Climate" : "Ambient"}</span>
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-300 font-medium truncate">
                  {rack.name}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Capacity: {rack.capacityPallets}</span>
                  <span className="font-mono text-slate-200 font-bold">
                    {rack.currentPalletIds.length} plts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zone 4: Quarantine / Damaged Freight Hold */}
      <div className="p-5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Quarantine &amp; Damaged Freight Hold Zone</span>
          </h2>
          <span className="text-xs text-rose-300 font-mono">Isolated Food-Grade Buffer</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {holdLocations.map((hl) => (
            <div key={hl.id} className="p-4 rounded-lg bg-[#060d17] border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-white">{hl.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {hl.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">{hl.notes}</p>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
                <span>Capacity:</span>
                <span className="font-mono text-white font-bold">{hl.currentPalletIds.length} / {hl.capacityPallets} pallets</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
