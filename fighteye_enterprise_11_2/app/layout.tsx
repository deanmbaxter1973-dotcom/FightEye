import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./rules.css";
import "./processing.css";
import "./profiles.css";
import "./verification.css";
import "./intelligence.css";
import "./sync-consent.css";
import "./rule-analysis.css";
import "./youtube.css";
import "./training-rankings.css";
import "./federation-operations.css";
import "./competition-mobile.css";
import "./enterprise.css";
import "./competition-discovery.css";
import "./entry-readiness.css";
import "./competition-operations.css";
import "./competition-live-suite.css";
import "./event-archive.css";
import "./navigation-fix.css";
import "./post-event-review.css";
import "./development-pathway.css";
import "./operations-pathway.css";
import "./event-readiness.css";
import "./event-execution.css";
import "./polish.css";
import "./iphone.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FightEye Enterprise 11.2 — Competition Cycle",
  description: "Unified fight database, live competition operations, coach command, club management and athlete intelligence.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {capable:true,statusBarStyle:"black-translucent",title:"FightEye"},
  formatDetection: {telephone:false},
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#061832",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
