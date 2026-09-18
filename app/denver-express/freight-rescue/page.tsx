import { notFound } from "next/navigation";
import { z } from "zod";
import { DENVER_EXPRESS_CONFIG as client } from "@/lib/client-config";
import { DENVER_EXPRESS_PRESENTATION as presentation } from "@/lib/client-config/clients/denver-express-presentation";
import { FreightRescueForm } from "@/components/client/FreightRescueForm";
import { demoMetadata } from "@/lib/seo/demo-metadata";
export const metadata = demoMetadata(
  client,
  "Freight Rescue intake",
  "Try a synthetic freight request with photos and follow its handoff into the existing dock and office demo.",
);
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; session?: string }>;
}) {
  if (!client.featureFlags.enableFreightRescue) notFound();
  const query = await searchParams;
  const session = z.uuid().safeParse(query.session);
  return (
    <>
      <section className="max-w-3xl space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-[#d97706] bg-amber-100/70 inline-block px-2.5 py-1 rounded-md">
          Freight Rescue / Demo intake
        </p>
        <h1 className="text-4xl font-black text-[#0b192c] sm:text-5xl">
          From freight problem to a clear handoff.
        </h1>
        <p className="text-lg text-slate-600">
          Only contact name, phone and the freight need are required. Add load
          details and photos when useful. Freight weight checks refer to freight
          weighing; axle legalization is not offered here.
        </p>
      </section>
      <FreightRescueForm
        client={client}
        basePath={presentation.basePath}
        initialService={query.service}
        sessionToken={session.success ? session.data : undefined}
      />
    </>
  );
}
