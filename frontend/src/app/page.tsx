"use client";

import React, { useEffect, useState } from "react";

const diseases = [
  { name: "Rheumatoid Arthritis (RA)", cat: "Joint / Systemic", markers: "RF (+), Anti-CCP (+), elevated CRP & ESR, joint stiffness" },
  { name: "Systemic Lupus Erythematosus (SLE)", cat: "Systemic", markers: "ANA Titer (high), Anti-dsDNA (+), suppressed Complement C3, malar rash" },
  { name: "Type 1 Diabetes Mellitus", cat: "Endocrine", markers: "Fasting glucose (>126 mg/dL), glucose spikes, early-onset indicators" },
  { name: "Hashimoto's Thyroiditis", cat: "Endocrine", markers: "Elevated TSH (>4.0 mIU/L), Anti-TPO (+), lethargy" },
  { name: "Graves' Disease", cat: "Endocrine", markers: "Suppressed TSH (<0.4 mIU/L), Anti-TPO (+), hypermotility symptoms" },
  { name: "Multiple Sclerosis (MS)", cat: "Neurological", markers: "High chronic fatigue score, clean organ metrics, neurological markers" },
  { name: "Psoriatic Arthritis", cat: "Dermatological / Joint", markers: "Skin lesions, joint pain, elevated CRP & ESR, RF (−)" },
  { name: "Celiac Disease", cat: "Gastrointestinal", markers: "Anti-tTG (+), severe GI symptoms, weight fluctuation" },
  { name: "Inflammatory Bowel Disease (IBD)", cat: "Gastrointestinal", markers: "Highly elevated CRP & ESR, severe GI symptoms, joint pain overlap" },
  { name: "Sjögren's Syndrome", cat: "Exocrine / Systemic", markers: "ANA Titer (+), RF (+), elevated ESR, dryness scores" },
  { name: "Ankylosing Spondylitis", cat: "Joint / Spine", markers: "HLA-B27 genetic marker (+), elevated ESR, spinal joint stiffness" },
  { name: "Autoimmune Hepatitis", cat: "Hepatic", markers: "ANA Titer (+), Anti-dsDNA (+), elevated transaminases" },
  { name: "Healthy / Control", cat: "Control", markers: "Values within normal reference ranges across all 18 clinical markers" },
];

const pipelineSteps = [
  { title: "Patient Inputs", sub: "18 Biomarkers", accent: false },
  { title: "Preprocessing", sub: "[0, π] Scaling", accent: false },
  { title: "PCA Filter", sub: "10 Components", accent: false },
  { title: "Quantum Map", sub: "10 Qubits (Sim)", accent: true },
  { title: "Kernel Matrix", sub: "State Fidelity", accent: false },
  { title: "OVR SVM", sub: "Prediction Label", accent: true },
];

export default function OverviewPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="space-y-20">
      
      {/* ── Editorial Hero ── */}
      <div className="max-w-3xl space-y-5">
        <h1
          className={`text-4xl md:text-[3.2rem] font-bold tracking-tight text-foreground font-serif-clinical leading-[1.15] ${
            mounted ? "animate-fade-up" : "opacity-0"
          }`}
        >
          Early-stage multi-disease diagnostic support using simulated quantum registers.
        </h1>
        <p
          className={`text-secondary text-base md:text-lg leading-relaxed max-w-2xl ${
            mounted ? "animate-fade-up delay-150" : "opacity-0"
          }`}
        >
          Autoimmune diseases are notoriously hard to diagnose early because symptoms overlap across conditions and lab markers are non-specific. This decision support system explores whether simulated quantum kernels can improve multi-disease classification by mapping marker vectors into high-dimensional Hilbert spaces.
        </p>
      </div>

      {/* ── Problem + Hypothesis Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          {
            label: "The Diagnostic Challenge",
            text: "Autoimmune diseases affect up to 8% of the global population. Misdiagnosis and delays average 4 to 7 years. Classical linear models struggle to find separable decision boundaries due to high marker correlations and class overlap in disease progression's early phases.",
            delay: "delay-200",
          },
          {
            label: "The Quantum Separation Hypothesis",
            text: "By preparing patient profiles as quantum states (angle encoding) and executing entangling CNOT gate chains in simulated registers, we map features into an exponentially larger mathematical space. In this simulated Hilbert space, non-linear multi-marker interactions become linearly separable.",
            delay: "delay-400",
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className={`border border-border-clinical bg-card-clinical p-7 rounded-2xl shadow-clinical-soft card-hover space-y-3 ${
              mounted ? `animate-fade-up ${card.delay}` : "opacity-0"
            }`}
          >
            <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold text-accent font-data">
              {card.label}
            </h2>
            <p className="text-sm leading-relaxed text-foreground">{card.text}</p>
          </div>
        ))}
      </div>

      {/* ── Animated Pipeline Flowchart ── */}
      <div className={`space-y-5 ${mounted ? "animate-fade-up delay-500" : "opacity-0"}`}>
        <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold text-secondary font-data">
          Data Flow & Simulation Pipeline
        </h2>

        <div className="bg-card-clinical border border-border-clinical p-8 md:p-10 rounded-2xl shadow-clinical-soft overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3 min-w-[800px] justify-center">
            {pipelineSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div
                  className="group flex flex-col items-center gap-2 card-hover cursor-default"
                  style={{ animationDelay: `${600 + idx * 120}ms` }}
                >
                  <div
                    className={`w-[120px] border rounded-xl p-4 text-center transition-all duration-500 group-hover:shadow-lg ${
                      step.accent
                        ? "bg-accent-tint/40 border-accent/30 group-hover:border-accent"
                        : "bg-white border-border-clinical group-hover:border-accent/40"
                    } ${mounted ? "animate-scale-in" : "opacity-0"}`}
                    style={{ animationDelay: `${600 + idx * 120}ms` }}
                  >
                    <span className="text-[11px] font-bold text-foreground block">{step.title}</span>
                    <span className={`text-[9px] font-data block mt-0.5 ${step.accent ? "text-accent" : "text-secondary"}`}>
                      {step.sub}
                    </span>
                  </div>
                </div>

                {idx < pipelineSteps.length - 1 && (
                  <svg
                    className={`w-8 h-4 flex-shrink-0 ${mounted ? "animate-fade-in" : "opacity-0"}`}
                    style={{ animationDelay: `${750 + idx * 120}ms` }}
                    viewBox="0 0 32 16"
                    fill="none"
                  >
                    <path d="M0 8 H24" stroke="#FF6F89" strokeWidth="1.5" strokeDasharray="4 3">
                      <animate attributeName="stroke-dashoffset" from="7" to="0" dur="1s" repeatCount="indefinite" />
                    </path>
                    <path d="M20 4 L28 8 L20 12" fill="#FF6F89" />
                  </svg>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── Disease Matrix Table ── */}
      <div className={`space-y-5 ${mounted ? "animate-fade-up delay-700" : "opacity-0"}`}>
        <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold text-secondary font-data">
          Target Disease Matrix — 13 Clinical Classes
        </h2>

        <div className="border border-border-clinical bg-white overflow-hidden rounded-2xl shadow-clinical-soft">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-clinical bg-card-clinical">
                <th className="px-5 py-4 text-[10px] font-bold text-secondary uppercase tracking-wider font-data w-10">#</th>
                <th className="px-5 py-4 text-[10px] font-bold text-secondary uppercase tracking-wider">Disease Class</th>
                <th className="px-5 py-4 text-[10px] font-bold text-secondary uppercase tracking-wider">Category</th>
                <th className="px-5 py-4 text-[10px] font-bold text-secondary uppercase tracking-wider">Key Biomarkers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-clinical">
              {diseases.map((d, idx) => (
                <tr
                  key={idx}
                  className="group hover:bg-accent-tint/20 transition-colors duration-300 cursor-default"
                  style={{ animationDelay: `${800 + idx * 60}ms` }}
                >
                  <td className="px-5 py-3.5 text-xs text-secondary font-data">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-card-clinical text-[10px] font-bold text-secondary group-hover:bg-accent group-hover:text-white transition-all duration-300">
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-foreground group-hover:text-accent transition-colors duration-300">
                    {d.name}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-secondary">{d.cat}</td>
                  <td className="px-5 py-3.5 text-[11px] text-secondary font-data leading-relaxed">{d.markers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
