import Link from "next/link";
import { getQuotesList } from "@/lib/services/quotes";
import {
  FileSpreadsheet,
  PlusCircle,
  ExternalLink,
  Zap,
} from "lucide-react";

export const revalidate = 0;

export default async function QuotesListPage() {
  const quotes = await getQuotesList();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            <span>ניהול הצעות מחיר וסנאפשוטים</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            הצעות מחיר מוקפאות בסנאפשוטים מקוריים עם קישורי חתימה דיגיטלית
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/quotes/new?mode=direct"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>מכירה ישירה</span>
          </Link>
          <Link
            href="/quotes/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>הצעת מחיר חדשה</span>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
        {quotes.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <p>עדיין לא נוצרו הצעות מחיר במערכת.</p>
            <Link
              href="/quotes/new"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
            >
              <span>צור הצעה ראשונה</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-800/50 text-slate-400 border-b border-slate-800 font-medium text-[11px]">
                  <th className="py-3 px-3.5">מספר הצעה</th>
                  <th className="py-3 px-3.5">שם לקוח / חברה</th>
                  <th className="py-3 px-3.5">תאריך</th>
                  <th className="py-3 px-3.5">סכום כולל מע״מ</th>
                  <th className="py-3 px-3.5">סטטוס</th>
                  <th className="py-3 px-3.5">גרסה</th>
                  <th className="py-3 px-3.5 text-center">קישור חתימה</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {quotes.map((q) => {
                  const party = q.version?.party;
                  const totals = q.version?.totals;
                  const signingToken = q.version?.signingToken;

                  return (
                    <tr key={q.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3.5 font-mono font-medium text-slate-300 text-xs">
                        {q.quoteNumber}
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-medium text-slate-200">
                          {party?.name || "ללא שם"}
                        </div>
                        {party?.companyName && party.companyName !== party.name && (
                          <div className="text-[10px] text-slate-400">{party.companyName}</div>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-slate-400 font-mono text-[11px]">
                        {new Date(q.createdAt).toLocaleDateString("he-IL")}
                      </td>
                      <td className="py-3 px-3.5 font-mono font-medium text-slate-200">
                        {totals?.totalWithVat ? `₪${totals.totalWithVat.toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-400 font-mono text-[11px]">
                        v{q.version?.versionNumber || 1}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        {signingToken ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-800/80 text-slate-300 rounded border border-slate-700 text-[11px]">
                            <span className="font-mono text-[10px] text-slate-400">/sign/...</span>
                            <a
                              href={`/sign/${signingToken}`}
                              target="_blank"
                              rel="noreferrer"
                              title="דף חתימה דיגיטלית"
                              className="text-amber-400 hover:text-amber-300"
                            >
                              <ExternalLink className="w-3 h-3" />
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
