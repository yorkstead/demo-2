"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Compass,
  Building2,
  AlertTriangle,
  Boxes,
  Archive,
  History,
  Users,
  CheckSquare,
  Globe,
  Receipt,
  CreditCard,
  BarChart3,
  Wrench,
  RotateCcw,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useWarehouseStore } from "@/lib/domain/store";

export function OperationsNav() {
  const pathname = usePathname();
  const { exceptions, jobs } = useWarehouseStore();

  const pendingExceptionsCount = exceptions.filter((e) => e.approvalStatus === "pending").length;
  const activeReworkCount = jobs.filter((j) => j.status === "in_progress" || j.status === "dock_assigned" || j.status === "awaiting_approval").length;

  const sections = [
    {
      title: null,
      items: [
        {
          label: "Command Center",
          href: "/operations/command-center",
          icon: LayoutDashboard,
          badge: null as string | null,
          badgeColor: undefined as string | undefined,
          external: false,
        },
      ],
    },
    {
      title: "Operations",
      items: [
        { label: "Jobs / Work Orders", href: "/operations/jobs", icon: Truck, badge: activeReworkCount > 0 ? `${activeReworkCount} Active` : null, badgeColor: "bg-amber-500/20 text-amber-300", external: false },
        { label: "Yard Management", href: "/operations/yard", icon: Compass, badge: null, badgeColor: undefined, external: false },
        { label: "Dock Operations", href: "/operations/dock", icon: Building2, badge: null, badgeColor: undefined, external: false },
        { label: "Warehouse Locations", href: "/operations/warehouse", icon: Building2, badge: null, badgeColor: undefined, external: false },
        { label: "Exception Triage", href: "/operations/exceptions", icon: AlertTriangle, badge: pendingExceptionsCount > 0 ? `${pendingExceptionsCount} Alert` : null, badgeColor: "bg-rose-500/20 text-rose-300", external: false },
      ],
    },
    {
      title: "Freight & Pallets",
      items: [
        { label: "Pallet Inventory", href: "/operations/freight/inventory", icon: Boxes, badge: null, badgeColor: undefined, external: false },
        { label: "Storage & Retention", href: "/operations/freight/storage", icon: Archive, badge: null, badgeColor: undefined, external: false },
        { label: "Movement History", href: "/operations/freight/movements", icon: History, badge: null, badgeColor: undefined, external: false },
      ],
    },
    {
      title: "Customers",
      items: [
        { label: "Account Directory", href: "/operations/customers/accounts", icon: Users, badge: null, badgeColor: undefined, external: false },
        { label: "Customer Approvals", href: "/operations/customers/approvals", icon: CheckSquare, badge: pendingExceptionsCount > 0 ? `${pendingExceptionsCount}` : null, badgeColor: "bg-rose-500/20 text-rose-300", external: false },
        { label: "Customer Portal Preview", href: "/operations/customers/portal-preview", icon: Globe, badge: null, badgeColor: undefined, external: false },
      ],
    },
    {
      title: "Commercial",
      items: [
        { label: "Billing Readiness", href: "/operations/commercial/billing", icon: Receipt, badge: null, badgeColor: undefined, external: false },
        { label: "Verified Rate Cards", href: "/operations/commercial/rate-cards", icon: CreditCard, badge: null, badgeColor: undefined, external: false },
      ],
    },
    {
      title: "Management",
      items: [
        { label: "Executive Analytics", href: "/operations/management/analytics", icon: BarChart3, badge: null, badgeColor: undefined, external: false },
        { label: "Labor & Equipment", href: "/operations/management/labor-equipment", icon: Wrench, badge: null, badgeColor: undefined, external: false },
      ],
    },
    {
      title: "Rework Flow Core",
      items: [
        { label: "Office Dispatch & Ledger", href: "/office", icon: ExternalLink, badge: null, badgeColor: undefined, external: true },
        { label: "Forklift Dock Terminal", href: "/dock", icon: ExternalLink, badge: null, badgeColor: undefined, external: true },
        { label: "Driver Intake Portal", href: "/reserve", icon: ExternalLink, badge: null, badgeColor: undefined, external: true },
        { label: "I-25 / I-70 Maps Simulation", href: "/maps", icon: ExternalLink, badge: null, badgeColor: undefined, external: true },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#0b192c] border-r border-[#1a3353] flex flex-col shrink-0 h-screen sticky top-0 overflow-y-auto">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#1a3353]">
        <Link href="/operations/command-center" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#d4af37] to-amber-600 flex items-center justify-center font-black text-slate-950 shadow-md">
            DX
          </div>
          <div>
            <div className="text-sm font-black text-white tracking-wide flex items-center gap-1.5">
              <span>DENVER EXPRESS</span>
            </div>
            <div className="text-[10px] uppercase font-mono text-[#d4af37] tracking-wider">
              Warehouse Operations
            </div>
          </div>
        </Link>
        <div className="mt-2.5 px-2 py-1 rounded bg-[#060d17] border border-[#233f63] text-[10px] text-slate-400 flex items-center justify-between">
          <span>60,000 sq ft • 6 Bays</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="p-3 space-y-5 flex-1">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            {sec.title && (
              <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {sec.title}
              </div>
            )}
            {sec.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#162b45] text-[#d4af37] border border-[#233f63] font-semibold shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-[#12243a]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#d4af37]" : "text-slate-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${item.badgeColor || "bg-slate-800 text-slate-300"}`}>
                      {item.badge}
                    </span>
                  )}
                  {item.external && <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#1a3353] bg-[#081322] text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span>Facility Terminal</span>
          <span className="text-slate-200 font-mono">6030 Washington</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
          <span>Denver, CO 80216</span>
          <Link href="/" className="text-[#d4af37] hover:underline">
            Exit to Hub →
          </Link>
        </div>
      </div>
    </aside>
  );
}
