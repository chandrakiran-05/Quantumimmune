"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, CheckCircle2, AlertTriangle, Loader2,
  FlaskConical, X, Activity, Droplet, Dna, FileText, ChevronRight
} from "lucide-react";
import { PatientFeatures, PredictResponse, extractReport, predictCondition } from "@/lib/api";

const PRESETS: Record<string, { label: string; features: PatientFeatures }> = {
  "Rheumatoid Arthritis": { label: "RA Profile", features: { Age:55,Sex:1,CRP:42,ESR:48,RF:1,Anti_CCP:1,ANA_titer:1,Anti_dsDNA:0,Complement_C3:108,TSH:2.5,Anti_TPO:0,Fasting_Glucose:95,Anti_tTG:0,HLA_B27:0,Joint_Pain:8,Fatigue:6,GI_Symptom:1,Skin_Lesion:0 }},
  "Systemic Lupus (SLE)": { label: "SLE Profile", features: { Age:30,Sex:1,CRP:18,ESR:42,RF:0,Anti_CCP:0,ANA_titer:3,Anti_dsDNA:1,Complement_C3:62,TSH:2.4,Anti_TPO:0,Fasting_Glucose:90,Anti_tTG:0,HLA_B27:0,Joint_Pain:5,Fatigue:7,GI_Symptom:2,Skin_Lesion:1 }},
  "Type 1 Diabetes":       { label: "T1D Profile", features: { Age:16,Sex:0,CRP:4,ESR:10,RF:0,Anti_CCP:0,ANA_titer:0,Anti_dsDNA:0,Complement_C3:112,TSH:2.8,Anti_TPO:0,Fasting_Glucose:240,Anti_tTG:0,HLA_B27:0,Joint_Pain:1,Fatigue:5,GI_Symptom:2,Skin_Lesion:0 }},
  "Healthy Control":       { label: "Control", features: { Age:35,Sex:0,CRP:2,ESR:8,RF:0,Anti_CCP:0,ANA_titer:0,Anti_dsDNA:0,Complement_C3:115,TSH:2.2,Anti_TPO:0,Fasting_Glucose:88,Anti_tTG:0,HLA_B27:0,Joint_Pain:1,Fatigue:1,GI_Symptom:0,Skin_Lesion:0 }},
};

const DEFAULT: PatientFeatures = { Age:40,Sex:0,CRP:3,ESR:10,RF:0,Anti_CCP:0,ANA_titer:0,Anti_dsDNA:0,Complement_C3:110,TSH:2.5,Anti_TPO:0,Fasting_Glucose:90,Anti_tTG:0,HLA_B27:0,Joint_Pain:1,Fatigue:2,GI_Symptom:1,Skin_Lesion:0 };

const GROUPS = [
  {
    label: "Demographics & Inflammation", icon: Activity,
    fields: [
      { key:"Age" as keyof PatientFeatures, label:"Age (yr)", min:5, max:85, step:1 },
      { key:"Sex" as keyof PatientFeatures, label:"Sex (0:M 1:F)", min:0, max:1, step:1 },
      { key:"CRP" as keyof PatientFeatures, label:"CRP (mg/L)", min:0, max:150, step:0.5 },
      { key:"ESR" as keyof PatientFeatures, label:"ESR (mm/hr)", min:0, max:100, step:1 },
    ],
  },
  {
    label: "Autoantibodies & Genetics", icon: Dna,
    fields: [
      { key:"RF" as keyof PatientFeatures, label:"Rheumatoid Factor", min:0, max:1, step:1 },
      { key:"Anti_CCP" as keyof PatientFeatures, label:"Anti-CCP", min:0, max:1, step:1 },
      { key:"ANA_titer" as keyof PatientFeatures, label:"ANA Titer (0–3)", min:0, max:3, step:1 },
      { key:"Anti_dsDNA" as keyof PatientFeatures, label:"Anti-dsDNA", min:0, max:1, step:1 },
      { key:"HLA_B27" as keyof PatientFeatures, label:"HLA-B27", min:0, max:1, step:1 },
    ],
  },
  {
    label: "Organ-Specific & Symptoms", icon: Droplet,
    fields: [
      { key:"Complement_C3" as keyof PatientFeatures, label:"C3 (mg/dL)", min:30, max:180, step:1 },
      { key:"TSH" as keyof PatientFeatures, label:"TSH (mIU/L)", min:0.01, max:15, step:0.1 },
      { key:"Anti_TPO" as keyof PatientFeatures, label:"Anti-TPO", min:0, max:1, step:1 },
      { key:"Fasting_Glucose" as keyof PatientFeatures, label:"Glucose (mg/dL)", min:60, max:400, step:1 },
      { key:"Anti_tTG" as keyof PatientFeatures, label:"Anti-tTG", min:0, max:1, step:1 },
      { key:"Joint_Pain" as keyof PatientFeatures, label:"Joint Pain (0–10)", min:0, max:10, step:1 },
      { key:"Fatigue" as keyof PatientFeatures, label:"Fatigue (0–10)", min:0, max:10, step:1 },
      { key:"GI_Symptom" as keyof PatientFeatures, label:"GI Score (0–10)", min:0, max:10, step:1 },
      { key:"Skin_Lesion" as keyof PatientFeatures, label:"Skin Lesions", min:0, max:1, step:1 },
    ],
  },
];

export default function IntakePage() {
  const [form, setForm] = useState<PatientFeatures>(DEFAULT);
  const [extracted, setExtracted] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [results, setResults] = useState<PredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePreset = (name: string) => {
    setForm(PRESETS[name].features); setExtracted({}); setResults(null); setError(null); setActivePreset(name);
  };

  const handleField = (k: keyof PatientFeatures, v: number) => {
    setForm(p => ({ ...p, [k]: isNaN(v) ? 0 : v })); setExtracted(p => ({ ...p, [k]: false }));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true); setError(null); setResults(null);
    try {
      const data = await extractReport(e.target.files[0]);
      const newForm = { ...form };
      const newExtracted = { ...extracted };
      for (const k of Object.keys(form) as (keyof PatientFeatures)[]) {
        if (data.extraction_flags[k]) {
          (newForm as any)[k] = data.extracted_data[k];
          newExtracted[k] = true;
        }
      }
      setForm(newForm); setExtracted(newExtracted); setActivePreset(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false); if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handlePredict = async () => {
    setPredicting(true); setError(null); setResults(null);
    try {
      const data = await predictCondition(form);
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto p-12 space-y-10 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <p className="text-[10px] font-extrabold text-secondary tracking-[0.2em] uppercase">
            Protocol / Intake
          </p>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Patient Intake</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {Object.entries(PRESETS).map(([name, cfg]) => (
            <button key={name} onClick={() => handlePreset(name)}
              className={`px-4 py-2 border rounded-xl text-xs font-bold transition-colors ${
                activePreset === name ? "border-primary bg-primary-light text-primary shadow-sm" : "border-border bg-card text-secondary hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {cfg.label}
            </button>
          ))}
          <div className="h-6 w-px bg-border mx-1"></div>
          <button onClick={() => !uploading && fileRef.current?.click()}
            className={`px-5 py-2 border border-dashed rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
              uploading ? "bg-primary-light border-primary/50 text-primary" : "bg-card text-primary border-primary/30 hover:bg-primary-light/50"
            }`}
          >
            {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : <><Upload className="w-4 h-4" /> Upload PDF Report</>}
          </button>
          <input ref={fileRef} type="file" onChange={handleUpload} accept="application/pdf,image/*" className="hidden" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Panel */}
        <div className="lg:col-span-8 ehr-card p-8 space-y-8">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-secondary">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Biomarker Registry</h3>
              <p className="text-[10px] text-secondary mt-0.5 uppercase tracking-widest">Manual entry or OCR extraction</p>
            </div>
          </div>

          {GROUPS.map(g => (
            <div key={g.label} className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <g.icon className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-extrabold text-foreground tracking-wider uppercase">{g.label}</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {g.fields.map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-secondary">{f.label}</label>
                      {extracted[f.key] && <span className="bg-primary-light text-primary text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow-sm">Scanned</span>}
                    </div>
                    <input type="number" min={f.min} max={f.max} step={f.step} value={form[f.key]} onChange={e => handleField(f.key, parseFloat(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg text-sm font-mono font-bold transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light ${
                        extracted[f.key] ? "border-primary bg-primary-light/30" : "border-border bg-slate-50/50 hover:border-slate-300"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-6 border-t border-border flex justify-end">
            <button onClick={handlePredict} disabled={predicting} className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm transition-colors">
              {predicting ? <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating Profile...</> : <><FlaskConical className="w-4 h-4" /> Run Prediction Protocol</>}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-4 sticky top-8">
          <AnimatePresence mode="wait">
            {predicting ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="ehr-card p-8 space-y-6 flex flex-col items-center justify-center min-h-[300px] text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <div>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Executing</span>
                  <p className="text-sm font-bold text-foreground mt-1">Quantum SV Simulation</p>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-red-50 border border-red-100 p-6 rounded-2xl flex flex-col items-center text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
                <h4 className="text-sm font-bold text-red-800">Execution Error</h4>
                <p className="text-xs text-red-600 mt-1 mb-4">{error}</p>
                <button onClick={() => setError(null)} className="px-4 py-2 bg-white rounded-lg text-xs font-bold text-red-600 shadow-sm border border-red-100 hover:bg-red-50">Dismiss</button>
              </motion.div>
            ) : results ? (
              <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="space-y-6">
                
                <div className="banner-card p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-extrabold text-primary tracking-widest uppercase">Diagnostic Output</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-foreground tracking-tight leading-tight mb-2">
                    {results.quantum_kernel_svm?.prediction}
                  </h2>
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">Confidence</span>
                    <span className="text-xl font-extrabold text-primary font-mono bg-white px-2 py-0.5 rounded-lg border border-primary-light shadow-sm">
                      {((results.quantum_kernel_svm?.confidence || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="ehr-card p-6">
                  <h4 className="text-[10px] font-extrabold text-secondary uppercase tracking-widest border-b border-border pb-3 mb-4">Probability Distribution</h4>
                  <div className="space-y-4">
                    {Object.entries(results.quantum_kernel_svm?.probabilities || {})
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 4)
                      .map(([cls, val], idx) => {
                        const isPrimary = cls === results.quantum_kernel_svm?.prediction;
                        return (
                          <div key={cls} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className={`text-[11px] truncate ${isPrimary ? "font-bold text-foreground" : "font-medium text-secondary"}`}>{cls}</span>
                              <span className={`text-[10px] font-mono font-bold ${isPrimary ? "text-primary" : "text-secondary"}`}>
                                {(val * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${val * 100}%` }} transition={{ delay: idx * 0.1, duration: 0.6 }}
                                className={`h-full rounded-full ${isPrimary ? "bg-primary" : "bg-slate-300"}`} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="ehr-card min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-slate-50 border-dashed border-2 border-border">
                <div className="w-12 h-12 bg-white text-secondary rounded-full flex items-center justify-center mb-4 shadow-sm border border-border">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Awaiting Input</h3>
                <p className="text-xs text-secondary mt-2 leading-relaxed">
                  Enter patient biomarkers or upload a lab report to evaluate against the quantum model.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
