"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Activity } from "lucide-react";
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
          style={{ display: "inline-block", marginRight: "0.3em" }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export default function OverviewPage() {
  return (
    <div className="space-y-20 max-w-3xl">

      {/* ════ HERO ════ */}
      <section className="pt-8 pb-2 space-y-7">

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 25 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-tint/50 border border-accent/20 rounded-full text-[11px] font-semibold text-accent"
        >
          Smart India Hackathon 2024 — Problem SIH1733
        </motion.div>

        <h1 className="text-[2.6rem] md:text-[3.6rem] font-bold tracking-tight text-foreground font-display leading-[1.1]">
          <WordReveal text="Quantum-enhanced diagnostic support for autoimmune diseases." />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, type: "spring", stiffness: 200, damping: 25 }}
          className="text-secondary text-base md:text-[1.05rem] leading-relaxed"
        >
          Autoimmune diseases affect 8% of the global population with diagnostic delays
          averaging 4–7 years. This system uses a quantum-kernel SVM to classify{" "}
          <strong className="text-foreground">13 conditions</strong> from{" "}
          <strong className="text-foreground">18 clinical biomarkers</strong>,
          simulated on <strong className="text-foreground">10 qubits</strong> with
          entangling CNOT layers — achieving{" "}
          <strong className="text-accent">84.7% test accuracy</strong> on held-out data.
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
            className="inline-flex items-center gap-2 px-6 py-3 text-secondary text-sm font-medium hover:text-foreground transition-colors duration-300"
          >
            View benchmarks →
          </Link>
        </motion.div>
      </section>

      {/* ════ APPROACH ════ */}
      <Reveal>
        <section className="space-y-4">
          <p className="text-secondary text-sm leading-relaxed">
            Classical models struggle when biomarker distributions overlap across autoimmune
            conditions — high marker correlations and non-specific symptoms cause misdiagnosis
            delays. By encoding patient vectors as qubit rotation angles and applying entangling
            gates, we map features into exponentially larger Hilbert spaces where non-linear marker
            interactions become linearly separable for SVM classification.
          </p>
        </section>
      </Reveal>

      {/* ════ PIPELINE ════ */}
      <Reveal>
        <section className="space-y-6">
          <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold text-secondary font-data">
            Pipeline
          </h2>
          <ol className="space-y-4 border-l-2 border-border pl-6">
            {[
              { step: "Patient vector", detail: "18 biomarkers — demographics, inflammation markers, autoantibodies, symptoms" },
              { step: "Standardize & reduce", detail: "Z-score normalization, then PCA to 10 principal components" },
              { step: "Quantum encoding", detail: "10-qubit angle encoding with 2 entangling layers (RY + CNOT ring)" },
              { step: "Kernel matrix", detail: "Pairwise state fidelity |⟨φ(xᵢ)|φ(xⱼ)⟩|² computed via simulated circuits" },
              { step: "Classification", detail: "One-vs-Rest SVM on the quantum kernel → 13-class disease output" },
            ].map((item, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06, type: "spring", stiffness: 250, damping: 24 }}
                className="relative"
              >
                <span className="absolute -left-[1.65rem] top-[0.3rem] w-3 h-3 rounded-full bg-accent/20 border-2 border-accent" />
                <span className="text-sm font-bold text-foreground">{item.step}</span>
                <span className="text-sm text-secondary ml-1.5">— {item.detail}</span>
              </motion.li>
            ))}
          </ol>
        </section>
      </Reveal>

      {/* ════ VALIDATION NOTE ════ */}
      <Reveal>
        <section className="space-y-3">
          <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold text-secondary font-data">
            Validation
          </h2>
          <p className="text-secondary text-sm leading-relaxed">
            All results are benchmarked against classical SVM (RBF kernel) and Random Forest
            baselines on identical held-out test splits. Kernel matrix computation is parallelized
            across CPU cores (2.58× speedup). See the{" "}
            <Link href="/compare" className="text-accent font-semibold hover:underline">
              Compare
            </Link>{" "}
            page for full metrics, confusion matrices, and speedup analysis.
          </p>
        </section>
      </Reveal>
    </div>
  );
}
