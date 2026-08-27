import type { Metadata } from "next";
import { Nunito, Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const fontNunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

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
  title: "QuantumImmune Dx | Clinical Diagnostic System",
  description: "A simulated quantum machine learning system for autoimmune disease prediction.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontNunito.variable} ${fontInter.variable} ${fontMono.variable}`}>
      <body className="antialiased flex flex-col min-h-screen">
        
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-sm group-hover:shadow-md transition-all">
                Q
              </div>
              <span className="font-display font-extrabold text-lg text-slate-900 tracking-tight">
                Quantum<span className="text-blue-600">Immune</span> Dx
              </span>
            </Link>

            {/* Links */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                Predictive Diagnosis
              </Link>
              <Link href="/compare" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                Baselines Compare
              </Link>
              <Link href="/methodology" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                Methodology
              </Link>
            </nav>

          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-slate-200/50 bg-slate-50/50 py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-medium">
              &copy; {new Date().getFullYear()} QuantumImmune Research. Not for medical use.
            </p>
            <div className="flex gap-4">
              <span className="badge-blue px-2 py-0.5 rounded-full">SIMULATED ENGINE</span>
              <span className="text-xs text-slate-400 font-data">v1.0.0-beta</span>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
