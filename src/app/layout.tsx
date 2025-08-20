import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Learning Platform - Platform Pembelajaran Digital",
  description: "Platform pembelajaran digital untuk SD, SMP, dan SMA dengan fitur interaktif dan monitoring real-time.",
  keywords: ["e-learning", "pembelajaran digital", "SD", "SMP", "SMA", "education", "Indonesia"],
  authors: [{ name: "E-Learning Platform Team" }],
  openGraph: {
    title: "E-Learning Platform",
    description: "Platform pembelajaran digital untuk masa depan pendidikan Indonesia",
    url: "https://elearning-platform.com",
    siteName: "E-Learning Platform",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "E-Learning Platform",
    description: "Platform pembelajaran digital untuk masa depan pendidikan Indonesia",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
