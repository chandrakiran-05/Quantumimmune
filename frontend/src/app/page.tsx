"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Brain, ShieldCheck, Microscope, HeartPulse, Dna, Activity, BarChart3 } from "lucide-react";
import Link from "next/link";

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 180, damping: 22, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const words = text.split(" ");
  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ type: "spring", stiffness: 160, damping: 22, delay: i * 0.045 }}
          className="inline-block mr-[0.28em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

const stats = [
  { value: "13", label: "Disease Classes" },
  { value: "10", label: "Simulated Qubits" },
  { value: "18", label: "Clinical Biomarkers" },
  { value: "84.7%", label: "Test Accuracy" },
];

const features = [
  {
    icon: Dna,
    title: "Quantum Kernel Encoding",
    text: "Patient biomarkers are encoded as qubit rotation angles across a 10-qubit simulated register. Entangling CNOT gates create cross-feature correlations in Hilbert space.",
    color: "text-accent",
    bg: "bg-accent-tint/30",
  },
  {
    icon: Brain,
    title: "Multi-Class Classification",
    text: "A One-vs-Rest SVM trained on the quantum kernel matrix separates 13 autoimmune conditions — including RA, SLE, Type 1 Diabetes, and Hashimoto's Thyroiditis.",
    color: "text-sage",
    bg: "bg-sage-bg/30",
  },
  {
    icon: ShieldCheck,
    title: "Validated Against Baselines",
    text: "Results are benchmarked against classical SVM (RBF) and Random Forest models on held-out test data, ensuring rigorous clinical relevance.",
    color: "text-amber",
    bg: "bg-amber-bg/30",
  },
  {
    icon: Microscope,
    title: "Parallelized Computation",
    text: "The kernel matrix is computed across multiple CPU cores using Python multiprocessing, achieving 2.58× speedup over sequential evaluation.",
    color: "text-accent",
    bg: "bg-accent-tint/30",
  },
];

export default function OverviewPage() {
  return (
    <div className="space-y-24">

      {/* ════ HERO ════ */}
      <section className="relative pt-8 pb-2">
        <div className="max-w-3xl space-y-7">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 25 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-tint/50 border border-accent/20 rounded-full text-[11px] font-semibold text-accent"
          >
            <Dna className="w-3.5 h-3.5" />
            Smart India Hackathon 2024 — Problem SIH1733
          </motion.div>

          <h1 className="text-[2.6rem] md:text-[3.6rem] font-bold tracking-tight text-foreground font-display leading-[1.1]">
            <WordReveal text="Quantum-enhanced diagnostic support for autoimmune diseases." />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, type: "spring", stiffness: 200, damping: 25 }}
            className="text-secondary text-base md:text-[1.05rem] leading-relaxed max-w-2xl"
          >
            Autoimmune diseases affect 8% of the global population with average diagnostic delays of 4–7 years.
            This system explores quantum-kernel SVMs to separate overlapping biomarker patterns across 13 conditions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, type: "spring", stiffness: 200, damping: 25 }}
            className="flex flex-wrap gap-3 pt-1"
          >
            <Link
              href="/predict"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(255,111,137,0.3)] hover:shadow-[0_8px_32px_rgba(255,111,137,0.42)] hover:-translate-y-0.5"
            >
              <Activity className="w-4 h-4" />
              Try Live Prediction
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-border text-foreground text-sm font-semibold rounded-xl hover:border-accent/40 hover:bg-card transition-all duration-300"
            >
              <BarChart3 className="w-4 h-4 text-secondary" />
              View Benchmarks
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ════ STATS ════ */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, idx) => (
            <Reveal key={idx} delay={idx * 0.07}>
              <motion.div
                whileHover={{ y: -4, boxShadow: "0 12px 36px rgba(43,36,32,0.1)" }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="border border-border bg-white p-5 rounded-2xl text-center cursor-default"
              >
                <div className="text-3xl font-bold font-data text-accent">{s.value}</div>
                <div className="text-[11px] text-secondary mt-1 font-data uppercase tracking-wider">{s.label}</div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════ FEATURE CARDS ════ */}
      <section>
        <Reveal>
          <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold text-secondary font-data mb-8">
            How It Works
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f, idx) => (
            <Reveal key={idx} delay={idx * 0.08}>
              <motion.div
                whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(43,36,32,0.1)" }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="border border-border bg-card p-7 rounded-2xl space-y-3 cursor-default group"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${f.bg}`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className={`text-sm font-bold ${f.color} group-hover:opacity-90 transition-opacity`}>{f.title}</h3>
                <p className="text-sm leading-relaxed text-secondary">{f.text}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════ PIPELINE ════ */}
      <Reveal>
        <section className="border border-border bg-card rounded-2xl p-8 md:p-10">
          <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold text-secondary font-data mb-8">
            Clinical Pipeline
          </h2>
          <div className="flex flex-wrap items-center gap-3 justify-center">
            {[
              { icon: HeartPulse, label: "18 Biomarkers", sub: "Patient vector" },
              { icon: Brain, label: "PCA → 10D", sub: "Dimensionality" },
              { icon: Dna, label: "10-Qubit Circuit", sub: "Angle encoding" },
              { icon: Microscope, label: "Kernel Matrix", sub: "State fidelity" },
              { icon: ShieldCheck, label: "OVR SVM", sub: "13-class output" },
            ].map((step, idx, arr) => (
              <div key={idx} className="flex items-center gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                  whileHover={{ y: -3 }}
                  className="border border-border bg-white rounded-2xl px-5 py-4 text-center cursor-default hover:border-accent/30 transition-colors duration-200"
                >
                  <step.icon className="w-5 h-5 mx-auto text-accent mb-1.5" />
                  <span className="text-[11px] font-bold text-foreground block">{step.label}</span>
                  <span className="text-[9px] font-data text-secondary block mt-0.5">{step.sub}</span>
                </motion.div>
                {idx < arr.length - 1 && (
                  <svg className="w-6 h-4 flex-shrink-0 text-border" viewBox="0 0 24 16" fill="none">
                    <path d="M0 8 H14 M14 4 L20 8 L14 12Z" fill="#FF6F89" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ════ CTA ════ */}
      <Reveal>
        <section className="text-center py-6 space-y-5">
          <h2 className="text-2xl md:text-[1.8rem] font-bold font-display text-foreground">
            Ready to explore the quantum kernel?
          </h2>
          <p className="text-secondary text-sm max-w-sm mx-auto leading-relaxed">
            Load a patient preset or enter custom biomarker values to run the Quantum Kernel SVM in real-time.
          </p>
          <Link
            href="/predict"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-[0_4px_16px_rgba(255,111,137,0.3)] hover:shadow-[0_8px_30px_rgba(255,111,137,0.42)] hover:-translate-y-0.5"
          >
            Open Live Prediction
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </Reveal>
    </div>
  );
}
