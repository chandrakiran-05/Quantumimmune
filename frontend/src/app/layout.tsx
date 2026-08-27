import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QuantumImmune | Clinical Intelligence",
  description: "LIMS Dashboard for QuantumImmune Diagnostics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontInter.variable} ${fontMono.variable}`}>
      <body className="antialiased flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 h-full overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
