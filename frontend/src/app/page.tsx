import { Bell, Beaker, Activity, CheckCircle2, RefreshCw, Plus } from "lucide-react";

export default function OverviewPage() {
  return (
    <div className="max-w-[1100px] mx-auto p-12 space-y-10 pb-20">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <p className="text-[10px] font-extrabold text-secondary tracking-[0.2em] uppercase">
            Northstar Lab / 08 FEB 2025
          </p>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Overview</h1>
        </div>
        <div className="flex items-center gap-5">
          <button className="text-secondary hover:text-primary transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center text-sm font-extrabold shadow-sm">
            JL
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="banner-card p-10 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-xl">
          <p className="text-[10px] font-extrabold text-primary tracking-[0.15em] uppercase mb-4">
            Good morning, Dr. Lee
          </p>
          <h2 className="text-[2.5rem] font-extrabold text-foreground tracking-tight leading-tight mb-3">
            Immune health, <span className="text-primary">made visible.</span>
          </h2>
          <p className="text-base text-primary/80 font-medium max-w-md">
            Track your lab protocols and review the latest patient immune assay activity.
          </p>
        </div>
        
        {/* Decorative graphic right */}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-6 opacity-30">
          <Beaker className="w-24 h-24 text-primary" strokeWidth={1} />
          <span className="text-sm font-mono font-bold text-primary tracking-[0.2em]">QI / 01</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="ehr-card p-6 flex flex-col justify-between min-h-[160px]">
          <div className="flex items-start justify-between">
            <span className="text-sm font-bold text-secondary">Assays logged</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Beaker className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-foreground tracking-tight">5</p>
            <p className="text-[11px] font-medium text-secondary mt-1">Across this workspace</p>
          </div>
        </div>

        <div className="ehr-card p-6 flex flex-col justify-between min-h-[160px]">
          <div className="flex items-start justify-between">
            <span className="text-sm font-bold text-secondary">Latest activity</span>
            <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-foreground tracking-tight">Active</p>
            <p className="text-[11px] font-medium text-secondary mt-1">Aug 27, 11:23 AM</p>
          </div>
        </div>

        <div className="ehr-card p-6 flex flex-col justify-between min-h-[160px]">
          <div className="flex items-start justify-between">
            <span className="text-sm font-bold text-secondary">Protocol status</span>
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-foreground tracking-tight">100%</p>
            <p className="text-[11px] font-medium text-secondary mt-1">Systems operational</p>
          </div>
        </div>
      </div>

      {/* Feed Section */}
      <div className="pt-6">
        <p className="text-[11px] font-extrabold text-secondary tracking-[0.2em] uppercase mb-5">
          Live Workspace Feed
        </p>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-2xl font-extrabold text-foreground tracking-tight">Recent assay activity</h3>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-primary hover:bg-primary-light rounded-xl transition-colors">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Log activity
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="ehr-card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-secondary tracking-[0.15em] uppercase">Activity</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary tracking-[0.15em] uppercase text-right">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary tracking-[0.15em] uppercase text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-foreground">Final validation record</p>
                  <p className="text-xs text-secondary mt-1">Quantum pipeline check for Subject #001</p>
                </td>
                <td className="px-6 py-5 text-xs font-mono font-medium text-secondary text-right">Today, 11:23 AM</td>
                <td className="px-6 py-5 text-right">
                  <span className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Completed
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-foreground">Initial feature extraction</p>
                  <p className="text-xs text-secondary mt-1">Biomarker scaling via MinMaxScaler</p>
                </td>
                <td className="px-6 py-5 text-xs font-mono font-medium text-secondary text-right">Today, 11:20 AM</td>
                <td className="px-6 py-5 text-right">
                  <span className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Completed
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
