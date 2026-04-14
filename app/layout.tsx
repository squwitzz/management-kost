import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { PWAInstallPrompt, PWAInstallTutorial, NotificationProvider } from "./components";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Kost Management System",
  description: "Aplikasi manajemen kost untuk penghuni dan admin",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kost App",
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: "#003EC6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kost App" />
        <meta name="theme-color" content="#003EC6" />
      </head>
      <body className={`${inter.variable} ${manrope.variable} bg-surface text-on-surface font-body antialiased selection:bg-secondary-container selection:text-white`}>
        <NotificationProvider />
        <PWAInstallPrompt />
        <PWAInstallTutorial />
        {children}
      </body>
    </html>
  );
}
