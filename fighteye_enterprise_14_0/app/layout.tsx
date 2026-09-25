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
import "./event-timeline.css";
import "./event-planner.css";
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
import "./club-finance.css";
import "./equipment-safety.css";
import "./athlete-welfare.css";
import "./welfare-coordination.css";
import "./welfare-engagement.css";
import "./club-participation.css";
import "./coaching-session.css";
import "./club-manager.css";
import "./experience-hub.css";
import "./fight-day-focus.css";
import "./simplified-nav.css";
import "./guided-experience.css";
import "./polish.css";
import "./iphone.css";
import "./install-app.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FightEye Enterprise 14.4 — Guided Fight Operations",
  description: "Fast, guided access to athletes, coaching, competitions, live fight operations and club management.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {capable:true,statusBarStyle:"black-translucent",title:"FightEye"},
  formatDetection: {telephone:false},
  icons: {
    icon: [{url:"/favicon.svg",type:"image/svg+xml"},{url:"/icon-192.png",sizes:"192x192",type:"image/png"},{url:"/icon-512.png",sizes:"512x512",type:"image/png"}],
    shortcut: "/favicon.svg",
    apple: [{url:"/apple-touch-icon.png",sizes:"180x180",type:"image/png"}],
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
