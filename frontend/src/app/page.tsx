"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, CheckCircle2, AlertTriangle, Loader2,
  FlaskConical, ArrowRight, Info, X
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PatientFeatures {
  Age: number; Sex: number; CRP: number; ESR: number; RF: number;
  Anti_CCP: number; ANA_titer: number; Anti_dsDNA: number;
  Complement_C3: number; TSH: number; Anti_TPO: number;
  Fasting_Glucose: number; Anti_tTG: number; HLA_B27: number;
  Joint_Pain: number; Fatigue: number; GI_Symptom: number; Skin_Lesion: number;
}
interface PredictionDetail { prediction: string; confidence: number; probabilities: Record<string, number>; }
interface PredictResponse {
  quantum_kernel_svm?: PredictionDetail;
  random_forest?: PredictionDetail;
  classical_svm?: PredictionDetail;
  qsvm_error?: string;
}

// ─── Presets ──────────────────────────────────────────────────────────────────
const PRESETS: Record<string, { emoji: string; features: PatientFeatures }> = {
  "Rheumatoid Arthritis": { emoji: "🦴", features: { Age:55,Sex:1,CRP:42,ESR:48,RF:1,Anti_CCP:1,ANA_titer:1,Anti_dsDNA:0,Complement_C3:108,TSH:2.5,Anti_TPO:0,Fasting_Glucose:95,Anti_tTG:0,HLA_B27:0,Joint_Pain:8,Fatigue:6,GI_Symptom:1,Skin_Lesion:0 }},
  "Systemic Lupus (SLE)": { emoji: "🦋", features: { Age:30,Sex:1,CRP:18,ESR:42,RF:0,Anti_CCP:0,ANA_titer:3,Anti_dsDNA:1,Complement_C3:62,TSH:2.4,Anti_TPO:0,Fasting_Glucose:90,Anti_tTG:0,HLA_B27:0,Joint_Pain:5,Fatigue:7,GI_Symptom:2,Skin_Lesion:1 }},
  "Type 1 Diabetes":       { emoji: "💉", features: { Age:16,Sex:0,CRP:4,ESR:10,RF:0,Anti_CCP:0,ANA_titer:0,Anti_dsDNA:0,Complement_C3:112,TSH:2.8,Anti_TPO:0,Fasting_Glucose:240,Anti_tTG:0,HLA_B27:0,Joint_Pain:1,Fatigue:5,GI_Symptom:2,Skin_Lesion:0 }},
  "Healthy Control":       { emoji: "💚", features: { Age:35,Sex:0,CRP:2,ESR:8,RF:0,Anti_CCP:0,ANA_titer:0,Anti_dsDNA:0,Complement_C3:115,TSH:2.2,Anti_TPO:0,Fasting_Glucose:88,Anti_tTG:0,HLA_B27:0,Joint_Pain:1,Fatigue:1,GI_Symptom:0,Skin_Lesion:0 }},
};

const DEFAULT: PatientFeatures = { Age:40,Sex:0,CRP:3,ESR:10,RF:0,Anti_CCP:0,ANA_titer:0,Anti_dsDNA:0,Complement_C3:110,TSH:2.5,Anti_TPO:0,Fasting_Glucose:90,Anti_tTG:0,HLA_B27:0,Joint_Pain:1,Fatigue:2,GI_Symptom:1,Skin_Lesion:0 };

// ─── Field Config ─────────────────────────────────────────────────────────────
const GROUPS: { label: string; fields: { key: keyof PatientFeatures; label: string; min: number; max: number; step: number }[] }[] = [
  {
    label: "Demographics & Inflammation",
    fields: [
      { key:"Age",            label:"Age (yr)",       min:5,    max:85,  step:1   },
      { key:"Sex",            label:"Sex (0:M 1:F)",  min:0,    max:1,   step:1   },
      { key:"CRP",            label:"CRP (mg/L)",     min:0,    max:150, step:0.5 },
      { key:"ESR",            label:"ESR (mm/hr)",    min:0,    max:100, step:1   },
    ],
  },
  {
    label: "Autoantibodies & Genetics",
    fields: [
      { key:"RF",             label:"Rheumatoid Factor",  min:0, max:1, step:1 },
      { key:"Anti_CCP",       label:"Anti-CCP",           min:0, max:1, step:1 },
      { key:"ANA_titer",      label:"ANA Titer (0–3)",    min:0, max:3, step:1 },
      { key:"Anti_dsDNA",     label:"Anti-dsDNA",         min:0, max:1, step:1 },
      { key:"HLA_B27",        label:"HLA-B27",            min:0, max:1, step:1 },
    ],
  },
  {
    label: "Organ-Specific & Symptoms",
    fields: [
      { key:"Complement_C3",  label:"C3 (mg/dL)",         min:30,  max:180, step:1   },
      { key:"TSH",            label:"TSH (mIU/L)",         min:0.01,max:15,  step:0.1 },
      { key:"Anti_TPO",       label:"Anti-TPO",            min:0,   max:1,   step:1   },
      { key:"Fasting_Glucose",label:"Glucose (mg/dL)",     min:60,  max:400, step:1   },
      { key:"Anti_tTG",       label:"Anti-tTG",            min:0,   max:1,   step:1   },
      { key:"Joint_Pain",     label:"Joint Pain (0–10)",   min:0,   max:10,  step:1   },
      { key:"Fatigue",        label:"Fatigue (0–10)",      min:0,   max:10,  step:1   },
      { key:"GI_Symptom",     label:"GI Score (0–10)",     min:0,   max:10,  step:1   },
      { key:"Skin_Lesion",    label:"Skin Lesions",        min:0,   max:1,   step:1   },
    ],
  },
];

const STEPS = [
  "Verifying patient vector integrity",
  "Normalizing via standard scalers",
  "Projecting into 10 PCA dimensions",
  "Encoding qubit rotation angles",
  "Executing simulated quantum circuits",
  "Evaluating OVR SVM boundaries",
];

// ─── Count-up animation ────────────────────────────────────────────────────────
function CountUp({ target, suffix = "", className = "" }: { target: number; suffix?: string; className?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const dur = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setVal(ease * target);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return <span className={className}>{val.toFixed(1)}{suffix}</span>;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PredictPage() {
  const [form, setForm] = useState<PatientFeatures>(DEFAULT);
  const [extracted, setExtracted] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<PredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const BACKEND = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");

  const applyPreset = (name: string) => {
    setForm(PRESETS[name].features);
    setExtracted({});
    setResults(null);
    setError(null);
    setActivePreset(name);
  };

  const setField = (k: keyof PatientFeatures, v: number) => {
    setForm(p => ({ ...p, [k]: isNaN(v) ? 0 : v }));
    setExtracted(p => ({ ...p, [k]: false }));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true); setError(null); setResults(null);
    const fd = new FormData();
    fd.append("file", e.target.files[0]);
    try {
      const r = await fetch(`${BACKEND}/extract-report`, { method: "POST", body: fd });
      if (!r.ok) throw new Error((await r.json()).detail || "Extraction failed");
      const j = await r.json();
      const nf = { ...form }; const ne = { ...extracted };
      for (const k of Object.keys(form) as (keyof PatientFeatures)[]) {
        if (j.extraction_flags[k]) { (nf as any)[k] = j.extracted_data[k]; ne[k] = true; }
      }
      setForm(nf); setExtracted(ne);
      setShowWarning(Object.values(ne).some(Boolean));
    } catch (err: any) {
      setError(err.message || "Upload failed. Make sure the backend is running.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const predict = async () => {
    setPredicting(true); setError(null); setResults(null); setStep(0);
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i + 1);
      await new Promise(r => setTimeout(r, 200));
    }
    try {
      const r = await fetch(`${BACKEND}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const detail = await r.json().catch(() => ({ detail: `Server error ${r.status}` }));
        throw new Error(detail.detail || "Prediction failed");
      }
      setResults(await r.json());
    } catch (err: any) {
      setError(err.message || "Could not reach backend. Make sure it is running.");
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="relative space-y-10 py-4">
      {/* Decorative Glow Backgrounds */}
      <div className="glow-blur -top-10 -left-10" />
      <div className="glow-blur top-40 right-10" />

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100">
        <div>
          <span className="badge-blue px-2.5 py-1 rounded-full text-[9px] inline-block mb-2">Simulated Quantum Engine</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display">
            Predictive <span className="gradient-text">Diagnostics</span>
          </h1>
          <p className="text-xs text-secondary mt-1">Multi-class SVM classification powered by simulated quantum kernels.</p>
        </div>

        {/* Quick Actions (Presets & Upload) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {Object.entries(PRESETS).map(([name, cfg]) => (
            <button
              key={name}
              onClick={() => applyPreset(name)}
              className={`px-3.5 py-2 border text-[11px] font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition-all duration-300 ${
                activePreset === name
                  ? "border-accent bg-accent-tint/10 text-accent font-bold shadow-sm shadow-blue-500/5"
                  : "border-slate-200 bg-white text-secondary hover:text-foreground hover:border-slate-300"
              }`}
            >
              <span>{cfg.emoji}</span>
              <span>{name}</span>
            </button>
          ))}
          <button
            onClick={() => !uploading && fileRef.current?.click()}
            className={`px-3.5 py-2 border border-dashed rounded-xl text-[11px] font-semibold flex items-center gap-2 cursor-pointer transition-all duration-300 ${
              uploading ? "bg-accent-tint/20 border-accent/40 text-accent" : "bg-white text-accent hover:border-accent/40 border-slate-300 hover:bg-accent-tint/5"
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Extracting…</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Report</span>
              </>
            )}
          </button>
          <input ref={fileRef} type="file" onChange={handleUpload} accept="application/pdf,image/*" className="hidden" />
        </div>
      </div>

      {/* Warning if extracted values need verification */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 p-4 bg-amber-bg/30 border border-amber/25 rounded-2xl"
          >
            <AlertTriangle className="w-4 h-4 text-amber flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-foreground font-data">Report Extracted Successfully</p>
              <p className="text-xs text-secondary mt-0.5 font-medium">Please review the highlighted values below before executing the diagnostic prediction.</p>
            </div>
            <button onClick={() => setShowWarning(false)} className="text-secondary hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Form Left, Results/Status Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Panel */}
        <div className="lg:col-span-7 space-y-6 vovy-card p-6 md:p-8 bg-white/95">
          {GROUPS.map(g => (
            <div key={g.label} className="space-y-4">
              <h3 className="text-xs font-bold text-secondary tracking-wide uppercase border-b border-slate-100 pb-2">{g.label}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {g.fields.map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <div className="flex justify-between items-center min-h-[1.1rem]">
                      <label className="text-[10px] font-semibold text-secondary">{f.label}</label>
                      {extracted[f.key] && (
                        <span className="bg-amber-bg text-amber border border-amber/20 text-[7px] font-bold font-data px-1 rounded-md uppercase">Extracted</span>
                      )}
                    </div>
                    <input
                      type="number"
                      min={f.min} max={f.max} step={f.step}
                      value={form[f.key]}
                      onChange={e => setField(f.key, parseFloat(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-xl text-xs font-data transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent ${
                        extracted[f.key]
                          ? "border-amber/50 bg-amber-bg/10 font-bold"
                          : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-3">
            <button
              onClick={predict}
              disabled={predicting}
              className="btn-primary px-8 py-3 rounded-xl text-xs uppercase tracking-[0.12em] font-bold cursor-pointer"
            >
              {predicting
                ? <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Computing…</span>
                : <span className="flex items-center gap-2"><FlaskConical className="w-3.5 h-3.5" /> Execute Prediction</span>
              }
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-5 space-y-6">
          <AnimatePresence mode="wait">
            {predicting ? (
              <motion.div
                key="pipeline"
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                className="vovy-card p-6 md:p-8 bg-white/95 space-y-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-secondary font-data uppercase tracking-wider block">Quantum Pipeline Simulation</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                  </span>
                </div>
                <div className="space-y-3.5">
                  {STEPS.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: i < step ? 1 : 0.25, x: 0 }}
                      className="flex items-center gap-3.5"
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        i < step ? "border-accent bg-accent" : "border-slate-200 bg-white"
                      }`}>
                        {i < step && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className="text-[11px] font-data text-secondary">{s}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-start gap-3 border border-accent/20 bg-accent-tint/10 p-4 rounded-2xl"
              >
                <AlertTriangle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-accent">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-accent/60 hover:text-accent">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ) : results ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Primary Prediction */}
                <div className="vovy-card p-6 md:p-8 bg-white/95 space-y-5">
                  <div>
                    <span className="text-[9px] text-secondary font-data uppercase tracking-wider block">Predicted Condition</span>
                    <h2 className="text-2xl font-bold text-foreground font-display mt-1.5 tracking-tight">
                      {results.quantum_kernel_svm?.prediction}
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50/70 border border-slate-100 p-4 rounded-2xl text-center">
                      <span className="text-[9px] text-secondary font-data block uppercase tracking-wider">Confidence</span>
                      <span className="text-2xl font-bold font-data text-accent mt-1 block">
                        <CountUp target={(results.quantum_kernel_svm?.confidence || 0) * 100} suffix="%" />
                      </span>
                    </div>
                    <div className="bg-slate-50/70 border border-slate-100 p-4 rounded-2xl text-center flex flex-col justify-center">
                      <span className="text-[9px] text-secondary font-data block uppercase tracking-wider">Simulation</span>
                      <span className="text-xs font-bold text-foreground font-data mt-2 block">10 Qubits</span>
                    </div>
                  </div>
                </div>

                {/* Probability chart */}
                {results.quantum_kernel_svm && (
                  <div className="vovy-card p-6 bg-white/95 space-y-4">
                    <h4 className="text-[10px] uppercase tracking-[0.15em] font-bold text-secondary font-data">Probability Distribution</h4>
                    <div className="space-y-3">
                      {Object.entries(results.quantum_kernel_svm.probabilities)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 4)
                        .map(([cls, val], idx) => {
                          const isPrimary = cls === results.quantum_kernel_svm!.prediction;
                          return (
                            <div key={cls} className="flex items-center gap-3">
                              <span className={`text-[10px] w-28 truncate flex-shrink-0 ${isPrimary ? "font-bold text-foreground" : "text-secondary"}`}>{cls}</span>
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${val * 100}%` }}
                                  transition={{ delay: idx * 0.05, duration: 0.5 }}
                                  className={`h-full rounded-full ${isPrimary ? "bg-accent" : "bg-slate-200"}`}
                                />
                              </div>
                              <span className={`text-[10px] font-data font-bold w-10 text-right ${isPrimary ? "text-accent" : "text-secondary"}`}>
                                {(val * 100).toFixed(1)}%
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Consistency */}
                <div className="vovy-card p-6 bg-white/95 space-y-4">
                  <h4 className="text-[10px] uppercase tracking-[0.15em] font-bold text-secondary font-data">Cross-Model Comparison</h4>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { label: "QSVM", val: results.quantum_kernel_svm },
                      { label: "SVM (RBF)", val: results.classical_svm },
                      { label: "RF", val: results.random_forest },
                    ].map(c => (
                      <div key={c.label} className="border border-slate-100 bg-slate-50/40 p-3.5 rounded-2xl text-center">
                        <span className="text-[9px] text-secondary font-data uppercase tracking-wider block">{c.label}</span>
                        <span className="text-[11px] font-bold text-foreground truncate block mt-1.5">{c.val?.prediction || "—"}</span>
                        <span className="text-[10px] font-data text-secondary block mt-0.5">{((c.val?.confidence || 0) * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="border border-dashed border-slate-200 bg-white/60 p-8 rounded-3xl text-center space-y-3 h-full flex flex-col justify-center min-h-[220px]">
                <FlaskConical className="w-8 h-8 text-secondary/30 mx-auto" />
                <p className="text-xs font-semibold text-secondary">Awaiting Diagnostic Input</p>
                <p className="text-[10px] text-secondary/60 max-w-[200px] mx-auto leading-relaxed">Select a preset profile or upload a lab report to generate diagnostic likelihoods.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
