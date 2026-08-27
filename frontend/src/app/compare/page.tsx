"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Loader2, BarChart3, TrendingUp, Cpu, Award } from "lucide-react";

interface ModelMetrics { accuracy: number; f1_macro: number; precision_macro: number; recall_macro: number; train_time: number; confusion_matrix: number[][]; }
interface BenchmarkData { sequential_time: number; sequential_pairs: number; parallel_time: number; parallel_pairs: number; n_cores: number; speedup: number; sample_size: number; max_diff: number; }

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ type: "spring", stiffness: 200, damping: 25, delay }} className={className}>
      {children}
    </motion.div>
  );
}

function CountUp({ target, decimals = 1, suffix = "", className = "" }: { target: number; decimals?: number; suffix?: string; className?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const dur = 1200; const start = performance.now();
    const tick = (now: number) => { const p = Math.min((now - start) / dur, 1); setVal((1 - Math.pow(1 - p, 3)) * target); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, [inView, target]);
  return <span ref={ref} className={className}>{val.toFixed(decimals)}{suffix}</span>;
}

export default function ComparePage() {
  const [data, setData] = useState<{ metrics: Record<string, ModelMetrics>; benchmarks: BenchmarkData; classes: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Quantum Kernel SVM");
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  const models = ["Quantum Kernel SVM", "Classical SVM", "Random Forest"];

  useEffect(() => {
    fetch(`${BACKEND}/models/metrics`).then(r => { if (!r.ok) throw new Error("Failed"); return r.json(); })
      .then(json => {
        const m: Record<string, ModelMetrics> = {};
        if (json.metrics["QSVM"]) m["Quantum Kernel SVM"] = json.metrics["QSVM"];
        if (json.metrics["Random Forest"]) m["Random Forest"] = json.metrics["Random Forest"];
        if (json.metrics["Classical SVM"]) m["Classical SVM"] = json.metrics["Classical SVM"];
        setData({ metrics: m, benchmarks: json.benchmarks, classes: json.classes }); setLoading(false);
      }).catch(e => { setError(e.message); setLoading(false); });
  }, [BACKEND]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-36 gap-4">
      <Loader2 className="w-6 h-6 text-accent animate-spin" />
      <p className="text-[10px] text-secondary font-data uppercase tracking-widest">Loading metrics...</p>
    </div>
  );

  if (error || !data) return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="vovy-card p-10 text-center space-y-4 max-w-md mx-auto bg-white">
      <p className="text-sm font-bold text-accent font-display">Connection Error</p>
      <p className="text-xs text-secondary">Backend at {BACKEND} unreachable.</p>
      <button onClick={() => window.location.reload()} className="px-5 py-2 border border-slate-200 text-xs font-bold bg-white rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">Retry</button>
    </motion.div>
  );

  return (
    <div className="relative space-y-16 py-4">
      {/* Decorative Glow Backgrounds */}
      <div className="glow-blur -top-10 -left-10" />
      <div className="glow-blur top-40 right-10" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="max-w-3xl space-y-3">
        <span className="badge-blue px-2.5 py-1 rounded-full text-[9px] inline-block mb-1">Model Benchmarks</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display">
          Performance & <span className="gradient-text">Speedups</span>
        </h1>
        <p className="text-secondary text-xs">Benchmarking Quantum Kernel SVM classification against classical baselines.</p>
      </motion.div>

      {/* Metrics Table */}
      <Reveal>
        <div className="space-y-4">
          <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold text-secondary font-data">Accuracy & Separation</h2>
          <div className="vovy-card overflow-hidden bg-white/95">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {["Model", "Accuracy", "F1 Macro", "Precision", "Recall", "Train Time"].map(h => (
                    <th key={h} className={`px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-wider font-data ${h !== "Model" ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {models.map((name, idx) => {
                  const m = data.metrics[name]; if (!m) return null;
                  return (
                    <motion.tr key={name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08, type: "spring", stiffness: 300, damping: 25 }}
                      className="group hover:bg-slate-50/40 transition-colors duration-200">
                      <td className="px-6 py-4 text-xs font-bold text-foreground group-hover:text-accent transition-colors duration-200">{name}</td>
                      <td className="px-6 py-4 text-xs font-data text-right text-accent font-bold"><CountUp target={m.accuracy * 100} suffix="%" /></td>
                      <td className="px-6 py-4 text-xs font-data text-right text-secondary">{m.f1_macro.toFixed(4)}</td>
                      <td className="px-6 py-4 text-xs font-data text-right text-secondary">{m.precision_macro.toFixed(4)}</td>
                      <td className="px-6 py-4 text-xs font-data text-right text-secondary">{m.recall_macro.toFixed(4)}</td>
                      <td className="px-6 py-4 text-xs font-data text-right text-secondary">{m.train_time.toFixed(3)}s</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      {/* Confusion Matrix */}
      <Reveal>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold text-secondary font-data">Confusion Matrices</h2>
            <div className="flex bg-slate-100/80 border border-slate-200 p-1 rounded-xl">
              {models.map(name => (
                <button key={name} onClick={() => setActiveTab(name)}
                  className={`relative px-4 py-1.5 text-[11px] font-bold rounded-lg cursor-pointer transition-colors duration-200 ${activeTab === name ? "text-accent" : "text-secondary hover:text-foreground"}`}>
                  {activeTab === name && <motion.span layoutId="cm-tab" className="absolute inset-0 bg-white border border-slate-200/50 rounded-lg shadow-sm -z-10" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                  {name}
                </button>
              ))}
            </div>
          </div>
          <div className="vovy-card p-6 md:p-8 bg-white/95">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}>
                <ConfusionGrid matrix={data.metrics[activeTab]?.confusion_matrix || []} classes={data.classes} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Reveal>

      {/* Speedup */}
      <Reveal>
        <div className="space-y-5">
          <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold text-secondary font-data">Parallel Speedup (Classical CPU)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { label: "Sequential (1 Thread)", value: data.benchmarks.sequential_time, suffix: "s", decimals: 3, sub: `${data.benchmarks.sequential_pairs} pairs`, icon: Cpu },
              { label: `Parallel (${data.benchmarks.n_cores} Threads)`, value: data.benchmarks.parallel_time, suffix: "s", decimals: 3, sub: "multiprocessing", icon: BarChart3 },
              { label: "Speedup Factor", value: data.benchmarks.speedup, suffix: "×", decimals: 2, sub: "concurrency multiplier", icon: TrendingUp, highlight: true },
            ].map((card, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 25 }}
                className={`vovy-card p-6 cursor-default relative overflow-hidden ${card.highlight ? "bg-accent-tint/15 border-accent/20" : "bg-white/95"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <span className={`text-[10px] font-data uppercase tracking-wider block ${card.highlight ? "text-accent" : "text-secondary"}`}>{card.label}</span>
                    <div className={`text-3xl font-bold font-data ${card.highlight ? "text-accent" : "text-foreground"}`}>
                      <CountUp target={card.value} decimals={card.decimals} suffix={card.suffix} />
                    </div>
                    <span className="text-[9.5px] text-secondary font-data block">{card.sub}</span>
                  </div>
                  <div className={`p-2.5 rounded-xl ${card.highlight ? "bg-accent/10 text-accent" : "bg-slate-50 text-secondary"}`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bar comparison */}
          <div className="vovy-card p-6 md:p-8 bg-white/95">
            <div className="space-y-4 max-w-xl mx-auto">
              {[
                { label: "Sequential", time: data.benchmarks.sequential_time, ratio: 1, accent: false },
                { label: `Parallel (${data.benchmarks.n_cores}c)`, time: data.benchmarks.parallel_time, ratio: data.benchmarks.parallel_time / data.benchmarks.sequential_time, accent: true },
              ].map((bar, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="text-[10.5px] text-secondary font-data w-24 text-right flex-shrink-0">{bar.label}</span>
                  <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${bar.ratio * 100}%` }} viewport={{ once: true }}
                      transition={{ delay: idx * 0.15, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      className={`h-full rounded-full ${bar.accent ? "bg-accent" : "bg-slate-200"}`} />
                  </div>
                  <span className={`text-[11px] font-data font-bold w-16 ${bar.accent ? "text-accent" : "text-secondary"}`}>{bar.time.toFixed(3)}s</span>
                </div>
              ))}
              <div className="text-center pt-2">
                <motion.span initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: 0.4 }} className="text-xs font-data font-bold text-accent">{data.benchmarks.speedup.toFixed(2)}× speedup multiplier</motion.span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

/* ── Confusion Matrix ── */
function ConfusionGrid({ matrix, classes }: { matrix: number[][]; classes: string[] }) {
  const [hovered, setHovered] = useState<{ r: number; c: number; v: number } | null>(null);
  if (!matrix.length) return <div className="py-10 text-xs font-data text-secondary text-center">No matrix data.</div>;
  const n = matrix.length; let max = 1; matrix.forEach(row => row.forEach(v => { if (v > max) max = v; }));
  const short = classes.map(c => c.length > 12 ? c.substring(0, 10) + "…" : c);
  const cell = 32; const pad = 100;

  return (
    <div className="flex flex-col items-center">
      <svg className="w-full max-w-[620px]" viewBox={`0 0 ${n * cell + pad * 2} ${n * cell + pad * 2}`}>
        {matrix.map((row, r) => row.map((v, c) => {
          const op = v === 0 ? 0.02 : Math.max(0.08, v / max);
          const isH = hovered?.r === r && hovered?.c === c;
          return (
            <g key={`${r}-${c}`}>
              <rect x={pad + c * cell} y={pad + r * cell} width={cell - 1.5} height={cell - 1.5} rx="4"
                fill={v === 0 ? "#f8fafc" : "#2563eb"} fillOpacity={op}
                stroke={isH ? "#0f172a" : "#e2e8f0"} strokeWidth={isH ? 2 : 0.5}
                className="cursor-crosshair transition-all duration-150"
                onMouseEnter={() => setHovered({ r, c, v })} onMouseLeave={() => setHovered(null)} />
              {v > 0 && <text x={pad + c * cell + cell / 2} y={pad + r * cell + cell / 2 + 3} textAnchor="middle" fill={op > 0.5 ? "#FFF" : "#0f172a"} className="text-[8px] font-data pointer-events-none font-bold">{v}</text>}
            </g>
          );
        }))}
        {short.map((name, i) => <text key={`y${i}`} x={pad - 8} y={pad + i * cell + cell / 2 + 3} textAnchor="end" fill="#64748b" className="text-[9px] font-data">{name}</text>)}
        {short.map((name, i) => <text key={`x${i}`} x={pad + i * cell + cell / 2} y={pad - 8} textAnchor="start" transform={`rotate(-50, ${pad + i * cell + cell / 2}, ${pad - 8})`} fill="#64748b" className="text-[9px] font-data">{name}</text>)}
      </svg>
      <div className="h-10 mt-2">
        {hovered ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-xs font-data bg-white border border-border px-4 py-2 rounded-xl shadow-sm">
            True: <span className="font-bold text-accent">{classes[hovered.r]}</span> → Pred: <span className="font-bold text-accent">{classes[hovered.c]}</span> = <span className="font-bold text-accent">{hovered.v}</span>
          </motion.div>
        ) : <p className="text-xs text-secondary font-data italic text-center">Hover to inspect cells</p>}
      </div>
    </div>
  );
}
