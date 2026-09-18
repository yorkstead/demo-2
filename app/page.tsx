import Link from "next/link";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function DemoHome({ searchParams }: { searchParams: Promise<{ session?: string }> }) {
  const query = await searchParams;
  if (!query.session) redirect(`/?session=${crypto.randomUUID()}`);
  const session = encodeURIComponent(query.session.slice(0, 160));
  const screens = [
    { name: "Office", step: "01", path: "/office", text: "Take a phone request, watch the queue, then review the completed job and its certificate." },
    { name: "Dock", step: "02", path: "/dock", text: "Select the reservation, add photos and supplies, capture a signature, and complete the job." },
    { name: "Driver intake", step: "03", path: "/reserve", text: "Show how a driver submits a new request that appears in the same office and dock queue." },
  ];
  return <main className="mx-auto max-w-5xl px-6 py-14">
    <p className="text-sm font-bold uppercase tracking-widest text-[#d4af37]">Yorkstead Systems · Concept prototype</p>
    <h1 className="mt-4 text-5xl font-black">Rework Flow</h1>
    <p className="mt-5 max-w-2xl text-lg text-slate-300">One request, from office to dock to completed paperwork. Open the screens below together to demonstrate the full handoff.</p>
    <div className="mt-10 grid gap-5 md:grid-cols-3">{screens.map(screen => <Link key={screen.path} href={`${screen.path}?session=${session}`} target="_blank" className="rounded-2xl border border-slate-700 bg-[#0b192c] p-6 hover:border-[#d4af37]">
      <span className="font-mono text-[#d4af37]">{screen.step}</span><h2 className="mt-5 text-2xl font-bold">{screen.name} ↗</h2><p className="mt-3 leading-relaxed text-slate-300">{screen.text}</p>
    </Link>)}</div>
    <section className="mt-8 rounded-2xl border border-slate-700 p-6"><h2 className="text-xl font-bold">A simple demonstration</h2><ol className="mt-4 list-decimal space-y-3 pl-5 text-slate-300"><li>Open Office and Dock. In Office, add a phone request using fictional details.</li><li>In Dock, select that reservation and follow the steps through photos, supplies and signature.</li><li>Complete the job, then return to Office to open its certificate and export.</li><li>Try Driver intake to show a second way to enter the same queue.</li></ol><p className="mt-5 text-sm text-slate-400">These links share one demo session. To use another device, copy this page’s complete address to that device and open its screen there. All data and prices are illustrative. Use fictional details only.</p></section>
    <nav className="mt-8 flex flex-wrap gap-6 text-[#d4af37]"><Link href="/" prefetch={false}>Start a fresh demonstration →</Link><Link href="/denver-express/pitch">Freight Rescue presentation →</Link></nav>
  </main>;
}
