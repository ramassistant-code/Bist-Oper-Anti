import Link from "next/link";
import { getQuotesList } from "@/lib/services/quotes";
import {
  FileSpreadsheet,
  PlusCircle,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  User,
} from "lucide-react";

export const revalidate = 0;

export default async function QuotesListPage() {
  const quotes = await getQuotesList();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-amber-400" />
            <span>ניהול הצעות מחיר וסנאפשוטים</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            הצעות מחיר מוקפאות בגרסאות קבועות (Immutable Snapshots) עם קישורי חתימה דיגיטלית
          </p>
        </div>

        <Link
          href="/quotes/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition hover:scale-105 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>הצעת מחיר חדשה</span>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {quotes.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-3">
            <FileSpreadsheet className="w-8 h-8 text-slate-600 mx-auto" />
            <p>עדיין לא נוצרו הצעות מחיר במערכת המקומית.</p>
            <Link
              href="/quotes/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>צור הצעה ראשונה עכשיו</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-800/50 text-slate-400 border-b border-slate-800 font-semibold">
                  <th className="py-3.5 px-4">מספר הצעה</th>
                  <th className="py-3.5 px-4">שם לקוח / חברה</th>
                  <th className="py-3.5 px-4">תאריך הפקה</th>
                  <th className="py-3.5 px-4">סכום כולל מע״מ</th>
                  <th className="py-3.5 px-4">סטטוס</th>
                  <th className="py-3.5 px-4">גרסה</th>
                  <th className="py-3.5 px-4 text-center">קישור חתימה דיגיטלית</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {quotes.map((q) => {
                  const party = q.version?.party;
                  const totals = q.version?.totals;
                  const signingToken = q.version?.signingToken;

                  return (
                    <tr key={q.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                        {q.quoteNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">
                          {party?.name || "לקוח ללא שם"}
                        </div>
                        {party?.companyName && (
                          <div className="text-[11px] text-slate-400">{party.companyName}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(q.createdAt).toLocaleDateString("he-IL")}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                        {totals?.totalWithVat ? `₪${totals.totalWithVat.toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        v{q.version?.versionNumber || 1}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {signingToken ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 text-[11px]">
                            <span className="font-mono text-[10px] text-cyan-400">/sign/...</span>
                            <a
                              href={`/sign/${signingToken}`}
                              target="_blank"
                              rel="noreferrer"
                              title="פתח דף חתימה דיגיטלית"
                              className="text-amber-400 hover:text-amber-300"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
