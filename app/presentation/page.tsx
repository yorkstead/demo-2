"use client";

import { useState } from "react";
import Link from "next/link";
import { useWarehouseStore } from "@/lib/domain/store";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Building2,
  Truck,
  Boxes,
  FileCheck,
  Receipt,
  DollarSign,
  UserCheck,
  Wrench,
  ShieldCheck,
  ExternalLink,
  Layers,
  Printer,
  Sparkles,
  HelpCircle,
  Clock,
  RotateCcw,
  Check,
} from "lucide-react";

export default function GuidedTourPresentationPage() {
  const {
    jobs,
    pallets,
    locations,
    trailers,
    exceptions,
    assets,
    personnel,
    approveChangeOrder,
    completeCorrectiveWork,
    reviewAndApproveBilling,
    resetToSeed,
  } = useWarehouseStore();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 8;

  // Flagship job and associated assets
  const flagshipJob = jobs.find((j) => j.id === "DX-260918-037") || jobs[0];
  const flagshipPallets = pallets.filter((p) => p.jobId === flagshipJob.id);
  const flagshipTrailer = trailers.find((t) => t.jobId === flagshipJob.id || t.trailerNumber === flagshipJob.trailer);
  const flagshipException = exceptions.find((e) => e.jobId === flagshipJob.id) || exceptions[0];
  const affectedPallet = pallets.find((p) => p.id === flagshipException?.palletId);

  // Commercial state indicators
  const isApproved =
    flagshipException?.status === "approved" ||
    flagshipException?.status === "in_progress" ||
    flagshipException?.status === "resolved";
  const isWorkDone = flagshipException?.status === "resolved";
  const isBillingSignedOff = flagshipJob?.billingReadinessStatus === "ready_to_invoice" || flagshipJob?.billingReadinessStatus === "invoiced";

  // Actions for interactive demonstration during tour
  const handleQuickApprove = () => {
    if (flagshipException) {
      approveChangeOrder(flagshipException.id, "Tom Bradley", "tbradley@rmbev-demo.com");
    }
  };

  const handleQuickCompleteWork = () => {
    if (flagshipException) {
      completeCorrectiveWork(flagshipException.id, "Marco S. (Lead Tech)", "ST-03");
    }
  };

  const handleQuickBillingSignoff = () => {
    reviewAndApproveBilling(flagshipJob.id, "Sarah Lin (Operations Manager)");
  };

  const stepsMeta = [
    { num: 1, label: "Work Intake", subtitle: "Every Job Starts in One Place" },
    { num: 2, label: "Yard & Bay", subtitle: "From Arrival to Door to Warehouse" },
    { num: 3, label: "Exception Logged", subtitle: "Exceptions Become Managed Work" },
    { num: 4, label: "Customer Approval", subtitle: "Customer Authorization Inside the Job" },
    { num: 5, label: "Work & Evidence", subtitle: "The Work Record Builds Itself" },
    { num: 6, label: "Executive View", subtitle: "Operations Become Management Intelligence" },
    { num: 7, label: "Operating Model", subtitle: "Denver Express Operations Architecture" },
    { num: 8, label: "Discovery Roadmap", subtitle: "What We Would Map With Denver Express" },
  ];

  return (
    <div className="min-h-screen bg-[#060d17] text-slate-100 flex flex-col">
      {/* Top Fixed Header */}
      <header className="border-b border-[#1a3353] bg-[#0b192c]/95 backdrop-blur sticky top-0 z-40 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/operations/command-center"
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4af37] to-amber-600 flex items-center justify-center font-black text-slate-950 text-xs shadow"
            title="Return to Command Center"
          >
            DX
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white tracking-tight">DENVER EXPRESS</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-[#d4af37] border border-amber-500/30">
                Executive Guided Tour • Meeting with Craig
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              6030 Washington St, Ste 130 • 60,000 Sq. Ft. Facility Operating Model
            </p>
          </div>
        </div>

        {/* Step Progress Pills */}
        <div className="hidden lg:flex items-center gap-1.5">
          {stepsMeta.map((s) => (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                currentStep === s.num
                  ? "bg-[#d4af37] text-slate-950 shadow"
                  : currentStep > s.num
                  ? "bg-[#142844] text-emerald-400 border border-emerald-500/30"
                  : "bg-[#081525] text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <span>{s.num}.</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => resetToSeed()}
            className="px-2.5 py-1.5 rounded-lg bg-[#081525] hover:bg-[#142844] border border-slate-700 text-xs text-slate-300 font-semibold flex items-center gap-1 transition"
            title="Reset demo data to initial scenario"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Scenario</span>
          </button>
          <Link
            href="/operations/command-center"
            className="px-3 py-1.5 rounded-lg bg-[#162b45] hover:bg-[#203a5c] border border-[#233f63] text-xs font-bold text-slate-200 transition flex items-center gap-1"
          >
            <span>Exit to Ops</span>
            <ExternalLink className="w-3 h-3 text-[#d4af37]" />
          </Link>
        </div>
      </header>

      {/* Main Guided Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-8 space-y-6">
        {/* Core Philosophy Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#0b192c] via-[#0d213a] to-[#0b192c] border border-[#233f63] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="space-y-0.5">
            <div className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider">
              Core Presentation Theme for Craig
            </div>
            <p className="text-sm font-semibold text-slate-200 italic">
              &ldquo;One operating model connects the truck, the warehouse, the freight, the customer, the work, the documentation, the billing record, and management visibility.&rdquo;
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-mono text-slate-400 block">Current Step</span>
            <span className="font-mono text-lg font-black text-[#d4af37]">
              {currentStep} of {totalSteps}
            </span>
          </div>
        </div>

        {/* STEP 1: The Work Enters */}
        {currentStep === 1 && (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#081525] border border-[#1a3353] space-y-6 shadow-2xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
                Step 1 of {totalSteps} • Job Intake
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                Every Job Starts in One Place
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Work arrives at Denver Express through multiple channels, but all intake funnels into a single authoritative work order before equipment moves.
              </p>
            </div>

            {/* Channels Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[#0b192c] border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Channel 1</span>
                <div className="text-sm font-bold text-white">Driver Self-Service</div>
                <p className="text-[11px] text-slate-400">
                  Driver pulls over on I-70 or scale, scans QR code, requests bay hold in under 60 seconds.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0b192c] border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Channel 2</span>
                <div className="text-sm font-bold text-white">Office Phone Intake</div>
                <p className="text-[11px] text-slate-400">
                  Broker or carrier dispatch calls 6030 Washington St; dispatcher logs details into terminal queue.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0b192c] border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Channel 3</span>
                <div className="text-sm font-bold text-white">Shipper Account Request</div>
                <p className="text-[11px] text-slate-400">
                  Enterprise shippers (Swift, Rocky Mountain Bev) initiate transload or rework via portal link.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0b192c] border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Channel 4</span>
                <div className="text-sm font-bold text-white">Future EDI / TMS Ingestion</div>
                <p className="text-[11px] text-slate-400">
                  Standard schema ready to consume 204/214 EDI loads from enterprise brokerage platforms.
                </p>
              </div>
            </div>

            {/* Flagship Job Card */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-[#0b192c] to-[#081525] border-2 border-[#d4af37]/60 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#d4af37] text-slate-950">
                    Flagship Job Scenario
                  </span>
                  <span className="font-mono text-base font-black text-white">{flagshipJob.id}</span>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {flagshipJob.service}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Customer / Shipper</span>
                  <div className="font-bold text-white">{flagshipJob.customer.name}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Trailer / BOL</span>
                  <div className="font-mono font-bold text-amber-400">
                    {flagshipJob.trailer} • {flagshipJob.bolNumber}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Assigned Door</span>
                  <div className="font-mono font-bold text-emerald-400">{flagshipJob.dockDoor || "Door 3"}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Initial Authorized Quote</span>
                  <div className="font-mono font-black text-white">${flagshipJob.quoteAmount.toFixed(2)}</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-[#060d17] p-3 rounded-lg border border-slate-800">
                <strong>Intake Scenario:</strong> Driver Dan Kowalski reported cargo shift descending I-70 Floyd Hill; rejected at Commerce City grocery receiver due to leaning pallets. Emergency Freight Rescue requested at 6030 Washington St.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Link
                  href={`/operations/jobs?job=${flagshipJob.id}`}
                  target="_blank"
                  className="px-4 py-2 rounded-lg bg-[#d4af37] hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow"
                >
                  <span>Open Full Job Record</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: The Facility Controls the Movement */}
        {currentStep === 2 && (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#081525] border border-[#1a3353] space-y-6 shadow-2xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
                Step 2 of {totalSteps} • Operational Movement
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                From Arrival to Door to Warehouse
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Everyone from the gate attendant to the forklift driver sees the exact same movement state in real time.
              </p>
            </div>

            {/* Visual Movement Ribbon */}
            <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-center">
              <div className="flex-1 p-3 rounded-lg bg-[#081525] border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">1. Gate Arrival</span>
                <div className="font-mono font-bold text-white text-xs mt-1">Gate Check-in</div>
                <div className="text-[11px] text-slate-400">SL-501201 verified</div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#d4af37] mx-auto hidden sm:block shrink-0" />

              <div className="flex-1 p-3 rounded-lg bg-[#081525] border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">2. Yard Staging</span>
                <div className="font-mono font-bold text-amber-400 text-xs mt-1">Spot Y-03</div>
                <div className="text-[11px] text-slate-400">Queue &amp; door assignment</div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#d4af37] mx-auto hidden sm:block shrink-0" />

              <div className="flex-1 p-3 rounded-lg bg-[#081525] border border-emerald-500/40">
                <span className="text-[10px] font-bold uppercase text-emerald-400 block">3. Dock Back-in</span>
                <div className="font-mono font-bold text-emerald-400 text-xs mt-1">Door 3 Engaged</div>
                <div className="text-[11px] text-slate-300">Leveler &amp; chocks set</div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#d4af37] mx-auto hidden sm:block shrink-0" />

              <div className="flex-1 p-3 rounded-lg bg-[#081525] border border-[#d4af37]/40">
                <span className="text-[10px] font-bold uppercase text-[#d4af37] block">4. Bay Triage</span>
                <div className="font-mono font-bold text-white text-xs mt-1">RW-01 Rework Bay</div>
                <div className="text-[11px] text-slate-300">8 Pallets offloaded</div>
              </div>
            </div>

            {/* Operational State Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#0b192c] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase">
                  <span>Yard Trailer Control</span>
                  <Truck className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-xs space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trailer:</span>
                    <span className="font-mono font-bold text-[#d4af37]">{flagshipJob.trailer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Carrier:</span>
                    <span>{flagshipJob.carrier.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="text-emerald-400 font-bold">At Door 3</span>
                  </div>
                </div>
                <Link
                  href="/operations/yard"
                  target="_blank"
                  className="text-[11px] text-[#d4af37] hover:underline font-bold inline-block pt-1"
                >
                  Inspect Yard Grid →
                </Link>
              </div>

              <div className="p-4 rounded-xl bg-[#0b192c] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase">
                  <span>Dock Bay Assignment</span>
                  <Building2 className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-xs space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Bay:</span>
                    <span className="font-mono font-bold text-emerald-400">Dock Door 3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Capacity:</span>
                    <span>26 Pallets Maximum</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Occupancy:</span>
                    <span className="font-semibold text-slate-200">Active Unloading</span>
                  </div>
                </div>
                <Link
                  href="/operations/dock"
                  target="_blank"
                  className="text-[11px] text-[#d4af37] hover:underline font-bold inline-block pt-1"
                >
                  Inspect Dock Schedule →
                </Link>
              </div>

              <div className="p-4 rounded-xl bg-[#0b192c] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase">
                  <span>Pallet Tracking</span>
                  <Boxes className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xs space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Pallets:</span>
                    <span className="font-bold text-white">{flagshipPallets.length} Units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rework Bay RW-01:</span>
                    <span className="font-mono text-amber-400">P01, P02, P08</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Staging Bay ST-03:</span>
                    <span className="font-mono text-slate-300">P05, P06, P07</span>
                  </div>
                </div>
                <Link
                  href="/operations/warehouse"
                  target="_blank"
                  className="text-[11px] text-[#d4af37] hover:underline font-bold inline-block pt-1"
                >
                  Inspect Warehouse Map →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Something Goes Wrong */}
        {currentStep === 3 && (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#081525] border border-[#1a3353] space-y-6 shadow-2xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-rose-400">
                Step 3 of {totalSteps} • Exception Detection
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                Exceptions Become Managed Work
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                When damage or load shift is discovered, work does not stop in confusion. It turns into an immediate, documented change order.
              </p>
            </div>

            {/* Exception Detail Box */}
            <div className="p-5 rounded-xl bg-rose-950/20 border-2 border-rose-500/40 space-y-4">
              <div className="flex items-center justify-between border-b border-rose-500/30 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <span className="font-mono font-black text-rose-300 text-sm">
                    {flagshipException.id}: {flagshipException.title}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Critical Exception
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Affected Pallet</span>
                    <span className="font-mono font-bold text-white">
                      {flagshipException.palletId || "DX-260918-037-P08"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Defect Analysis</span>
                    <p className="text-slate-300 leading-relaxed">
                      Severe 14° tilt; bottom GMA runners cracked; lower carton tiers crushed under load weight descending I-70. Requires full restack, pallet exchange, and machine restrapping.
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Photographic Evidence</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 2 Timestamped photos attached via dock tablet
                    </span>
                  </div>
                </div>

                {/* Commercial Distinction Card */}
                <div className="p-4 rounded-lg bg-[#081525] border border-slate-800 space-y-2.5">
                  <div className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider">
                    Commercial Authorization State
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Base Authorized Work:</span>
                      <span className="font-mono font-semibold">${flagshipJob.quoteAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-amber-400 font-bold">
                      <span>Pending Change Order (EX-1049):</span>
                      <span className="font-mono">+${(flagshipException.changeOrderAmount ?? 285).toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                      <span className="text-white">Authorized Total Today:</span>
                      <span className="font-mono text-emerald-400">${flagshipJob.quoteAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Potential Total if Approved:</span>
                      <span className="font-mono font-bold text-[#d4af37]">
                        ${(flagshipJob.quoteAmount + (flagshipException.changeOrderAmount ?? 285)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Link
                  href={`/approval/${flagshipException.id}`}
                  target="_blank"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow"
                >
                  <span>Open Customer Authorization Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: The Customer Decides Without Breaking Workflow */}
        {currentStep === 4 && (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#081525] border border-[#1a3353] space-y-6 shadow-2xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
                Step 4 of {totalSteps} • Customer Authorization
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                Customer Authorization Becomes Part of the Job
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                The broker or shipper reviews real photos on their phone or computer, authorizes the additional \$285, and the warehouse instantly updates.
              </p>
            </div>

            {/* Customer Decision Demonstration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Simulated Customer Experience */}
              <div className="p-5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-4">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>What the Customer Sees (Tom Bradley)</span>
                  <span className="text-[10px] font-mono text-[#d4af37]">Secure Mobile Link</span>
                </div>

                <div className="p-3 rounded-lg bg-[#081525] border border-slate-800 text-xs space-y-2">
                  <div className="font-bold text-white">Rocky Mountain Beverage Co. — Work Authorization</div>
                  <div className="text-slate-400 text-[11px]">
                    Pallet P08 requires restack and Grade-A pallet exchange to prevent total bottle loss.
                  </div>
                  <div className="flex justify-between font-mono pt-1 border-t border-slate-800 font-bold">
                    <span className="text-slate-300">Requested Addition:</span>
                    <span className="text-emerald-400">+$285.00</span>
                  </div>
                </div>

                {!isApproved ? (
                  <button
                    onClick={handleQuickApprove}
                    className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Click to Simulate Customer Approval ($285.00)</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold">Authorized by Tom Bradley:</span> Digital signature captured. Work order updated in real time.
                    </div>
                  </div>
                )}
              </div>

              {/* Synchronized Propagation Card */}
              <div className="p-5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-4">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Where the Update Propagates Instantly
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded bg-[#081525] border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Job Commercial State:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {isApproved ? "Authorized: $735.00" : "Authorized: $450.00"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-[#081525] border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Pending Additions:</span>
                    <span className="font-mono font-bold text-slate-300">
                      {isApproved ? "$0.00 (Cleared)" : "$285.00 (Pending)"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-[#081525] border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Forklift Terminal Tablet:</span>
                    <span className="text-emerald-400 font-semibold">
                      {isApproved ? "Green light: Proceed with Rebuild" : "Holding Pallet P08"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-[#081525] border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Customer Portal:</span>
                    <span className="text-slate-300">Live stage updated to &quot;Rework In Progress&quot;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Work Becomes Evidence and Revenue */}
        {currentStep === 5 && (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#081525] border border-[#1a3353] space-y-6 shadow-2xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Step 5 of {totalSteps} • Documentation &amp; Billing
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                The Work Record Builds Itself
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Accounting never has to reconstruct what happened after the fact. The operational work automatically produces the certified billing packet.
              </p>
            </div>

            {/* Lifecycle Pipeline */}
            <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg bg-[#081525] border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">1. Authorized</span>
                <span className="font-mono text-base font-black text-white">$735.00</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Approved by customer</span>
              </div>
              <div className="p-3 rounded-lg bg-[#081525] border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">2. Performed</span>
                <span className="font-mono text-base font-black text-[#d4af37]">
                  {isWorkDone ? "$735.00" : "$450.00"}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {isWorkDone ? "Restack complete" : "Base labor logged"}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#081525] border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">3. Documented</span>
                <span className="font-mono text-base font-black text-blue-400">8 / 8 Verified</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Audit checklist passed</span>
              </div>
              <div className="p-3 rounded-lg bg-[#081525] border border-emerald-500/40">
                <span className="text-[10px] font-bold uppercase text-emerald-400 block">4. Final Billable</span>
                <span className="font-mono text-base font-black text-emerald-400">
                  ${flagshipJob.billableAmount.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-300 block mt-0.5">Ready for invoice</span>
              </div>
            </div>

            {/* Interactive Simulation Trigger if Not Done */}
            {!isWorkDone && (
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 flex items-center justify-between text-xs">
                <div className="text-amber-300 font-medium">
                  Simulate technician completing corrective rebuild and QA plumb check (&lt;1° tolerance):
                </div>
                <button
                  onClick={handleQuickCompleteWork}
                  className="px-3.5 py-1.5 rounded-lg bg-[#d4af37] hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer"
                >
                  Complete Restack &amp; Stage Pallet
                </button>
              </div>
            )}

            {/* Quick Links to Certified Job Packet & Billing Board */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                Full 8-point audit checklist verified: Gate arrival, BOL, Photos, Exception, Authorization, Labor tally, QA, Release.
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/operations/jobs/${flagshipJob.id}/packet`}
                  target="_blank"
                  className="px-4 py-2 rounded-lg bg-[#142844] hover:bg-[#1a3353] border border-[#233f63] text-xs font-bold text-slate-200 flex items-center gap-1.5 transition shadow"
                >
                  <Printer className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>View Certified Job Packet (Printable)</span>
                </Link>
                <Link
                  href="/operations/commercial/billing"
                  target="_blank"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Billing Review Ledger</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Craig Sees the Business */}
        {currentStep === 6 && (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#081525] border border-[#1a3353] space-y-6 shadow-2xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
                Step 6 of {totalSteps} • Management Intelligence
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                Operations Become Management Intelligence
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Craig does not need to guess what is happening on the dock or in the yard. The same operational facts aggregate into real-time decision visibility.
              </p>
            </div>

            {/* Owner KPIs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-[#0b192c] border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Active Work Orders</span>
                <span className="font-mono text-xl font-black text-white">
                  {jobs.filter((j) => j.status !== "completed").length} Active
                </span>
                <span className="text-[10px] text-blue-400 block mt-0.5">Across 6 dock doors</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0b192c] border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Billable Revenue Today</span>
                <span className="font-mono text-xl font-black text-emerald-400">
                  ${jobs.reduce((sum, j) => sum + j.billableAmount, 0).toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Authorized ∩ Performed</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0b192c] border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Dock Door Utilization</span>
                <span className="font-mono text-xl font-black text-[#d4af37]">4 / 6 Doors (66%)</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Doors 1 &amp; 6 available</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0b192c] border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Est. Contribution Margin</span>
                <span className="font-mono text-xl font-black text-purple-400">
                  ~58%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Illustrative Demo Model</span>
              </div>
            </div>

            {/* Direct Signal to Record Drill-Downs */}
            <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Management Signal → Operational Record (No Searching Required)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <Link
                  href="/operations/customers/approvals"
                  target="_blank"
                  className="p-3 rounded-lg bg-[#081525] hover:bg-[#142844] border border-slate-800 transition flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-amber-300">1 Awaiting Approval</div>
                    <div className="text-[10px] text-slate-400">EX-1049 ($285.00)</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </Link>

                <Link
                  href="/operations/yard"
                  target="_blank"
                  className="p-3 rounded-lg bg-[#081525] hover:bg-[#142844] border border-slate-800 transition flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-white">1 Trailer Waiting in Yard</div>
                    <div className="text-[10px] text-slate-400">KNIG-44102 Spot Y-03</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-400" />
                </Link>

                <Link
                  href="/operations/management/labor-equipment"
                  target="_blank"
                  className="p-3 rounded-lg bg-[#081525] hover:bg-[#142844] border border-slate-800 transition flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-200">Asset Maintenance Due Soon</div>
                    <div className="text-[10px] text-slate-400">Yale FL-01 (29h remaining)</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#d4af37]" />
                </Link>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#081525] border border-slate-800 text-center text-xs font-semibold text-slate-300 italic">
              &ldquo;Same operational data. Different view for the person making the decision.&rdquo;
            </div>
          </div>
        )}

        {/* STEP 7: Full System Operating Model Map */}
        {currentStep === 7 && (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#081525] border border-[#1a3353] space-y-6 shadow-2xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
                Step 7 of {totalSteps} • System Architecture
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                Denver Express Operations Architecture
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                How all parts of the facility connect seamlessly into one unified operating system.
              </p>
            </div>

            {/* Architecture Flow Diagram */}
            <div className="p-6 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-6">
              {/* Header Box */}
              <div className="max-w-md mx-auto p-3 rounded-xl bg-[#d4af37] text-slate-950 text-center font-black text-sm uppercase tracking-wider shadow-lg">
                DENVER EXPRESS OPERATIONS PLATFORM
              </div>

              {/* Middle Triad */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#081525] border border-blue-500/40 text-center space-y-1.5">
                  <div className="text-xs font-black uppercase text-blue-400 tracking-wider">JOBS &amp; INTAKE</div>
                  <div className="text-xs text-white font-bold">Yard / Dock Bays / Rework</div>
                  <p className="text-[11px] text-slate-400">
                    Trailers, arrivals, driver self-service, dock scheduling.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#081525] border border-emerald-500/40 text-center space-y-1.5">
                  <div className="text-xs font-black uppercase text-emerald-400 tracking-wider">FREIGHT &amp; PALLETS</div>
                  <div className="text-xs text-white font-bold">Locations / Move History / Racks</div>
                  <p className="text-[11px] text-slate-400">
                    Pallet-level condition, dimensions, weights, high-bay slots.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#081525] border border-purple-500/40 text-center space-y-1.5">
                  <div className="text-xs font-black uppercase text-purple-400 tracking-wider">CUSTOMERS &amp; SHIPPERS</div>
                  <div className="text-xs text-white font-bold">Approvals / Self-Service Portal</div>
                  <p className="text-[11px] text-slate-400">
                    Electronic sign-offs, photo inspection, job packet visibility.
                  </p>
                </div>
              </div>

              {/* Bottom Spine */}
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[#081525] border border-slate-700 text-center text-xs">
                  <span className="font-bold uppercase tracking-wider text-white">DOCUMENTATION AUDIT GATE</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Gate record • BOL • Inbound photos • Exception log • Customer sign-off • Labor tally • QA plumb check • Departure
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#081525] border border-emerald-500/30 text-center text-xs">
                    <span className="font-bold uppercase tracking-wider text-emerald-400">COMMERCIAL BILLING</span>
                    <div className="text-[11px] text-slate-400">QuickBooks CSV • Single authoritative total</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#081525] border border-[#d4af37]/30 text-center text-xs">
                    <span className="font-bold uppercase tracking-wider text-[#d4af37]">EXECUTIVE INTELLIGENCE</span>
                    <div className="text-[11px] text-slate-400">Real-time throughput, bottlenecks, margin visibility</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Discovery Roadmap */}
        {currentStep === 8 && (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#081525] border border-[#1a3353] space-y-6 shadow-2xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
                Step 8 of {totalSteps} • Implementation Discussion
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                What We Would Map With Denver Express
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                The demo establishes the foundational operating model. During implementation, we will map Denver Express&apos;s exact facility layout, workflows, and commercial rules.
              </p>
            </div>

            {/* Discovery Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-5 rounded-xl bg-[#0b192c] border border-slate-800 space-y-2.5">
                <div className="font-bold text-[#d4af37] uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>1. Facility &amp; Physical Layout</span>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-[11px]">
                  <li>How many dock doors are actually commissioned at 6030 Washington St?</li>
                  <li>How should staging, storage, rework bays, and outbound lanes be designated?</li>
                  <li>How many active pallet positions should the system track on day one?</li>
                  <li>Do you plan to utilize barcode or QR labels on pallets during offload?</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-[#0b192c] border border-slate-800 space-y-2.5">
                <div className="font-bold text-blue-400 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  <span>2. Operational Workflows</span>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-[11px]">
                  <li>What is the standard procedure when a driver arrives without notice?</li>
                  <li>Who performs the initial inspection and takes photographs (guard or dock tech)?</li>
                  <li>What thresholds trigger an emergency change order vs standard rework?</li>
                  <li>How should warehouse technicians log labor hours (tablet or dispatch desk)?</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-[#0b192c] border border-slate-800 space-y-2.5">
                <div className="font-bold text-emerald-400 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  <span>3. Commercial &amp; Billing Rules</span>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-[11px]">
                  <li>What are Denver Express&apos;s standard baseline rates for rework, transloading, and storage?</li>
                  <li>Which customer accounts have automated change order thresholds (e.g. under $500)?</li>
                  <li>How should storage accrual be billed (per pallet day or monthly tier)?</li>
                  <li>What accounting export format fits your current bookkeeping (QuickBooks, CSV, API)?</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-[#0b192c] border border-purple-400 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Wrench className="w-4 h-4" />
                <span>4. Capital Assets &amp; Rollout Phasing</span>
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-[11px] p-5 rounded-xl bg-[#0b192c] border border-slate-800">
                <li>What forklift and equipment assets should be registered in the system?</li>
                <li>Do you want to track maintenance intervals and inspection compliance?</li>
                <li>Which operational module should go live first (Rework intake vs Dock management)?</li>
                <li>What hardware tablets or mobile devices will warehouse technicians carry?</li>
              </ul>
            </div>

            {/* Closing Meeting Summary Box */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-amber-500/20 via-[#0b192c] to-amber-500/20 border border-[#d4af37]/40 text-center space-y-2">
              <h3 className="text-base font-black text-white">Ready for Denver Express Implementation</h3>
              <p className="text-xs text-slate-300 max-w-2xl mx-auto">
                Craig, this software was built specifically around Denver Express&apos;s physical terminal, cold-chain &amp; food-grade needs, and freight rescue reputation.
              </p>
            </div>
          </div>
        )}

        {/* Step Navigation Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${
              currentStep === 1
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-[#0b192c] hover:bg-[#142844] text-white border border-[#233f63] cursor-pointer"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <div className="text-xs font-mono text-slate-500">
            Step {currentStep} of {totalSteps} • {stepsMeta[currentStep - 1].subtitle}
          </div>

          <button
            onClick={() => setCurrentStep((prev) => Math.min(prev + 1, totalSteps))}
            disabled={currentStep === totalSteps}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${
              currentStep === totalSteps
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-[#d4af37] hover:bg-amber-400 text-slate-950 font-black cursor-pointer shadow"
            }`}
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
