"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusCircle, Search, Laptop, ShieldCheck } from "lucide-react";

export function Topbar() {
  const pathname = usePathname();

  if (pathname.startsWith("/sign")) {
    return null;
  }
  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-30 mr-64">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs bg-slate-800/80 border border-slate-700/60 text-slate-300 px-3 py-1.5 rounded-lg">
          <Laptop className="w-3.5 h-3.5 text-cyan-400" />
          <span>סביבת פיתוח מקומית:</span>
          <span className="text-cyan-400 font-mono font-medium">http://localhost:3000</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>אבטחת ייצור: אין שום מגע או כתיבה ל-DB המרוחק</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/quotes/new"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>הצעה חדשה</span>
        </Link>
      </div>
    </header>
  );
}
