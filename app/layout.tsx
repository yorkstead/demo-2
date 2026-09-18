import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";

export const metadata: Metadata = {
  title: "ReworkFlow • Denver Express Warehousing",
  description: "High-Velocity Cargo Rework & Cross-Dock Evidence Engine",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ReworkFlow",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0b192c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                function registerSW() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(reg) {
                      console.log('[ReworkFlow PWA] Immediate SW registered, scope:', reg.scope);
                    })
                    .catch(function(err) {
                      console.warn('[ReworkFlow PWA] Immediate SW reg error:', err);
                    });
                }
                if (document.readyState === 'complete' || document.readyState === 'interactive') {
                  registerSW();
                } else {
                  window.addEventListener('DOMContentLoaded', registerSW);
                }
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#060d17] text-slate-100 antialiased selection:bg-[#d4af37] selection:text-[#0b192c]">
        <div className="border-b border-amber-500/30 bg-[#0b192c] px-4 py-2 text-center text-xs text-amber-200">Concept prototype · Fictional data only · Separate demonstration system</div>{children}
        <PwaInstallPrompt />
      </body>
    </html>
  );
}



