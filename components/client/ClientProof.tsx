import type { ReworkClientConfig } from "@/lib/client-config";
import {
  approvedCases,
  type ClientProofConfig,
} from "@/lib/client-proof/types";
import { card } from "./ClientShell";
export function ClientProof({
  client,
  proof,
}: {
  client: ReworkClientConfig;
  proof: ClientProofConfig;
}) {
  const cases = approvedCases(client, proof);
  return (
    <>
      <section className={card}>
        <h2 className="text-2xl font-bold text-[#0b192c]">Review-request workflow</h2>
        <p className="mt-3 text-slate-600 leading-relaxed">
          After a completed job, an authorized team member can prepare an
          optional, neutral request for honest feedback. Contact permission, an
          opt-out check and a verified business review link are required.
          Requests are never selected by expected rating.
        </p>
        <p className="mt-4 text-sm font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
          Review sending is not connected in this demo. No reviews, star ratings
          or review counts are invented.
        </p>
      </section>
      <section className={card}>
        <h2 className="text-2xl font-bold text-[#0b192c]">Case evidence</h2>
        {cases.length ? (
          cases.map((item) => (
            <article key={item.slug} className="mt-5 space-y-3 border-t border-slate-100 pt-4">
              <h3 className="text-xl font-bold text-[#0b192c]">{item.title}</h3>
              <p className="text-slate-600">
                <strong className="text-slate-800">Problem:</strong> {item.problem}
              </p>
              <p className="text-slate-600">
                <strong className="text-slate-800">Work performed:</strong> {item.workPerformed}
              </p>
              <p className="text-slate-600">
                <strong className="text-slate-800">Outcome:</strong> {item.outcome}
              </p>
              {item.metrics?.map((metric) => (
                <p key={metric.label} className="text-slate-600 font-medium">
                  {metric.label}: <span className="text-[#d97706] font-bold">{metric.value}</span>
                </p>
              ))}
            </article>
          ))
        ) : (
          <p className="mt-3 text-slate-600 leading-relaxed">
            No approved customer case studies have been supplied. Each future
            story requires a supported service, source evidence, customer
            permission and publication approval. Demo jobs never become customer
            proof automatically.
          </p>
        )}
      </section>
    </>
  );
}
