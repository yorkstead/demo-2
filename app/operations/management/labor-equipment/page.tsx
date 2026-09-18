"use client";

import { useState } from "react";
import Link from "next/link";
import { useWarehouseStore } from "@/lib/domain/store";
import {
  Wrench,
  BatteryCharging,
  UserCheck,
  ShieldCheck,
  Clock,
  Truck,
  Building2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  Zap,
} from "lucide-react";

export default function LaborEquipmentPage() {
  const { assets, personnel, jobs, updateAsset } = useWarehouseStore();
  const [activeTab, setActiveTab] = useState<"all" | "assets" | "labor">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredAssets = assets.filter((asset) => {
    if (selectedCategory === "all") return true;
    return asset.category === selectedCategory;
  });

  const inUseAssets = assets.filter((a) => a.status === "in_use");
  const maintenanceDueAssets = assets.filter((a) => a.inspectionStatus === "due_soon" || a.status === "maintenance_due");
  const activePersonnel = personnel.filter((p) => p.status === "active");
  const totalLaborHours = personnel.reduce((sum, p) => sum + p.hoursLoggedToday, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_use":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "available":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "charging":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      case "maintenance_due":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "out_of_service":
        return "bg-slate-700 text-slate-300 border-slate-600";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
            Operations Assets &amp; Staffing
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Capital Asset &amp; Labor Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Forklift fleet telemetry, maintenance intervals, certified technician assignments, and job labor tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/operations/management/analytics"
            className="px-3 py-1.5 rounded-lg bg-[#0b192c] hover:bg-[#142844] border border-[#233f63] text-xs font-bold text-slate-300 transition"
          >
            Executive Analytics →
          </Link>
        </div>
      </div>

      {/* Illustrative Disclaimer Note */}
      <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-500/30 text-xs text-blue-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            <strong>Illustrative Capital Asset Model:</strong> Fleet identifiers, meter hours, and technician assignments demonstrate operational equipment integration. Actual equipment count and maintenance schedules will be calibrated upon Denver Express launch.
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Active Forklifts &amp; Equipment</div>
          <div className="mt-2 text-2xl font-black text-[#d4af37]">
            {inUseAssets.length} / {assets.length} In Use
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {assets.filter((a) => a.status === "available").length} Available • {assets.filter((a) => a.status === "charging").length} Charging
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Maintenance Due Soon</div>
          <div className="mt-2 text-2xl font-black text-amber-400">
            {maintenanceDueAssets.length} Assets
          </div>
          <div className="mt-1 text-[11px] text-slate-400">FL-01 &amp; FL-03 approaching 250hr PM</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Technicians on Duty</div>
          <div className="mt-2 text-2xl font-black text-emerald-400">
            {activePersonnel.length} / {personnel.length} Personnel
          </div>
          <div className="mt-1 text-[11px] text-slate-400">100% OSHA forklift certified</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Logged Shift Labor</div>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {totalLaborHours.toFixed(1)} hrs
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Billable job execution tracking</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1a3353] pb-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === "all" ? "bg-[#d4af37] text-slate-950 shadow" : "bg-[#0b192c] text-slate-300 hover:bg-[#142844] border border-[#1a3353]"
          }`}
        >
          All Resources ({assets.length + personnel.length})
        </button>
        <button
          onClick={() => setActiveTab("assets")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === "assets" ? "bg-[#d4af37] text-slate-950 shadow" : "bg-[#0b192c] text-slate-300 hover:bg-[#142844] border border-[#1a3353]"
          }`}
        >
          Capital Assets Registry ({assets.length})
        </button>
        <button
          onClick={() => setActiveTab("labor")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === "labor" ? "bg-[#d4af37] text-slate-950 shadow" : "bg-[#0b192c] text-slate-300 hover:bg-[#142844] border border-[#1a3353]"
          }`}
        >
          Warehouse Technicians ({personnel.length})
        </button>
      </div>

      {/* Section 1: Capital Asset Registry */}
      {(activeTab === "all" || activeTab === "assets") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#d4af37]" />
              <span>Capital Equipment Fleet Registry ({filteredAssets.length})</span>
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#081525] border border-[#1a3353] rounded px-2.5 py-1 text-xs text-slate-300 font-semibold focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="electric_forklift">Electric Forklifts</option>
                <option value="standup_forklift">Stand-up Forklifts</option>
                <option value="pallet_jack">Electric Pallet Jacks</option>
                <option value="stretch_wrapper">Stretch Wrappers</option>
                <option value="axle_scale">Axle Scale Systems</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => {
              const hoursUntilService = asset.nextServiceHours - asset.meterHours;
              const isMaintenanceDueSoon = hoursUntilService <= 50;
              const activeJob = asset.currentJobId ? jobs.find((j) => j.id === asset.currentJobId) : null;

              return (
                <div
                  key={asset.id}
                  className={`p-5 rounded-xl bg-[#0b192c] border transition space-y-4 flex flex-col justify-between ${
                    isMaintenanceDueSoon ? "border-amber-500/50 shadow-md shadow-amber-950/10" : "border-[#1a3353]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-[#1a3353] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-[#d4af37]">{asset.id}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-mono">
                          {asset.category.replace("_", " ")}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusBadge(
                          asset.status
                        )}`}
                      >
                        {asset.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="mt-3">
                      <h3 className="text-sm font-bold text-white leading-snug">{asset.name}</h3>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                        <span>Current Area:</span>
                        <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 text-[11px]">
                          {asset.currentArea}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Operational Telemetry & Link to Job */}
                  <div className="p-3 rounded-lg bg-[#081525] border border-slate-800/80 space-y-2 text-xs">
                    {activeJob ? (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Assigned Work Order:</span>
                        <Link
                          href={`/operations/jobs?job=${activeJob.id}`}
                          className="font-mono font-bold text-[#d4af37] hover:underline flex items-center gap-1"
                        >
                          <span>{activeJob.id}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Assigned Work Order:</span>
                        <span>None (Staged)</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Operator:</span>
                      <span className="font-semibold text-slate-200">
                        {asset.assignedOperator || "Available in Bay"}
                      </span>
                    </div>

                    {asset.batteryPercent !== undefined ? (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> Battery:
                        </span>
                        <span className="font-mono font-bold text-emerald-400">{asset.batteryPercent}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-blue-400" /> Power:
                        </span>
                        <span className="font-mono text-slate-300">Dedicated 240V A/C</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Meter / Next PM:</span>
                      <span className="font-mono text-[11px]">
                        {asset.meterHours} hrs /{" "}
                        <strong className={isMaintenanceDueSoon ? "text-amber-400" : "text-slate-300"}>
                          {asset.nextServiceHours} hrs ({hoursUntilService} hrs rem.)
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" /> Inspection:
                      </span>
                      <span
                        className={`font-semibold ${
                          asset.inspectionStatus === "compliant"
                            ? "text-emerald-400"
                            : "text-amber-400 font-bold"
                        }`}
                      >
                        {asset.inspectionStatus === "compliant" ? "Compliant (OSHA)" : "PM Due Soon (<50h)"}
                      </span>
                    </div>
                  </div>

                  {asset.notes && (
                    <div className="text-[11px] text-slate-400 italic">
                      &quot;{asset.notes}&quot;
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 2: Warehouse Technicians & Staffing */}
      {(activeTab === "all" || activeTab === "labor") && (
        <div className="space-y-4 pt-4 border-t border-[#1a3353]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span>Shift Personnel &amp; Labor Assignment ({personnel.length})</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">Current Terminal Shift</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personnel.map((tech) => {
              const assignedJob = tech.currentJobId ? jobs.find((j) => j.id === tech.currentJobId) : null;

              return (
                <div
                  key={tech.id}
                  className="p-5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[#1a3353] pb-3">
                    <div>
                      <div className="text-base font-bold text-white">{tech.name}</div>
                      <div className="text-xs text-slate-400">{tech.role}</div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        tech.status === "active"
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          : "bg-slate-700 text-slate-300 border-slate-600"
                      }`}
                    >
                      {tech.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded bg-[#081525] border border-slate-800">
                      <span className="text-slate-500 text-[10px] uppercase block">Current Location</span>
                      <span className="font-mono font-bold text-emerald-400">{tech.currentArea}</span>
                    </div>

                    <div className="p-2.5 rounded bg-[#081525] border border-slate-800">
                      <span className="text-slate-500 text-[10px] uppercase block">Hours Logged Today</span>
                      <span className="font-mono font-bold text-white">{tech.hoursLoggedToday.toFixed(2)} hrs</span>
                    </div>

                    <div className="p-2.5 rounded bg-[#081525] border border-slate-800">
                      <span className="text-slate-500 text-[10px] uppercase block">Assigned Equipment</span>
                      <span className="font-mono font-bold text-[#d4af37]">
                        {tech.assignedAssetId || "Unassigned"}
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-[#081525] border border-slate-800">
                      <span className="text-slate-500 text-[10px] uppercase block">Active Job</span>
                      {assignedJob ? (
                        <Link
                          href={`/operations/jobs?job=${assignedJob.id}`}
                          className="font-mono font-bold text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <span>{assignedJob.id}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      ) : (
                        <span className="text-slate-500">Available</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Active Certifications:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {tech.certifications.map((cert) => (
                        <span
                          key={cert}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#162b45] text-slate-300 border border-[#233f63]"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
