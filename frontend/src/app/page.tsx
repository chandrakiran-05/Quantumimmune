"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Beaker, Brain, ShieldCheck, Microscope, HeartPulse, Dna } from "lucide-react";
import Link from "next/link";

/* ── Scroll-reveal wrapper ── */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Word-by-word text reveal ── */
function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const words = text.split(" ");
  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ type: "spring", stiffness: 150, damping: 20, delay: i * 0.05 }}
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

const diseases = [
  { name: "Rheumatoid Arthritis", cat: "Joint", markers: "RF, Anti-CCP, CRP, ESR" },
  { name: "Systemic Lupus (SLE)", cat: "Systemic", markers: "ANA, Anti-dsDNA, C3" },
  { name: "Type 1 Diabetes", cat: "Endocrine", markers: "Fasting Glucose" },
  { name: "Hashimoto's Thyroiditis", cat: "Endocrine", markers: "TSH↑, Anti-TPO" },
  { name: "Graves' Disease", cat: "Endocrine", markers: "TSH↓, Anti-TPO" },
  { name: "Multiple Sclerosis", cat: "Neuro", markers: "Fatigue score, exclusion" },
  { name: "Psoriatic Arthritis", cat: "Derm/Joint", markers: "Skin lesions, CRP" },
  { name: "Celiac Disease", cat: "GI", markers: "Anti-tTG, GI symptoms" },
  { name: "IBD", cat: "GI", markers: "CRP↑↑, ESR↑↑, GI" },
  { name: "Sjögren's Syndrome", cat: "Exocrine", markers: "ANA, RF, ESR" },
  { name: "Ankylosing Spondylitis", cat: "Spine", markers: "HLA-B27, ESR" },
  { name: "Autoimmune Hepatitis", cat: "Hepatic", markers: "ANA, Anti-dsDNA" },
  { name: "Healthy Control", cat: "Control", markers: "Normal ranges" },
];

const pipeline = [
  { title: "Patient Vector", sub: "18 biomarkers", icon: HeartPulse },
  { title: "Normalization", sub: "[0, π] scaling", icon: Beaker },
  { title: "PCA Reduction", sub: "→ 10 components", icon: Brain },
  { title: "Quantum Encoding", sub: "10-qubit circuit", icon: Dna },
  { title: "Kernel Matrix", sub: "state fidelity", icon: Microscope },
  { title: "OVR SVM", sub: "classification", icon: ShieldCheck },
];

const stats = [
  { value: "13", label: "Disease Classes" },
  { value: "10", label: "Simulated Qubits" },
  { value: "18", label: "Clinical Biomarkers" },
  { value: "2.58×", label: "Parallel Speedup" },
];

export default function OverviewPage() {
  return (
    <div className="space-y-28">

      {/* ════════ HERO ════════ */}
      <section className="relative pt-6 pb-4">
        <div className="max-w-3xl space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-tint/50 border border-accent/20 rounded-full text-[11px] font-semibold text-accent"
          >
            <Dna className="w-3.5 h-3.5" />
            Smart India Hackathon 2024 — Problem Statement SIH1733
          </motion.div>

          <h1 className="text-4xl md:text-[3.4rem] font-bold tracking-tight text-foreground font-display leading-[1.12]">
            <WordReveal text="Early-stage multi-disease diagnostic support using simulated quantum registers." />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 25 }}
            className="text-secondary text-base md:text-lg leading-relaxed max-w-2xl"
          >
            Autoimmune diseases affect 8% of the global population with average diagnostic delays of 4–7 years.
            This system explores quantum-kernel SVMs to separate overlapping biomarker patterns in high-dimensional Hilbert spaces.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 25 }}
            className="flex flex-wrap gap-3 pt-2"
          >
            <Link
              href="/predict"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-[0_4px_16px_rgba(255,111,137,0.3)] hover:shadow-[0_8px_30px_rgba(255,111,137,0.4)] hover:-translate-y-0.5"
            >
              Try Live Prediction
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/methodology"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-border text-foreground text-sm font-semibold rounded-xl hover:border-accent/40 hover:bg-card transition-all duration-300"
            >
              Read Methodology
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ════════ STATS ROW ════════ */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, idx) => (
            <Reveal key={idx} delay={idx * 0.08}>
              <motion.div
                whileHover={{ y: -3, boxShadow: "0 8px 30px rgba(43,36,32,0.1)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="border border-border bg-white p-5 rounded-2xl text-center cursor-default"
              >
                <div className="text-3xl font-bold font-data text-accent">{s.value}</div>
                <div className="text-[11px] text-secondary mt-1 font-data uppercase tracking-wider">{s.label}</div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════ HYPOTHESIS CARDS ════════ */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          {
            label: "The Diagnostic Challenge",
            text: "Classical linear models struggle with overlapping biomarker distributions across 13 autoimmune conditions. High marker correlations and non-specific symptoms cause misdiagnosis delays averaging 4–7 years.",
          },
          {
            label: "The Quantum Separation Hypothesis",
            text: "By encoding patient vectors as qubit rotation angles and applying entangling CNOT sequences, we map features into exponentially larger Hilbert spaces where non-linear marker interactions become linearly separable for SVM classification.",
          },
        ].map((card, idx) => (
          <Reveal key={idx} delay={idx * 0.1}>
            <motion.div
              whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(43,36,32,0.12)" }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="border border-border bg-card p-7 md:p-8 rounded-2xl space-y-3 cursor-default"
            >
              <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold text-accent font-data">{card.label}</h2>
              <p className="text-sm leading-relaxed text-foreground">{card.text}</p>
            </motion.div>
          </Reveal>
        ))}
      </section>

      {/* ════════ PIPELINE ════════ */}
      <section>
        <Reveal>
          <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold text-secondary font-data mb-6">
            Data Flow & Simulation Pipeline
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="bg-card border border-border p-8 md:p-10 rounded-2xl overflow-x-auto">
            <div className="flex items-center gap-2 min-w-[820px] justify-center">
              {pipeline.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                    whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(43,36,32,0.1)" }}
                    className="w-[120px] border border-border bg-white rounded-2xl p-4 text-center cursor-default transition-colors duration-200 hover:border-accent/40"
                  >
                    <step.icon className="w-5 h-5 mx-auto text-accent mb-2" />
                    <span className="text-[11px] font-bold text-foreground block">{step.title}</span>
                    <span className="text-[9px] font-data text-secondary block mt-0.5">{step.sub}</span>
                  </motion.div>

                  {idx < pipeline.length - 1 && (
                    <svg className="w-8 h-4 flex-shrink-0" viewBox="0 0 32 16" fill="none">
                      <line x1="0" y1="8" x2="22" y2="8" stroke="#E8DFD3" strokeWidth="1.5" strokeDasharray="4 3" style={{ animation: "dash-flow 0.8s linear infinite" }} />
                      <polygon points="20,4 28,8 20,12" fill="#FF6F89" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ════════ DISEASE MATRIX ════════ */}
      <section>
        <Reveal>
          <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold text-secondary font-data mb-6">
            Target Disease Matrix — 13 Classes
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="border border-border bg-white overflow-hidden rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="px-5 py-3.5 text-[10px] font-bold text-secondary uppercase tracking-wider font-data w-10">#</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-secondary uppercase tracking-wider">Disease</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-secondary uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-secondary uppercase tracking-wider">Key Markers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {diseases.map((d, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.03, type: "spring", stiffness: 300, damping: 25 }}
                    className="group hover:bg-accent-tint/15 transition-colors duration-200 cursor-default"
                  >
                    <td className="px-5 py-3 text-xs font-data">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-card text-[10px] font-bold text-secondary group-hover:bg-accent group-hover:text-white transition-all duration-300">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-foreground group-hover:text-accent transition-colors duration-200">{d.name}</td>
                    <td className="px-5 py-3 text-xs text-secondary">{d.cat}</td>
                    <td className="px-5 py-3 text-[11px] text-secondary font-data">{d.markers}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* ════════ CTA ════════ */}
      <Reveal>
        <section className="text-center py-8 space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">
            Ready to explore the quantum kernel?
          </h2>
          <p className="text-secondary text-sm max-w-md mx-auto">
            Load a preset patient profile or upload your own clinical report to see the Quantum Kernel SVM in action.
          </p>
          <Link
            href="/predict"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-[0_4px_16px_rgba(255,111,137,0.3)] hover:shadow-[0_8px_30px_rgba(255,111,137,0.4)] hover:-translate-y-0.5"
          >
            Open Live Prediction
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </Reveal>
    </div>
  );
}
