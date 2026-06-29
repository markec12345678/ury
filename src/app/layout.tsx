import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "URY Dashboard — Restaurant Management Evaluation",
  description: "Comprehensive evaluation dashboard for URY open-source restaurant management system built on ERPNext/Frappe",
  keywords: ["URY", "Restaurant", "ERPNext", "Frappe", "POS", "KOT", "Dashboard"],
  authors: [{ name: "URY Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "URY Dashboard — Restaurant Management Evaluation",
    description: "Comprehensive evaluation dashboard for URY restaurant management system",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "URY Dashboard — Restaurant Management Evaluation",
    description: "Comprehensive evaluation dashboard for URY restaurant management system",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
