import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FPGA Block Editor — Lattice Avant",
  description: "Visual block diagram editor for Lattice Avant FPGA system-level design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full`}>
      <body className="h-full w-full overflow-hidden text-zinc-100" style={{ background: "#1e1e2e" }}>
        {children}
      </body>
    </html>
  );
}
