"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusCircle, Zap, ShieldCheck } from "lucide-react";

export function Topbar() {
  const pathname = usePathname();

  if (pathname.startsWith("/sign")) {
    return null;
  }

  return (
    <header className="h-14 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-8 sticky top-0 z-30 mr-64">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>חיבור Supabase CRM פעיל (קריאה בלבד)</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/quotes/new?mode=direct"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>מכירה ישירה</span>
        </Link>
        <Link
          href="/quotes/new"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-sm transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>הצעת מחיר</span>
        </Link>
      </div>
    </header>
  );
}
