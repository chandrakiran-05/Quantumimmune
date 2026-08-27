"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Beaker, ClipboardList, Settings, ShieldCheck, Activity } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Immune assays", href: "/assays", icon: Beaker, badge: "5" },
    { name: "Patient Intake", href: "/intake", icon: ClipboardList },
    { name: "Workspace settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-[280px] flex flex-col h-screen border-r border-border bg-sidebar-bg flex-shrink-0">
      {/* Brand Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-[16px] text-primary leading-tight tracking-tight">QuantumImmune</h1>
            <p className="text-[9px] font-bold text-secondary tracking-widest uppercase mt-0.5">Clinical Intelligence</p>
          </div>
        </div>
      </div>

      {/* Workspace Selector */}
      <div className="px-5 mb-8 mt-2">
        <button className="w-full flex items-center justify-between px-4 py-3 bg-sidebar-bg border border-border rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-success"></div>
            <span className="text-sm font-bold text-foreground">Northstar Lab</span>
          </div>
          <span className="text-secondary text-lg leading-none">›</span>
        </button>
      </div>

      {/* Navigation */}
      <div className="px-5 flex-1 overflow-y-auto">
        <h3 className="text-[10px] font-extrabold text-secondary tracking-widest uppercase mb-3 pl-2">Workspace</h3>
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center justify-between px-3 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-primary-light text-primary"
                    : "text-secondary hover:bg-sidebar-hover hover:text-primary"
                }`}
              >
                <div className="flex items-center gap-3">
                  <link.icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </div>
                {link.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isActive ? "bg-white text-primary" : "bg-slate-100 text-secondary"}`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Profile */}
      <div className="p-5 border-t border-border mt-auto bg-sidebar-bg shrink-0">
        <div className="flex items-center gap-3 pl-2 mb-4">
          <Activity className="w-4.5 h-4.5 text-success" />
          <div>
            <p className="text-sm font-bold text-foreground leading-tight">Protocol online</p>
            <p className="text-[10px] text-secondary mt-0.5">All systems operational</p>
          </div>
        </div>
        
        <button className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center text-sm font-bold shadow-sm">
              JL
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Dr. Jordan Lee</p>
              <p className="text-[10px] text-secondary mt-0.5">Clinical researcher</p>
            </div>
          </div>
          <span className="text-secondary text-lg leading-none">›</span>
        </button>
      </div>
    </aside>
  );
}
