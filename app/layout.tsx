import "./globals.css";
import type { Metadata } from "next";
import { AppProvider } from "@/lib/app-context";
import { ToastProvider, ToastViewport } from "@/lib/toast";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "AquaPure — Real-time Water Quality OS",
  description:
    "Local-first water quality monitoring OS. Live IoT-style telemetry, AI contamination classifier, canvas geospatial heatmap, and compliance report generation for PDAM, refill depots, and aquaculture.",
  applicationName: "AquaPure",
  keywords: ["water quality", "IoT", "PDAM", "aquaculture", "compliance", "real-time"],
  authors: [{ name: "AquaPure" }],
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <AppProvider>
          <ToastProvider>
            <Shell>{children}</Shell>
            <ToastViewport />
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
