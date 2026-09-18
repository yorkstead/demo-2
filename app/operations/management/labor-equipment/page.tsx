"use client";

import { Wrench, BatteryCharging, UserCheck, ShieldCheck } from "lucide-react";

export default function LaborEquipmentPage() {
  const equipment = [
    { id: "FL-01", name: "Yale ERP050 5000lb Cushion Forklift", type: "Electric Forklift", battery: "84%", status: "Active (Door 2)", operator: "Luis R.", certStatus: "OSHA Certified (Exp 2027)" },
    { id: "FL-02", name: "Hyster J40XNT 4000lb Forklift", type: "Electric Forklift", battery: "92%", status: "Active (Door 5)", operator: "Marco S.", certStatus: "OSHA Certified (Exp 2027)" },
    { id: "FL-03", name: "Crown RC 5500 Stand-Up Rider", type: "Stand-up Forklift", battery: "65%", status: "Charging Bay 1", operator: "Unassigned", certStatus: "OSHA Certified (Exp 2026)" },
    { id: "SR-01", name: "Orion Rotary Turntable Stretch Wrapper", type: "Machine Wrapper", battery: "A/C Power", status: "Active (RW-01)", operator: "Shared", certStatus: "PM Checked Sep 05" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
          Operations Assets & Staffing
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
          Labor & Equipment Tracking
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Forklift fleet telemetry, battery levels, maintenance checks, and warehouse technician certifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {equipment.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-xl bg-[#0b192c] border border-[#1a3353] flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between border-b border-[#1a3353] pb-3">
                <span className="font-mono text-sm font-bold text-[#d4af37]">{item.id}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {item.status}
                </span>
              </div>

              <div className="mt-3">
                <h2 className="text-base font-bold text-white">{item.name}</h2>
                <div className="text-xs text-slate-400 mt-0.5">{item.type}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1a3353] space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> Battery / Power:
                </span>
                <span className="font-mono font-bold text-slate-200">{item.battery}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Current Operator:
                </span>
                <span className="font-semibold text-slate-200">{item.operator}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" /> Inspection / Cert:
                </span>
                <span className="text-[11px] text-slate-300">{item.certStatus}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
