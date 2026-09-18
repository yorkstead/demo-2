import { JobStatus, JobPriority, ExceptionSeverity, ApprovalStatus } from "@/lib/domain/types";

export function StatusBadge({ status }: { status: JobStatus | string }) {
  const configs: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    inbound: { label: "Inbound Gate", bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-400", dot: "bg-blue-400" },
    waiting: { label: "Yard Staging", bg: "bg-slate-500/10 border-slate-500/30", text: "text-slate-400", dot: "bg-slate-400" },
    dock_assigned: { label: "Dock Assigned", bg: "bg-indigo-500/10 border-indigo-500/30", text: "text-indigo-400", dot: "bg-indigo-400" },
    active_rework: { label: "Active Rework", bg: "bg-amber-500/10 border-amber-500/30", text: "text-amber-400", dot: "bg-amber-400 animate-pulse" },
    staged: { label: "Staged / Outbound", bg: "bg-teal-500/10 border-teal-500/30", text: "text-teal-400", dot: "bg-teal-400" },
    storage: { label: "High-Bay Storage", bg: "bg-purple-500/10 border-purple-500/30", text: "text-purple-400", dot: "bg-purple-400" },
    awaiting_approval: { label: "Approval Required", bg: "bg-rose-500/10 border-rose-500/30", text: "text-rose-400", dot: "bg-rose-400 animate-ping" },
    ready_for_billing: { label: "Ready for Billing", bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-400" },
    completed: { label: "Completed / Invoiced", bg: "bg-slate-700/30 border-slate-600/30", text: "text-slate-400", dot: "bg-emerald-500" },
  };

  const c = configs[status] || { label: status, bg: "bg-slate-800 border-slate-700", text: "text-slate-300", dot: "bg-slate-400" };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span>{c.label}</span>
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: JobPriority }) {
  if (priority === "critical_emergency") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
        CRITICAL
      </span>
    );
  }
  if (priority === "expedited") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
        EXPEDITED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
      STANDARD
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: ExceptionSeverity }) {
  const configs: Record<ExceptionSeverity, { label: string; cls: string }> = {
    critical: { label: "CRITICAL", cls: "bg-red-500/20 text-red-400 border-red-500/40" },
    high: { label: "HIGH", cls: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
    medium: { label: "MEDIUM", cls: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
    low: { label: "LOW", cls: "bg-slate-700/40 text-slate-400 border-slate-600" },
  };
  const c = configs[severity];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${c.cls}`}>
      {c.label}
    </span>
  );
}

export function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  if (status === "approved") {
    return <span className="text-emerald-400 font-bold text-xs bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">Approved</span>;
  }
  if (status === "pending") {
    return <span className="text-rose-400 font-bold text-xs bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded animate-pulse">Awaiting Sign-off</span>;
  }
  if (status === "waived") {
    return <span className="text-slate-400 font-medium text-xs bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">Auto-Waived</span>;
  }
  return <span className="text-red-400 font-bold text-xs bg-red-900/30 px-2 py-0.5 rounded">Rejected</span>;
}
