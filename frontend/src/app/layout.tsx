"use client";

import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const ibmMono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const navLinks = [
  { href: "/", label: "Overview" },
  { href: "/predict", label: "Live Prediction" },
  { href: "/compare", label: "Model Comparison" },
  { href: "/methodology", label: "Methodology & Disclosures" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${ibmMono.variable} h-full`}>
      <head>
        <title>QuantumImmune Dx — Clinical Diagnostic System</title>
        <meta name="description" content="Quantum-Kernel ML system for early multi-autoimmune disease detection." />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-accent-tint">
        
        {/* ── Navigation Header ── */}
        <header className="sticky top-0 z-50 w-full bg-[#FFFAF0]/85 backdrop-blur-xl border-b border-border-clinical transition-all duration-500">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <svg className="w-7 h-7 text-accent transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <div className="absolute -inset-1 bg-accent/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
              </div>
              <span className="text-xl font-bold tracking-tight text-accent font-serif-clinical transition-colors duration-300">
                QuantumImmune Dx
              </span>
              <span className="hidden md:block h-4 w-px bg-border-clinical" />
              <span className="hidden md:block text-[10px] text-secondary tracking-widest uppercase font-data">
                CLINICAL SUPPORT
              </span>
            </Link>
            
            {/* Nav Links */}
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      isActive 
                        ? "text-accent bg-accent-tint/50" 
                        : "text-secondary hover:text-foreground hover:bg-card-clinical"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-accent rounded-full animate-scale-in" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 w-full">
          <div className="max-w-7xl mx-auto px-6 py-10 md:py-16">
            {children}
          </div>
        </main>

        {/* ── Sticky Disclaimer Footer ── */}
        <footer className="w-full bg-card-clinical/80 backdrop-blur-md border-t border-border-clinical py-4 px-6 sticky bottom-0 z-40">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[10px] font-bold text-amber-border bg-amber-bg/60 px-2.5 py-1 border border-amber-border/20 rounded-md font-data tracking-wider uppercase animate-fade-in">
              <span className="w-1.5 h-1.5 bg-amber-border rounded-full animate-pulse" />
              RESEARCH PROTOCOL
            </div>
            <p className="text-[11px] text-secondary leading-relaxed max-w-2xl text-center md:text-left">
              Prototype for research/educational purposes — not a medical diagnosis. Predictions use simulated quantum registers.
            </p>
            <div className="text-[10px] text-secondary font-data uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-sage-border rounded-full animate-pulse" />
              SYS ACTIVE
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
