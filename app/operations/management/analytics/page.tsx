"use client";

import { useWarehouseStore } from "@/lib/domain/store";
import { BarChart3, TrendingUp, Clock, DollarSign, Activity } from "lucide-react";

export default function AnalyticsPage() {
  const { jobs } = useWarehouseStore();

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
          Executive Performance
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
          Terminal Throughput & Analytics
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Operational velocity, door cycle times, bay revenue per hour, and customer rework volume.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Average Rework Turnaround</div>
          <div className="mt-2 text-2xl font-black text-white">82 Mins</div>
          <div className="mt-1 text-[11px] text-emerald-400">18% faster than Front Range average</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Weekly Pallets Recovered</div>
          <div className="mt-2 text-2xl font-black text-[#d4af37]">148 Units</div>
          <div className="mt-1 text-[11px] text-slate-400">Shifted loads and crushed packaging</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Bay Yield / Hour</div>
          <div className="mt-2 text-2xl font-black text-emerald-400">$184.50</div>
          <div className="mt-1 text-[11px] text-slate-400">Door 2 lead generator</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Carrier Claim Save Rate</div>
          <div className="mt-2 text-2xl font-black text-blue-400">99.4%</div>
          <div className="mt-1 text-[11px] text-slate-400">Zero cargo loss claims post-rework</div>
        </div>
      </div>

      <div className="p-5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#d4af37]" />
          <span>Throughput by Service Category</span>
        </h2>

        <div className="space-y-3">
          {[
            { name: "Shifted Pallet Rework & Restacking", percent: 45, count: "68 jobs", color: "bg-[#d4af37]" },
            { name: "Container Floor-Load Transloading", percent: 25, count: "38 jobs", color: "bg-blue-400" },
            { name: "Axle Scale Rebalancing (I-25 & Fort Collins Port)", percent: 18, count: "27 jobs", color: "bg-emerald-400" },
            { name: "Short-Term Cross-Dock Staging", percent: 12, count: "18 jobs", color: "bg-purple-400" },
          ].map((item) => (
            <div key={item.name} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-200">{item.name}</span>
                <span className="text-slate-400 font-mono">{item.count} ({item.percent}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#060d17] overflow-hidden">
                <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
