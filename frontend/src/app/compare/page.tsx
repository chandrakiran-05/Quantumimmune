"use client";

import React, { useState, useEffect } from "react";

interface ModelMetrics {
  accuracy: number;
  f1_macro: number;
  precision_macro: number;
  recall_macro: number;
  train_time: number;
  confusion_matrix: number[][];
}

interface BenchmarkData {
  sequential_time: number;
  sequential_pairs: number;
  parallel_time: number;
  parallel_pairs: number;
  n_cores: number;
  speedup: number;
  sample_size: number;
  max_diff: number;
}

export default function ComparePage() {
  const [data, setData] = useState<{
    metrics: Record<string, ModelMetrics>;
    benchmarks: BenchmarkData;
    classes: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Quantum Kernel SVM");
  const [mounted, setMounted] = useState(false);

  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  const models = ["Quantum Kernel SVM", "Classical SVM", "Random Forest"];

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetch(`${BACKEND}/models/metrics`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then((json) => {
        const mapped: Record<string, ModelMetrics> = {};
        if (json.metrics["QSVM"]) mapped["Quantum Kernel SVM"] = json.metrics["QSVM"];
        if (json.metrics["Random Forest"]) mapped["Random Forest"] = json.metrics["Random Forest"];
        if (json.metrics["Classical SVM"]) mapped["Classical SVM"] = json.metrics["Classical SVM"];
        setData({ metrics: mapped, benchmarks: json.benchmarks, classes: json.classes });
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [BACKEND]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-5 animate-fade-in">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 bg-accent rounded-full" style={{ animation: `dot-pulse 1.4s ${i * 0.2}s infinite ease-in-out both` }} />
          ))}
        </div>
        <p className="text-[10px] text-secondary font-data uppercase tracking-widest">Loading analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="border border-accent/20 bg-accent-tint/10 p-10 rounded-2xl text-center space-y-4 max-w-md mx-auto shadow-clinical-soft animate-scale-in">
        <p className="text-sm font-bold text-accent font-serif-clinical">Connection Error</p>
        <p className="text-xs text-secondary">Could not reach backend at {BACKEND}.</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2 border border-border-clinical text-xs font-bold bg-white text-foreground hover:bg-card-clinical transition-all duration-300 rounded-xl shadow-clinical-soft cursor-pointer">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Header */}
      <div className={`max-w-3xl space-y-4 ${mounted ? "animate-fade-up" : "opacity-0"}`}>
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-serif-clinical leading-tight">
          Performance metrics & concurrency speedups.
        </h1>
        <p className="text-secondary text-sm">
          Comparative view of the Quantum Kernel SVM (multi-class, one-vs-rest) versus classical baselines.
        </p>
      </div>

      {/* ── Metrics Table ── */}
      <div className={`space-y-5 ${mounted ? "animate-fade-up delay-200" : "opacity-0"}`}>
        <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold text-accent font-data">
          Accuracy & Separation Metrics
        </h2>
        <div className="border border-border-clinical bg-white overflow-hidden rounded-2xl shadow-clinical-soft">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-clinical bg-card-clinical">
                {["Model", "Accuracy", "F1 Macro", "Precision", "Recall", "Train Time"].map((h) => (
                  <th key={h} className={`px-5 py-4 text-[10px] font-bold text-secondary uppercase tracking-wider font-data ${h !== "Model" ? "text-right" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-clinical">
              {models.map((name, idx) => {
                const m = data.metrics[name];
                if (!m) return null;
                return (
                  <tr
                    key={name}
                    className="group hover:bg-accent-tint/15 transition-colors duration-300"
                    style={{ animation: `fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${300 + idx * 100}ms both` }}
                  >
                    <td className="px-5 py-4 text-sm font-bold text-foreground group-hover:text-accent transition-colors duration-300">
                      {name}
                    </td>
                    <td className="px-5 py-4 text-sm font-data text-right text-accent font-bold">
                      {(m.accuracy * 100).toFixed(2)}%
                    </td>
                    <td className="px-5 py-4 text-sm font-data text-right">{m.f1_macro.toFixed(4)}</td>
                    <td className="px-5 py-4 text-sm font-data text-right">{m.precision_macro.toFixed(4)}</td>
                    <td className="px-5 py-4 text-sm font-data text-right">{m.recall_macro.toFixed(4)}</td>
                    <td className="px-5 py-4 text-sm font-data text-right text-secondary">{m.train_time.toFixed(3)}s</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Confusion Matrix ── */}
      <div className={`space-y-5 ${mounted ? "animate-fade-up delay-400" : "opacity-0"}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold text-accent font-data">
            Multi-Class Confusion Matrices
          </h2>
          <div className="flex bg-card-clinical border border-border-clinical p-1 rounded-xl shadow-clinical-soft">
            {models.map((name) => (
              <button
                key={name}
                onClick={() => setActiveTab(name)}
                className={`px-4 py-2 text-[11px] font-bold transition-all duration-400 rounded-lg cursor-pointer ${
                  activeTab === name
                    ? "bg-white text-accent border border-border-clinical shadow-sm"
                    : "text-secondary hover:text-foreground"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card-clinical border border-border-clinical p-8 rounded-2xl shadow-clinical-soft">
          <ConfusionGrid
            key={activeTab}
            matrix={data.metrics[activeTab]?.confusion_matrix || []}
            classes={data.classes}
          />
        </div>
      </div>

      {/* ── Parallel Speedup ── */}
      <div className={`space-y-5 ${mounted ? "animate-fade-up delay-600" : "opacity-0"}`}>
        <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold text-accent font-data">
          Parallel Processing Speedup (Classical CPU)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              label: "Sequential (1 Thread)",
              value: `${data.benchmarks.sequential_time.toFixed(3)}s`,
              sub: `${data.benchmarks.sequential_pairs} kernel pairs`,
              highlight: false,
            },
            {
              label: `Parallel (${data.benchmarks.n_cores} Threads)`,
              value: `${data.benchmarks.parallel_time.toFixed(3)}s`,
              sub: "multiprocessing chunking",
              highlight: false,
            },
            {
              label: "Speedup Factor",
              value: `${data.benchmarks.speedup.toFixed(2)}x`,
              sub: "concurrency multiplier",
              highlight: true,
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className={`border p-6 rounded-2xl shadow-clinical-soft card-hover flex flex-col justify-between ${
                card.highlight ? "border-accent/30 bg-accent-tint/10 border-t-4 border-t-accent" : "border-border-clinical bg-white"
              }`}
              style={{ animation: `scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${700 + idx * 120}ms both` }}
            >
              <span className={`text-[10px] font-data uppercase tracking-wider ${card.highlight ? "text-accent" : "text-secondary"}`}>
                {card.label}
              </span>
              <div className={`mt-3 text-3xl font-bold font-data ${card.highlight ? "text-accent" : "text-foreground"}`}>
                {card.value}
              </div>
              <span className="text-[9px] text-secondary mt-2 font-data">{card.sub}</span>
            </div>
          ))}
        </div>

        {/* Animated Bar Comparison */}
        <div className="bg-card-clinical border border-border-clinical p-8 rounded-2xl shadow-clinical-soft">
          <div className="space-y-5 max-w-xl mx-auto">
            {[
              { label: "Sequential", time: data.benchmarks.sequential_time, ratio: 1, color: "bg-secondary/20" },
              { label: `Parallel (${data.benchmarks.n_cores}c)`, time: data.benchmarks.parallel_time, ratio: data.benchmarks.parallel_time / data.benchmarks.sequential_time, color: "bg-accent" },
            ].map((bar, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-[11px] text-secondary font-data w-24 text-right flex-shrink-0">{bar.label}</span>
                <div className="flex-1 h-5 bg-border-clinical/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${bar.color}`}
                    style={{
                      width: `${bar.ratio * 100}%`,
                      animation: `width-grow 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${800 + idx * 200}ms both`,
                    }}
                  />
                </div>
                <span className={`text-[11px] font-data font-bold w-16 ${idx === 1 ? "text-accent" : "text-secondary"}`}>
                  {bar.time.toFixed(3)}s
                </span>
              </div>
            ))}
            <div className="text-center pt-2">
              <span className="text-sm font-data font-bold text-accent animate-fade-up delay-500">
                {data.benchmarks.speedup.toFixed(2)}× speedup
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Confusion Matrix Grid ── */
function ConfusionGrid({ matrix, classes }: { matrix: number[][]; classes: string[] }) {
  const [hovered, setHovered] = useState<{ r: number; c: number; v: number } | null>(null);

  if (!matrix.length) {
    return <div className="py-10 text-xs font-data text-secondary text-center">No data available.</div>;
  }

  const n = matrix.length;
  let max = 1;
  matrix.forEach((row) => row.forEach((v) => { if (v > max) max = v; }));

  const short = classes.map((c) => (c.length > 12 ? c.substring(0, 10) + "…" : c));
  const cell = 32;
  const pad = 100;

  return (
    <div className="flex flex-col items-center">
      <svg className="w-full max-w-[620px]" viewBox={`0 0 ${n * cell + pad * 2} ${n * cell + pad * 2}`}>
        {/* Grid */}
        {matrix.map((row, r) =>
          row.map((v, c) => {
            const opacity = v === 0 ? 0.02 : Math.max(0.08, v / max);
            const isHov = hovered?.r === r && hovered?.c === c;
            return (
              <g key={`${r}-${c}`}>
                <rect
                  x={pad + c * cell} y={pad + r * cell}
                  width={cell - 1.5} height={cell - 1.5} rx="4"
                  fill={v === 0 ? "#FFFAF0" : "#FF6F89"} fillOpacity={opacity}
                  stroke={isHov ? "#2B2420" : "#E8DFD3"} strokeWidth={isHov ? 2 : 0.5}
                  className="cursor-crosshair transition-all duration-200"
                  onMouseEnter={() => setHovered({ r, c, v })}
                  onMouseLeave={() => setHovered(null)}
                >
                  <animate attributeName="fill-opacity" from="0" to={String(opacity)} dur="0.5s" fill="freeze" begin={`${r * 0.03 + c * 0.03}s`} />
                </rect>
                {v > 0 && (
                  <text
                    x={pad + c * cell + cell / 2} y={pad + r * cell + cell / 2 + 3}
                    textAnchor="middle"
                    fill={opacity > 0.5 ? "#FFF" : "#2B2420"}
                    className="text-[8px] font-data pointer-events-none font-bold"
                  >
                    {v}
                  </text>
                )}
              </g>
            );
          })
        )}

        {/* Y labels */}
        {short.map((name, i) => (
          <text key={`y${i}`} x={pad - 8} y={pad + i * cell + cell / 2 + 3} textAnchor="end" fill="#6B6058" className="text-[9px] font-data">
            {name}
          </text>
        ))}

        {/* X labels */}
        {short.map((name, i) => (
          <text key={`x${i}`} x={pad + i * cell + cell / 2} y={pad - 8} textAnchor="start" transform={`rotate(-50, ${pad + i * cell + cell / 2}, ${pad - 8})`} fill="#6B6058" className="text-[9px] font-data">
            {name}
          </text>
        ))}
      </svg>

      <div className="h-10 mt-3">
        {hovered ? (
          <div className="text-xs font-data bg-white border border-border-clinical px-4 py-2 rounded-xl shadow-clinical-soft animate-scale-in">
            True: <span className="font-bold text-accent">{classes[hovered.r]}</span> →
            Pred: <span className="font-bold text-accent">{classes[hovered.c]}</span> =
            <span className="font-bold text-accent ml-1">{hovered.v}</span>
          </div>
        ) : (
          <p className="text-xs text-secondary font-data italic text-center">Hover over a cell to inspect</p>
        )}
      </div>
    </div>
  );
}
