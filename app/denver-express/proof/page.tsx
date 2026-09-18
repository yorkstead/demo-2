import { DENVER_EXPRESS_CONFIG as client } from "@/lib/client-config";
import { DENVER_EXPRESS_PROOF } from "@/lib/client-config/clients/denver-express-proof";
import { ClientProof } from "@/components/client/ClientProof";
import { demoMetadata } from "@/lib/seo/demo-metadata";
export const metadata = demoMetadata(
  client,
  "Reviews & case evidence",
  "Preview the permission-backed review request and case-study structures. No customer proof has been supplied.",
);
export default function Page() {
  return (
    <>
      <h1 className="text-4xl font-black text-[#0b192c] sm:text-5xl">Earned proof, ready to document.</h1>
      <ClientProof client={client} proof={DENVER_EXPRESS_PROOF} />
    </>
  );
}
