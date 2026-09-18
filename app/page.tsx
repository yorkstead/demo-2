import Link from "next/link";
import {
  LayoutDashboard,
  Truck,
  Building2,
  Compass,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

export default function DemoHome() {
  const operationalModules = [
    {
      title: "Executive Command Center",
      href: "/operations/command-center",
      desc: "Live warehouse pulse: Yard occupancy, 6 dock doors, exception holds, and unbilled revenue.",
      icon: LayoutDashboard,
      badge: "Full Platform",
    },
    {
      title: "Job & Work Order Management",
      href: "/operations/jobs",
      desc: "Full lifecycle tracking for shifted pallets, container transloading, and cross-docking.",
      icon: Truck,
      badge: "Core Workflow",
    },
    {
      title: "Yard & Dock Management",
      href: "/operations/dock",
      desc: "Real-time door status (Doors 1–6) and yard trailer detention monitoring.",
      icon: Building2,
      badge: "6 Bays",
    },
    {
      title: "Warehouse Slotting & Storage",
      href: "/operations/warehouse",
      desc: "60,000 sq. ft. 4-tier high-bay racks, climate zones, and dedicated rework bays.",
      icon: Compass,
      badge: "30ft Clear",
    },
  ];

  const reworkFlowScreens = [
    {
      name: "Dispatcher / Office Board",
      path: "/office",
      desc: "Live intake queue, QuickBooks CSV export, PDF Certificate generator, and immutable audit ledger.",
    },
    {
      name: "Forklift Dock Tablet",
      path: "/dock",
      desc: "Samsung Active5 tablet terminal with 4-step wizard: Intake, Photos, Supplies, and Signature sign-off.",
    },
    {
      name: "Driver Mobile Intake",
      path: "/reserve",
      desc: "Driver self-service bay reservation and instant pricing range estimate on mobile devices.",
    },
    {
      name: "Highway Maps Simulation",
      path: "/maps",
      desc: "Driver Google Maps discovery simulation at the I-25 / I-70 'Mousetrap' interchange.",
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 space-y-12">
      {/* Hero Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-[#d4af37]">
          <span>Denver Express Warehousing & Cross-Docking</span>
          <span>•</span>
          <span>60,000 Sq. Ft. Facility Demo</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Denver Express Warehouse Operations System
        </h1>
        <p className="max-w-3xl text-lg text-slate-300 leading-relaxed">
          The comprehensive operating platform concept for Denver Express at 6030 Washington St, Denver, CO.
          Demonstrating integrated yard management, dock scheduling, high-bay storage, and the proven Rework Flow engine.
        </p>
      </div>

      {/* Primary Platform Launch Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-[#0b192c] via-[#12243a] to-[#0b192c] border-2 border-[#d4af37] shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
            Primary Demonstration Entry Point
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Enter the Operations Command Center
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Experience the complete executive operating system: Live bay doors, yard trailers, exception triage, pallet tracking, and QuickBooks billing readiness.
          </p>
        </div>

        <Link
          href="/operations/command-center"
          className="px-6 py-3.5 rounded-xl bg-[#d4af37] hover:bg-amber-400 text-slate-950 font-black text-sm transition flex items-center justify-center gap-2 shadow-xl shrink-0"
        >
          <span>Launch Operations Platform</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Operations Suite Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>Enterprise Operations Modules</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {operationalModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className="p-5 rounded-xl bg-[#0b192c] border border-[#1a3353] hover:border-[#d4af37] transition flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-[#162b45] flex items-center justify-center text-[#d4af37]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-[#060d17] border border-slate-800">
                      {mod.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-3 group-hover:text-[#d4af37] transition">
                    {mod.title} →
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Embedded Frontline Rework Flow Screens */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Rework Flow Execution Suite (Frontline Touchpoints)
          </h2>
          <span className="text-xs text-slate-400">Open side-by-side on tablet/laptop</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reworkFlowScreens.map((screen) => (
            <Link
              key={screen.path}
              href={screen.path}
              target="_blank"
              className="p-5 rounded-xl bg-[#0b192c] border border-slate-800 hover:border-[#233f63] transition flex flex-col justify-between"
            >
              <div>
                <h3 className="text-sm font-bold text-white flex items-center justify-between">
                  <span>{screen.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#d4af37]" />
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {screen.desc}
                </p>
              </div>
              <span className="mt-4 text-[11px] font-bold text-[#d4af37]">
                Launch Terminal ↗
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
