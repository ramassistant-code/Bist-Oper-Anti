import { getDashboardDeliverables, seedSampleDeliverablesIfEmpty } from "@/lib/services/deliverables";
import {
  Film,
  ExternalLink,
  PlaySquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  FolderOpen,
} from "lucide-react";

export const revalidate = 0;

export default async function DeliverablesPage() {
  await seedSampleDeliverablesIfEmpty();
  const deliverables = await getDashboardDeliverables();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Film className="w-6 h-6 text-amber-400" />
          <span>ניהול תוצרים מול לקוחות (Deliverables Hub)</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          מעקב מדויק אחר כל סרטון רילס, פרק פודקאסט וסשן סטילס – כולל סבבי תיקונים וקישורי עבודה
        </p>
      </div>

      {/* Deliverables Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div
              key={item.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-700 transition"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-amber-400">{item.deliverableNumber}</span>
                  <h3 className="font-bold text-white text-sm mt-0.5">{item.name}</h3>
                  <p className="text-[11px] text-slate-400">{item.parentProductName}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${statusClass}`}>
                  {item.status}
                </span>
              </div>

              {/* Customer & Staff Info */}
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">לקוח:</span>
                  <span className="font-semibold text-white">{item.customerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">איש צוות מטפל:</span>
                  <span className="text-slate-300 font-medium">
                    {item.assignedStaffName || "לא הוקצה"} ({item.assignedStaffRole || "צוות"})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">יעד אספקה:</span>
                  <span className="font-mono text-slate-300">{item.dueDate || "ללא יעד"}</span>
                </div>
              </div>

              {/* Revision Rounds Badge */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400">סבב תיקונים:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">
                    סבב {item.currentRevisionNumber ?? 1} מתוך {item.maxRevisionsAllowed ?? 2}
                  </span>
                  {(item.currentRevisionNumber ?? 1) >= (item.maxRevisionsAllowed ?? 2) && (
                    <span className="text-[10px] bg-rose-950 text-rose-400 border border-rose-800 px-1.5 py-0.5 rounded">
                      סבב אחרון
                    </span>
                  )}
                </div>
              </div>

              {/* Client Feedback or Staff Notes */}
              {item.clientFeedback && (
                <div className="p-3 bg-amber-950/20 border border-amber-800/30 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>משוב לקוח לתיקון:</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{item.clientFeedback}</p>
                </div>
              )}

              {item.staffNotes && !item.clientFeedback && (
                <div className="p-3 bg-slate-800/20 border border-slate-800 rounded-xl text-xs text-slate-400 text-[11px]">
                  <strong>הערת צוות:</strong> {item.staffNotes}
                </div>
              )}

              {/* Action Links */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {item.rawFootageUrl && (
                    <a
                      href={item.rawFootageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-slate-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg transition"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                      <span>גלם</span>
                    </a>
                  )}

                  {item.draftPreviewUrl && (
                    <a
                      href={item.draftPreviewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-purple-300 bg-purple-950/50 hover:bg-purple-900/50 border border-purple-800/40 px-2.5 py-1.5 rounded-lg transition"
                    >
                      <PlaySquare className="w-3.5 h-3.5 text-purple-400" />
                      <span>טיוטת צפייה</span>
                    </a>
                  )}
                </div>

                <span className="text-[10px] text-slate-500 font-mono">
                  {item.dealNumber}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
