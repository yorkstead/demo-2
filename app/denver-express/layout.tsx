import type { Viewport } from "next";
import { ClientShell } from "@/components/client/ClientShell";
import { DENVER_EXPRESS_CONFIG as client } from "@/lib/client-config";
import { DENVER_EXPRESS_PRESENTATION as presentation } from "@/lib/client-config/clients/denver-express-presentation";
import { demoMetadata } from "@/lib/seo/demo-metadata";

export const metadata = demoMetadata(
  client,
  "Freight help preview",
  "Preview verified freight services and the Yorkstead Freight Rescue demonstration.",
);
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClientShell client={client} presentation={presentation}>
      {children}
    </ClientShell>
  );
}
