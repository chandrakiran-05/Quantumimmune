"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, CheckCircle2, AlertTriangle, Loader2, FlaskConical, ArrowRight } from "lucide-react";

interface PatientFeatures {
  Age: number; Sex: number; CRP: number; ESR: number; RF: number;
  Anti_CCP: number; ANA_titer: number; Anti_dsDNA: number;
  Complement_C3: number; TSH: number; Anti_TPO: number;
  Fasting_Glucose: number; Anti_tTG: number; HLA_B27: number;
  Joint_Pain: number; Fatigue: number; GI_Symptom: number; Skin_Lesion: number;
}

interface PredictionDetail { prediction: string; confidence: number; probabilities: Record<string, number>; }
interface PredictResponse { quantum_kernel_svm: PredictionDetail | null; random_forest: PredictionDetail | null; classical_svm: PredictionDetail | null; }

const PRESETS: Record<string, { emoji: string; features: PatientFeatures }> = {
  "Rheumatoid Arthritis": { emoji: "🦴", features: { Age:55,Sex:1,CRP:42,ESR:48,RF:1,Anti_CCP:1,ANA_titer:1,Anti_dsDNA:0,Complement_C3:108,TSH:2.5,Anti_TPO:0,Fasting_Glucose:95,Anti_tTG:0,HLA_B27:0,Joint_Pain:8,Fatigue:6,GI_Symptom:1,Skin_Lesion:0 }},
  "Systemic Lupus (SLE)": { emoji: "🦋", features: { Age:30,Sex:1,CRP:18,ESR:42,RF:0,Anti_CCP:0,ANA_titer:3,Anti_dsDNA:1,Complement_C3:62,TSH:2.4,Anti_TPO:0,Fasting_Glucose:90,Anti_tTG:0,HLA_B27:0,Joint_Pain:5,Fatigue:7,GI_Symptom:2,Skin_Lesion:1 }},
  "Type 1 Diabetes": { emoji: "💉", features: { Age:16,Sex:0,CRP:4,ESR:10,RF:0,Anti_CCP:0,ANA_titer:0,Anti_dsDNA:0,Complement_C3:112,TSH:2.8,Anti_TPO:0,Fasting_Glucose:240,Anti_tTG:0,HLA_B27:0,Joint_Pain:1,Fatigue:5,GI_Symptom:2,Skin_Lesion:0 }},
  "Healthy Control": { emoji: "💚", features: { Age:35,Sex:0,CRP:2,ESR:8,RF:0,Anti_CCP:0,ANA_titer:0,Anti_dsDNA:0,Complement_C3:115,TSH:2.2,Anti_TPO:0,Fasting_Glucose:88,Anti_tTG:0,HLA_B27:0,Joint_Pain:1,Fatigue:1,GI_Symptom:0,Skin_Lesion:0 }},
};

const FIELDS: { key: keyof PatientFeatures; label: string; min: number; max: number; step: number; group: string }[] = [
  { key:"Age",label:"Age (yr)",min:5,max:85,step:1,group:"Demographics" },
  { key:"Sex",label:"Sex (0:M 1:F)",min:0,max:1,step:1,group:"Demographics" },
  { key:"CRP",label:"CRP (mg/L)",min:0,max:150,step:0.5,group:"Demographics" },
  { key:"ESR",label:"ESR (mm/hr)",min:0,max:100,step:1,group:"Demographics" },
  { key:"RF",label:"Rheumatoid Factor",min:0,max:1,step:1,group:"Antibodies" },
  { key:"Anti_CCP",label:"Anti-CCP",min:0,max:1,step:1,group:"Antibodies" },
  { key:"ANA_titer",label:"ANA Titer (0–3)",min:0,max:3,step:1,group:"Antibodies" },
  { key:"Anti_dsDNA",label:"Anti-dsDNA",min:0,max:1,step:1,group:"Antibodies" },
  { key:"HLA_B27",label:"HLA-B27",min:0,max:1,step:1,group:"Antibodies" },
  { key:"Complement_C3",label:"C3 (mg/dL)",min:30,max:180,step:1,group:"Organ" },
  { key:"TSH",label:"TSH (mIU/L)",min:0.01,max:15,step:0.1,group:"Organ" },
  { key:"Anti_TPO",label:"Anti-TPO",min:0,max:1,step:1,group:"Organ" },
  { key:"Fasting_Glucose",label:"Glucose (mg/dL)",min:60,max:400,step:1,group:"Organ" },
  { key:"Anti_tTG",label:"Anti-tTG",min:0,max:1,step:1,group:"Organ" },
  { key:"Joint_Pain",label:"Joint Pain (0–10)",min:0,max:10,step:1,group:"Organ" },
  { key:"Fatigue",label:"Fatigue (0–10)",min:0,max:10,step:1,group:"Organ" },
  { key:"GI_Symptom",label:"GI Score (0–10)",min:0,max:10,step:1,group:"Organ" },
  { key:"Skin_Lesion",label:"Skin Lesions",min:0,max:1,step:1,group:"Organ" },
];

const PROXY_IMP: [string, number][] = [["Anti_CCP",0.185],["ANA_titer",0.142],["Fasting_Glucose",0.121],["CRP",0.108],["Complement_C3",0.095]];

function CountUp({ target, suffix = "", className = "" }: { target: number; suffix?: string; className?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const dur = 1200;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / dur, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = eased * target;
      setVal(start);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target]);
  return <span className={className}>{val.toFixed(1)}{suffix}</span>;
}

const STEPS = [
  "Verifying patient vector integrity",
  "Normalizing via standard scalers",
  "Projecting into 10 PCA dimensions",
  "Encoding qubit rotation angles",
  "Executing simulated quantum circuits",
  "Evaluating OVR SVM boundaries",
];

export default function PredictPage() {
  const [form, setForm] = useState<PatientFeatures>({ Age:40,Sex:0,CRP:3,ESR:10,RF:0,Anti_CCP:0,ANA_titer:0,Anti_dsDNA:0,Complement_C3:110,TSH:2.5,Anti_TPO:0,Fasting_Glucose:90,Anti_tTG:0,HLA_B27:0,Joint_Pain:1,Fatigue:2,GI_Symptom:1,Skin_Lesion:0 });
  const [extracted, setExtracted] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<PredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  const applyPreset = (name: string) => { setForm(PRESETS[name].features); setExtracted({}); setResults(null); setError(null); setActive(name); };
  const setField = (k: keyof PatientFeatures, v: number) => { setForm(p => ({ ...p, [k]: v })); setExtracted(p => ({ ...p, [k]: false })); };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true); setError(null); setResults(null);
    const fd = new FormData(); fd.append("file", e.target.files[0]);
    try {
      const r = await fetch(`${BACKEND}/extract-report`, { method: "POST", body: fd });
      if (!r.ok) throw new Error((await r.json()).detail || "Extraction failed");
      const j = await r.json();
      const nf = { ...form }; const ne = { ...extracted };
      for (const k of Object.keys(form)) { if (j.extraction_flags[k]) { (nf as any)[k] = j.extracted_data[k]; ne[k] = true; } }
      setForm(nf); setExtracted(ne);
    } catch (err: any) { setError(err.message); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const predict = async () => {
    setPredicting(true); setError(null); setResults(null); setStep(0);
    for (let i = 0; i < STEPS.length; i++) { setStep(i + 1); await new Promise(r => setTimeout(r, 450)); }
    try {
      const r = await fetch(`${BACKEND}/predict`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error((await r.json()).detail || "Prediction failed");
      setResults(await r.json());
    } catch (err: any) { setError(err.message); }
    finally { setPredicting(false); }
  };

  const groups = ["Demographics", "Antibodies", "Organ"];

  return (
    <div className="space-y-8">
      {/* Warning Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="flex items-start gap-3 p-5 bg-amber-bg/40 border border-amber/25 rounded-2xl">
        <AlertTriangle className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground font-data">Verification Required</h4>
          <p className="text-xs text-secondary mt-0.5">Extracted values are flagged — review each before computing predictions.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        {/* ── Sidebar ── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 250, damping: 25, delay: 0.1 }}
          className="space-y-5">
          {/* Presets */}
          <div className="border border-border bg-card p-5 rounded-2xl space-y-3">
            <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-secondary font-data">Quick Presets</span>
            <div className="flex flex-col gap-1.5">
              {Object.entries(PRESETS).map(([name, cfg]) => (
                <motion.button key={name} onClick={() => applyPreset(name)} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`w-full text-left px-3 py-2.5 border text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition-colors duration-200 ${
                    active === name ? "border-accent bg-accent-tint/30 text-accent" : "border-border bg-white hover:border-accent/30 text-foreground"
                  }`}>
                  <span className="text-base">{cfg.emoji}</span>
                  <span className="flex-1">{name}</span>
                  <ArrowRight className={`w-3 h-3 transition-opacity ${active === name ? "opacity-100 text-accent" : "opacity-0"}`} />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Upload */}
          <div className="border border-border bg-card p-5 rounded-2xl space-y-3">
            <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-secondary font-data">Upload Report</span>
            <motion.div onClick={() => !uploading && fileRef.current?.click()} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors duration-300 ${
                uploading ? "border-accent/40 bg-accent-tint/10" : "border-border bg-white hover:border-accent/30"}`}>
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-5 h-5 text-accent animate-spin" />
                  <span className="text-[10px] font-bold text-accent font-data uppercase">Extracting...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-5 h-5 text-secondary" />
                  <span className="text-xs font-bold text-accent">Choose file</span>
                  <span className="text-[9px] text-secondary">PDF, PNG, JPG</span>
                </div>
              )}
              <input ref={fileRef} type="file" onChange={handleUpload} accept="application/pdf,image/*" className="hidden" />
            </motion.div>
          </div>
        </motion.div>

        {/* ── Main Area ── */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 250, damping: 25, delay: 0.2 }}
          className="space-y-6">
          {/* Form */}
          <div className="border border-border bg-white p-6 md:p-8 rounded-2xl space-y-7">
            <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold text-accent font-data">Biomarker Configuration</h2>
            {groups.map(g => (
              <div key={g} className="space-y-3">
                <h3 className="text-xs font-bold text-secondary border-b border-border pb-2">{g === "Demographics" ? "Demographics & Inflammation" : g === "Antibodies" ? "Autoantibodies & Genetics" : "Organ-Specific & Symptoms"}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {FIELDS.filter(f => f.group === g).map(f => (
                    <div key={f.key} className="space-y-1 group">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-semibold text-foreground group-hover:text-accent transition-colors duration-200">{f.label}</label>
                        {extracted[f.key] && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}
                            className="bg-amber-bg text-amber border border-amber/20 text-[8px] font-bold font-data px-1.5 py-0.5 rounded-md uppercase">Verify</motion.span>
                        )}
                      </div>
                      <input type="number" min={f.min} max={f.max} step={f.step} value={form[f.key]}
                        onChange={e => setField(f.key, parseFloat(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-xl text-sm font-data transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent ${
                          extracted[f.key] ? "border-amber/40 bg-amber-bg/15 font-bold" : "border-border bg-[#FFFDF8] hover:border-accent/25"}`} />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-2">
              <motion.button onClick={predict} disabled={predicting} whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(255,111,137,0.35)" }} whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="px-7 py-3 bg-accent hover:bg-accent-hover text-white text-xs uppercase tracking-[0.15em] font-bold rounded-xl disabled:opacity-50 cursor-pointer shadow-[0_4px_16px_rgba(255,111,137,0.25)]">
                {predicting ? <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Computing...</span> : <span className="flex items-center gap-2"><FlaskConical className="w-3.5 h-3.5" /> Compute Diagnostic Likelihood</span>}
              </motion.button>
            </div>
          </div>

          {/* Progress */}
          <AnimatePresence>
            {predicting && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="border border-border bg-card rounded-2xl overflow-hidden">
                <div className="p-6 space-y-2.5">
                  {STEPS.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: i < step ? 1 : 0.25, x: 0 }}
                      transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                      className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        i < step ? "border-accent bg-accent" : "border-border"}`}>
                        {i < step && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-xs font-data text-secondary">{s}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="border border-accent/25 bg-accent-tint/15 p-4 rounded-2xl text-center text-xs font-bold text-accent">{error}</motion.div>
            )}
          </AnimatePresence>

          {/* ══ RESULTS ══ */}
          <AnimatePresence>
            {results && !predicting && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 250, damping: 25 }}
                className="space-y-6">

                {/* Primary result */}
                {results.quantum_kernel_svm && (
                  <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="border border-border bg-card p-6 md:p-8 rounded-2xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] text-secondary font-data uppercase tracking-wider block">Quantum Kernel SVM (multi-class, one-vs-rest)</span>
                        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 20 }}
                          className="text-3xl md:text-4xl font-bold text-foreground font-display mt-1">{results.quantum_kernel_svm.prediction}</motion.h2>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-white border border-border px-5 py-3 rounded-xl text-center">
                          <span className="text-[9px] text-secondary font-data block uppercase tracking-wider">Confidence</span>
                          <span className="text-2xl font-bold font-data text-accent">
                            <CountUp target={results.quantum_kernel_svm.confidence * 100} suffix="%" />
                          </span>
                        </div>
                        <div className="bg-sage-bg/50 border border-sage/20 px-4 py-3 rounded-xl text-center">
                          <span className="text-[9px] text-sage font-data block uppercase tracking-wider">Cohort</span>
                          <span className="text-xs font-bold text-sage font-data">SYNTHETIC</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Probability Distribution */}
                  {results.quantum_kernel_svm && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 250, damping: 25 }}
                      className="border border-border bg-white p-6 rounded-2xl">
                      <h3 className="text-[10px] uppercase tracking-[0.15em] font-bold text-secondary font-data mb-4">Probability Distribution</h3>
                      <div className="space-y-2.5">
                        {Object.entries(results.quantum_kernel_svm.probabilities).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([cls, val], idx) => {
                          const isPrimary = cls === results.quantum_kernel_svm!.prediction;
                          return (
                            <div key={cls} className="flex items-center gap-3">
                              <span className={`text-[11px] w-[130px] truncate flex-shrink-0 ${isPrimary ? "font-bold text-foreground" : "text-secondary"}`}>{cls}</span>
                              <div className="flex-1 h-2.5 bg-border/30 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(2, val * 100)}%` }}
                                  transition={{ delay: 0.3 + idx * 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                  className={`h-full rounded-full ${isPrimary ? "bg-accent" : "bg-border"}`} />
                              </div>
                              <span className={`text-[11px] font-data font-bold w-12 text-right ${isPrimary ? "text-accent" : "text-secondary"}`}>{(val * 100).toFixed(1)}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Feature Importance */}
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 250, damping: 25 }}
                    className="border border-border bg-white p-6 rounded-2xl">
                    <h3 className="text-[10px] uppercase tracking-[0.15em] font-bold text-secondary font-data mb-1">Contributing Biomarkers</h3>
                    <p className="text-[9px] text-secondary font-data italic mb-4">Proxy importance (Random Forest)</p>
                    <div className="space-y-2.5">
                      {PROXY_IMP.map(([feat, val], idx) => (
                        <div key={feat} className="flex items-center gap-3">
                          <span className="text-[11px] w-[110px] truncate flex-shrink-0 text-secondary font-semibold">{feat}</span>
                          <div className="flex-1 h-2.5 bg-border/30 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(val / 0.185) * 100}%` }}
                              transition={{ delay: 0.4 + idx * 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                              className="h-full bg-secondary/25 rounded-full" />
                          </div>
                          <span className="text-[11px] font-data font-bold text-secondary w-12 text-right">{val.toFixed(3)}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Cross-model */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, type: "spring", stiffness: 250, damping: 25 }}
                  className="border border-border bg-white p-6 rounded-2xl">
                  <h3 className="text-[10px] uppercase tracking-[0.15em] font-bold text-secondary font-data mb-4">Cross-Model Consistency</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {([
                      { name: "Quantum Kernel SVM", obj: results.quantum_kernel_svm, primary: true },
                      { name: "Classical SVM (RBF)", obj: results.classical_svm, primary: false },
                      { name: "Random Forest", obj: results.random_forest, primary: false },
                    ] as const).map((m, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + idx * 0.1, type: "spring", stiffness: 300, damping: 25 }}
                        whileHover={{ y: -2 }}
                        className={`border p-5 rounded-xl text-center cursor-default ${m.primary ? "border-accent/25 bg-accent-tint/10" : "border-border bg-card"}`}>
                        <span className="text-[9px] text-secondary font-data uppercase tracking-wider block">{m.name}</span>
                        {m.obj ? (
                          <div className="mt-2 space-y-0.5">
                            <div className="text-sm font-bold text-foreground">{m.obj.prediction}</div>
                            <div className={`text-sm font-data font-bold ${m.primary ? "text-accent" : "text-secondary"}`}>{(m.obj.confidence * 100).toFixed(1)}%</div>
                          </div>
                        ) : <div className="mt-2 text-xs text-secondary italic font-data">Unavailable</div>}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
