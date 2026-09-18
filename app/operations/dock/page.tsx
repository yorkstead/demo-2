"use client";

import { useState } from "react";
import Link from "next/link";
import { useWarehouseStore } from "@/lib/domain/store";
import { Building2, Truck, ExternalLink, Clock, User, CheckCircle, ArrowRight, Boxes, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/operations/StatusBadge";

export default function DockOperationsPage() {
  const { locations, jobs, trailers, assignDockDoor } = useWarehouseStore();
  const dockDoors = locations.filter((l) => l.id.startsWith("D-"));

  const [selectedDoorForAssignment, setSelectedDoorForAssignment] = useState<string | null>(null);
  const [selectedTrailer, setSelectedTrailer] = useState<string>("");

  const waitingTrailers = trailers.filter((t) => !t.assignedDoor);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
            Dock Management • 6 Bay Doors • 6030 Washington St
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Dock &amp; Door Operations
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time dock levelers, active bay unloading, turnaround timers, and forklift operator tablet links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/operations/jobs?job=DX-260918-037"
            className="px-3.5 py-2 rounded-lg bg-[#162b45] hover:bg-[#1f3b5f] border border-[#233f63] text-xs font-bold text-[#d4af37] transition flex items-center gap-1.5"
          >
            <span>★ Inspect Door 3 (Flagship)</span>
          </Link>
          <Link
            href="/dock"
            target="_blank"
            className="px-3.5 py-2 rounded-lg bg-[#d4af37] hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md self-start sm:self-auto"
          >
            <span>Open Active5 Dock Tablet</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Glanceable Door Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Active Bay Turnarounds</div>
          <div className="mt-2 text-2xl font-black text-white">
            {dockDoors.filter((d) => d.status !== "available").length} / 6 Doors
          </div>
          <div className="mt-1 text-[11px] text-slate-400">4 active, 2 available</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Average Bay Dwell</div>
          <div className="mt-2 text-2xl font-black text-[#d4af37]">48 Minutes</div>
          <div className="mt-1 text-[11px] text-slate-400">Target: &lt; 90 min turnaround</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Forklifts Logged</div>
          <div className="mt-2 text-2xl font-black text-emerald-400">4 Active Units</div>
          <div className="mt-1 text-[11px] text-slate-400">FL-01, FL-02, FL-03, EP-01</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Inbound Yard Queue</div>
          <div className="mt-2 text-2xl font-black text-blue-400">{waitingTrailers.length} Trailers</div>
          <div className="mt-1 text-[11px] text-slate-400">Ready for dock call</div>
        </div>
      </div>

      {/* 6 Dock Door Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {dockDoors.map((door) => {
          const assignedJob = jobs.find(
            (j) => j.dockDoor && (door.name.includes(j.dockDoor) || j.dockDoor.includes(door.name))
          );
          const isFull = door.status === "full";
          const isPartial = door.status === "partial";
          const isFlagship = assignedJob?.id === "DX-260918-037";

          return (
            <div
              key={door.id}
              className={`p-5 rounded-xl border flex flex-col justify-between transition ${
                isFlagship
                  ? "bg-[#182e4b] border-[#d4af37] ring-1 ring-[#d4af37]/50 shadow-xl shadow-amber-500/10"
                  : isFull
                  ? "bg-[#0b192c] border-amber-500/50 shadow-lg shadow-amber-500/5"
                  : isPartial
                  ? "bg-[#0b192c] border-blue-500/50 shadow-lg shadow-blue-500/5"
                  : "bg-[#081525] border-[#1a3353]"
              }`}
            >
              <div>
                {/* Door Header */}
                <div className="flex items-center justify-between border-b border-[#1a3353] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-700 flex items-center justify-center">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isFull
                            ? "bg-amber-400 animate-pulse"
                            : isPartial
                            ? "bg-blue-400"
                            : "bg-emerald-500"
                        }`}
                      />
                    </span>
                    <h2 className="font-mono text-base font-bold text-white">{door.name}</h2>
                    {isFlagship && (
                      <span className="text-[9px] font-bold uppercase bg-amber-500/20 text-[#d4af37] border border-amber-500/40 px-1.5 py-0.5 rounded">
                        ★ Flagship
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                    {door.status === "available" ? "Available" : door.status}
                  </span>
                </div>

                {/* Job Information */}
                {assignedJob ? (
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider">
                          {assignedJob.service}
                        </span>
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          ${assignedJob.billableAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {assignedJob.customer.name}
                      </div>
                      <div className="font-mono text-xs text-slate-300 mt-0.5">
                        Trl: <span className="text-white font-bold">{assignedJob.trailer}</span> ({assignedJob.carrier.name})
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#060d17] border border-[#233f63] space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Work Order:</span>
                        <Link
                          href={`/operations/jobs?job=${assignedJob.id}`}
                          className="font-mono text-[#d4af37] font-semibold hover:underline"
                        >
                          {assignedJob.id} →
                        </Link>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Driver / Phone:</span>
                        <span className="text-slate-200">{assignedJob.driver.name}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Lead Forklift Tech:</span>
                        <span className="text-slate-200 font-semibold">{assignedJob.labor.assignedTech}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Pallet Count:</span>
                        <span className="font-mono text-slate-200">{assignedJob.palletCount} units</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <StatusBadge status={assignedJob.status} />
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>42m elapsed</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center space-y-2">
                    <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
                    <div className="text-sm font-semibold text-slate-400">Bay Available &amp; Ready</div>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Hydraulic dock leveler and wheel chocks ready for inbound trailer spot.
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-6 pt-3 border-t border-[#1a3353] flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  {door.notes || "Hydraulic leveler OK"}
                </span>

                {assignedJob ? (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/operations/jobs?job=${assignedJob.id}`}
                      className="px-2.5 py-1 rounded bg-[#162b45] hover:bg-[#203a5c] border border-[#233f63] text-xs font-bold text-slate-200 transition"
                    >
                      Details
                    </Link>
                    <Link
                      href="/dock"
                      target="_blank"
                      className="px-2.5 py-1 rounded bg-[#d4af37] hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition"
                    >
                      <span>Tablet</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedDoorForAssignment(door.name);
                      setSelectedTrailer(waitingTrailers[0]?.trailerNumber || "");
                    }}
                    className="text-xs text-[#d4af37] hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Assign Trailer</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Assigning Trailer from Dock Board */}
      {selectedDoorForAssignment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b192c] border border-[#233f63] rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1a3353] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#d4af37]" />
                <span>Call Waiting Trailer to {selectedDoorForAssignment}</span>
              </h3>
              <button
                onClick={() => setSelectedDoorForAssignment(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {waitingTrailers.length > 0 ? (
                <>
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">
                      Select Waiting Trailer from Yard:
                    </label>
                    <select
                      value={selectedTrailer}
                      onChange={(e) => setSelectedTrailer(e.target.value)}
                      className="w-full bg-[#060d17] border border-[#233f63] rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-[#d4af37]"
                    >
                      {waitingTrailers.map((t) => {
                        const j = jobs.find((job) => job.trailer === t.trailerNumber);
                        return (
                          <option key={t.trailerNumber} value={t.trailerNumber}>
                            {t.trailerNumber} — {t.carrier} ({j?.service || "Cross-Dock"}) • {t.yardLocation}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    This will dispatch the hostler yard truck to move the trailer to {selectedDoorForAssignment} and advance the work order lifecycle to Dock Assigned.
                  </p>
                </>
              ) : (
                <div className="py-4 text-center text-slate-400">
                  No trailers currently waiting in the yard.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1a3353]">
              <button
                onClick={() => setSelectedDoorForAssignment(null)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              {waitingTrailers.length > 0 && (
                <button
                  onClick={() => {
                    const job = jobs.find((j) => j.trailer === selectedTrailer);
                    if (job && selectedDoorForAssignment) {
                      assignDockDoor(job.id, selectedDoorForAssignment);
                    }
                    setSelectedDoorForAssignment(null);
                  }}
                  className="px-4 py-1.5 rounded bg-[#d4af37] hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow"
                >
                  Spot Trailer at Door →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
