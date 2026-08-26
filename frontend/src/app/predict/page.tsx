"use client";

import React, { useState, useRef, useEffect } from "react";

interface PatientFeatures {
  Age: number; Sex: number; CRP: number; ESR: number; RF: number;
  Anti_CCP: number; ANA_titer: number; Anti_dsDNA: number;
  Complement_C3: number; TSH: number; Anti_TPO: number;
  Fasting_Glucose: number; Anti_tTG: number; HLA_B27: number;
  Joint_Pain: number; Fatigue: number; GI_Symptom: number; Skin_Lesion: number;
}

interface PredictionDetail {
  prediction: string;
  confidence: number;
  probabilities: Record<string, number>;
}

interface PredictResponse {
  quantum_kernel_svm: PredictionDetail | null;
  random_forest: PredictionDetail | null;
  classical_svm: PredictionDetail | null;
}

const PRESET_PATIENTS: Record<string, { features: PatientFeatures; color: string; icon: string }> = {
  "Rheumatoid Arthritis": {
    icon: "🦴",
    color: "hover:border-[#E8967A]",
    features: { Age: 55, Sex: 1, CRP: 42, ESR: 48, RF: 1, Anti_CCP: 1, ANA_titer: 1, Anti_dsDNA: 0, Complement_C3: 108, TSH: 2.5, Anti_TPO: 0, Fasting_Glucose: 95, Anti_tTG: 0, HLA_B27: 0, Joint_Pain: 8, Fatigue: 6, GI_Symptom: 1, Skin_Lesion: 0 },
  },
  "Systemic Lupus (SLE)": {
    icon: "🦋",
    color: "hover:border-[#C98ABF]",
    features: { Age: 30, Sex: 1, CRP: 18, ESR: 42, RF: 0, Anti_CCP: 0, ANA_titer: 3, Anti_dsDNA: 1, Complement_C3: 62, TSH: 2.4, Anti_TPO: 0, Fasting_Glucose: 90, Anti_tTG: 0, HLA_B27: 0, Joint_Pain: 5, Fatigue: 7, GI_Symptom: 2, Skin_Lesion: 1 },
  },
  "Type 1 Diabetes": {
    icon: "💉",
    color: "hover:border-[#7B9E89]",
    features: { Age: 16, Sex: 0, CRP: 4, ESR: 10, RF: 0, Anti_CCP: 0, ANA_titer: 0, Anti_dsDNA: 0, Complement_C3: 112, TSH: 2.8, Anti_TPO: 0, Fasting_Glucose: 240, Anti_tTG: 0, HLA_B27: 0, Joint_Pain: 1, Fatigue: 5, GI_Symptom: 2, Skin_Lesion: 0 },
  },
  "Healthy Control": {
    icon: "💚",
    color: "hover:border-sage-border",
    features: { Age: 35, Sex: 0, CRP: 2, ESR: 8, RF: 0, Anti_CCP: 0, ANA_titer: 0, Anti_dsDNA: 0, Complement_C3: 115, TSH: 2.2, Anti_TPO: 0, Fasting_Glucose: 88, Anti_tTG: 0, HLA_B27: 0, Joint_Pain: 1, Fatigue: 1, GI_Symptom: 0, Skin_Lesion: 0 },
  },
};

const FEATURE_META: Record<keyof PatientFeatures, { label: string; min: number; max: number; step: number; group: string }> = {
  Age: { label: "Patient Age (yr)", min: 5, max: 85, step: 1, group: "Demographics & Inflammation" },
  Sex: { label: "Sex (0: Male, 1: Female)", min: 0, max: 1, step: 1, group: "Demographics & Inflammation" },
  CRP: { label: "C-Reactive Protein (mg/L)", min: 0, max: 150, step: 0.5, group: "Demographics & Inflammation" },
  ESR: { label: "Sed. Rate (mm/hr)", min: 0, max: 100, step: 1, group: "Demographics & Inflammation" },
  RF: { label: "Rheumatoid Factor", min: 0, max: 1, step: 1, group: "Autoantibodies & Genetics" },
  Anti_CCP: { label: "Anti-CCP", min: 0, max: 1, step: 1, group: "Autoantibodies & Genetics" },
  ANA_titer: { label: "ANA Titer (0–3)", min: 0, max: 3, step: 1, group: "Autoantibodies & Genetics" },
  Anti_dsDNA: { label: "Anti-dsDNA", min: 0, max: 1, step: 1, group: "Autoantibodies & Genetics" },
  HLA_B27: { label: "HLA-B27", min: 0, max: 1, step: 1, group: "Autoantibodies & Genetics" },
  Complement_C3: { label: "Complement C3 (mg/dL)", min: 30, max: 180, step: 1, group: "Organ & Symptom" },
  TSH: { label: "TSH (mIU/L)", min: 0.01, max: 15, step: 0.1, group: "Organ & Symptom" },
  Anti_TPO: { label: "Anti-TPO", min: 0, max: 1, step: 1, group: "Organ & Symptom" },
  Fasting_Glucose: { label: "Fasting Glucose (mg/dL)", min: 60, max: 400, step: 1, group: "Organ & Symptom" },
  Anti_tTG: { label: "Anti-tTG", min: 0, max: 1, step: 1, group: "Organ & Symptom" },
  Joint_Pain: { label: "Joint Pain (0–10)", min: 0, max: 10, step: 1, group: "Organ & Symptom" },
  Fatigue: { label: "Fatigue (0–10)", min: 0, max: 10, step: 1, group: "Organ & Symptom" },
  GI_Symptom: { label: "GI Symptoms (0–10)", min: 0, max: 10, step: 1, group: "Organ & Symptom" },
  Skin_Lesion: { label: "Skin Lesions", min: 0, max: 1, step: 1, group: "Organ & Symptom" },
};

const PROXY_IMPORTANCE: Record<string, number> = {
  Anti_CCP: 0.185, ANA_titer: 0.142, Fasting_Glucose: 0.121, CRP: 0.108, Complement_C3: 0.095,
};

export default function PredictPage() {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<PatientFeatures>({
    Age: 40, Sex: 0, CRP: 3, ESR: 10, RF: 0, Anti_CCP: 0, ANA_titer: 0, Anti_dsDNA: 0,
    Complement_C3: 110, TSH: 2.5, Anti_TPO: 0, Fasting_Glucose: 90, Anti_tTG: 0, HLA_B27: 0,
    Joint_Pain: 1, Fatigue: 2, GI_Symptom: 1, Skin_Lesion: 0,
  });
  const [extractedFlags, setExtractedFlags] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [results, setResults] = useState<PredictResponse | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  useEffect(() => { setMounted(true); }, []);

  const applyPreset = (name: string) => {
    setFormData(PRESET_PATIENTS[name].features);
    setExtractedFlags({});
    setResults(null);
    setShowResults(false);
    setErrorMsg(null);
    setActivePreset(name);
  };

  const handleInput = (field: keyof PatientFeatures, val: number) => {
    setFormData((p) => ({ ...p, [field]: val }));
    setExtractedFlags((p) => ({ ...p, [field]: false }));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    setErrorMsg(null);
    setResults(null);
    setShowResults(false);
    const fd = new FormData();
    fd.append("file", e.target.files[0]);
    try {
      const res = await fetch(`${BACKEND}/extract-report`, { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json()).detail || "Extraction failed");
      const json = await res.json();
      const nf = { ...formData };
      const nfl = { ...extractedFlags };
      for (const k of Object.keys(FEATURE_META)) {
        if (json.extraction_flags[k]) { nf[k as keyof PatientFeatures] = json.extracted_data[k]; nfl[k] = true; }
      }
      setFormData(nf);
      setExtractedFlags(nfl);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const steps = [
    "Verifying patient vector integrity",
    "Normalizing via standard scalers",
    "Projecting into 10 PCA dimensions",
    "Encoding qubit rotation angles",
    "Executing simulated quantum circuits",
    "Evaluating OVR SVM boundaries",
  ];

  const runPrediction = async () => {
    setPredicting(true);
    setErrorMsg(null);
    setResults(null);
    setShowResults(false);
    setProgressStep(0);

    for (let i = 0; i < steps.length; i++) {
      setProgressStep(i + 1);
      await new Promise((r) => setTimeout(r, 500));
    }

    try {
      const res = await fetch(`${BACKEND}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Prediction failed");
      const json = await res.json();
      setResults(json);
      setTimeout(() => setShowResults(true), 100);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setPredicting(false);
    }
  };

  const groups = ["Demographics & Inflammation", "Autoantibodies & Genetics", "Organ & Symptom"];

  return (
    <div className="space-y-10">
      {/* ── Amber verification banner ── */}
      <div className={`border border-amber-border/30 bg-amber-bg/40 backdrop-blur-sm p-5 rounded-2xl flex items-start gap-4 ${mounted ? "animate-fade-up" : "opacity-0"}`}>
        <span className="text-xl mt-0.5">⚠️</span>
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground font-data">Verification Protocol</h4>
          <p className="text-xs text-secondary leading-relaxed mt-1">
            Fields populated via report extraction are flagged in amber. Review and confirm each value before computing predictions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* ══ Left Sidebar ══ */}
        <div className={`space-y-6 ${mounted ? "animate-slide-left delay-100" : "opacity-0"}`}>
          {/* Presets */}
          <div className="border border-border-clinical bg-card-clinical p-5 rounded-2xl shadow-clinical-soft space-y-3">
            <h3 className="text-[10px] uppercase tracking-[0.15em] font-bold text-secondary font-data">Quick Presets</h3>
            <div className="flex flex-col gap-2">
              {Object.entries(PRESET_PATIENTS).map(([name, cfg]) => (
                <button
                  key={name}
                  onClick={() => applyPreset(name)}
                  className={`w-full text-left px-3.5 py-3 border text-xs font-semibold bg-white rounded-xl flex items-center gap-2.5 group cursor-pointer transition-all duration-300 ${
                    activePreset === name
                      ? "border-accent bg-accent-tint/30 shadow-sm"
                      : `border-border-clinical hover:bg-white hover:shadow-sm ${cfg.color}`
                  }`}
                >
                  <span className="text-base group-hover:scale-110 transition-transform duration-300">{cfg.icon}</span>
                  <span className="flex-1">{name}</span>
                  <span className={`text-[10px] font-data transition-all duration-300 ${
                    activePreset === name ? "text-accent" : "text-secondary opacity-0 group-hover:opacity-100"
                  }`}>→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upload */}
          <div className="border border-border-clinical bg-card-clinical p-5 rounded-2xl shadow-clinical-soft space-y-3">
            <h3 className="text-[10px] uppercase tracking-[0.15em] font-bold text-secondary font-data">Upload Report</h3>
            <p className="text-[11px] text-secondary leading-relaxed">
              Upload a PDF or image to auto-extract lab values.
            </p>
            <div
              onClick={() => !uploading && fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-500 ${
                uploading
                  ? "border-accent/40 bg-accent-tint/20"
                  : "border-border-clinical bg-white hover:border-accent/40 hover:bg-accent-tint/10"
              }`}
            >
              {uploading ? (
                <div className="space-y-2">
                  <div className="w-16 h-1 mx-auto rounded-full overflow-hidden bg-accent/20">
                    <div className="h-full bg-accent rounded-full shimmer-loader" style={{ width: "60%" }} />
                  </div>
                  <span className="text-[10px] font-bold text-accent font-data uppercase tracking-wider block animate-pulse">
                    Extracting...
                  </span>
                </div>
              ) : (
                <div className="space-y-2 group">
                  <svg className="w-7 h-7 mx-auto text-secondary group-hover:text-accent transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                  <span className="text-xs font-bold text-accent block">Choose file</span>
                  <span className="text-[9px] text-secondary block">PDF, PNG, JPG</span>
                </div>
              )}
              <input ref={fileRef} type="file" onChange={handleUpload} accept="application/pdf,image/*" className="hidden" />
            </div>
          </div>
        </div>

        {/* ══ Right Main ══ */}
        <div className={`space-y-8 ${mounted ? "animate-slide-right delay-200" : "opacity-0"}`}>
          {/* Biomarker Form */}
          <div className="border border-border-clinical bg-white p-6 md:p-8 rounded-2xl shadow-clinical-soft space-y-8">
            <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold text-accent font-data">
              Biomarker Configuration
            </h2>

            {groups.map((groupName) => (
              <div key={groupName} className="space-y-4">
                <h3 className="text-xs font-bold text-secondary border-b border-border-clinical pb-2">{groupName}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {Object.entries(FEATURE_META)
                    .filter(([, m]) => m.group === groupName)
                    .map(([key, meta]) => {
                      const fk = key as keyof PatientFeatures;
                      const extracted = extractedFlags[key];
                      return (
                        <div key={key} className="space-y-1.5 group">
                          <div className="flex justify-between items-center">
                            <label className="text-[11px] font-semibold text-foreground group-hover:text-accent transition-colors duration-300">
                              {meta.label}
                            </label>
                            {extracted && (
                              <span className="bg-amber-bg text-amber-border border border-amber-border/20 text-[8px] font-bold font-data px-1.5 py-0.5 rounded-md uppercase tracking-wider animate-scale-in">
                                Verify
                              </span>
                            )}
                          </div>
                          <input
                            type="number"
                            min={meta.min} max={meta.max} step={meta.step}
                            value={formData[fk]}
                            onChange={(e) => handleInput(fk, parseFloat(e.target.value) || 0)}
                            className={`w-full px-3 py-2.5 border rounded-xl text-sm font-data transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent ${
                              extracted
                                ? "border-amber-border/50 bg-amber-bg/20 text-foreground font-bold"
                                : "border-border-clinical bg-[#FFFDF8] hover:border-accent/30"
                            }`}
                          />
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}

            <div className="pt-4 flex justify-end">
              <button
                onClick={runPrediction}
                disabled={predicting}
                className="group relative px-7 py-3 bg-accent hover:bg-accent-hover text-white text-xs uppercase tracking-[0.15em] font-bold rounded-xl disabled:opacity-50 transition-all duration-500 cursor-pointer shadow-clinical-soft hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {predicting ? (
                    <>
                      <span className="inline-flex gap-0.5">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                      Computing...
                    </>
                  ) : (
                    <>🔬 Compute Diagnostic Likelihood</>
                  )}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-accent-hover to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
            </div>
          </div>

          {/* ── Progress Milestones ── */}
          {predicting && (
            <div className="border border-border-clinical bg-card-clinical p-8 rounded-2xl shadow-clinical-soft animate-scale-in">
              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 transition-all duration-500 ${
                      idx < progressStep ? "opacity-100" : "opacity-20"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                      idx < progressStep
                        ? "border-accent bg-accent"
                        : "border-border-clinical"
                    }`}>
                      {idx < progressStep && (
                        <svg className="w-2.5 h-2.5 text-white animate-scale-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs font-data text-secondary">{step}</span>
                    {idx === progressStep - 1 && idx < steps.length - 1 && (
                      <div className="w-4 h-0.5 bg-accent/30 rounded-full overflow-hidden ml-auto">
                        <div className="h-full bg-accent rounded-full animate-pulse" style={{ width: "70%" }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {errorMsg && (
            <div className="border border-accent/30 bg-accent-tint/20 p-4 rounded-2xl text-center text-xs font-bold text-accent animate-scale-in">
              {errorMsg}
            </div>
          )}

          {/* ══ Results ══ */}
          {results && showResults && (
            <div className="space-y-8 animate-fade-up">
              {/* Primary Result */}
              {results.quantum_kernel_svm && (
                <div className="border border-border-clinical bg-card-clinical p-6 md:p-8 rounded-2xl shadow-clinical-soft animate-scale-in">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div className="space-y-1">
                      <span className="text-[10px] text-secondary font-data uppercase tracking-wider">
                        Classification — Quantum Kernel SVM (multi-class, one-vs-rest)
                      </span>
                      <h2 className="text-3xl md:text-4xl font-bold text-foreground font-serif-clinical animate-fade-up delay-100">
                        {results.quantum_kernel_svm.prediction}
                      </h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-white border border-border-clinical px-5 py-3 text-center rounded-xl shadow-clinical-soft card-hover">
                        <span className="text-[9px] text-secondary font-data block uppercase tracking-wider">Confidence</span>
                        <span className="text-2xl font-bold font-data text-accent animate-fade-up delay-200">
                          {(results.quantum_kernel_svm.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="bg-sage-bg/50 border border-sage-border/20 px-4 py-3 text-center rounded-xl shadow-clinical-soft">
                        <span className="text-[9px] text-sage-border font-data block uppercase tracking-wider">Cohort</span>
                        <span className="text-xs font-bold text-sage-border font-data animate-fade-up delay-300">SYNTHETIC</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Probability Bars */}
                {results.quantum_kernel_svm && (
                  <div className="border border-border-clinical bg-white p-6 rounded-2xl shadow-clinical-soft card-hover animate-fade-up delay-200">
                    <h3 className="text-[10px] uppercase tracking-[0.15em] font-bold text-secondary font-data mb-5">
                      Probability Distribution
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(results.quantum_kernel_svm.probabilities)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 6)
                        .map(([cls, val], idx) => {
                          const isPrimary = cls === results.quantum_kernel_svm!.prediction;
                          return (
                            <div key={cls} className="flex items-center gap-3 group" style={{ animationDelay: `${300 + idx * 80}ms` }}>
                              <span className={`text-[11px] w-[140px] truncate flex-shrink-0 transition-colors duration-300 ${isPrimary ? "font-bold text-foreground" : "text-secondary"} group-hover:text-accent`}>
                                {cls}
                              </span>
                              <div className="flex-1 h-3 bg-border-clinical/30 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-1000 ease-out ${isPrimary ? "bg-accent" : "bg-border-clinical"}`}
                                  style={{
                                    width: `${Math.max(2, val * 100)}%`,
                                    animation: `width-grow 1s cubic-bezier(0.22, 1, 0.36, 1) ${300 + idx * 100}ms both`,
                                  }}
                                />
                              </div>
                              <span className={`text-[11px] font-data font-bold w-12 text-right ${isPrimary ? "text-accent" : "text-secondary"}`}>
                                {(val * 100).toFixed(1)}%
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Feature Importance */}
                <div className="border border-border-clinical bg-white p-6 rounded-2xl shadow-clinical-soft card-hover animate-fade-up delay-400">
                  <h3 className="text-[10px] uppercase tracking-[0.15em] font-bold text-secondary font-data mb-1">
                    Contributing Biomarkers
                  </h3>
                  <p className="text-[9px] text-secondary font-data italic mb-5">
                    Proxy importance (Random Forest) — Quantum Kernel SVM has no native feature importance.
                  </p>
                  <div className="space-y-3">
                    {Object.entries(PROXY_IMPORTANCE).map(([feat, val], idx) => (
                      <div key={feat} className="flex items-center gap-3 group">
                        <span className="text-[11px] w-[120px] truncate flex-shrink-0 text-secondary group-hover:text-foreground transition-colors duration-300 font-semibold">
                          {feat}
                        </span>
                        <div className="flex-1 h-3 bg-border-clinical/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-secondary/30 rounded-full"
                            style={{
                              width: `${(val / 0.185) * 100}%`,
                              animation: `width-grow 1s cubic-bezier(0.22, 1, 0.36, 1) ${500 + idx * 100}ms both`,
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-data font-bold text-secondary w-12 text-right">
                          {val.toFixed(3)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cross-Model Consistency */}
              <div className="border border-border-clinical bg-white p-6 rounded-2xl shadow-clinical-soft animate-fade-up delay-500">
                <h3 className="text-[10px] uppercase tracking-[0.15em] font-bold text-secondary font-data mb-5">
                  Cross-Model Classification Consistency
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: "Quantum Kernel SVM", obj: results.quantum_kernel_svm, primary: true },
                    { name: "Classical SVM (RBF)", obj: results.classical_svm, primary: false },
                    { name: "Random Forest", obj: results.random_forest, primary: false },
                  ].map((model, idx) => (
                    <div
                      key={idx}
                      className={`border p-5 rounded-xl text-center card-hover ${
                        model.primary ? "border-accent/30 bg-accent-tint/10" : "border-border-clinical bg-card-clinical"
                      }`}
                      style={{ animation: `scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${600 + idx * 120}ms both` }}
                    >
                      <span className="text-[9px] text-secondary font-data uppercase tracking-wider block">{model.name}</span>
                      {model.obj ? (
                        <div className="mt-2.5 space-y-1">
                          <div className="text-sm font-bold text-foreground leading-tight">{model.obj.prediction}</div>
                          <div className={`text-sm font-data font-bold ${model.primary ? "text-accent" : "text-secondary"}`}>
                            {(model.obj.confidence * 100).toFixed(1)}%
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2.5 text-xs text-secondary italic font-data">Unavailable</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
