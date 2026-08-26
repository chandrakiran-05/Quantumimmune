"use client";

import React, { useEffect, useState } from "react";

const disclosures = [
  {
    title: "Simulated Quantum Pipeline",
    text: "All quantum circuits are simulated classically using PennyLane's lightning.qubit statevector simulator. No physical quantum computing hardware (QPU) was utilized. The mathematical properties of the feature maps are simulated, not executed in coherent quantum registers.",
  },
  {
    title: "Classical Concurrency vs Quantum Speedup",
    text: "The parallel speedup benchmarks illustrate classical concurrency achieved via multiprocessing across CPU cores (chunked workload distribution). This does not reflect actual physical quantum speedup.",
  },
  {
    title: "Synthetic Cohort Limitations",
    text: "Models are trained entirely on a synthetic dataset generated from literature reference tables of biomarker distributions per disease. It contains no real-world patient records. The 50 samples per class are insufficient for diagnostic generalizability.",
  },
  {
    title: "Clinical Decision Support Boundaries",
    text: "This is a proof-of-concept exploring mathematical separability of overlapping marker vectors in simulated Hilbert spaces. It is strictly not a clinical diagnostic device and must not be used to direct patient care.",
  },
];

const techStack = [
  { label: "Frontend Framework", val: "Next.js 15 (App Router / React 19)" },
  { label: "State Management", val: "React Context & Hooks" },
  { label: "Styling Engine", val: "Tailwind CSS v4 (Warm-Clinical Theme)" },
  { label: "Server Stack", val: "FastAPI REST Server (Python 3.13)" },
  { label: "Quantum Simulator", val: "PennyLane 0.45.1 (lightning.qubit)" },
  { label: "Classical ML Solver", val: "scikit-learn 1.3 (OVR Kernel SVM)" },
  { label: "PDF Parser", val: "pdfplumber 0.11" },
  { label: "OCR Module", val: "Tesseract OCR & PyTesseract" },
];

const architectureSteps = [
  { step: "Input Scaling", desc: "Real values mapped to [0, π] angles using MinMaxScaler." },
  { step: "PCA Pre-filtering", desc: "18 patient features reduced to 10 principal components." },
  { step: "State Preparation", desc: "10 qubits initialized to |0⟩ and rotated using Ry(xᵢ) gates." },
  { step: "Entanglement", desc: "Circular CNOT gate chains wrap the 10th qubit back to the 1st." },
  { step: "Fidelity Kernel", desc: "Adjoint measurement yields |⟨φ(x)|φ(y)⟩|² as the kernel." },
];

export default function MethodologyPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="space-y-16">
      {/* Header */}
      <div className={`max-w-3xl space-y-4 ${mounted ? "animate-fade-up" : "opacity-0"}`}>
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-serif-clinical leading-tight">
          System methodology & transparency declarations.
        </h1>
        <p className="text-secondary text-sm">
          Technical specifications, physical models, and honest declarations of the simulated quantum execution platform.
        </p>
      </div>

      {/* ── Disclosures ── */}
      <div className="space-y-5">
        <h2 className={`text-[11px] uppercase tracking-[0.15em] font-bold text-accent font-data ${mounted ? "animate-fade-up delay-100" : "opacity-0"}`}>
          Disclosures & System Constraints
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {disclosures.map((item, idx) => (
            <div
              key={idx}
              className={`border border-border-clinical bg-card-clinical p-6 rounded-2xl shadow-clinical-soft card-hover space-y-2 ${
                mounted ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${200 + idx * 120}ms` }}
            >
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2.5 font-serif-clinical">
                <span className="w-2 h-2 bg-accent rounded-full flex-shrink-0 animate-pulse" />
                {item.title}
              </h3>
              <p className="text-xs leading-relaxed text-secondary pl-[18px]">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-border-clinical" />

      {/* ── Architecture + Tech Stack ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Architecture */}
        <div className={`space-y-5 ${mounted ? "animate-slide-left delay-500" : "opacity-0"}`}>
          <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold text-accent font-data">
            Quantum Feature Mapping Architecture
          </h2>

          <div className="space-y-4">
            {architectureSteps.map((s, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 group"
                style={{ animation: mounted ? `fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${600 + idx * 100}ms both` : "none" }}
              >
                <div className="w-7 h-7 rounded-full border-2 border-border-clinical flex items-center justify-center flex-shrink-0 text-[10px] font-bold font-data text-secondary group-hover:border-accent group-hover:text-accent group-hover:bg-accent-tint/20 transition-all duration-300">
                  {idx + 1}
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground">{s.step}</span>
                  <p className="text-[11px] text-secondary leading-relaxed mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className={`space-y-5 ${mounted ? "animate-slide-right delay-500" : "opacity-0"}`}>
          <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold text-accent font-data">
            Technology Stack
          </h2>

          <div className="border border-border-clinical bg-white overflow-hidden rounded-2xl shadow-clinical-soft">
            <div className="grid grid-cols-2 border-b border-border-clinical bg-card-clinical p-3 text-[10px] font-bold text-secondary font-data uppercase tracking-wider">
              <div>Sub-System</div>
              <div>Specification</div>
            </div>
            {techStack.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-2 border-b border-border-clinical p-3.5 hover:bg-accent-tint/10 last:border-b-0 transition-colors duration-300 group"
                style={{ animation: mounted ? `fadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${700 + idx * 80}ms both` : "none" }}
              >
                <div className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors duration-300">
                  {item.label}
                </div>
                <div className="text-[10px] text-secondary font-data">{item.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
