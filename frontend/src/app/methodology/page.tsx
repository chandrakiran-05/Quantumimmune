"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { AlertCircle, Cpu, Zap, Database, Shield, Layers, Server, FileText, ScanLine } from "lucide-react";

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ type: "spring", stiffness: 200, damping: 25, delay }} className={className}>
      {children}
    </motion.div>
  );
}

const disclosures = [
  { title: "Simulated Quantum Pipeline", text: "All quantum circuits are simulated classically using PennyLane's lightning.qubit statevector simulator. No physical quantum computing hardware (QPU) was utilized." },
  { title: "Classical Concurrency vs Quantum Speedup", text: "The parallel speedup benchmarks illustrate classical CPU concurrency via multiprocessing. This does not reflect physical quantum speedup." },
  { title: "Synthetic Cohort Limitations", text: "Models are trained on synthetic data generated from literature reference tables. It contains no real-world patient records. 50 samples per class are insufficient for generalizability." },
  { title: "Clinical Decision Support Boundaries", text: "This is a proof-of-concept. It is strictly not a clinical diagnostic device, has not undergone clinical validation, and must not direct patient care." },
];

const archSteps = [
  { step: "Input Scaling", desc: "Real values mapped to [0, π] angles via MinMaxScaler." },
  { step: "PCA Pre-filtering", desc: "18 features reduced to 10 principal components." },
  { step: "State Preparation", desc: "10 qubits initialized to |0⟩, rotated via Ry(xᵢ) gates." },
  { step: "Entanglement", desc: "Circular CNOT chain wraps qubit 10 back to qubit 1." },
  { step: "Fidelity Kernel", desc: "Adjoint measurement yields |⟨φ(x)|φ(y)⟩|² kernel." },
];

const techStack: { icon: React.ElementType; label: string; val: string }[] = [
  { icon: Layers, label: "Frontend", val: "Next.js 15 (App Router / React 19)" },
  { icon: Server, label: "Backend", val: "FastAPI (Python 3.13)" },
  { icon: Cpu, label: "Quantum Sim", val: "PennyLane 0.45.1 (lightning.qubit)" },
  { icon: Zap, label: "ML Solver", val: "scikit-learn 1.3 (OVR Kernel SVM)" },
  { icon: FileText, label: "PDF Parser", val: "pdfplumber 0.11" },
  { icon: ScanLine, label: "OCR", val: "Tesseract & PyTesseract" },
];

export default function MethodologyPage() {
  return (
    <div className="space-y-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="max-w-3xl space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-display leading-tight">
          System methodology & transparency declarations.
        </h1>
        <p className="text-secondary text-sm">Technical specifications, models, and honest disclosures of this simulated quantum prototype.</p>
      </motion.div>

      {/* Disclosures */}
      <section className="space-y-5">
        <Reveal>
          <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold text-accent font-data">Disclosures & Constraints</h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-3">
          {disclosures.map((d, idx) => (
            <Reveal key={idx} delay={idx * 0.08}>
              <motion.div whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(43,36,32,0.08)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="border border-border bg-card p-5 rounded-2xl space-y-2 cursor-default">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 font-display">
                  <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                    <AlertCircle className="w-4 h-4 text-accent" />
                  </motion.span>
                  {d.title}
                </h3>
                <p className="text-xs leading-relaxed text-secondary pl-6">{d.text}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Architecture + Tech Stack */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Architecture */}
        <div className="space-y-5">
          <Reveal>
            <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold text-accent font-data">Quantum Feature Architecture</h2>
          </Reveal>
          <div className="space-y-3">
            {archSteps.map((s, idx) => (
              <Reveal key={idx} delay={idx * 0.07}>
                <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="flex items-start gap-3 group cursor-default">
                  <motion.div whileHover={{ scale: 1.15, backgroundColor: "var(--accent-tint)" }}
                    className="w-7 h-7 rounded-full border-2 border-border flex items-center justify-center flex-shrink-0 text-[10px] font-bold font-data text-secondary group-hover:border-accent group-hover:text-accent transition-colors duration-200">
                    {idx + 1}
                  </motion.div>
                  <div>
                    <span className="text-xs font-bold text-foreground group-hover:text-accent transition-colors duration-200">{s.step}</span>
                    <p className="text-[11px] text-secondary leading-relaxed mt-0.5">{s.desc}</p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="space-y-5">
          <Reveal>
            <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold text-accent font-data">Technology Stack</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="border border-border bg-white overflow-hidden rounded-2xl divide-y divide-border">
              {techStack.map((item, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: idx * 0.06, type: "spring", stiffness: 300, damping: 25 }}
                  whileHover={{ backgroundColor: "rgba(255,111,137,0.04)" }}
                  className="flex items-center gap-4 p-4 group cursor-default transition-colors duration-200">
                  <div className="w-9 h-9 rounded-xl bg-card flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                    <item.icon className="w-4.5 h-4.5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors duration-200">{item.label}</span>
                    <span className="text-[10px] text-secondary font-data block">{item.val}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
