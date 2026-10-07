import { getDashboardDeliverables, seedSampleDeliverablesIfEmpty } from "@/lib/services/deliverables";
import {
  Film,
  ExternalLink,
  PlaySquare,
  AlertCircle,
  FolderOpen,
} from "lucide-react";

export const revalidate = 0;

export default async function DeliverablesPage() {
  await seedSampleDeliverablesIfEmpty();
  const deliverables = await getDashboardDeliverables();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4">
        <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <Film className="w-5 h-5 text-amber-400" />
          <span>מרכז ניהול תוצרים ומסירות (Deliverables Hub)</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          מעקב אחר כל תוצר ספציפי – סרטוני רילס, פרקי פודקאסט, סבבי תיקונים וקישורי עבודה
        </p>
      </div>

      {/* Deliverables Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deliverables.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 shadow-sm space-y-3 hover:border-slate-700 transition"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-[11px] text-slate-400">{item.deliverableNumber}</span>
                <h3 className="font-semibold text-slate-100 text-xs mt-0.5">{item.name}</h3>
                <p className="text-[10px] text-slate-400">{item.parentProductName}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {item.status}
              </span>
            </div>

            {/* Customer & Staff Info */}
            <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/60 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">לקוח:</span>
                <span className="font-medium text-slate-200 text-[11px]">{item.customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">מטפל:</span>
                <span className="text-slate-300 text-[11px]">
                  {item.assignedStaffName || "לא הוקצה"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">יעד:</span>
                <span className="font-mono text-slate-300 text-[11px]">{item.dueDate || "—"}</span>
              </div>
            </div>

            {/* Revision Rounds Badge */}
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950/40 rounded-lg border border-slate-800/40 text-[11px]">
              <span className="text-slate-400">סבב תיקונים:</span>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="font-semibold text-slate-200">
                  {item.currentRevisionNumber ?? 1} / {item.maxRevisionsAllowed ?? 2}
                </span>
                {(item.currentRevisionNumber ?? 1) >= (item.maxRevisionsAllowed ?? 2) && (
                  <span className="text-[9px] text-amber-400 bg-amber-950/40 border border-amber-800/40 px-1 rounded">
                    סבב אחרון
                  </span>
                )}
              </div>
            </div>

            {/* Client Feedback or Staff Notes */}
            {item.clientFeedback && (
              <div className="p-2.5 bg-amber-950/10 border border-amber-900/30 rounded-lg text-xs space-y-0.5">
                <div className="flex items-center gap-1 text-amber-400/90 font-medium text-[10px]">
                  <AlertCircle className="w-3 h-3" />
                  <span>משוב לקוח:</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{item.clientFeedback}</p>
              </div>
            )}

            {item.staffNotes && !item.clientFeedback && (
              <div className="p-2 bg-slate-950/40 border border-slate-800/60 rounded-lg text-[10px] text-slate-400">
                <strong className="text-slate-300">הערת צוות:</strong> {item.staffNotes}
              </div>
            )}

            {/* Action Links */}
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {item.rawFootageUrl && (
                  <a
                    href={item.rawFootageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-slate-300 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition"
                  >
                    <FolderOpen className="w-3 h-3 text-slate-400" />
                    <span>חומרי גלם</span>
                  </a>
                )}

                {item.draftPreviewUrl && (
                  <a
                    href={item.draftPreviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-slate-300 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition"
                  >
                    <PlaySquare className="w-3 h-3 text-slate-400" />
                    <span>טיוטת צפייה</span>
                  </a>
                )}
              </div>

              <span className="text-[10px] text-slate-500 font-mono">
                {item.dealNumber}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
