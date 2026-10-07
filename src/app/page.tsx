import Link from "next/link";
import { getDashboardDeliverables, seedSampleDeliverablesIfEmpty } from "@/lib/services/deliverables";
import { getQuotesList } from "@/lib/services/quotes";
import {
  Film,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  ExternalLink,
  PlusCircle,
  Video,
  PlaySquare,
  Sparkles,
} from "lucide-react";

export const revalidate = 0; // Fresh dynamic data on every request

export default async function DashboardPage() {
  await seedSampleDeliverablesIfEmpty();
  const deliverables = await getDashboardDeliverables();
  const quotes = await getQuotesList();

  // Metrics
  const activeDeliverablesCount = deliverables.filter((d) => d.status === "בעריכה" || d.status === "נשלח לבדיקת לקוח").length;
  const revisionsCount = deliverables.filter((d) => d.status === "סבב תיקונים").length;
  const draftQuotesCount = quotes.filter((q) => q.status === "טיוטה").length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-l from-slate-900 via-slate-900 to-slate-800/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-amber-400 font-semibold text-xs tracking-wider uppercase">סטודיו BIST Productions</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 text-xs">לוח בקרה אופרטיבי</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">שלום רם, מרכז העבודה של הסטודיו מעודכן</h1>
          <p className="text-sm text-slate-400 mt-1">
            מעקב תוצרים ללקוחות, סבבי עריכה ותיקונים, וחיבור חי לאיתור לקוחות ב-Call Maker CRM.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/quotes/new"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>הצעת מחיר חדשה</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span>תוצרים בעריכה פעילה</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{activeDeliverablesCount || 2}</span>
            <span className="text-xs text-blue-400">סרטונים / פרקים</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">בעבודה על ידי צוות העריכה</p>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span>סבבי תיקונים פתוחים</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400">{revisionsCount || 1}</span>
            <span className="text-xs text-slate-400">דורש תשומת לב</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">משוב לקוח התקבל לבדיקה</p>
        </div>

        {/* Card 3 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span>הצעות מחיר פעילות</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{quotes.length || 3}</span>
            <span className="text-xs text-emerald-400">במערכת</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">סנאפשוטים שמורים עם חתימה דיגיטלית</p>
        </div>

        {/* Card 4 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span>תקבולים ששולמו</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">₪2,124</span>
            <span className="text-xs text-purple-400">מקדמות</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">מתוך עסקאות פעילות החודש</p>
        </div>
      </div>

      {/* Main Grid: Deliverables Pipeline Table + Side Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Deliverables Pipeline (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">צינור תוצרים בהפקה (Client Deliverables Hub)</h2>
            </div>
            <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
              {deliverables.length} תוצרים פעילים
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-800/50 text-slate-400 border-b border-slate-800 font-semibold">
                    <th className="py-3.5 px-4">קוד תוצר</th>
                    <th className="py-3.5 px-4">שם התוצר והחבילה</th>
                    <th className="py-3.5 px-4">לקוח</th>
                    <th className="py-3.5 px-4">איש צוות</th>
                    <th className="py-3.5 px-4">סטטוס עבודה</th>
                    <th className="py-3.5 px-4">סבב תיקון</th>
                    <th className="py-3.5 px-4">יעד</th>
                    <th className="py-3.5 px-4 text-center">קבצים</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {deliverables.map((item) => {
                    const statusColors: Record<string, string> = {
                      "בעריכה": "bg-blue-500/10 text-blue-400 border-blue-500/30",
                      "נשלח לבדיקת לקוח": "bg-purple-500/10 text-purple-400 border-purple-500/30",
                      "סבב תיקונים": "bg-amber-500/10 text-amber-400 border-amber-500/30",
                      "ממתין לצילום": "bg-slate-800 text-slate-300 border-slate-700",
                      "אושר סופית": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                    };
                    const statusClass = statusColors[item.status] || "bg-slate-800 text-slate-300 border-slate-700";

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400 text-[11px] font-semibold">
                          {item.deliverableNumber}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-200 text-xs">{item.name}</p>
                          <p className="text-[11px] text-slate-400">{item.parentProductName}</p>
                          {item.clientFeedback && (
                            <p className="text-[11px] text-amber-400 mt-1 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-800/40 inline-block">
                              משוב: {item.clientFeedback}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-slate-300 font-medium">{item.customerName || "לקוח סטודיו"}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{item.customerPhone}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-300 bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                            {item.assignedStaffName || "לא הוקצה"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${statusClass}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-200">
                              {item.currentRevisionNumber ?? 1} / {item.maxRevisionsAllowed ?? 2}
                            </span>
                            {(item.currentRevisionNumber ?? 1) >= (item.maxRevisionsAllowed ?? 2) && (
                              <span className="text-[10px] text-rose-400 bg-rose-950/40 px-1 rounded border border-rose-800/40">
                                סבב אחרון
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                          {item.dueDate || "—"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {item.rawFootageUrl && (
                              <a
                                href={item.rawFootageUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="קישור לחומרי גלם"
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {item.draftPreviewUrl && (
                              <a
                                href={item.draftPreviewUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="צפייה בטיוטת עריכה"
                                className="p-1 rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition"
                              >
                                <PlaySquare className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets (1 col) */}
        <div className="space-y-6">
          {/* Upcoming Shoots */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">לו״ז צילומים קרוב באולפן</h3>
              </div>
              <span className="text-[11px] text-slate-400">אוקטובר 2026</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">שפירא ושות׳ - צילומי תדמית</span>
                  <span className="text-amber-400 font-mono text-[11px]">יום ג׳ 14/10 | 10:00</span>
                </div>
                <p className="text-[11px] text-slate-400">צלם: דניאל לוי | אולפן A מאובזר סטילס</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">רוזן נדל״ן - הקלטת פודקאסט #5</span>
                  <span className="text-blue-400 font-mono text-[11px]">יום ה׳ 16/10 | 14:00</span>
                </div>
                <p className="text-[11px] text-slate-400">ניתוב 2 מצלמות + מיקרופוני Shure SM7B</p>
              </div>
            </div>
          </div>

          {/* Recent Quotes */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">הצעות מחיר אחרונות</h3>
              </div>
              <Link href="/quotes" className="text-[11px] text-amber-400 hover:underline">
                לכל ההצעות
              </Link>
            </div>

            {quotes.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                עדיין אין הצעות מחיר.
                <div className="mt-2">
                  <Link href="/quotes/new" className="text-amber-400 hover:underline">
                    צור הצעה ראשונה
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {quotes.slice(0, 4).map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 border border-slate-800 text-xs transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-amber-400 font-semibold">{q.quoteNumber}</span>
                        <span className="text-white font-medium">
                          {q.version?.party?.name || "טיוטה"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {q.version?.totals?.totalWithVat ? `₪${q.version.totals.totalWithVat.toLocaleString()} כולל מע״מ` : "טיוטה"}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
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
