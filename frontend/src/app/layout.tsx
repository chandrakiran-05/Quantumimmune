"use client";

import { Inter, Nunito, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, X, Menu } from "lucide-react";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"], weight: ["400", "600", "700", "800"], display: "swap" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Predictive Diagnosis" },
    { href: "/compare", label: "Baselines Compare" },
    { href: "/methodology", label: "Methodology" },
  ];

  return (
    <html lang="en" className={`${nunito.variable} ${inter.variable} ${jetbrains.variable} h-full`}>
      <head>
        <title>QuantumImmune Dx — Clinical Diagnostic System</title>
        <meta name="description" content="Quantum-Kernel SVM for early multi-autoimmune disease detection." />
      </head>
      <body className="min-h-full flex flex-col text-foreground font-sans selection:bg-accent-tint">

        {/* ════════════════ HEADER ════════════════ */}
        <motion.header
          className={`sticky top-0 z-50 w-full transition-all duration-500 ${
            scrolled
              ? "bg-white/80 backdrop-blur-2xl shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
              : "bg-white/95 backdrop-blur-md"
          }`}
          initial={{ y: -80 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="h-16 flex items-center justify-between">

              {/* Logo */}
              <Link href="/" className="flex items-center gap-2.5 group">
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <FlaskConical className="w-6 h-6 text-accent" strokeWidth={2.2} />
                </motion.div>
                <span className="text-lg font-bold tracking-tight text-foreground font-display">
                  Quantum<span className="text-accent">Immune</span> Dx
                </span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-1 relative">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`relative px-4 py-2 text-[13px] font-medium rounded-lg transition-colors duration-200 ${
                        isActive ? "text-accent" : "text-secondary hover:text-foreground"
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 bg-accent-tint/50 rounded-lg -z-10"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-secondary hover:text-foreground hover:bg-card transition-colors cursor-pointer"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                className="md:hidden overflow-hidden border-t border-border bg-white/95 backdrop-blur-2xl"
              >
                <div className="px-6 py-4 space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        pathname === link.href ? "bg-accent-tint/40 text-accent" : "text-secondary hover:bg-card"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        {/* ════════════════ PAGE CONTENT ════════════════ */}
        <main className="flex-1 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="max-w-7xl mx-auto px-6 py-8 md:py-10"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ════════════════ FOOTER ════════════════ */}
        <footer className="w-full bg-card/80 backdrop-blur-md border-t border-border py-3.5 px-6 sticky bottom-0 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-amber bg-amber-bg/60 px-2.5 py-1 border border-amber/20 rounded-md font-data tracking-wider uppercase">
              <motion.span
                className="w-1.5 h-1.5 bg-amber rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              RESEARCH PROTOTYPE
            </div>
            <p className="text-[11px] text-secondary max-w-xl text-center hidden md:block">
              For research/educational purposes — not a medical diagnosis. Simulated quantum registers only.
            </p>
            <div className="text-[10px] text-secondary font-data uppercase tracking-wider flex items-center gap-1.5">
              <motion.span
                className="w-1.5 h-1.5 bg-sage rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 2, delay: 1 }}
              />
              ACTIVE
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
