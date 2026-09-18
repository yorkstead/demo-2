"use client";

import { CheckCircle2, Circle, AlertCircle, Clock, FileText, Check } from "lucide-react";
import { WarehouseJob, FreightUnit, OperationalException, JobDocumentationCompleteness } from "@/lib/domain/types";
import { buildJobDocumentation } from "@/lib/domain/documentation";

interface DocumentationChecklistProps {
  completeness?: JobDocumentationCompleteness;
  job?: WarehouseJob;
  pallets?: FreightUnit[];
  exceptions?: OperationalException[];
  compact?: boolean;
  variant?: "compact" | "detailed";
}

export function DocumentationChecklist(props: DocumentationChecklistProps) {
  const completeness =
    props.completeness ||
    (props.job ? buildJobDocumentation(props.job, props.exceptions || []) : null);

  if (!completeness) return null;

  const isCompact = props.compact || props.variant === "compact";
  const completedCount = completeness.completedCount ?? completeness.items.filter((i) => i.completed).length;
  const totalCount = completeness.totalCount ?? completeness.items.length;
  const requiredCount = completeness.items.filter((i) => i.required).length;
  const requiredCompleted = completeness.items.filter((i) => i.required && i.completed).length;

  if (isCompact) {
    return (
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
            completeness.allRequiredPresent
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/10 text-amber-300 border-amber-500/30"
          }`}
        >
          {completeness.allRequiredPresent ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3 h-3 text-amber-400" />
          )}
          <span>
            {requiredCompleted}/{requiredCount} Docs
          </span>
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-800">
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <FileText className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Documentation Audit Checklist</span>
        </div>
        <span
          className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
            completeness.allRequiredPresent
              ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
              : "bg-amber-950/40 text-amber-300 border-amber-500/30"
          }`}
        >
          {completeness.allRequiredPresent ? "All Required Docs Present" : `${requiredCompleted}/${requiredCount} Required Verified`}
        </span>
      </div>

      <div className="space-y-1.5">
        {completeness.items.map((item) => (
          <div
            key={item.key}
            className={`p-2 rounded-lg flex items-start gap-2.5 text-xs transition ${
              item.completed
                ? "bg-[#060d17] border border-slate-800/80"
                : item.required
                ? "bg-amber-950/20 border border-amber-500/30"
                : "bg-slate-900/40 border border-slate-800 text-slate-500"
            }`}
          >
            <div className="pt-0.5 shrink-0">
              {item.completed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : item.required ? (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-slate-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`font-semibold ${item.completed ? "text-slate-200" : item.required ? "text-amber-200" : "text-slate-500"}`}>
                  {item.label}
                </span>
                {item.required && (
                  <span className="text-[9px] uppercase font-bold text-slate-500 px-1 rounded bg-slate-800">
                    Required
                  </span>
                )}
              </div>

              {item.notes && (
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {item.notes}
                </div>
              )}
            </div>

            {item.verifiedBy && (
              <span className="text-[10px] text-slate-500 font-mono shrink-0 hidden sm:inline">
                {item.verifiedBy}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
