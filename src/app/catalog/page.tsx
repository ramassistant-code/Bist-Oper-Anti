import { getCatalogProducts, getAllComponents } from "@/lib/services/catalog";
import { Package, Layers, Clock, FileText, CheckCircle2 } from "lucide-react";

export const revalidate = 0;

export default async function CatalogPage() {
  const [products, components] = await Promise.all([
    getCatalogProducts(),
    getAllComponents(),
  ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Package className="w-6 h-6 text-amber-400" />
          <span>קטלוג מוצרים ועץ מוצר (BOM)</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          הגדרת חבילות הסטודיו והרכבי האופרציה שלהן – כל חבילה מורכבת מרכיבי שעות, עריכה ותיקונים
        </p>
      </div>

      {/* Section 1: Studio Packages & BOM */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">חבילות ומוצרי מדף (Studio Packages)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-bold">
                      {p.productNumber}
                    </span>
                    <span className="text-xs text-slate-400">{p.category}</span>
                  </div>
                  <h3 className="font-bold text-base text-white mt-1">{p.name}</h3>
                </div>

                <div className="text-left">
                  <span className="text-lg font-extrabold text-amber-400 font-mono">
                    ₪{p.price.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    עלות ייצור: ₪{p.productionCost ? p.productionCost.toLocaleString() : 0}
                  </p>
                </div>
              </div>

              {p.quoteDescriptionDefault && (
                <p className="text-xs text-slate-400 bg-slate-800/40 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {p.quoteDescriptionDefault}
                </p>
              )}

              {/* Components Tree */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-2">הרכב החבילה (BOM Breakdown):</h4>
                <div className="space-y-1.5">
                  {p.components && p.components.length > 0 ? (
                    p.components.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-[11px]">
                            {c.defaultQuantity}×
                          </span>
                          <span className="text-white font-medium">{c.componentName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          {c.deliverableType}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">אין רכיבים מוגדרים</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Raw Operational Components */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">רכיבי אופרציה בסיסיים (Core Components)</h2>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 border-b border-slate-800 font-semibold">
                <th className="py-3 px-4">קוד רכיב</th>
                <th className="py-3 px-4">שם הרכיב</th>
                <th className="py-3 px-4">סוג תוצר</th>
                <th className="py-3 px-4">יח׳ מידה</th>
                <th className="py-3 px-4">עלות משוערת</th>
                <th className="py-3 px-4">מחיר מומלץ</th>
                <th className="py-3 px-4">הנחיות צוות ועבודה</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {components.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-mono font-bold text-amber-400 text-[11px]">
                    {c.componentNumber}
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">{c.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {c.deliverableType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{c.unitType}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">₪{c.costEstimate}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-200">₪{c.defaultPrice}</td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs truncate">
                    {c.internalNotes || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
