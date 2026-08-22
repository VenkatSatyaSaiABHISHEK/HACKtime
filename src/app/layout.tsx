import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { EventProvider } from "@/context/event-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HackPulse — Live Hackathon Event Command Center",
  description: "Run every phase, countdown, live announcement, and stage projector display in perfect sync from a futuristic control room.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col bg-[#050505] text-[#f5f5f7] selection:bg-primary/30 selection:text-white">
        <EventProvider>
          {children}
        </EventProvider>
      </body>
    </html>
  );
}
