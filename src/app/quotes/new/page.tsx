"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  User,
  Search,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Percent,
  Layers,
  ArrowRight,
  Send,
  Save,
  Copy,
  ExternalLink,
} from "lucide-react";

interface ProductBomComponent {
  id: string;
  componentId: string;
  defaultQuantity: number;
  sortOrder: number;
  componentName: string;
  deliverableType: string;
  unitType: string;
  costEstimate: number;
  defaultPrice: number;
  internalNotes?: string;
  quoteDescriptionDefault?: string;
}

interface ProductItem {
  id: string;
  productNumber: string;
  name: string;
  category: string;
  price: number;
  productionCost: number;
  quoteDescriptionDefault?: string;
  quoteNotesDefault?: string;
  components: ProductBomComponent[];
}

interface SelectedQuoteItem {
  cartId: string;
  productId: string;
  productNumber: string;
  name: string;
  quantity: number;
  unitPrice: number;
  notes: {
    clientNotes: string;
    opsNotes: string;
    priceReason: string;
  };
  components: Array<{
    id: string;
    componentId: string;
    name: string;
    deliverableType: string;
    unitType: string;
    quantity: number;
    internalNotes: string;
    clientNotes: string;
  }>;
}

interface CrmCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  companyName: string;
  vatNumber: string;
  address: string;
  source: string;
}

export default function NewQuotePage() {
  const router = useRouter();
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [availableProducts, setAvailableProducts] = useState<ProductItem[]>([]);

  // CRM Search state
  const [crmQuery, setCrmQuery] = useState("");
  const [crmResults, setCrmResults] = useState<CrmCustomer[]>([]);
  const [isSearchingCrm, setIsSearchingCrm] = useState(false);
  const [showCrmDropdown, setShowCrmDropdown] = useState(false);

  // Selected Customer
  const [customer, setCustomer] = useState<{
    id?: string;
    name: string;
    phone: string;
    email: string;
    companyName: string;
    vatNumber: string;
    address: string;
    source: string;
  }>({
    name: "",
    phone: "",
    email: "",
    companyName: "",
    vatNumber: "",
    address: "",
    source: "",
  });

  // Items basket
  const [items, setItems] = useState<SelectedQuoteItem[]>([]);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Financials
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [advancePercent, setAdvancePercent] = useState<number>(50);
  const [validityDays, setValidityDays] = useState<number>(14);
  const [installmentsCount, setInstallmentsCount] = useState<number>(1);
  const [paymentTerms, setPaymentTerms] = useState<string>("50% מקדמה בהזמנה, 50% בגמר הפקה");

  // 4 Tiers of Notes
  const [clientNotes, setClientNotes] = useState<string>(
    "המחיר כולל שימוש בציוד האולפן, תאורה והקלטת סאונד. לוחות זמנים יתואמו מראש."
  );
  const [deliveryTerms, setDeliveryTerms] = useState<string>(
    "טיוטה ראשונה למסירה תוך 5 ימי עסקים מסיום יום הצילומים. עד 2 סבבי תיקונים כלולים לכל תוצר."
  );
  const [opsNotes, setOpsNotes] = useState<string>(
    "לוודא כיול מצלמות 4K וגיבוי חומרים כפול מייד בתום הצילום לשרת הסטודיו."
  );
  const [salesNotes, setSalesNotes] = useState<string>(
    "לקוח מ-Call Maker, ביקש גמישות בסבבי התיקונים. אושרה הנחת סגירה."
  );

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdQuote, setCreatedQuote] = useState<{
    quoteNumber: string;
    signingToken: string;
  } | null>(null);

  // 1. Fetch Catalog
  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch("/api/catalog");
        const data = await res.json();
        if (data.success && data.products) {
          setAvailableProducts(data.products);
          // Pre-select first product to give an awesome initial preview
          if (data.products.length > 0) {
            addProductToQuote(data.products[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load catalog:", err);
      } finally {
        setLoadingCatalog(false);
      }
    }
    loadCatalog();
  }, []);

  // 2. Debounced CRM Search
  useEffect(() => {
    if (!crmQuery || crmQuery.trim().length < 2) {
      setCrmResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingCrm(true);
      try {
        const res = await fetch(`/api/crm/search?q=${encodeURIComponent(crmQuery)}`);
        const data = await res.json();
        if (data.success && data.customers) {
          setCrmResults(data.customers);
          setShowCrmDropdown(true);
        }
      } catch (e) {
        console.error("CRM search failed:", e);
      } finally {
        setIsSearchingCrm(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [crmQuery]);

  // Select customer from CRM
  const handleSelectCustomer = (c: CrmCustomer) => {
    setCustomer({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      companyName: c.companyName,
      vatNumber: c.vatNumber,
      address: c.address,
      source: c.source,
    });
    setCrmQuery(c.name);
    setShowCrmDropdown(false);
  };

  // Add Product to basket
  const addProductToQuote = (prod: ProductItem) => {
    const cartId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newItem: SelectedQuoteItem = {
      cartId,
      productId: prod.id,
      productNumber: prod.productNumber,
      name: prod.name,
      quantity: 1,
      unitPrice: prod.price,
      notes: {
        clientNotes: prod.quoteNotesDefault || "",
        opsNotes: "",
        priceReason: "",
      },
      components: (prod.components || []).map((c) => ({
        id: `c-${Date.now()}-${c.id}`,
        componentId: c.componentId,
        name: c.componentName,
        deliverableType: c.deliverableType,
        unitType: c.unitType,
        quantity: c.defaultQuantity || 1,
        internalNotes: c.internalNotes || "",
        clientNotes: c.quoteDescriptionDefault || "",
      })),
    };
    setItems((prev) => [...prev, newItem]);
    setExpandedItemId(cartId);
  };

  // Remove Item
  const removeItem = (cartId: string) => {
    setItems((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  // Update item quantity
  const updateItemQuantity = (cartId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.cartId === cartId ? { ...i, quantity } : i))
    );
  };

  // Update item unit price
  const updateItemPrice = (cartId: string, unitPrice: number) => {
    setItems((prev) =>
      prev.map((i) => (i.cartId === cartId ? { ...i, unitPrice: Math.max(0, unitPrice) } : i))
    );
  };

  // Update item notes
  const updateItemNotes = (cartId: string, field: "clientNotes" | "opsNotes" | "priceReason", value: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.cartId === cartId ? { ...i, notes: { ...i.notes, [field]: value } } : i
      )
    );
  };

  // Update component in item
  const updateComponentQuantity = (cartId: string, compId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.cartId !== cartId) return item;
        return {
          ...item,
          components: item.components.map((c) =>
            c.id === compId ? { ...c, quantity: Math.max(1, quantity) } : c
          ),
        };
      })
    );
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const beforeVat = Math.max(0, subtotal - discountAmount);
  const vatRate = 0.18; // 18% מע״מ
  const vatAmount = Math.round(beforeVat * vatRate);
  const totalWithVat = beforeVat + vatAmount;
  const advanceAmount = Math.round(totalWithVat * (advancePercent / 100));

  // Save quote
  const handleSaveQuote = async () => {
    if (!customer.name) {
      alert("נא להזין או לבחור שם לקוח");
      return;
    }
    if (items.length === 0) {
      alert("נא להוסיף לפחות מוצר אחד להצעה");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        crmCustomerId: customer.id || undefined,
        party: customer,
        items,
        totals: {
          subtotal,
          discountPercent,
          discountAmount,
          beforeVat,
          vatRate,
          vatAmount,
          totalWithVat,
          advancePaymentAmount: advanceAmount,
        },
        terms: {
          validityDays,
          paymentTerms,
          installmentsCount,
        },
        notes: {
          clientNotes,
          deliveryTerms,
          opsNotes,
          salesNotes,
        },
      };

      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setCreatedQuote({
          quoteNumber: data.quoteNumber,
          signingToken: data.signingToken,
        });
      } else {
        alert("שגיאה ביצירת הצעה: " + data.error);
      }
    } catch (e: any) {
      alert("שגיאת רשת: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link href="/quotes" className="hover:text-amber-400 flex items-center gap-1">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>הצעות מחיר</span>
            </Link>
            <span>/</span>
            <span className="text-amber-400">הצעה חדשה</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>יצירת הצעת מחיר חכמה</span>
            <span className="text-xs bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/30">
              כולל פירוק רכיבי אופרציה
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/quotes"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            ביטול
          </Link>
          <button
            onClick={handleSaveQuote}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? "שומר הצעה..." : "שמור הצעה והפק חתימה"}</span>
          </button>
        </div>
      </div>

      {/* Success Modal / Banner */}
      {createdQuote && (
        <div className="p-6 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-300 text-base">
                  הצעת מחיר {createdQuote.quoteNumber} נשמרה בהצלחה כסנאפשוט מקורי!
                </h3>
                <p className="text-xs text-slate-300">
                  נוצר סנאפשוט מלא של הנתונים, פרטי הלקוח, הרכיבים וכל שכבות ההערות.
                </p>
              </div>
            </div>
            <Link
              href="/quotes"
              className="text-xs bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl font-bold hover:bg-emerald-400 transition"
            >
              צפה בכל ההצעות
            </Link>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-500/20 flex items-center justify-between gap-4">
            <div className="text-xs space-y-0.5 min-w-0">
              <p className="text-slate-400 font-semibold">קישור חתימה דיגיטלית ללקוח (מאובטח):</p>
              <p className="text-emerald-400 font-mono text-[11px] truncate">
                http://localhost:3000/sign/{createdQuote.signingToken}
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`http://localhost:3000/sign/${createdQuote.signingToken}`);
                alert("הקישור הועתק ללוח!");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>העתק קישור</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: CRM Customer Finder */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base text-white">1. פרטי לקוח (איתור חי ב-Call Maker CRM)</h2>
          </div>
          <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
            קריאה בלבד ללא שום מגע בייצור
          </span>
        </div>

        {/* Live Search Input */}
        <div className="relative">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={crmQuery}
              onChange={(e) => setCrmQuery(e.target.value)}
              onFocus={() => setShowCrmDropdown(true)}
              placeholder="הקלד שם לקוח, חברה או מספר טלפון לאיתור ב-CRM..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {showCrmDropdown && crmResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800">
              {crmResults.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelectCustomer(c)}
                  className="p-3.5 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{c.name}</span>
                      {c.companyName && (
                        <span className="text-slate-400 font-medium">({c.companyName})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 mt-1">
                      <span>טלפון: {c.phone}</span>
                      {c.vatNumber && <span>ח.פ: {c.vatNumber}</span>}
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      {c.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Customer Details Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">שם הלקוח / איש קשר</label>
            <input
              type="text"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              placeholder="שם הלקוח"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">טלפון</label>
            <input
              type="text"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              placeholder="050-0000000"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">שם חברה / עסק</label>
            <input
              type="text"
              value={customer.companyName}
              onChange={(e) => setCustomer({ ...customer, companyName: e.target.value })}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              placeholder="שם החברה"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">אימייל</label>
            <input
              type="email"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              placeholder="client@domain.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">מספר ע.מ / ח.פ</label>
            <input
              type="text"
              value={customer.vatNumber}
              onChange={(e) => setCustomer({ ...customer, vatNumber: e.target.value })}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              placeholder="51xxxxxxx"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">כתובת</label>
            <input
              type="text"
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              placeholder="רחוב, עיר"
            />
          </div>
        </div>
      </section>

      {/* STEP 2: Products & BOM Breakdown */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base text-white">2. סל מוצרים ופירוק רכיבי אופרציה (BOM)</h2>
          </div>

          {/* Product selector dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">הוסף מוצר מקטלוג הסטודיו:</span>
            <select
              onChange={(e) => {
                const prod = availableProducts.find((p) => p.id === e.target.value);
                if (prod) addProductToQuote(prod);
                e.target.value = "";
              }}
              defaultValue=""
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-400 font-semibold focus:outline-none"
            >
              <option value="" disabled>
                בחר מוצר להוספה...
              </option>
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (₪{p.price.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Items List */}
        {items.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
            אין עדיין מוצרים בהצעה. בחר מוצר מהתפריט למעלה כדי להתחיל.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => {
              const isExpanded = expandedItemId === item.cartId;
              const itemTotal = item.quantity * item.unitPrice;

              return (
                <div
                  key={item.cartId}
                  className="bg-slate-800/40 border border-slate-800 rounded-xl overflow-hidden transition"
                >
                  {/* Item Header Row */}
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{item.name}</span>
                          <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                            {item.productNumber}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {item.components.length} רכיבי אופרציה כלולים
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Quantity */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400">כמות:</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.cartId, parseInt(e.target.value) || 1)}
                          className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center"
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400">מחיר יח׳:</span>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItemPrice(item.cartId, parseFloat(e.target.value) || 0)}
                          className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-mono"
                        />
                        <span className="text-xs text-slate-400">₪</span>
                      </div>

                      {/* Row Total */}
                      <div className="w-28 text-left">
                        <span className="text-sm font-bold text-amber-400 font-mono">
                          ₪{itemTotal.toLocaleString()}
                        </span>
                      </div>

                      {/* Expand / Collapse Details Button */}
                      <button
                        onClick={() => setExpandedItemId(isExpanded ? null : item.cartId)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="צפה ברכיבים ובהערות שורה"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.cartId)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                        title="מחק מוצר"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Components & Line Notes Section */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-900/80 border-t border-slate-800 space-y-4">
                      {/* Components Breakdown Table */}
                      <div>
                        <h4 className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                          <span>הרכב רכיבי האופרציה בחבילה (BOM Breakdown):</span>
                        </h4>
                        <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden">
                          <table className="w-full text-right text-xs">
                            <thead>
                              <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                                <th className="p-2.5">רכיב</th>
                                <th className="p-2.5">סוג תוצר</th>
                                <th className="p-2.5">יחידת מידה</th>
                                <th className="p-2.5">כמות כלולה</th>
                                <th className="p-2.5">הנחיות פנימיות לאופרציה</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {item.components.map((comp) => (
                                <tr key={comp.id}>
                                  <td className="p-2.5 font-medium text-white">{comp.name}</td>
                                  <td className="p-2.5">
                                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                                      {comp.deliverableType}
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-slate-400">{comp.unitType}</td>
                                  <td className="p-2.5">
                                    <input
                                      type="number"
                                      min="1"
                                      value={comp.quantity}
                                      onChange={(e) =>
                                        updateComponentQuantity(item.cartId, comp.id, parseInt(e.target.value) || 1)
                                      }
                                      className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-white text-center"
                                    />
                                  </td>
                                  <td className="p-2.5 text-slate-400 text-[11px]">
                                    {comp.internalNotes || "אין הנחיה מיוחדת"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Line Specific Notes (3 Fields) */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            הערה ללקוח עבור שורה זו (ב-PDF)
                          </label>
                          <textarea
                            rows={2}
                            value={item.notes.clientNotes}
                            onChange={(e) => updateItemNotes(item.cartId, "clientNotes", e.target.value)}
                            placeholder="הערה שתוצג מתחת למוצר בהצעת המחיר..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            הערה פנימית לאופרציה (עורך / צלם)
                          </label>
                          <textarea
                            rows={2}
                            value={item.notes.opsNotes}
                            onChange={(e) => updateItemNotes(item.cartId, "opsNotes", e.target.value)}
                            placeholder="דגשים לצוות ההפקה עבור מוצר זה..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            סיבת שינוי מחיר / הנחה מיוחדת
                          </label>
                          <textarea
                            rows={2}
                            value={item.notes.priceReason}
                            onChange={(e) => updateItemNotes(item.cartId, "priceReason", e.target.value)}
                            placeholder="הסבר לסטודיו על תמחור חריג..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* STEP 3: Global 4-Tier Notes */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          <h2 className="font-bold text-base text-white">3. כל שכבות ההערות והתנאים (4 רמות הפרדה מוחלטת)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tier 1: Client Notes */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400">1. הערות כלליות ללקוח</span>
              <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800/50">
                מוצג ללקוח בהצעה ובחתימה
              </span>
            </div>
            <textarea
              rows={3}
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Tier 2: Delivery Terms */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400">2. תנאי אספקה ולוחות זמנים</span>
              <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800/50">
                מוצג ללקוח ובחוזה
              </span>
            </div>
            <textarea
              rows={3}
              value={deliveryTerms}
              onChange={(e) => setDeliveryTerms(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Tier 3: Internal Ops Notes */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">3. הערות פנימיות לאופרציה</span>
              <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800/50">
                חסוי - צוות פנימי בלבד
              </span>
            </div>
            <textarea
              rows={3}
              value={opsNotes}
              onChange={(e) => setOpsNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Tier 4: Sales Confidential Notes */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400">4. הערות ניהול ומכירות סודיות</span>
              <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800/50">
                סודי מוחלט - הנהלה בלבד
              </span>
            </div>
            <textarea
              rows={3}
              value={salesNotes}
              onChange={(e) => setSalesNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-rose-400"
            />
          </div>
        </div>
      </section>

      {/* STEP 4: Financial Summary & Terms */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Terms & Validity */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-white">4. תנאי התקשרות ותוקף הצעה</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">תוקף ההצעה (בימים)</label>
                <input
                  type="number"
                  min="1"
                  value={validityDays}
                  onChange={(e) => setValidityDays(parseInt(e.target.value) || 14)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">מספר תשלומים מבוקש</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={installmentsCount}
                  onChange={(e) => setInstallmentsCount(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">תנאי פריסת תשלום</label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                אחוז מקדמה נדרש (%): {advancePercent}% (₪{advanceAmount.toLocaleString()})
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={advancePercent}
                onChange={(e) => setAdvancePercent(parseInt(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Totals Summary Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-sm text-slate-300 border-b border-slate-800 pb-2">
              סיכום כספי לתשלום
            </h3>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>סה״כ לפני הנחה:</span>
              <span className="font-mono text-white">₪{subtotal.toLocaleString()}</span>
            </div>

            {/* Discount input */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span>הנחה:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-center text-amber-400"
                />
                <span>%</span>
              </div>
              <span className="font-mono text-rose-400">- ₪{discountAmount.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>סכום חייב במע״מ:</span>
              <span className="font-mono text-white">₪{beforeVat.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>מע״מ (18%):</span>
              <span className="font-mono text-white">₪{vatAmount.toLocaleString()}</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-sm font-bold text-white">סה״כ לתשלום כולל מע״מ:</span>
              <span className="text-xl font-extrabold text-amber-400 font-mono">
                ₪{totalWithVat.toLocaleString()}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-purple-300">
              <span>מקדמה לתשלום מיידי ({advancePercent}%):</span>
              <span className="font-bold font-mono">₪{advanceAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-400">
            סה״כ {items.length} מוצרים | לתשלום:{" "}
            <strong className="text-amber-400 font-mono text-sm">₪{totalWithVat.toLocaleString()}</strong>
          </span>
          {customer.name && (
            <span className="text-emerald-400">לקוח: {customer.name}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveQuote}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? "שומר..." : "שמור הצעה והפק חתימה דיגיטלית"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
