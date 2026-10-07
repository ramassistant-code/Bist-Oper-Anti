"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Layers,
  Clock,
  PlusCircle,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ComponentItem {
  id: string;
  componentNumber: string;
  name: string;
  deliverableType: string;
  unitType: string;
  costEstimate: number;
  defaultPrice: number;
  sopLink?: string;
  internalNotes?: string;
  quoteDescriptionDefault?: string;
  isActive: boolean;
}

interface ProductItem {
  id: string;
  productNumber: string;
  name: string;
  category: string;
  deliverableType: string;
  price: number;
  productionCost: number;
  quoteDescriptionDefault?: string;
  quoteNotesDefault?: string;
  isActive: boolean;
  components: Array<{
    id: string;
    componentId: string;
    defaultQuantity: number;
    componentName: string;
    deliverableType: string;
    unitType: string;
    costEstimate: number;
    defaultPrice: number;
    internalNotes?: string;
  }>;
}

export default function CatalogManagementPage() {
  const [activeTab, setActiveTab] = useState<"products" | "components">("products");
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form States
  const [showProductModal, setShowProductModal] = useState(false);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editingComponent, setEditingComponent] = useState<ComponentItem | null>(null);

  // New/Edit Component form fields
  const [compForm, setCompForm] = useState({
    name: "",
    deliverableType: "עריכת וידאו",
    unitType: "יחידה",
    costEstimate: 0,
    defaultPrice: 0,
    sopLink: "",
    internalNotes: "",
    quoteDescriptionDefault: "",
  });

  // New/Edit Product form fields
  const [prodForm, setProdForm] = useState({
    name: "",
    category: "חבילות סושיאל",
    deliverableType: "וידאו",
    price: 0,
    productionCost: 0,
    quoteDescriptionDefault: "",
    quoteNotesDefault: "",
    bomComponents: [] as Array<{ componentId: string; quantity: number }>,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/catalog");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setComponents(data.components || []);
      }
    } catch (e) {
      console.error("Failed to load catalog:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ── Component Handlers ───────────────────────────────────────────────────────
  const handleOpenComponentModal = (comp?: ComponentItem) => {
    if (comp) {
      setEditingComponent(comp);
      setCompForm({
        name: comp.name,
        deliverableType: comp.deliverableType,
        unitType: comp.unitType || "יחידה",
        costEstimate: comp.costEstimate || 0,
        defaultPrice: comp.defaultPrice || 0,
        sopLink: comp.sopLink || "",
        internalNotes: comp.internalNotes || "",
        quoteDescriptionDefault: comp.quoteDescriptionDefault || "",
      });
    } else {
      setEditingComponent(null);
      setCompForm({
        name: "",
        deliverableType: "עריכת וידאו",
        unitType: "יחידה",
        costEstimate: 0,
        defaultPrice: 0,
        sopLink: "",
        internalNotes: "",
        quoteDescriptionDefault: "",
      });
    }
    setShowComponentModal(true);
  };

  const handleSaveComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compForm.name.trim()) return alert("נא להזין שם רכיב");

    try {
      const url = "/api/catalog/components";
      const method = editingComponent ? "PUT" : "POST";
      const body = editingComponent ? { id: editingComponent.id, ...compForm } : compForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setShowComponentModal(false);
        loadData();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err: any) {
      alert("שגיאה: " + err.message);
    }
  };

  const handleDeleteComponent = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק רכיב זה?")) return;
    try {
      const res = await fetch(`/api/catalog/components?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        loadData();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err: any) {
      alert("שגיאה: " + err.message);
    }
  };

  // ── Product Handlers ─────────────────────────────────────────────────────────
  const handleOpenProductModal = (prod?: ProductItem) => {
    if (prod) {
      setEditingProduct(prod);
      setProdForm({
        name: prod.name,
        category: prod.category || "חבילות סושיאל",
        deliverableType: prod.deliverableType || "וידאו",
        price: prod.price || 0,
        productionCost: prod.productionCost || 0,
        quoteDescriptionDefault: prod.quoteDescriptionDefault || "",
        quoteNotesDefault: prod.quoteNotesDefault || "",
        bomComponents: (prod.components || []).map((c) => ({
          componentId: c.componentId,
          quantity: c.defaultQuantity || 1,
        })),
      });
    } else {
      setEditingProduct(null);
      setProdForm({
        name: "",
        category: "חבילות סושיאל",
        deliverableType: "וידאו",
        price: 0,
        productionCost: 0,
        quoteDescriptionDefault: "",
        quoteNotesDefault: "",
        bomComponents: [],
      });
    }
    setShowProductModal(true);
  };

  const handleAddBomItem = (componentId: string) => {
    if (!componentId) return;
    const exists = prodForm.bomComponents.some((c) => c.componentId === componentId);
    if (exists) {
      setProdForm({
        ...prodForm,
        bomComponents: prodForm.bomComponents.map((c) =>
          c.componentId === componentId ? { ...c, quantity: c.quantity + 1 } : c
        ),
      });
    } else {
      setProdForm({
        ...prodForm,
        bomComponents: [...prodForm.bomComponents, { componentId, quantity: 1 }],
      });
    }
  };

  const handleRemoveBomItem = (componentId: string) => {
    setProdForm({
      ...prodForm,
      bomComponents: prodForm.bomComponents.filter((c) => c.componentId !== componentId),
    });
  };

  const handleUpdateBomQty = (componentId: string, quantity: number) => {
    setProdForm({
      ...prodForm,
      bomComponents: prodForm.bomComponents.map((c) =>
        c.componentId === componentId ? { ...c, quantity: Math.max(1, quantity) } : c
      ),
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name.trim()) return alert("נא להזין שם מוצר");

    try {
      const url = "/api/catalog/products";
      const method = editingProduct ? "PUT" : "POST";
      const body = editingProduct ? { id: editingProduct.id, ...prodForm } : prodForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setShowProductModal(false);
        loadData();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err: any) {
      alert("שגיאה: " + err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק מוצר זה מהקטלוג?")) return;
    try {
      const res = await fetch(`/api/catalog/products?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        loadData();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err: any) {
      alert("שגיאה: " + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <span>ניהול קטלוג מוצרים ועץ מוצר (BOM)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            הגדרת חבילות הסטודיו, פירוק לרכיבי אופרציה, מחירים ועלויות ייצור
          </p>
        </div>

        {/* Tab & Action Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === "products"
                  ? "bg-slate-800 text-slate-100 border border-slate-700/60"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              חבילות ומוצרים ({products.length})
            </button>
            <button
              onClick={() => setActiveTab("components")}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === "components"
                  ? "bg-slate-800 text-slate-100 border border-slate-700/60"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              רכיבי אופרציה ({components.length})
            </button>
          </div>

          {activeTab === "products" ? (
            <button
              onClick={() => handleOpenProductModal()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>מוצר חדש</span>
            </button>
          ) : (
            <button
              onClick={() => handleOpenComponentModal()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>רכיב חדש</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: PRODUCTS & BOM */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-4 hover:border-slate-700 transition"
              >
                {/* Product Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                        {p.productNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">{p.category}</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-100 mt-1">{p.name}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenProductModal(p)}
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                      title="ערוך מוצר ועץ רכיבים"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-1.5 text-rose-400/70 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                      title="מחק מוצר"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Price & Cost */}
                <div className="flex items-baseline justify-between text-xs border-y border-slate-800/60 py-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-400">מחיר ללקוח:</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      ₪{p.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5 text-slate-400">
                    <span>עלות ייצור פנימית:</span>
                    <span className="font-mono text-slate-300">
                      ₪{p.productionCost ? p.productionCost.toLocaleString() : 0}
                    </span>
                  </div>
                </div>

                {/* BOM Items */}
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
                    עץ מוצר ({p.components?.length || 0} רכיבי אופרציה):
                  </span>
                  {p.components && p.components.length > 0 ? (
                    <div className="space-y-1">
                      {p.components.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                              {c.defaultQuantity}×
                            </span>
                            <span className="text-slate-200">{c.componentName}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{c.deliverableType}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-slate-950/40 border border-dashed border-slate-800 text-[11px] text-slate-500 text-center">
                      לא הוגדרו רכיבים לעץ מוצר זה
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: COMPONENTS */}
      {activeTab === "components" && (
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 border-b border-slate-800 font-medium">
                <th className="py-3 px-4">קוד רכיב</th>
                <th className="py-3 px-4">שם הרכיב</th>
                <th className="py-3 px-4">סוג תוצר</th>
                <th className="py-3 px-4">יח׳ מידה</th>
                <th className="py-3 px-4">עלות משוערת</th>
                <th className="py-3 px-4">מחיר מומלץ</th>
                <th className="py-3 px-4">הנחיות עבודה / הערות פנימיות</th>
                <th className="py-3 px-4 text-center">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {components.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-mono font-medium text-slate-400 text-[11px]">
                    {c.componentNumber}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-100">{c.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {c.deliverableType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{c.unitType}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">₪{c.costEstimate}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-200">₪{c.defaultPrice}</td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs truncate">
                    {c.internalNotes || "—"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenComponentModal(c)}
                        className="p-1 text-slate-400 hover:text-slate-200 transition"
                        title="ערוך רכיב"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteComponent(c.id)}
                        className="p-1 text-rose-400/70 hover:text-rose-400 transition"
                        title="מחק רכיב"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* COMPONENT MODAL (Create / Edit) */}
      {showComponentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100">
                {editingComponent ? `עריכת רכיב: ${editingComponent.name}` : "הוספת רכיב אופרציה חדש"}
              </h3>
              <button
                onClick={() => setShowComponentModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveComponent} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">שם הרכיב</label>
                <input
                  type="text"
                  required
                  value={compForm.name}
                  onChange={(e) => setCompForm({ ...compForm, name: e.target.value })}
                  placeholder="למשל: עריכת רילס, שעת אולפן..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">סוג תוצר</label>
                  <select
                    value={compForm.deliverableType}
                    onChange={(e) => setCompForm({ ...compForm, deliverableType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="עריכת וידאו">עריכת וידאו</option>
                    <option value="שעות אולפן">שעות אולפן</option>
                    <option value="סטילס">סטילס</option>
                    <option value="סאונד">סאונד</option>
                    <option value="גרפיקה">גרפיקה</option>
                    <option value="תיקונים">תיקונים</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">יחידת מידה</label>
                  <input
                    type="text"
                    value={compForm.unitType}
                    onChange={(e) => setCompForm({ ...compForm, unitType: e.target.value })}
                    placeholder="שעות / יחידות / סבבים"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">עלות ייצור פנימית (₪)</label>
                  <input
                    type="number"
                    value={compForm.costEstimate}
                    onChange={(e) => setCompForm({ ...compForm, costEstimate: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">מחיר מומלץ ללקוח (₪)</label>
                  <input
                    type="number"
                    value={compForm.defaultPrice}
                    onChange={(e) => setCompForm({ ...compForm, defaultPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">הנחיות עבודה ו-SOP (הוראות לצוות)</label>
                <textarea
                  rows={2}
                  value={compForm.internalNotes}
                  onChange={(e) => setCompForm({ ...compForm, internalNotes: e.target.value })}
                  placeholder="הוראות לעורך או לצלם..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowComponentModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {editingComponent ? "עדכן רכיב" : "שמור רכיב"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL (Create / Edit with BOM Builder) */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100">
                {editingProduct ? `עריכת מוצר: ${editingProduct.name}` : "הוספת מוצר / חבילה חדשה לקטלוג"}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">שם המוצר / החבילה</label>
                <input
                  type="text"
                  required
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  placeholder="למשל: חבילת 5 רילס, יום צילום תדמית..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">קטגוריה</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="חבילות סושיאל">חבילות סושיאל</option>
                    <option value="פודקאסטים">פודקאסטים</option>
                    <option value="תדמית">תדמית</option>
                    <option value="שירותי אולפן">שירותי אולפן</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">סוג תוצר עיקרי</label>
                  <select
                    value={prodForm.deliverableType}
                    onChange={(e) => setProdForm({ ...prodForm, deliverableType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="וידאו">וידאו</option>
                    <option value="סטילס">סטילס</option>
                    <option value="סאונד">סאונד</option>
                    <option value="שעות אולפן">שעות אולפן</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">מחיר מכירה ללקוח (₪)</label>
                  <input
                    type="number"
                    required
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">עלות ייצור משוערת (₪)</label>
                  <input
                    type="number"
                    value={prodForm.productionCost}
                    onChange={(e) => setProdForm({ ...prodForm, productionCost: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">תיאור ברירת מחדל בהצעת מחיר</label>
                <textarea
                  rows={2}
                  value={prodForm.quoteDescriptionDefault}
                  onChange={(e) => setProdForm({ ...prodForm, quoteDescriptionDefault: e.target.value })}
                  placeholder="פירוט מה החבילה כוללת..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              {/* BOM Composition Builder */}
              <div className="border-t border-slate-800 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300 text-[11px]">
                    הרכבת עץ מוצר (BOM) - אילו רכיבים כלולים בחבילה?
                  </span>
                  <select
                    onChange={(e) => {
                      handleAddBomItem(e.target.value);
                      e.target.value = "";
                    }}
                    defaultValue=""
                    className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-amber-400"
                  >
                    <option value="" disabled>
                      + הוסף רכיב לחבילה...
                    </option>
                    {components.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.deliverableType})
                      </option>
                    ))}
                  </select>
                </div>

                {prodForm.bomComponents.length === 0 ? (
                  <div className="p-3 bg-slate-950/60 rounded-lg border border-dashed border-slate-800 text-center text-slate-500 text-[11px]">
                    לא נבחרו רכיבים. בחר רכיב מהתפריט כדי להגדיר את עץ המוצר.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {prodForm.bomComponents.map((item) => {
                      const comp = components.find((c) => c.id === item.componentId);
                      return (
                        <div
                          key={item.componentId}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                        >
                          <span className="text-slate-200">{comp?.name || "רכיב"}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-[11px]">כמות:</span>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateBomQty(item.componentId, parseInt(e.target.value) || 1)}
                              className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center text-slate-100"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveBomItem(item.componentId)}
                              className="text-rose-400/80 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {editingProduct ? "עדכן מוצר ועץ BOM" : "שמור מוצר חדש"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
