"use client";

import Link from "next/link";
import { useWarehouseStore } from "@/lib/domain/store";
import { Building2, Truck, ExternalLink, Clock, User, CheckCircle } from "lucide-react";
import { StatusBadge } from "@/components/operations/StatusBadge";

export default function DockOperationsPage() {
  const { locations, jobs } = useWarehouseStore();
  const dockDoors = locations.filter((l) => l.zone === "dock_door");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
            Dock Management • 6 Bay Doors
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Dock & Door Operations
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time dock levelers, active bay unloading, and forklift operator tablet links.
          </p>
        </div>

        <Link
          href="/dock"
          target="_blank"
          className="px-3.5 py-2 rounded-lg bg-[#d4af37] hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md self-start sm:self-auto"
        >
          <span>Open Active5 Dock Tablet Simulator</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 6 Dock Door Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {dockDoors.map((door) => {
          const assignedJob = jobs.find((j) => j.dockDoor && door.name.includes(j.dockDoor));
          const isFull = door.status === "full";
          const isPartial = door.status === "partial";

          return (
            <div
              key={door.id}
              className={`p-5 rounded-xl border flex flex-col justify-between transition ${
                isFull
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
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                    {door.status}
                  </span>
                </div>

                {/* Job Information */}
                {assignedJob ? (
                  <div className="mt-4 space-y-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider">
                        {assignedJob.service}
                      </span>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {assignedJob.carrier.name}
                      </div>
                      <div className="font-mono text-xs text-slate-400">
                        Trailer: {assignedJob.trailer}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#060d17] border border-[#233f63] space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Work Order:</span>
                        <span className="font-mono text-white font-semibold">{assignedJob.id}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Assigned Operator:</span>
                        <span className="text-slate-200 font-semibold">{assignedJob.labor.assignedTech}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Pallet Count:</span>
                        <span className="font-mono text-slate-200">{assignedJob.palletCount} units</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={assignedJob.status} />
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center space-y-2">
                    <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
                    <div className="text-sm font-semibold text-slate-400">Bay Available</div>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto">
                      Door ready for inbound spot or cross-dock transfer.
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
                  <Link
                    href="/dock"
                    target="_blank"
                    className="px-3 py-1.5 rounded-lg bg-[#162b45] hover:bg-[#203a5c] border border-[#233f63] text-xs font-bold text-[#d4af37] flex items-center gap-1.5 transition"
                  >
                    <span>Dock Terminal</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                ) : (
                  <Link
                    href="/operations/yard"
                    className="text-xs text-slate-400 hover:text-white font-medium"
                  >
                    Assign Trailer →
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
