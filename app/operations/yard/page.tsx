"use client";

import { useWarehouseStore } from "@/lib/domain/store";
import { Compass, Clock, Truck, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function YardPage() {
  const { trailers, jobs, assignDockDoor } = useWarehouseStore();

  const yardSpots = Array.from({ length: 14 }, (_, i) => {
    const spotId = `Spot Y-${String(i + 1).padStart(2, "0")}`;
    const trailer = trailers.find((t) => t.yardLocation === spotId);
    return { spotId, trailer };
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
          Facility Grounds • 6030 Washington St
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
          Yard & Trailer Management
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor trailer check-ins, yard spots, detention clocks, and door staging across the facility grounds.
        </p>
      </div>

      {/* Yard Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Trailers On Site</div>
          <div className="mt-2 text-2xl font-black text-white">{trailers.length} trailers</div>
          <div className="mt-1 text-[11px] text-slate-400">4 active, 2 staged/empty</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Detention Alerts</div>
          <div className="mt-2 text-2xl font-black text-amber-400">1 Warning</div>
          <div className="mt-1 text-[11px] text-slate-400">Werner WRNR-88214 approaching 2h limit</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Seal Integrity</div>
          <div className="mt-2 text-2xl font-black text-emerald-400">100% Verified</div>
          <div className="mt-1 text-[11px] text-slate-400">All inbound security seals photographed</div>
        </div>
      </div>

      {/* Visual Yard Map Grid */}
      <div className="p-5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#d4af37]" />
            <span>Denver Terminal Yard Staging Layout</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Capacity: 18 Staging Slots</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {yardSpots.map(({ spotId, trailer }) => (
            <div
              key={spotId}
              className={`p-3.5 rounded-lg border flex flex-col justify-between min-h-[120px] transition ${
                trailer
                  ? "bg-[#162b45] border-[#233f63]"
                  : "bg-[#060d17]/60 border-dashed border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-300">{spotId}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    trailer ? "bg-amber-400" : "bg-slate-700"
                  }`}
                />
              </div>

              {trailer ? (
                <div className="my-2 space-y-0.5">
                  <div className="font-mono text-xs font-bold text-white truncate">
                    {trailer.trailerNumber}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{trailer.carrier}</div>
                  <div className="text-[10px] font-semibold text-[#d4af37]">
                    {trailer.loadStatus.toUpperCase()}
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-600 font-medium">Empty Slot</div>
              )}

              <div className="text-[10px] text-slate-500 font-mono">
                {trailer ? `Driver: ${trailer.driverName.split(" ")[0]}` : "Available"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trailer Detail Table */}
      <div className="rounded-xl bg-[#0b192c] border border-[#1a3353] overflow-hidden">
        <div className="p-4 border-b border-[#1a3353]">
          <h2 className="text-sm font-bold text-white">Active Yard Registry</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#081525] text-[11px] uppercase font-bold text-slate-400 border-b border-[#1a3353]">
              <tr>
                <th className="p-3">Trailer #</th>
                <th className="p-3">Carrier</th>
                <th className="p-3">Driver & Contact</th>
                <th className="p-3">Yard Slot / Dock</th>
                <th className="p-3">Load Status</th>
                <th className="p-3">Seal #</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a3353]">
              {trailers.map((t) => (
                <tr key={t.trailerNumber} className="hover:bg-[#102237]">
                  <td className="p-3 font-mono font-bold text-[#d4af37]">{t.trailerNumber}</td>
                  <td className="p-3 font-semibold text-white">{t.carrier}</td>
                  <td className="p-3">
                    <div>{t.driverName}</div>
                    <div className="text-slate-500 text-[11px]">{t.driverPhone}</div>
                  </td>
                  <td className="p-3">
                    <span className="font-mono px-2 py-0.5 rounded bg-[#060d17] border border-[#233f63] text-slate-200">
                      {t.yardLocation}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/15 text-blue-300 border border-blue-500/30">
                      {t.loadStatus}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-400">{t.sealNumber}</td>
                  <td className="p-3">
                    {t.assignedDoor ? (
                      <span className="text-emerald-400 font-semibold text-[11px]">
                        At {t.assignedDoor}
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          const job = jobs.find((j) => j.trailer === t.trailerNumber);
                          if (job) assignDockDoor(job.id, "Door 3");
                        }}
                        className="px-2 py-1 rounded bg-[#162b45] hover:bg-[#203a5c] border border-[#233f63] text-[11px] text-white font-bold transition"
                      >
                        Call to Dock →
                      </button>
                    )}
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
