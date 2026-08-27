"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, CheckCircle2, AlertTriangle, Loader2,
  FlaskConical, X, Activity, Droplet, Dna
} from "lucide-react";

// ─── Interfaces ───────────────────────────────────────────────────────────────
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

// ─── Data Config ──────────────────────────────────────────────────────────────
const PRESETS: Record<string, { emoji: string; features: PatientFeatures }> = {
  "Rheumatoid Arthritis": { emoji: "🦴", features: { Age:55,Sex:1,CRP:42,ESR:48,RF:1,Anti_CCP:1,ANA_titer:1,Anti_dsDNA:0,Complement_C3:108,TSH:2.5,Anti_TPO:0,Fasting_Glucose:95,Anti_tTG:0,HLA_B27:0,Joint_Pain:8,Fatigue:6,GI_Symptom:1,Skin_Lesion:0 }},
  "Systemic Lupus (SLE)": { emoji: "🦋", features: { Age:30,Sex:1,CRP:18,ESR:42,RF:0,Anti_CCP:0,ANA_titer:3,Anti_dsDNA:1,Complement_C3:62,TSH:2.4,Anti_TPO:0,Fasting_Glucose:90,Anti_tTG:0,HLA_B27:0,Joint_Pain:5,Fatigue:7,GI_Symptom:2,Skin_Lesion:1 }},
  "Type 1 Diabetes":       { emoji: "💉", features: { Age:16,Sex:0,CRP:4,ESR:10,RF:0,Anti_CCP:0,ANA_titer:0,Anti_dsDNA:0,Complement_C3:112,TSH:2.8,Anti_TPO:0,Fasting_Glucose:240,Anti_tTG:0,HLA_B27:0,Joint_Pain:1,Fatigue:5,GI_Symptom:2,Skin_Lesion:0 }},
  "Healthy Control":       { emoji: "💚", features: { Age:35,Sex:0,CRP:2,ESR:8,RF:0,Anti_CCP:0,ANA_titer:0,Anti_dsDNA:0,Complement_C3:115,TSH:2.2,Anti_TPO:0,Fasting_Glucose:88,Anti_tTG:0,HLA_B27:0,Joint_Pain:1,Fatigue:1,GI_Symptom:0,Skin_Lesion:0 }},
};

const DEFAULT: PatientFeatures = { Age:40,Sex:0,CRP:3,ESR:10,RF:0,Anti_CCP:0,ANA_titer:0,Anti_dsDNA:0,Complement_C3:110,TSH:2.5,Anti_TPO:0,Fasting_Glucose:90,Anti_tTG:0,HLA_B27:0,Joint_Pain:1,Fatigue:2,GI_Symptom:1,Skin_Lesion:0 };

const GROUPS: { label: string; icon: React.ElementType; fields: { key: keyof PatientFeatures; label: string; min: number; max: number; step: number }[] }[] = [
  {
    label: "Demographics & Inflammation", icon: Activity,
    fields: [
      { key:"Age", label:"Age (yr)", min:5, max:85, step:1 },
      { key:"Sex", label:"Sex (0:M 1:F)", min:0, max:1, step:1 },
      { key:"CRP", label:"CRP (mg/L)", min:0, max:150, step:0.5 },
      { key:"ESR", label:"ESR (mm/hr)", min:0, max:100, step:1 },
    ],
  },
  {
    label: "Autoantibodies & Genetics", icon: Dna,
    fields: [
      { key:"RF", label:"Rheumatoid Factor", min:0, max:1, step:1 },
      { key:"Anti_CCP", label:"Anti-CCP", min:0, max:1, step:1 },
      { key:"ANA_titer", label:"ANA Titer (0–3)", min:0, max:3, step:1 },
      { key:"Anti_dsDNA", label:"Anti-dsDNA", min:0, max:1, step:1 },
      { key:"HLA_B27", label:"HLA-B27", min:0, max:1, step:1 },
    ],
  },
  {
    label: "Organ-Specific & Symptoms", icon: Droplet,
    fields: [
      { key:"Complement_C3", label:"C3 (mg/dL)", min:30, max:180, step:1 },
      { key:"TSH", label:"TSH (mIU/L)", min:0.01, max:15, step:0.1 },
      { key:"Anti_TPO", label:"Anti-TPO", min:0, max:1, step:1 },
      { key:"Fasting_Glucose", label:"Glucose (mg/dL)", min:60, max:400, step:1 },
      { key:"Anti_tTG", label:"Anti-tTG", min:0, max:1, step:1 },
      { key:"Joint_Pain", label:"Joint Pain (0–10)", min:0, max:10, step:1 },
      { key:"Fatigue", label:"Fatigue (0–10)", min:0, max:10, step:1 },
      { key:"GI_Symptom", label:"GI Score (0–10)", min:0, max:10, step:1 },
      { key:"Skin_Lesion", label:"Skin Lesions", min:0, max:1, step:1 },
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function CountUp({ target, suffix = "", className = "" }: { target: number; suffix?: string; className?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const dur = 1200; const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      setVal((1 - Math.pow(1 - t, 3)) * target);
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
  const fileRef = useRef<HTMLInputElement>(null);

  const BACKEND = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");

  const applyPreset = (name: string) => {
    setForm(PRESETS[name].features); setExtracted({}); setResults(null); setError(null); setActivePreset(name);
  };

  const setField = (k: keyof PatientFeatures, v: number) => {
    setForm(p => ({ ...p, [k]: isNaN(v) ? 0 : v })); setExtracted(p => ({ ...p, [k]: false }));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true); setError(null); setResults(null);
    const fd = new FormData(); fd.append("file", e.target.files[0]);
    try {
      const r = await fetch(`${BACKEND}/extract-report`, { method: "POST", body: fd });
      if (!r.ok) throw new Error((await r.json()).detail || "Extraction failed");
      const j = await r.json();
      const nf = { ...form }; const ne = { ...extracted };
      for (const k of Object.keys(form) as (keyof PatientFeatures)[]) {
        if (j.extraction_flags[k]) { (nf as any)[k] = j.extracted_data[k]; ne[k] = true; }
      }
      setForm(nf); setExtracted(ne); setActivePreset(null);
    } catch (err: any) {
      setError(err.message || "Upload failed. Ensure backend is running.");
    } finally {
      setUploading(false); if (fileRef.current) fileRef.current.value = "";
    }
  };

  const predict = async () => {
    setPredicting(true); setError(null); setResults(null); setStep(0);
    for (let i = 0; i < STEPS.length; i++) { setStep(i + 1); await new Promise(r => setTimeout(r, 150)); }
    try {
      const r = await fetch(`${BACKEND}/predict`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || "Prediction failed");
      setResults(await r.json());
    } catch (err: any) {
      setError(err.message || "Prediction failed. Ensure backend is running.");
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="relative space-y-8 animate-in fade-in duration-500">
      <div className="glow-blur -top-20 -left-20" />
      <div className="glow-blur top-40 right-0" />

      {/* Header & Presets */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display text-slate-900">
            Predictive <span className="gradient-text">Diagnostics</span>
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">Input patient biomarkers to compute simulated quantum likelihoods.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {Object.entries(PRESETS).map(([name, cfg]) => (
            <button key={name} onClick={() => applyPreset(name)}
              className={`px-4 py-2 border rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                activePreset === name
                  ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span>{cfg.emoji}</span> {name}
            </button>
          ))}
          <button onClick={() => !uploading && fileRef.current?.click()}
            className={`px-4 py-2 border border-dashed rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
              uploading ? "bg-blue-50 border-blue-400 text-blue-600" : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
            }`}
          >
            {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Extracting…</> : <><Upload className="w-3.5 h-3.5" /> Upload Lab Report</>}
          </button>
          <input ref={fileRef} type="file" onChange={handleUpload} accept="application/pdf,image/*" className="hidden" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Panel */}
        <div className="lg:col-span-7 vovy-card p-8 space-y-8">
          {GROUPS.map(g => (
            <div key={g.label} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <g.icon className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold text-slate-700 tracking-wider uppercase">{g.label}</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {g.fields.map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-500">{f.label}</label>
                      {extracted[f.key] && <span className="bg-amber-100 text-amber-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Extracted</span>}
                    </div>
                    <input type="number" min={f.min} max={f.max} step={f.step} value={form[f.key]} onChange={e => setField(f.key, parseFloat(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-xl text-sm font-data transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                        extracted[f.key] ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-4 flex justify-end">
            <button onClick={predict} disabled={predicting} className="btn-primary px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 w-full md:w-auto justify-center">
              {predicting ? <><Loader2 className="w-4 h-4 animate-spin" /> Computing Likelihoods...</> : <><FlaskConical className="w-4 h-4" /> Execute Prediction</>}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-5 h-full">
          <AnimatePresence mode="wait">
            {predicting ? (
              <motion.div key="loading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="vovy-card p-8 h-full space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Processing</span>
                    <p className="text-sm font-semibold text-slate-900">Quantum Execution Pipeline</p>
                  </div>
                </div>
                <div className="space-y-4 pt-2">
                  {STEPS.map((s, i) => (
                    <div key={i} className={`flex items-center gap-3 transition-opacity duration-300 ${i < step ? "opacity-100" : "opacity-25"}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${i < step ? "bg-blue-600" : "bg-slate-200"}`}>
                        {i < step && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <span className="text-xs font-data font-medium text-slate-700">{s}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : error ? (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-start gap-4">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-red-800">Execution Error</h4>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
              </motion.div>
            ) : results ? (
              <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6 h-full">
                
                <div className="vovy-card p-8 bg-white/95">
                  <span className="badge-blue px-3 py-1 rounded-full mb-4 inline-block">Diagnostic Result</span>
                  <h2 className="text-3xl font-extrabold text-slate-900 font-display leading-tight">
                    {results.quantum_kernel_svm?.prediction}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Confidence</span>
                      <span className="text-3xl font-extrabold text-blue-600 font-data mt-1 block">
                        <CountUp target={(results.quantum_kernel_svm?.confidence || 0) * 100} suffix="%" />
                      </span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col justify-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Architecture</span>
                      <span className="text-sm font-bold text-slate-700 font-data mt-2">10-Qubit Simulator</span>
                    </div>
                  </div>
                </div>

                <div className="vovy-card p-8 bg-white/95 space-y-5">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Class Distribution</h4>
                  <div className="space-y-4">
                    {Object.entries(results.quantum_kernel_svm?.probabilities || {})
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 4)
                      .map(([cls, val], idx) => {
                        const isPrimary = cls === results.quantum_kernel_svm?.prediction;
                        return (
                          <div key={cls} className="flex items-center gap-3">
                            <span className={`text-[10px] w-28 truncate font-medium ${isPrimary ? "text-slate-900 font-bold" : "text-slate-500"}`}>{cls}</span>
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${val * 100}%` }} transition={{ delay: idx * 0.1, duration: 0.6 }}
                                className={`h-full rounded-full ${isPrimary ? "bg-gradient-to-r from-blue-600 to-cyan-500" : "bg-slate-300"}`} />
                            </div>
                            <span className={`text-[10px] font-data font-bold w-10 text-right ${isPrimary ? "text-blue-600" : "text-slate-400"}`}>
                              {(val * 100).toFixed(1)}%
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="vovy-card h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-white/50 border-dashed">
                <div className="w-16 h-16 bg-blue-50 text-blue-200 rounded-full flex items-center justify-center mb-4">
                  <Activity className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-slate-700">Awaiting Profile</h3>
                <p className="text-xs text-slate-500 mt-2 max-w-[220px] leading-relaxed">
                  Enter patient biomarkers or select a preset to compute the diagnostic probability matrix.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
