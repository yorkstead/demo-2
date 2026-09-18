"use client";

import { useState } from "react";
import Link from "next/link";
import { useWarehouseStore } from "@/lib/domain/store";
import {
  BarChart3,
  TrendingUp,
  Clock,
  DollarSign,
  Activity,
  AlertTriangle,
  Building2,
  Truck,
  Boxes,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ArrowRight,
  Info,
  Wrench,
  Sparkles,
  HelpCircle,
  FileCheck,
  AlertCircle,
} from "lucide-react";

export default function AnalyticsPage() {
  const { jobs, trailers, locations, pallets, exceptions, assets, personnel } = useWarehouseStore();
  const [timeframe, setTimeframe] = useState<"today" | "shift">("today");

  // Operational metrics derived directly from shared store
  const activeJobs = jobs.filter((j) => j.status !== "completed");
  const completedJobsToday = jobs.filter((j) => j.status === "completed" || j.status === "ready_for_billing");
  const palletsInFacility = pallets.length;
  const dockDoors = locations.filter((l) => l.id.startsWith("D-"));
  const occupiedDoors = dockDoors.filter((d) => d.status === "full" || d.status === "partial").length;
  const availableDoors = dockDoors.filter((d) => d.status === "available").length;

  const awaitingCustomerExceptions = exceptions.filter((e) => e.approvalStatus === "pending");
  const readyForBillingJobs = jobs.filter(
    (j) => j.billingReadinessStatus === "ready_to_invoice" || j.status === "ready_for_billing"
  );
  const needsReviewJobs = jobs.filter((j) => j.billingReadinessStatus === "needs_review");
  const storagePallets = pallets.filter((p) => p.status === "stored" || p.currentLocation.startsWith("A-") || p.currentLocation.startsWith("B-"));

  // Revenue & Commercial metrics derived strictly from store rules
  const totalAuthorizedRevenue = jobs.reduce((sum, j) => sum + (j.authorizedAmount ?? j.billableAmount), 0);
  const totalPerformedWork = jobs.reduce((sum, j) => sum + (j.performedAmount ?? j.quoteAmount), 0);
  const totalBillableRevenue = jobs.reduce((sum, j) => sum + j.billableAmount, 0);
  const totalReadyToInvoiceValue = readyForBillingJobs.reduce((sum, j) => sum + j.billableAmount, 0);
  const totalPendingChangeOrders = jobs.reduce((sum, j) => sum + (j.pendingAdditions ?? 0), 0);
  const totalStorageAccrual = jobs.reduce((sum, j) => sum + (j.storageAmount ?? 0), 0);

  // Margin concept (Illustrative Demo Estimate)
  // Assumptions: Direct labor rate estimate = $45/hr fully loaded; Materials cost estimate = 25% of quote; Forklift operating cost = $15/operating hr.
  const totalLoggedLaborHours = jobs.reduce((sum, j) => sum + j.labor.hoursLogged, 0);
  const estimatedDirectLaborCost = totalLoggedLaborHours * 45.0;
  const estimatedMaterialsCost = jobs.reduce((sum, j) => {
    const palCost = (j.materials.palletsUsed || 0) * 12.0;
    const wrapCost = (j.materials.wrapRollsUsed || 0) * 15.0;
    return sum + palCost + wrapCost;
  }, 0);
  const estimatedDirectCost = estimatedDirectLaborCost + estimatedMaterialsCost;
  const estimatedContributionMargin = totalBillableRevenue > 0 ? totalBillableRevenue - estimatedDirectCost : 0;
  const estimatedContributionMarginPercent =
    totalBillableRevenue > 0 ? Math.round((estimatedContributionMargin / totalBillableRevenue) * 100) : 0;
  const revenuePerLaborHour = totalLoggedLaborHours > 0 ? totalBillableRevenue / totalLoggedLaborHours : 0;
  const revenuePerJob = jobs.length > 0 ? totalBillableRevenue / jobs.length : 0;

  // Service Mix Breakdown derived deterministically from jobs
  const servicesMap: Record<string, { count: number; authorized: number; billable: number; hours: number }> = {};
  jobs.forEach((j) => {
    if (!servicesMap[j.service]) {
      servicesMap[j.service] = { count: 0, authorized: 0, billable: 0, hours: 0 };
    }
    servicesMap[j.service].count += 1;
    servicesMap[j.service].authorized += j.authorizedAmount ?? j.billableAmount;
    servicesMap[j.service].billable += j.billableAmount;
    servicesMap[j.service].hours += j.labor.hoursLogged;
  });
  const serviceCategories = Object.entries(servicesMap).map(([serviceName, data]) => ({
    name: serviceName,
    ...data,
    percent: Math.round((data.billable / (totalBillableRevenue || 1)) * 100),
  }));

  // Capacity calculations
  const totalRackCapacity = locations
    .filter((l) => l.zone === "STORAGE")
    .reduce((sum, l) => sum + l.capacityPallets, 0);
  const totalRackedPallets = locations
    .filter((l) => l.zone === "STORAGE")
    .reduce((sum, l) => sum + l.currentPalletIds.length, 0);
  const storageUtilization = totalRackCapacity > 0 ? Math.round((totalRackedPallets / totalRackCapacity) * 100) : 0;

  const totalReworkCapacity = locations
    .filter((l) => l.zone === "REWORK")
    .reduce((sum, l) => sum + l.capacityPallets, 0);
  const totalReworkPallets = locations
    .filter((l) => l.zone === "REWORK")
    .reduce((sum, l) => sum + l.currentPalletIds.length, 0);
  const reworkUtilization = totalReworkCapacity > 0 ? Math.round((totalReworkPallets / totalReworkCapacity) * 100) : 0;

  // Yard trailer states
  const trailersWaiting = trailers.filter((t) => t.loadStatus === "waiting").length;
  const trailersAtDoor = trailers.filter((t) => t.loadStatus === "at_door").length;
  const trailersStaged = trailers.filter((t) => t.loadStatus === "staged_ready").length;
  const trailersDeparted = trailers.filter((t) => t.loadStatus === "departed").length;

  // Bottlenecks & Attention Signals
  const attentionSignals = [
    ...(awaitingCustomerExceptions.length > 0
      ? [
          {
            id: "SIG-01",
            type: "warning",
            title: `${awaitingCustomerExceptions.length} Change Order Awaiting Customer Authorization`,
            detail: `Critical Exception EX-1049 ($285.00) blocking Pallet P08 rework on Flagship Job DX-260918-037.`,
            link: "/operations/customers/approvals",
            actionLabel: "View Approvals Queue",
          },
        ]
      : []),
    ...(trailersWaiting > 0
      ? [
          {
            id: "SIG-02",
            type: "alert",
            title: `${trailersWaiting} Trailer Waiting in Yard (KNIG-44102)`,
            detail: `Trailer KNIG-44102 staged at Spot Y-03 awaiting open door assignment (Job DX-260918-031).`,
            link: "/operations/yard",
            actionLabel: "Yard Management",
          },
        ]
      : []),
    ...(readyForBillingJobs.length > 0
      ? [
          {
            id: "SIG-03",
            type: "info",
            title: `${readyForBillingJobs.length} Work Order Ready for Invoicing ($${totalReadyToInvoiceValue.toFixed(2)})`,
            detail: `Job DX-260918-043 driver signed and documentation verified; ready for accounting release.`,
            link: "/operations/commercial/billing",
            actionLabel: "Billing Readiness Board",
          },
        ]
      : []),
    ...(needsReviewJobs.length > 0
      ? [
          {
            id: "SIG-04",
            type: "info",
            title: `${needsReviewJobs.length} Work Order Completed Awaiting Billing Review`,
            detail: `Job DX-260918-041 storage retention review pending operations manager sign-off.`,
            link: "/operations/commercial/billing",
            actionLabel: "Review Ledger",
          },
        ]
      : []),
    ...(assets.filter((a) => a.inspectionStatus === "due_soon").length > 0
      ? [
          {
            id: "SIG-05",
            type: "neutral",
            title: `Preventative Maintenance Due Soon (FL-01 & FL-03)`,
            detail: `Yale FL-01 within 29 operating hours of scheduled 250hr interval.`,
            link: "/operations/management/labor-equipment",
            actionLabel: "Asset Registry",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
            Executive Management Layer • Terminal Facility
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Executive Operations &amp; Commercial Summary
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Unified visibility into facility capacity, revenue generation, resource consumption, and operational bottlenecks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#0b192c] border border-[#1a3353] rounded-lg p-1 text-xs">
            <button
              onClick={() => setTimeframe("today")}
              className={`px-3 py-1 rounded font-bold transition cursor-pointer ${
                timeframe === "today" ? "bg-[#d4af37] text-slate-950 shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeframe("shift")}
              className={`px-3 py-1 rounded font-bold transition cursor-pointer ${
                timeframe === "shift" ? "bg-[#d4af37] text-slate-950 shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Current Shift (Day)
            </button>
          </div>

          <Link
            href="/operations/management/labor-equipment"
            className="px-3.5 py-2 rounded-lg bg-[#142844] hover:bg-[#1a3353] border border-[#233f63] text-xs font-bold text-slate-200 transition"
          >
            Equipment &amp; Staffing →
          </Link>
        </div>
      </div>

      {/* Subtle Facility Assumptions Note */}
      <div className="p-3 rounded-xl bg-[#081525] border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
          <span>
            <strong>Facility Baseline:</strong> 6030 Washington St, Suite 130, Denver, CO 80216 (~60,000 sq. ft. food-grade warehouse). Metrics computed directly from active terminal store. Illustrative facility configuration — actual layout and rack counts to be mapped during implementation.
          </span>
        </span>
        <span className="font-mono text-slate-500 uppercase text-[10px] hidden sm:inline">
          Timeframe: {timeframe === "today" ? "Today" : "Current Shift"}
        </span>
      </div>

      {/* 1. Core Executive KPI Grid (Derived strictly from centralized store) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Link
          href="/operations/jobs"
          className="p-4 rounded-xl bg-[#0b192c] hover:bg-[#102237] border border-[#1a3353] transition group"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Active Jobs</span>
            <Truck className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">{activeJobs.length}</div>
          <div className="mt-1 text-[10px] text-slate-400">{completedJobsToday.length} completed today</div>
        </Link>

        <Link
          href="/operations/yard"
          className="p-4 rounded-xl bg-[#0b192c] hover:bg-[#102237] border border-[#1a3353] transition group"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Trucks Handled</span>
            <Building2 className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">{trailers.length}</div>
          <div className="mt-1 text-[10px] text-slate-400">
            {trailersAtDoor} docked • {trailersWaiting} waiting
          </div>
        </Link>

        <Link
          href="/operations/freight/inventory"
          className="p-4 rounded-xl bg-[#0b192c] hover:bg-[#102237] border border-[#1a3353] transition group"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Pallets in Facility</span>
            <Boxes className="w-3.5 h-3.5 text-[#d4af37] group-hover:translate-x-0.5 transition" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">{palletsInFacility}</div>
          <div className="mt-1 text-[10px] text-slate-400">{storagePallets.length} in high-bay racks</div>
        </Link>

        <Link
          href="/operations/dock"
          className="p-4 rounded-xl bg-[#0b192c] hover:bg-[#102237] border border-[#1a3353] transition group"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Occupied Doors</span>
            <Building2 className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#d4af37] font-mono">
            {occupiedDoors} / {dockDoors.length}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">{availableDoors} available for intake</div>
        </Link>

        <Link
          href="/operations/customers/approvals"
          className="p-4 rounded-xl bg-[#0b192c] hover:bg-[#102237] border border-[#1a3353] transition group"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Awaiting Customer</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-300 font-mono">
            {awaitingCustomerExceptions.length}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">+$285.00 pending sign-off</div>
        </Link>
      </div>

      {/* 2. Management Attention & Operational Bottlenecks Section */}
      <div className="p-5 rounded-2xl bg-[#0b192c] border border-[#1a3353] space-y-4">
        <div className="flex items-center justify-between border-b border-[#1a3353] pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Management Attention &amp; Constraint Signals ({attentionSignals.length})
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Direct Operational Drill-Down</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {attentionSignals.map((signal) => (
            <div
              key={signal.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition ${
                signal.type === "warning"
                  ? "bg-amber-950/20 border-amber-500/40 hover:bg-amber-950/30"
                  : signal.type === "alert"
                  ? "bg-rose-950/20 border-rose-500/40 hover:bg-rose-950/30"
                  : "bg-[#081525] border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    {signal.type === "warning" && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                    {signal.type === "alert" && <Clock className="w-3.5 h-3.5 text-rose-400" />}
                    {signal.type === "info" && <FileCheck className="w-3.5 h-3.5 text-emerald-400" />}
                    {signal.type === "neutral" && <Wrench className="w-3.5 h-3.5 text-[#d4af37]" />}
                    <span>{signal.title}</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">{signal.detail}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end">
                <Link
                  href={signal.link}
                  className="text-xs font-bold text-[#d4af37] hover:underline flex items-center gap-1"
                >
                  <span>{signal.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Commercial Revenue & Margin Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commercial Ledger Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0b192c] border border-[#1a3353] space-y-5">
          <div className="flex items-center justify-between border-b border-[#1a3353] pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider">
                Commercial Ledger Rules
              </span>
              <h2 className="text-base font-bold text-white">Revenue Visibility &amp; Pipeline</h2>
            </div>
            <Link
              href="/operations/commercial/billing"
              className="text-xs font-semibold text-[#d4af37] hover:underline"
            >
              Billing Board →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-[#081525] border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Total Authorized</span>
              <span className="font-mono text-lg font-black text-slate-200">
                ${totalAuthorizedRevenue.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Approved under contract</span>
            </div>

            <div className="p-3 rounded-xl bg-[#081525] border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Work Performed</span>
              <span className="font-mono text-lg font-black text-[#d4af37]">
                ${totalPerformedWork.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Labor executed by techs</span>
            </div>

            <div className="p-3 rounded-xl bg-[#081525] border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Billable Revenue</span>
              <span className="font-mono text-lg font-black text-emerald-400">
                ${totalBillableRevenue.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Authorized ∩ Performed</span>
            </div>

            <div className="p-3 rounded-xl bg-[#081525] border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Ready to Invoice</span>
              <span className="font-mono text-lg font-black text-white">
                ${totalReadyToInvoiceValue.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Signed off for export</span>
            </div>
          </div>

          {/* Pending and Storage callouts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#081525] border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400">Pending Customer Change Orders:</span>
                <div className="text-[11px] text-slate-500">EX-1049 awaiting approval</div>
              </div>
              <span className="font-mono text-sm font-bold text-amber-400">
                +${totalPendingChangeOrders.toFixed(2)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#081525] border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400">Storage Revenue Accrual:</span>
                <div className="text-[11px] text-slate-500">16 pallets High-Bay Rack A-02</div>
              </div>
              <span className="font-mono text-sm font-bold text-purple-400">
                +${totalStorageAccrual.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Estimated Margin Concept Card (Clearly labeled Illustrative Demo Estimate) */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c1c30] to-[#081525] border border-[#233f63] space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[9px] uppercase font-bold text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded border border-[#d4af37]/30">
                  Illustrative Demo Estimate
                </span>
                <h3 className="text-base font-bold text-white mt-1.5">Contribution Margin Concept</h3>
              </div>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>

            <p className="text-[11px] text-slate-400 mt-2.5">
              Transparent cost accounting model assuming $45/hr fully loaded direct labor + standard materials consumed.
            </p>

            <div className="space-y-2 mt-4 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Total Billable Revenue:</span>
                <span className="font-mono font-bold text-white">${totalBillableRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Est. Direct Labor Cost ({totalLoggedLaborHours}h @ $45):</span>
                <span className="font-mono text-slate-300">-${estimatedDirectLaborCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Est. Materials &amp; Pallet Replacements:</span>
                <span className="font-mono text-slate-300">-${estimatedMaterialsCost.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="font-bold text-white">Est. Contribution Margin:</span>
                <span className="font-mono text-lg font-black text-emerald-400">
                  ${estimatedContributionMargin.toFixed(2)} ({estimatedContributionMarginPercent}%)
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 rounded bg-[#060d17]">
              <span className="text-[10px] text-slate-500 uppercase block">Rev / Labor Hour</span>
              <span className="font-mono font-bold text-white">${revenuePerLaborHour.toFixed(2)}</span>
            </div>
            <div className="p-2 rounded bg-[#060d17]">
              <span className="text-[10px] text-slate-500 uppercase block">Rev / Work Order</span>
              <span className="font-mono font-bold text-white">${revenuePerJob.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Facility Capacity: Dock, Warehouse & Yard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Dock Capacity */}
        <div className="p-5 rounded-2xl bg-[#0b192c] border border-[#1a3353] space-y-4">
          <div className="flex items-center justify-between border-b border-[#1a3353] pb-2.5">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#d4af37]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Dock Door Capacity</h3>
            </div>
            <Link href="/operations/dock" className="text-xs text-[#d4af37] hover:underline font-bold">
              Dock Bay View →
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Configured Demo Doors:</span>
              <span className="font-mono font-bold text-white">{dockDoors.length} Doors</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Occupied / Active:</span>
              <span className="font-mono font-bold text-emerald-400">
                {occupiedDoors} ({Math.round((occupiedDoors / dockDoors.length) * 100)}%)
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Available for Immediate Intake:</span>
              <span className="font-mono font-bold text-blue-400">{availableDoors} Doors (Doors 1, 6)</span>
            </div>
          </div>

          {/* Door Status Pills */}
          <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800">
            {dockDoors.map((door) => (
              <div
                key={door.id}
                className={`p-2 rounded text-center border text-[11px] ${
                  door.status === "full" || door.status === "partial"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                    : "bg-[#081525] border-slate-800 text-slate-400"
                }`}
              >
                <div className="font-mono font-bold">{door.name.replace("Dock ", "")}</div>
                <div className="text-[9px] uppercase font-bold mt-0.5">
                  {door.status === "full" || door.status === "partial" ? "Occupied" : "Open"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warehouse Floor & Rack Capacity */}
        <div className="p-5 rounded-2xl bg-[#0b192c] border border-[#1a3353] space-y-4">
          <div className="flex items-center justify-between border-b border-[#1a3353] pb-2.5">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Warehouse Capacity</h3>
            </div>
            <Link href="/operations/warehouse" className="text-xs text-[#d4af37] hover:underline font-bold">
              Locations →
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>High-Bay Rack Positions:</span>
              <span className="font-mono font-bold text-white">
                {totalRackedPallets} / {totalRackCapacity} ({storageUtilization}%)
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Rework Bays (RW-01 / RW-02):</span>
              <span className="font-mono font-bold text-amber-400">
                {totalReworkPallets} / {totalReworkCapacity} ({reworkUtilization}%)
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Floor Staging Lanes (ST-01..04):</span>
              <span className="font-mono font-bold text-blue-400">Sound Freight Outbound</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Storage Positions Utilization</span>
              <span className="font-mono">{storageUtilization}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#060d17] overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(storageUtilization, 6)}%` }} />
            </div>
          </div>
        </div>

        {/* Yard Management Capacity */}
        <div className="p-5 rounded-2xl bg-[#0b192c] border border-[#1a3353] space-y-4">
          <div className="flex items-center justify-between border-b border-[#1a3353] pb-2.5">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Yard Management</h3>
            </div>
            <Link href="/operations/yard" className="text-xs text-[#d4af37] hover:underline font-bold">
              Yard View →
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Trailers Backed at Dock:</span>
              <span className="font-mono font-bold text-emerald-400">{trailersAtDoor} Units</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Waiting in Yard (Spot Y-03):</span>
              <span className="font-mono font-bold text-amber-400">{trailersWaiting} Unit (KNIG-44102)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Staged Outbound for Pickup:</span>
              <span className="font-mono font-bold text-blue-400">{trailersStaged} Unit (WRNR-88214)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Departed Today:</span>
              <span className="font-mono font-bold text-slate-400">{trailersDeparted} Unit (SNLU-11048)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            Average trailer dwell: <strong className="text-slate-200">1h 42m</strong> from gate arrival to release.
          </div>
        </div>
      </div>

      {/* 5. Service Mix & Labor Value Distribution */}
      <div className="p-6 rounded-2xl bg-[#0b192c] border border-[#1a3353] space-y-5">
        <div className="flex items-center justify-between border-b border-[#1a3353] pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider">
              Operational Value Stream
            </span>
            <h2 className="text-base font-bold text-white">Service Mix &amp; Work Volume</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Derived from Centralized Job Records</span>
        </div>

        <div className="space-y-4">
          {serviceCategories.map((srv) => (
            <div key={srv.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{srv.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    ({srv.count} work order{srv.count > 1 ? "s" : ""} • {srv.hours} labor hrs)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-slate-400">${srv.billable.toFixed(2)} billable</span>
                  <span className="font-mono text-xs font-bold text-emerald-400">{srv.percent}%</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-[#060d17] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                  style={{ width: `${Math.max(srv.percent, 8)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
