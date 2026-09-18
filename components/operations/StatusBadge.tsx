import { JobStatus, JobPriority, ExceptionSeverity, ApprovalStatus, TrailerLoadStatus } from "@/lib/domain/types";

export function StatusBadge({ status }: { status: JobStatus | string }) {
  const configs: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    requested: { label: "Requested", bg: "bg-purple-500/10 border-purple-500/30", text: "text-purple-300", dot: "bg-purple-400" },
    scheduled: { label: "Scheduled", bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-300", dot: "bg-blue-400" },
    arrived: { label: "Arrived", bg: "bg-cyan-500/10 border-cyan-500/30", text: "text-cyan-300", dot: "bg-cyan-400" },
    waiting: { label: "Yard Waiting", bg: "bg-slate-500/10 border-slate-500/30", text: "text-slate-300", dot: "bg-slate-400" },
    dock_assigned: { label: "Dock Assigned", bg: "bg-indigo-500/10 border-indigo-500/30", text: "text-indigo-300", dot: "bg-indigo-400" },
    in_progress: { label: "In Progress / Rework", bg: "bg-amber-500/10 border-amber-500/30", text: "text-amber-300", dot: "bg-amber-400 animate-pulse" },
    active_rework: { label: "In Progress / Rework", bg: "bg-amber-500/10 border-amber-500/30", text: "text-amber-300", dot: "bg-amber-400 animate-pulse" },
    awaiting_approval: { label: "Awaiting Approval", bg: "bg-rose-500/10 border-rose-500/30", text: "text-rose-300", dot: "bg-rose-400 animate-ping" },
    staged: { label: "Staged Outbound", bg: "bg-teal-500/10 border-teal-500/30", text: "text-teal-300", dot: "bg-teal-400" },
    storage: { label: "High-Bay Storage", bg: "bg-violet-500/10 border-violet-500/30", text: "text-violet-300", dot: "bg-violet-400" },
    ready_for_billing: { label: "Ready for Billing", bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-300", dot: "bg-emerald-400" },
    completed: { label: "Completed / Invoiced", bg: "bg-slate-800 border-slate-700", text: "text-slate-400", dot: "bg-emerald-500" },
  };

  const c = configs[status] || { label: status.replace(/_/g, " "), bg: "bg-slate-800 border-slate-700", text: "text-slate-300", dot: "bg-slate-400" };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span>{c.label}</span>
    </span>
  );
}

export function TrailerStatusBadge({ status }: { status: TrailerLoadStatus | string }) {
  const configs: Record<string, { label: string; bg: string }> = {
    expected: { label: "Expected", bg: "bg-blue-500/15 border-blue-500/30 text-blue-300" },
    arrived: { label: "Arrived", bg: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300" },
    waiting: { label: "Waiting in Yard", bg: "bg-amber-500/15 border-amber-500/30 text-amber-300" },
    at_door: { label: "At Dock Door", bg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" },
    staged_ready: { label: "Staged / Ready", bg: "bg-teal-500/15 border-teal-500/30 text-teal-300" },
    departed: { label: "Departed", bg: "bg-slate-800 border-slate-700 text-slate-400" },
  };
  const c = configs[status] || { label: status, bg: "bg-slate-800 border-slate-700 text-slate-300" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${c.bg}`}>
      {c.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: JobPriority }) {
  if (priority === "critical_emergency") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
        CRITICAL
      </span>
    );
  }
  if (priority === "expedited") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
        EXPEDITED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
      STANDARD
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: ExceptionSeverity }) {
  const configs: Record<ExceptionSeverity, { label: string; cls: string }> = {
    critical: { label: "CRITICAL", cls: "bg-red-500/20 text-red-300 border-red-500/40" },
    high: { label: "HIGH", cls: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
    medium: { label: "MEDIUM", cls: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
    low: { label: "LOW", cls: "bg-slate-700/40 text-slate-400 border-slate-600" },
  };
  const c = configs[severity] || configs.medium;
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
    return <span className="text-rose-400 font-bold text-xs bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded animate-pulse">Awaiting Customer</span>;
  }
  if (status === "waived") {
    return <span className="text-slate-400 font-medium text-xs bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">Waived</span>;
  }
  return <span className="text-red-400 font-medium text-xs bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded">Declined / Hold</span>;
}

export function ExceptionLifecycleBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; bg: string; text: string }> = {
    new: { label: "New", bg: "bg-blue-500/15 border-blue-500/30", text: "text-blue-300" },
    investigating: { label: "Investigating", bg: "bg-indigo-500/15 border-indigo-500/30", text: "text-indigo-300" },
    awaiting_customer: { label: "Awaiting Customer", bg: "bg-rose-500/20 border-rose-500/40 animate-pulse", text: "text-rose-300" },
    approved: { label: "Customer Approved", bg: "bg-emerald-500/20 border-emerald-500/40", text: "text-emerald-300" },
    in_progress: { label: "Corrective Work Active", bg: "bg-amber-500/20 border-amber-500/40", text: "text-amber-300" },
    resolved: { label: "Resolved", bg: "bg-teal-500/15 border-teal-500/30", text: "text-teal-300" },
    declined: { label: "Held / Declined", bg: "bg-slate-800 border-slate-700", text: "text-slate-400" },
  };
  const c = configs[status] || { label: status.replace(/_/g, " "), bg: "bg-slate-800 border-slate-700", text: "text-slate-300" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}
