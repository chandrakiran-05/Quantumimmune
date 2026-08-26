"use client";

import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, Activity, BarChart3, BookOpen, ChevronDown, Zap, Shield, Microscope, Cpu, Dna, X, Menu } from "lucide-react";
import "./globals.css";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const ibmMono = IBM_Plex_Mono({ variable: "--font-ibm-mono", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

const platformModules = [
  {
    title: "Live Prediction",
    href: "/predict",
    desc: "Run patient biomarker vectors through the quantum kernel pipeline.",
    icon: Activity,
    color: "text-accent",
  },
  {
    title: "Model Comparison",
    href: "/compare",
    desc: "Compare QSVM accuracy against classical SVM and Random Forest baselines.",
    icon: BarChart3,
    color: "text-sage",
  },
  {
    title: "Methodology & Disclosures",
    href: "/methodology",
    desc: "Technical specifications, system constraints, and transparency declarations.",
    icon: BookOpen,
    color: "text-amber",
  },
];

const highlights = [
  { icon: Cpu, label: "10-Qubit Simulation" },
  { icon: Dna, label: "13 Disease Classes" },
  { icon: Zap, label: "2.58× Parallel Speedup" },
  { icon: Shield, label: "One-vs-Rest SVM" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Overview" },
    { href: "/predict", label: "Predict" },
    { href: "/compare", label: "Compare" },
    { href: "/methodology", label: "Methodology" },
  ];

  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${ibmMono.variable} h-full`}>
      <head>
        <title>QuantumImmune Dx — Clinical Diagnostic System</title>
        <meta name="description" content="Quantum-Kernel SVM for early multi-autoimmune disease detection." />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-accent-tint">

        {/* ════════════════ HEADER ════════════════ */}
        <motion.header
          className={`sticky top-0 z-50 w-full transition-all duration-500 ${
            scrolled
              ? "bg-[#FFFAF0]/80 backdrop-blur-2xl shadow-[0_1px_3px_rgba(43,36,32,0.06)]"
              : "bg-[#FFFAF0]/95 backdrop-blur-md"
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
                {/* Overview link */}
                <Link
                  href="/"
                  className={`relative px-3.5 py-2 text-[13px] font-medium rounded-lg transition-colors duration-200 ${
                    pathname === "/" ? "text-accent" : "text-secondary hover:text-foreground"
                  }`}
                >
                  Overview
                  {pathname === "/" && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-accent-tint/50 rounded-lg -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>

                {/* Platform Dropdown */}
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center gap-1 px-3.5 py-2 text-[13px] font-medium rounded-lg transition-colors duration-200 cursor-pointer ${
                      ["/predict", "/compare", "/methodology"].includes(pathname)
                        ? "text-accent"
                        : "text-secondary hover:text-foreground"
                    }`}
                  >
                    Platform
                    <motion.span
                      animate={{ rotate: dropdownOpen ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </motion.span>
                    {["/predict", "/compare", "/methodology"].includes(pathname) && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-accent-tint/50 rounded-lg -z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>

                  {/* Mega Dropdown */}
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-full right-0 mt-2 w-[520px] bg-white/95 backdrop-blur-2xl border border-border rounded-2xl shadow-[0_20px_60px_-15px_rgba(43,36,32,0.2)] overflow-hidden"
                      >
                        <div className="p-2">
                          <div className="px-4 pt-3 pb-2">
                            <span className="text-[10px] font-bold text-secondary font-data uppercase tracking-[0.2em]">
                              Diagnostic Modules
                            </span>
                          </div>

                          {platformModules.map((mod, idx) => (
                            <motion.div
                              key={mod.href}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.06, type: "spring", stiffness: 400, damping: 25 }}
                            >
                              <Link
                                href={mod.href}
                                className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-200 group ${
                                  pathname === mod.href
                                    ? "bg-accent-tint/40"
                                    : "hover:bg-card"
                                }`}
                              >
                                <div className={`w-10 h-10 rounded-xl bg-card flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300 ${mod.color}`}>
                                  <mod.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors duration-200 flex items-center gap-2">
                                    {mod.title}
                                    {pathname === mod.href && (
                                      <span className="text-[8px] bg-accent text-white px-1.5 py-0.5 rounded-full font-data uppercase tracking-wider">Active</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-secondary mt-0.5 leading-relaxed">{mod.desc}</p>
                                </div>
                              </Link>
                            </motion.div>
                          ))}

                          {/* Highlights Row */}
                          <div className="mt-2 mx-2 mb-2 p-3 bg-card rounded-xl">
                            <div className="flex items-center justify-between gap-4">
                              {highlights.map((h, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 + idx * 0.05, type: "spring", stiffness: 400, damping: 25 }}
                                  className="flex items-center gap-1.5 text-[10px] text-secondary font-data"
                                >
                                  <h.icon className="w-3.5 h-3.5 text-accent" />
                                  {h.label}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Direct nav links (for quick access) */}
                {navLinks.slice(1).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 text-[13px] font-medium rounded-lg transition-colors duration-200 ${
                      pathname === link.href ? "text-accent" : "text-secondary hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
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
              className="max-w-7xl mx-auto px-6 py-10 md:py-14"
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
