import Link from "next/link";
import { getDashboardDeliverables, seedSampleDeliverablesIfEmpty } from "@/lib/services/deliverables";
import { getQuotesList } from "@/lib/services/quotes";
import {
  Film,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ExternalLink,
  PlusCircle,
  Video,
  PlaySquare,
  Zap,
} from "lucide-react";

export const revalidate = 0;

export default async function DashboardPage() {
  await seedSampleDeliverablesIfEmpty();
  const deliverables = await getDashboardDeliverables();
  const quotes = await getQuotesList();

  const activeDeliverablesCount = deliverables.filter(
    (d) => d.status === "בעריכה" || d.status === "נשלח לבדיקת לקוח"
  ).length;
  const revisionsCount = deliverables.filter((d) => d.status === "סבב תיקונים").length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-amber-400 font-semibold text-xs tracking-wider uppercase">BIST PRODUCTIONS</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 text-xs">לוח בקרה אופרטיבי</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">מרכז פעילות הסטודיו וההפקה</h1>
          <p className="text-xs text-slate-400 mt-1">
            מעקב תוצרים ללקוחות, סבבי עריכה ותיקונים, וחיבור חי לאיתור לקוחות ב-CRM.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/quotes/new?mode=direct"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>מכירה ישירה</span>
          </Link>
          <Link
            href="/quotes/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>הצעת מחיר חדשה</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards - Calm, clean, restrained palette */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>תוצרים בעריכה פעילה</span>
            <Film className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100 font-mono">{activeDeliverablesCount || 2}</span>
            <span className="text-[11px] text-slate-400">סרטונים / פרקים</span>
          </div>
          <p className="text-[10px] text-slate-500">בעבודה ע״י צוות העריכה</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>סבבי תיקונים פתוחים</span>
            <AlertCircle className="w-4 h-4 text-amber-400/80" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400 font-mono">{revisionsCount || 1}</span>
            <span className="text-[11px] text-slate-400">ממתין לתיקון</span>
          </div>
          <p className="text-[10px] text-slate-500">משוב לקוח התקבל לבדיקה</p>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>הצעות מחיר במערכת</span>
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100 font-mono">{quotes.length || 3}</span>
            <span className="text-[11px] text-slate-400">הצעות וסנאפשוטים</span>
          </div>
          <p className="text-[10px] text-slate-500">עם קישורי חתימה דיגיטלית</p>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>תקבולים שנסגרו</span>
            <CheckCircle2 className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100 font-mono">₪2,124</span>
            <span className="text-[11px] text-slate-400">מקדמות</span>
          </div>
          <p className="text-[10px] text-slate-500">מתוך עסקאות פעילות החודש</p>
        </div>
      </div>

      {/* Main Grid: Deliverables Pipeline + Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deliverables Pipeline Table (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-slate-200">צינור תוצרים בהפקה (Client Deliverables Hub)</h2>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
              {deliverables.length} תוצרים
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-800/50 text-slate-400 border-b border-slate-800 font-medium text-[11px]">
                    <th className="py-3 px-3.5">קוד</th>
                    <th className="py-3 px-3.5">תוצר וחבילה</th>
                    <th className="py-3 px-3.5">לקוח</th>
                    <th className="py-3 px-3.5">איש צוות</th>
                    <th className="py-3 px-3.5">סטטוס</th>
                    <th className="py-3 px-3.5">סבב</th>
                    <th className="py-3 px-3.5 text-center">קבצים</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {deliverables.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono text-slate-400 text-[10px]">
                        {item.deliverableNumber}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <p className="font-medium text-slate-200 text-xs">{item.name}</p>
                        <p className="text-[10px] text-slate-400">{item.parentProductName}</p>
                        {item.clientFeedback && (
                          <p className="text-[10px] text-amber-400/90 mt-1 bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-900/40 inline-block">
                            משוב: {item.clientFeedback}
                          </p>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <p className="text-slate-300">{item.customerName || "לקוח סטודיו"}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{item.customerPhone}</p>
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-300 text-[11px]">
                        {item.assignedStaffName || "—"}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className="font-mono text-slate-300 text-[11px]">
                          {item.currentRevisionNumber ?? 1}/{item.maxRevisionsAllowed ?? 2}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {item.rawFootageUrl && (
                            <a
                              href={item.rawFootageUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="קישור לחומרי גלם"
                              className="p-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {item.draftPreviewUrl && (
                            <a
                              href={item.draftPreviewUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="טיוטת צפייה"
                              className="p-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200"
                            >
                              <PlaySquare className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Side Widgets (1 col) */}
        <div className="space-y-4">
          {/* Upcoming Shoots */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h3 className="font-semibold text-xs text-slate-200">לו״ז צילומים קרוב</h3>
              </div>
              <span className="text-[10px] text-slate-500">אוקטובר 2026</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-200">שפירא ושות׳ - צילומי תדמית</span>
                  <span className="text-amber-400/90 font-mono text-[10px]">14/10 | 10:00</span>
                </div>
                <p className="text-[10px] text-slate-400">צלם: דניאל לוי | אולפן A</p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-200">רוזן נדל״ן - פרק פודקאסט #5</span>
                  <span className="text-slate-400 font-mono text-[10px]">16/10 | 14:00</span>
                </div>
                <p className="text-[10px] text-slate-400">ניתוב 2 מצלמות + מיקרופונים</p>
              </div>
            </div>
          </div>

          {/* Recent Quotes */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-xs text-slate-200">הצעות מחיר אחרונות</h3>
              </div>
              <Link href="/quotes" className="text-[11px] text-amber-400 hover:underline">
                לכל ההצעות
              </Link>
            </div>

            {quotes.length === 0 ? (
              <div className="text-center py-4 text-slate-500 text-xs">אין הצעות שמורות.</div>
            ) : (
              <div className="space-y-1.5">
                {quotes.slice(0, 3).map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400 text-[11px]">{q.quoteNumber}</span>
                        <span className="text-slate-200 font-medium">
                          {q.version?.party?.name || "טיוטה"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {q.version?.totals?.totalWithVat
                          ? `₪${q.version.totals.totalWithVat.toLocaleString()}`
                          : "טיוטה"}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                      {q.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
