"use client";

import { useWarehouseStore } from "@/lib/domain/store";
import { Users, Building, DollarSign, Shield, Phone, Mail } from "lucide-react";

export default function AccountsPage() {
  const { customers } = useWarehouseStore();

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
          Commercial Relationships
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
          Customer Account Directory
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Authorized brokerages, dedicated fleet partners, payment terms, and approval authorization rules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {customers.map((cust) => (
          <div
            key={cust.id}
            className="p-5 rounded-xl bg-[#0b192c] border border-[#1a3353] flex flex-col justify-between space-y-4 hover:border-[#233f63] transition"
          >
            <div>
              <div className="flex items-center justify-between border-b border-[#1a3353] pb-3">
                <span className="font-mono text-xs font-bold text-[#d4af37]">{cust.accountNumber}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  {cust.billingTier} Tier
                </span>
              </div>

              <div className="mt-3">
                <h2 className="text-base font-bold text-white">{cust.name}</h2>
                <div className="mt-2 text-xs text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-200 font-medium">{cust.contact.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{cust.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{cust.contact.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1a3353] space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Payment Terms:</span>
                <span className="font-semibold text-slate-200">{cust.paymentTerms}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Active Work Orders:</span>
                <span className="font-mono text-white font-bold">{cust.activeJobsCount}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>YTD Spend:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  ${cust.totalYtdSpend.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
