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
  Zap,
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
      badge: null,
    },
    {
      title: "מכירה ישירה",
      href: "/quotes/new?mode=direct",
      icon: Zap,
      badge: "מהיר",
    },
    {
      title: "מרכז תוצרים והפקה",
      href: "/deliverables",
      icon: Film,
      badge: null,
    },
    {
      title: "ניהול קטלוג ועץ מוצר",
      href: "/catalog",
      icon: Package,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-l border-slate-800/80 flex flex-col h-screen fixed right-0 top-0 z-40 select-none backdrop-blur-md">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-lg shadow-sm">
            B
          </div>
          <div>
            <h1 className="font-semibold text-sm text-slate-100 tracking-wide flex items-center gap-1.5">
              BIST <span className="text-amber-400 font-bold">OPERATIONS</span>
            </h1>
            <p className="text-[11px] text-slate-400">ניהול סטודיו, הצעות ותוצרים</p>
          </div>
        </div>

        {/* Live Call Maker Pill - Subtle */}
        <div className="mt-3.5 px-2.5 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-lg flex items-center justify-between text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="font-medium">Call Maker CRM</span>
          </div>
          <span className="text-[10px] text-slate-400">קריאה בלבד</span>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="p-3.5 space-y-2">
        <Link
          href="/quotes/new"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>הצעת מחיר חדשה</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-medium text-slate-400 px-2 py-1">תפריט ראשי</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? "bg-slate-800 text-slate-100 border border-slate-700/80 shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-950/40 text-xs space-y-2.5">
        <div className="flex items-center justify-between text-slate-400 text-[11px]">
          <div className="flex items-center gap-1.5">
            <Database className="w-3 h-3 text-slate-400" />
            <span>מסד נתונים מקומי</span>
          </div>
          <span className="text-slate-300 font-mono text-[10px]">SQLite</span>
        </div>

        <div className="flex items-center gap-2.5 pt-1 border-t border-slate-800/40">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-xs">
            רם
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-200 font-medium text-xs truncate">רם שחר</p>
            <p className="text-[10px] text-slate-400 truncate">מנהל סטודיו ומפיק</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
