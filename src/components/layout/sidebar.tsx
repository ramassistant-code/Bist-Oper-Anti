"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Film,
  Package,
  PlusCircle,
  Database,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  if (pathname.startsWith("/sign")) {
    return null;
  }

  const navItems = [
    {
      title: "לוח בקרה ראשי",
      href: "/",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      title: "הצעות מחיר",
      href: "/quotes",
      icon: FileSpreadsheet,
      badge: "טיוטות וגרסאות",
    },
    {
      title: "הפקה ותוצרים",
      href: "/deliverables",
      icon: Film,
      badge: "שלבי עריכה",
    },
    {
      title: "קטלוג ועץ מוצר (BOM)",
      href: "/catalog",
      icon: Package,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-l border-slate-800 flex flex-col h-screen fixed right-0 top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-amber-500/20">
            B
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-wide flex items-center gap-1.5">
              BIST <span className="text-amber-400 font-extrabold">OPERATIONS</span>
            </h1>
            <p className="text-xs text-slate-400">ניהול סטודיו, הצעות ותוצרים</p>
          </div>
        </div>

        {/* Live Call Maker Pill */}
        <div className="mt-4 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between text-xs text-emerald-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold">Call Maker CRM</span>
          </div>
          <span className="text-[10px] bg-emerald-950/60 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
            קריאה בלבד
          </span>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="p-4">
        <Link
          href="/quotes/new"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>הצעת מחיר חדשה</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-semibold text-slate-400 px-3 py-1">ניווט במערכת</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-slate-800 text-amber-400 shadow-sm border border-slate-700/50"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700/60">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-xs space-y-3">
        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>מסד נתונים</span>
          </div>
          <span className="text-cyan-400 font-mono text-[11px]">SQLite (Local)</span>
        </div>

        <div className="flex items-center gap-3 pt-1 border-t border-slate-800/60">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-xs">
            רם
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-xs truncate">רם שחר</p>
            <p className="text-[11px] text-slate-400 truncate">מנהל סטודיו ומפיק</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
