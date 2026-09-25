import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./rules.css";
import "./navigation-fix.css";
import "./experience-hub.css";
import "./simplified-nav.css";
import "./guided-experience.css";
import "./design-system.css";
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
  title: "FightEye Enterprise 14.6 — Guided Fight Operations",
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
