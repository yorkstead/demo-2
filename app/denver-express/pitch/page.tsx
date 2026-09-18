import { notFound } from "next/navigation";
import { z } from "zod";
import { DENVER_EXPRESS_CONFIG as client } from "@/lib/client-config";
import { DENVER_EXPRESS_PRESENTATION as presentation } from "@/lib/client-config/clients/denver-express-presentation";
import { ClientPitchPanel } from "@/components/client/ClientPitchPanel";
import { card } from "@/components/client/ClientShell";
import { demoMetadata } from "@/lib/seo/demo-metadata";
export const metadata = demoMetadata(
  client,
  "Pitch Mode & implementation readiness",
  "Walk through the current opportunity, working demonstration and requirements for a production integration.",
);
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  if (!client.featureFlags.enablePitchMode) notFound();
  const query = await searchParams;
  const session = z.uuid().safeParse(query.session);
  return (
    <>
      <section className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-[#d97706] bg-amber-100/70 inline-block px-2.5 py-1 rounded-md">
          Yorkstead · Commercial Proposal &amp; Demonstration
        </p>
        <h1 className="text-4xl font-black text-[#0b192c] sm:text-5xl">
          From published services to automated dock recovery.
        </h1>
        <p className="max-w-3xl text-lg text-slate-600 leading-relaxed">
          {client.businessName} already publishes freight rescue, cross-docking and
          rework services. This concept demonstrates a public intake funnel and a dock-to-office workflow.
          The audit determines whether this or another operational problem deserves the first implementation.
        </p>
      </section>

      <section className={card}>
        <p className="text-sm font-bold text-slate-600">Proposed first engagement</p>
        <h2 className="mt-2 text-3xl font-black text-[#0b192c]">$350 workflow audit</h2>
        <p className="mt-4 leading-relaxed text-slate-600">A $350 workflow audit maps the current systems and handoffs, explains the observed problems, and recommends the highest-priority fix with a proposed implementation contract. Target delivery is about 48 hours after the agreed observation and required information are complete; confirm the date in the audit scope.</p>
        <p className="mt-4 leading-relaxed text-slate-600">Implementation is quoted after the audit: 50% at signing and 50% after written acceptance and handoff review. Own the agreed custom assets after final payment, with documented operation and a documented handoff and a strongly recommended review by a developer you choose and pay. The $350 audit is credited against the signing installment. Optional concierge is $149/month for questions, troubleshooting triage and scheduled health checks; changes are quoted separately; no Yorkstead subscription is required to operate the purchased solution.</p>
        <p className="mt-4 leading-relaxed text-slate-600">Client-owned tablets, mounts or an in-house server are evaluated where they improve the workflow. Hardware, backup and support responsibilities are itemized after the audit. The demo shows capability; if another problem is more urgent, we can start there.</p>
        <p className="mt-4 leading-relaxed text-slate-600">Where appropriate, the agreement can define local exclusivity by system, direct competitors, territory and duration. It is not a promise that competitors cannot buy other systems.</p>
      </section>

      <section className={card}>
        <h2 className="text-2xl font-bold text-[#0b192c]">Example implementation scope &amp; acceptance</h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-slate-600">
          <li>One location, one intake-to-completion workflow, up to two dock tablets and one office workstation, plus one staff handover session.</li>
          <li>Implementation scope and price follow the audit. Half is due at signing and half after written acceptance and handoff review. Hardware and independent review costs are itemized before kickoff.</li>
          <li>Acceptance: staff complete an agreed sample job from intake through photos, charges, signature, office review and CSV export; agreed devices show the same saved job after reload; access, recovery and connection-loss checks pass.</li>
          <li>Delivery timing follows the agreed readiness checks. The proposed implementation includes a 30-day remedy for reproducible defects against the signed scope. Optional concierge support and third-party costs are defined separately.</li>
          <li>Excluded: payment processing, TMS or accounting integrations, certified weighing, verified geolocation, historical migration, additional sites and new workflows. Scope changes require a separate written quote.</li>
          <li>Timing depends on approved rates, site access, hardware availability and network checks. This demonstration is not approval to use real operational data.</li>
        </ul>
      </section>

      <section className={card}>
        <h2 className="mb-4 text-2xl font-bold text-[#0b192c]">Current opportunity</h2>
        <ul className="list-disc space-y-3 pl-5 text-slate-600">
          {presentation.opportunity.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <ClientPitchPanel
        client={client}
        presentation={presentation}
        initialSession={session.success ? session.data : undefined}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <section className={card}>
          <h2 className="mb-4 text-2xl font-bold text-[#0b192c]">Implemented in this demo</h2>
          <ul className="list-disc space-y-3 pl-5 text-slate-600">
            <li>
              Eight verified service/problem previews with indexing protection.
            </li>
            <li>
              Validated intake, photo preparation and existing workflow handoff.
            </li>
            <li>
              Original client/source context preserved through job updates.
            </li>
            <li>
              Review eligibility and case approval structures with empty
              evidence collections.
            </li>
            <li>
              Offline queue staging &amp; real-time SSE pub/sub sync between dock &amp; office.
            </li>
          </ul>
          <p className="mt-5 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
            This is implementation evidence. Live client deployment and
            physical-device acceptance remain separate.
          </p>
        </section>
        <section className={card}>
          <h2 className="mb-4 text-2xl font-bold text-[#0b192c]">
            Required before production
          </h2>
          <ul className="list-disc space-y-3 pl-5 text-slate-600">
            {presentation.productionRequirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className={card}>
        <h2 className="text-xl font-bold text-[#0b192c]">Suggested pitch close</h2>
        <p className="mt-3 text-slate-600 leading-relaxed">
          Start with the highest-priority operational problem and a $350 audit.
          Review the systems, findings, recommended fix and proposed contract before deciding
          whether to buy an implementation. Target findings in about 48 hours after agreed inputs are complete.
        </p>
      </section>
    </>
  );
}
