"use client";

import { useWarehouseStore } from "@/lib/domain/store";
import { CreditCard, ShieldCheck, Tag, HelpCircle } from "lucide-react";

export default function RateCardsPage() {
  const { rateCard } = useWarehouseStore();

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
          Commercial Pricing Model
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
          Verified Master Rate Cards
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Standardized warehouse rates for labor, pallet exchange, machine wrap, transloading, and storage.
        </p>
      </div>

      <div className="rounded-xl bg-[#0b192c] border border-[#1a3353] overflow-hidden">
        <div className="p-4 border-b border-[#1a3353] flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Active Tariff Schedule (2026.1)
          </span>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Published Operational Standard
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#081525] text-[11px] uppercase font-bold text-slate-400 border-b border-[#1a3353]">
              <tr>
                <th className="p-3">Item Code</th>
                <th className="p-3">Category</th>
                <th className="p-3">Description</th>
                <th className="p-3">Billing Unit</th>
                <th className="p-3">Standard Rate</th>
                <th className="p-3">Rush Multiplier</th>
                <th className="p-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a3353]">
              {rateCard.map((item) => (
                <tr key={item.id} className="hover:bg-[#102237]">
                  <td className="p-3 font-mono font-bold text-[#d4af37]">{item.code}</td>
                  <td className="p-3 font-semibold text-white">{item.category}</td>
                  <td className="p-3">{item.description}</td>
                  <td className="p-3 font-mono text-slate-400">{item.unit.replace(/_/g, " ")}</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">
                    ${item.standardRate.toFixed(2)}
                  </td>
                  <td className="p-3 font-mono text-slate-300">{item.rushMultiplier}x</td>
                  <td className="p-3 text-[11px] text-slate-400">{item.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
