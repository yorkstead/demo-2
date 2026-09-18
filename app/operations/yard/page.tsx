"use client";

import { useState } from "react";
import Link from "next/link";
import { useWarehouseStore } from "@/lib/domain/store";
import { TrailerStatusBadge } from "@/components/operations/StatusBadge";
import {
  Compass,
  Clock,
  Truck,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Building2,
  X,
  Phone,
} from "lucide-react";

export default function YardPage() {
  const { trailers, jobs, locations, assignDockDoor } = useWarehouseStore();

  const [selectedTrailerToAssign, setSelectedTrailerToAssign] = useState<string | null>(null);
  const [targetDoor, setTargetDoor] = useState<string>("Door 6");

  const yardSpots = Array.from({ length: 14 }, (_, i) => {
    const spotId = `Spot Y-${String(i + 1).padStart(2, "0")}`;
    const trailer = trailers.find((t) => t.yardLocation === spotId);
    return { spotId, trailer };
  });

  const availableDockDoors = locations.filter(
    (l) => l.id.startsWith("D-") && l.status === "available"
  );

  const trailerToAssign = trailers.find((t) => t.trailerNumber === selectedTrailerToAssign);
  const linkedJobToAssign = jobs.find((j) => j.trailer === selectedTrailerToAssign);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
            Facility Grounds • 6030 Washington St, Denver
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Yard &amp; Trailer Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor trailer check-ins, yard spots, detention clocks, and door staging across the facility grounds.
          </p>
        </div>

        <Link
          href="/reserve"
          target="_blank"
          className="px-3.5 py-2 rounded-lg bg-[#d4af37] hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md self-start sm:self-auto"
        >
          <span>+ Driver Gate Check-in</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Yard Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Trailers On Site</div>
          <div className="mt-2 text-2xl font-black text-white">{trailers.length} trailers</div>
          <div className="mt-1 text-[11px] text-slate-400">
            {trailers.filter((t) => t.assignedDoor).length} at doors, {trailers.filter((t) => !t.assignedDoor).length} in yard staging
          </div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Detention Alerts</div>
          <div className="mt-2 text-2xl font-black text-amber-400">1 Warning</div>
          <div className="mt-1 text-[11px] text-slate-400">Werner WRNR-88214 (Y-03) approaching 2h limit</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Seal Integrity</div>
          <div className="mt-2 text-2xl font-black text-emerald-400">100% Verified</div>
          <div className="mt-1 text-[11px] text-slate-400">All inbound security bolt seals inspected &amp; photographed</div>
        </div>
      </div>

      {/* Visual Yard Map Grid */}
      <div className="p-5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#d4af37]" />
              <span>Denver Terminal Yard Staging Layout (Spots Y-01 – Y-14)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Physical staging bays surrounding the 60,000 sq ft facility perimeter.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">14 Numbered Staging Slots</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {yardSpots.map(({ spotId, trailer }) => {
            const linkedJob = trailer ? jobs.find((j) => j.trailer === trailer.trailerNumber) : null;
            const isFlagship = trailer?.trailerNumber === "RMB-5012";

            return (
              <div
                key={spotId}
                className={`p-3.5 rounded-lg border flex flex-col justify-between min-h-[140px] transition ${
                  isFlagship
                    ? "bg-[#182e4b] border-[#d4af37] ring-1 ring-[#d4af37]/50 shadow-md shadow-amber-500/10"
                    : trailer
                    ? "bg-[#162b45] border-[#233f63]"
                    : "bg-[#060d17]/60 border-dashed border-slate-800"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-300">{spotId.replace("Spot ", "")}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        trailer?.assignedDoor
                          ? "bg-emerald-400 animate-pulse"
                          : trailer
                          ? "bg-amber-400"
                          : "bg-slate-700"
                      }`}
                    />
                  </div>

                  {trailer ? (
                    <div className="mt-2 space-y-0.5">
                      <div className="font-mono text-xs font-bold text-white truncate">
                        {trailer.trailerNumber}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{trailer.carrier}</div>
                      {trailer.assignedDoor ? (
                        <div className="text-[10px] font-bold text-emerald-400">
                          {trailer.assignedDoor}
                        </div>
                      ) : (
                        <div className="text-[10px] font-semibold text-amber-300">
                          Waiting in Yard
                        </div>
                      )}
                      {isFlagship && (
                        <span className="inline-block text-[8px] font-bold uppercase bg-amber-500/20 text-[#d4af37] px-1 rounded">
                          Flagship
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 text-[11px] text-slate-600 font-medium">Empty Slot</div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                  {trailer && linkedJob ? (
                    <Link
                      href={`/operations/jobs?job=${linkedJob.id}`}
                      className="text-[#d4af37] hover:underline font-mono truncate"
                    >
                      {linkedJob.id.replace("DX-260918-", "#")} →
                    </Link>
                  ) : (
                    <span className="text-slate-600 font-mono">Available</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trailer Detail Table */}
      <div className="rounded-xl bg-[#0b192c] border border-[#1a3353] overflow-hidden">
        <div className="p-4 border-b border-[#1a3353] flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#d4af37]" />
            <span>Active Yard Registry ({trailers.length} Trailers on Site)</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Real-time Check-in Telemetry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#081525] text-[11px] uppercase font-bold text-slate-400 border-b border-[#1a3353]">
              <tr>
                <th className="p-3">Trailer #</th>
                <th className="p-3">Carrier</th>
                <th className="p-3">Driver &amp; Contact</th>
                <th className="p-3">Yard Slot / Dock</th>
                <th className="p-3">Load Status</th>
                <th className="p-3">Seal #</th>
                <th className="p-3">Linked Job</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a3353]">
              {trailers.map((t) => {
                const linkedJob = jobs.find((j) => j.trailer === t.trailerNumber);
                const isFlagship = t.trailerNumber === "RMB-5012";

                return (
                  <tr
                    key={t.trailerNumber}
                    className={`transition ${
                      isFlagship ? "bg-[#102237] hover:bg-[#132a44]" : "hover:bg-[#102237]"
                    }`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[#d4af37]">{t.trailerNumber}</span>
                        {isFlagship && (
                          <span className="text-[9px] font-bold uppercase bg-amber-500/20 text-[#d4af37] px-1 py-0.2 rounded border border-amber-500/40">
                            Flagship
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-white">{t.carrier}</td>
                    <td className="p-3">
                      <div className="text-white font-medium">{t.driverName}</div>
                      <div className="text-slate-400 text-[11px] font-mono">{t.driverPhone}</div>
                    </td>
                    <td className="p-3">
                      <span className="font-mono px-2 py-0.5 rounded bg-[#060d17] border border-[#233f63] text-slate-200">
                        {t.yardLocation}
                      </span>
                    </td>
                    <td className="p-3">
                      <TrailerStatusBadge status={t.loadStatus} />
                    </td>
                    <td className="p-3 font-mono text-slate-400">{t.sealNumber}</td>
                    <td className="p-3">
                      {linkedJob ? (
                        <Link
                          href={`/operations/jobs?job=${linkedJob.id}`}
                          className="text-[#d4af37] hover:underline font-mono text-xs font-semibold"
                        >
                          {linkedJob.id}
                        </Link>
                      ) : (
                        <span className="text-slate-500 font-mono">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      {t.assignedDoor ? (
                        <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>At {t.assignedDoor}</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedTrailerToAssign(t.trailerNumber);
                            setTargetDoor(availableDockDoors[0]?.name || "Door 6");
                          }}
                          className="px-2.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1 shadow"
                        >
                          <span>Call to Dock</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Dock Door Modal */}
      {selectedTrailerToAssign && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b192c] border border-[#233f63] rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1a3353] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#d4af37]" />
                <span>Call Trailer to Dock Door</span>
              </h3>
              <button
                onClick={() => setSelectedTrailerToAssign(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#060d17] border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Trailer:</span>
                  <span className="font-mono font-bold text-[#d4af37]">{selectedTrailerToAssign}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Carrier:</span>
                  <span className="text-white font-semibold">{trailerToAssign?.carrier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Driver:</span>
                  <span className="text-slate-200">{trailerToAssign?.driverName} ({trailerToAssign?.driverPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Linked Job:</span>
                  <span className="font-mono text-emerald-400 font-semibold">{linkedJobToAssign?.id || "N/A"}</span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">
                  Select Destination Dock Door:
                </label>
                <select
                  value={targetDoor}
                  onChange={(e) => setTargetDoor(e.target.value)}
                  className="w-full bg-[#060d17] border border-[#233f63] rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-[#d4af37]"
                >
                  {locations
                    .filter((l) => l.id.startsWith("D-"))
                    .map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} — {d.status === "available" ? "Available / Ready" : `Currently Occupied (${d.status})`}
                      </option>
                    ))}
                </select>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Calling this trailer will update the yard queue, dispatch yard truck instruction, assign the door to Job <strong className="text-white">{linkedJobToAssign?.id}</strong>, and populate the dock master terminal.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1a3353]">
              <button
                onClick={() => setSelectedTrailerToAssign(null)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (linkedJobToAssign) {
                    assignDockDoor(linkedJobToAssign.id, targetDoor);
                  }
                  setSelectedTrailerToAssign(null);
                }}
                className="px-4 py-1.5 rounded bg-[#d4af37] hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow flex items-center gap-1"
              >
                <span>Confirm Door Dispatch →</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
