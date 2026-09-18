"use client";

import { useWarehouseStore } from "@/lib/domain/store";
import { Archive, Calendar, DollarSign, Clock, ShieldCheck } from "lucide-react";

export default function StoragePage() {
  const { jobs, pallets } = useWarehouseStore();
  const storageJobs = jobs.filter((j) => j.service === "Short-Term Storage" || j.status === "storage");

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
          Warehousing Services
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
          Storage & Retention Management
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Short-term pallet staging, daily retention per-diem accrual, lot numbers, and high-bay slotting.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Active Pallets in Storage</div>
          <div className="mt-2 text-2xl font-black text-white">16 Units</div>
          <div className="mt-1 text-[11px] text-slate-400">Front Range Regional Foods (Rack A-02)</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Daily Storage Per-Diem</div>
          <div className="mt-2 text-2xl font-black text-emerald-400">$56.00 / day</div>
          <div className="mt-1 text-[11px] text-slate-400">$3.50/pallet/day rate applied after 48h free window</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Average Days Staged</div>
          <div className="mt-2 text-2xl font-black text-[#d4af37]">2.4 Days</div>
          <div className="mt-1 text-[11px] text-slate-400">High-velocity turnover target: &lt; 5 days</div>
        </div>
      </div>

      <div className="rounded-xl bg-[#0b192c] border border-[#1a3353] overflow-hidden">
        <div className="p-4 border-b border-[#1a3353]">
          <h2 className="text-sm font-bold text-white">Storage Lot Registry</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#081525] text-[11px] uppercase font-bold text-slate-400 border-b border-[#1a3353]">
              <tr>
                <th className="p-3">Work Order</th>
                <th className="p-3">Customer Account</th>
                <th className="p-3">Location</th>
                <th className="p-3">Pallet Count</th>
                <th className="p-3">Intake Date</th>
                <th className="p-3">Retention Agreed</th>
                <th className="p-3">Billing Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a3353]">
              {storageJobs.map((j) => (
                <tr key={j.id} className="hover:bg-[#102237]">
                  <td className="p-3 font-mono font-bold text-[#d4af37]">{j.id}</td>
                  <td className="p-3 font-semibold text-white">{j.customer.name}</td>
                  <td className="p-3 font-mono text-emerald-400">{j.warehouseLocations.join(", ")}</td>
                  <td className="p-3 font-mono">{j.palletCount} plts</td>
                  <td className="p-3 text-slate-400">{new Date(j.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-slate-300">Through Sep 25, 2026</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                      {j.billingStatus}
                    </span>
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
