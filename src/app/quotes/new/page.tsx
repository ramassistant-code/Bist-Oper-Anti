"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  Zap,
  CreditCard,
  Building,
  Phone,
  Mail,
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
  status: string;
}

function NewQuoteOrDealInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "direct" ? "direct" : "quote";

  const [mode, setMode] = useState<"quote" | "direct">(initialMode);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [availableProducts, setAvailableProducts] = useState<ProductItem[]>([]);

  // CRM Search state
  const [crmQuery, setCrmQuery] = useState("");
  const [crmResults, setCrmResults] = useState<CrmCustomer[]>([]);
  const [isSearchingCrm, setIsSearchingCrm] = useState(false);
  const [showCrmDropdown, setShowCrmDropdown] = useState(false);

  // Customer
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

  // Basket starts strictly EMPTY - as requested!
  const [items, setItems] = useState<SelectedQuoteItem[]>([]);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Financials
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [advancePercent, setAdvancePercent] = useState<number>(50);
  const [validityDays, setValidityDays] = useState<number>(14);
  const [installmentsCount, setInstallmentsCount] = useState<number>(1);
  const [paymentTerms, setPaymentTerms] = useState<string>("50% מקדמה בהזמנה, 50% בגמר הפקה");

  // Direct sale specific fields
  const [paymentStatus, setPaymentStatus] = useState<string>("שולמה מקדמה");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("העברה בנקאית");
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");

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
  const [salesNotes, setSalesNotes] = useState<string>("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState<{
    type: "quote" | "deal";
    number: string;
    signingToken?: string;
    deliverablesCount?: number;
  } | null>(null);

  // 1. Fetch Catalog (Clean, NO auto-add to basket!)
  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch("/api/catalog");
        const data = await res.json();
        if (data.success && data.products) {
          setAvailableProducts(data.products);
        }
      } catch (err) {
        console.error("Failed to load catalog:", err);
      } finally {
        setLoadingCatalog(false);
      }
    }
    loadCatalog();
  }, []);

  // 2. Debounced CRM Search against real Supabase DB
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
      companyName: c.companyName || c.name,
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

  // Update item level notes
  const updateItemNotes = (cartId: string, field: "clientNotes" | "opsNotes" | "priceReason", value: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.cartId === cartId ? { ...i, notes: { ...i.notes, [field]: value } } : i
      )
    );
  };

  // Update component in item (quantity & component-level notes)
  const updateComponentField = (
    cartId: string,
    compId: string,
    field: "quantity" | "internalNotes" | "clientNotes",
    value: any
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.cartId !== cartId) return item;
        return {
          ...item,
          components: item.components.map((c) => {
            if (c.id !== compId) return c;
            return {
              ...c,
              [field]: field === "quantity" ? Math.max(1, parseInt(value) || 1) : value,
            };
          }),
        };
      })
    );
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const beforeVat = Math.max(0, subtotal - discountAmount);
  const vatRate = 0.18;
  const vatAmount = Math.round(beforeVat * vatRate);
  const totalWithVat = beforeVat + vatAmount;
  const advanceAmount = Math.round(totalWithVat * (advancePercent / 100));

  // Sync default paid amount in direct sale mode
  useEffect(() => {
    if (mode === "direct" && paidAmount === 0 && advanceAmount > 0) {
      setPaidAmount(advanceAmount);
    }
  }, [mode, advanceAmount]);

  // Handle Save (Either Quote or Direct Sale)
  const handleSubmit = async () => {
    if (!customer.name.trim()) {
      alert("נא להזין או לבחור שם לקוח");
      return;
    }
    if (items.length === 0) {
      alert("סל המוצרים ריק. נא לבחור לפחות מוצר אחד מקטלוג הסטודיו");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "direct") {
        // Direct Sale
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
          payment: {
            paymentStatus,
            paidAmount: Number(paidAmount) || 0,
            paymentMethod,
            invoiceNumber,
          },
          notes: {
            clientNotes,
            deliveryTerms,
            opsNotes,
            salesNotes,
          },
        };

        const res = await fetch("/api/deals/direct", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setCreatedResult({
            type: "deal",
            number: data.dealNumber,
            deliverablesCount: data.deliverablesCount,
          });
        } else {
          alert("שגיאה בפתיחת מכירה ישירה: " + data.error);
        }
      } else {
        // Price Quote with snapshot & digital signing
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
          setCreatedResult({
            type: "quote",
            number: data.quoteNumber,
            signingToken: data.signingToken,
          });
        } else {
          alert("שגיאה ביצירת הצעה: " + data.error);
        }
      }
    } catch (e: any) {
      alert("שגיאת רשת: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link href="/" className="hover:text-slate-200 flex items-center gap-1">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>ראשי</span>
            </Link>
            <span>/</span>
            <span className="text-slate-300">
              {mode === "direct" ? "פתיחת עסקה ישירה" : "הצעת מחיר"}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            {mode === "direct" ? "מכירה ישירה (פתיחת הזמנת הפקה מיידית)" : "יצירת הצעת מחיר לחתימה"}
          </h1>
        </div>

        {/* Mode Toggle Switch */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode("quote")}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
              mode === "quote"
                ? "bg-slate-800 text-slate-100 shadow-sm border border-slate-700/60"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            הצעת מחיר לחתימה
          </button>
          <button
            type="button"
            onClick={() => setMode("direct")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
              mode === "direct"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>מכירה ישירה</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {createdResult && (
        <div className="p-5 bg-slate-900 border border-slate-700 rounded-xl space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">
                  {createdResult.type === "deal"
                    ? `עסקה ${createdResult.number} נפתחה בהצלחה בהפקה!`
                    : `הצעת מחיר ${createdResult.number} נשמרה כסנאפשוט מקורי!`}
                </h3>
                <p className="text-xs text-slate-400">
                  {createdResult.type === "deal"
                    ? `נוצרו ${createdResult.deliverablesCount} תוצרים בצינור ההפקה מול הצוות.`
                    : "הפרטים הוקפאו בסנאפשוט ונוצר קישור חתימה מאובטח ללקוח."}
                </p>
              </div>
            </div>
            <Link
              href={createdResult.type === "deal" ? "/deliverables" : "/quotes"}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-1.5 rounded-lg font-medium border border-slate-700 transition"
            >
              {createdResult.type === "deal" ? "למרכז התוצרים" : "לרשימת ההצעות"}
            </Link>
          </div>

          {createdResult.signingToken && (
            <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between gap-4 text-xs">
              <span className="font-mono text-slate-300 truncate">
                http://localhost:3000/sign/{createdResult.signingToken}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`http://localhost:3000/sign/${createdResult.signingToken}`);
                  alert("הקישור הועתק!");
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>העתק</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECTION 1: Customer Selection */}
      <section className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <h2 className="font-semibold text-sm text-slate-200">1. פרטי לקוח (איתור ב-CRM)</h2>
          </div>
          <span className="text-[11px] text-slate-400">
            איתור חי מתוך 5,000+ לקוחות ולידים בייצור
          </span>
        </div>

        {/* Live Search Input */}
        <div className="relative">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={crmQuery}
              onChange={(e) => setCrmQuery(e.target.value)}
              onFocus={() => setShowCrmDropdown(true)}
              placeholder="חפש לפי שם לקוח, טלפון, אימייל או חברה..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-9 pl-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-600 transition"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {showCrmDropdown && crmResults.length > 0 && (
            <div className="absolute top-full mt-1.5 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-slate-800/80 max-h-60 overflow-y-auto">
              {crmResults.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelectCustomer(c)}
                  className="p-3 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100">{c.name}</span>
                      {c.companyName && c.companyName !== c.name && (
                        <span className="text-slate-400">({c.companyName})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 text-[11px] mt-0.5">
                      <span>טלפון: {c.phone}</span>
                      {c.email && <span>מייל: {c.email}</span>}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {c.source}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Customer Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">שם לקוח / איש קשר</label>
            <input
              type="text"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-slate-600"
              placeholder="שם הלקוח"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">טלפון</label>
            <input
              type="text"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-slate-600 font-mono"
              placeholder="050-0000000"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">חברה / ע.מ / ח.פ</label>
            <input
              type="text"
              value={customer.companyName}
              onChange={(e) => setCustomer({ ...customer, companyName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-slate-600"
              placeholder="שם העסק"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: Basket & Components Breakdown */}
      <section className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h2 className="font-semibold text-sm text-slate-200">2. סל מוצרים ורכיבי אופרציה (BOM)</h2>
          </div>

          {/* Add product select */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">הוסף מוצר:</span>
            <select
              onChange={(e) => {
                const prod = availableProducts.find((p) => p.id === e.target.value);
                if (prod) addProductToQuote(prod);
                e.target.value = "";
              }}
              defaultValue=""
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-amber-400 font-medium focus:outline-none"
            >
              <option value="" disabled>
                בחר מוצר מהקטלוג...
              </option>
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (₪{p.price.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Basket Empty State - As requested! */}
        {items.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs space-y-1">
            <p className="font-medium text-slate-300">סל המוצרים ריק</p>
            <p className="text-[11px] text-slate-400">
              בחר מוצר מתפריט הקטלוג למעלה כדי להתחיל להרכיב את ההצעה.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => {
              const isExpanded = expandedItemId === item.cartId;
              const itemTotal = item.quantity * item.unitPrice;

              return (
                <div
                  key={item.cartId}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden"
                >
                  {/* Header Row */}
                  <div className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded bg-slate-800 text-slate-400 flex items-center justify-center font-mono text-[11px]">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-100 text-xs">{item.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                            {item.productNumber}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {item.components.length} רכיבי אופרציה
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1 text-slate-400">
                        <span>כמות:</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.cartId, parseInt(e.target.value) || 1)}
                          className="w-14 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-center text-slate-100"
                        />
                      </div>

                      <div className="flex items-center gap-1 text-slate-400">
                        <span>מחיר:</span>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItemPrice(item.cartId, parseFloat(e.target.value) || 0)}
                          className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-center text-slate-100 font-mono"
                        />
                        <span>₪</span>
                      </div>

                      <span className="font-mono font-bold text-amber-400 w-24 text-left">
                        ₪{itemTotal.toLocaleString()}
                      </span>

                      <button
                        type="button"
                        onClick={() => setExpandedItemId(isExpanded ? null : item.cartId)}
                        className="p-1 text-slate-400 hover:text-slate-200"
                        title="פירוט רכיבים והערות"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeItem(item.cartId)}
                        className="p-1 text-rose-400/70 hover:text-rose-400"
                        title="הסר מוצר"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded: Component Notes & Line Notes */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-900/60 border-t border-slate-800 space-y-4 text-xs">
                      {/* BOM Components Table with Editable Notes per Component */}
                      <div>
                        <h4 className="text-[11px] font-semibold text-slate-300 mb-2">
                          פירוק רכיבי אופרציה והערות ברמת רכיב:
                        </h4>
                        <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
                          <table className="w-full text-right text-[11px]">
                            <thead>
                              <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-medium">
                                <th className="p-2">רכיב</th>
                                <th className="p-2">סוג</th>
                                <th className="p-2 text-center">כמות</th>
                                <th className="p-2">הערות פנימיות לרכיב (לאופרציה / עורך / צלם)</th>
                                <th className="p-2">הערה ללקוח עבור רכיב זה</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {item.components.map((comp) => (
                                <tr key={comp.id}>
                                  <td className="p-2 font-medium text-slate-200">{comp.name}</td>
                                  <td className="p-2 text-slate-400">{comp.deliverableType}</td>
                                  <td className="p-2 text-center">
                                    <input
                                      type="number"
                                      min="1"
                                      value={comp.quantity}
                                      onChange={(e) =>
                                        updateComponentField(item.cartId, comp.id, "quantity", e.target.value)
                                      }
                                      className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center text-slate-100"
                                    />
                                  </td>
                                  {/* Editable Component-Level Internal Note */}
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      value={comp.internalNotes}
                                      onChange={(e) =>
                                        updateComponentField(item.cartId, comp.id, "internalNotes", e.target.value)
                                      }
                                      placeholder="הנחיית צוות/צלם ספציפית..."
                                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-500"
                                    />
                                  </td>
                                  {/* Editable Component-Level Client Note */}
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      value={comp.clientNotes}
                                      onChange={(e) =>
                                        updateComponentField(item.cartId, comp.id, "clientNotes", e.target.value)
                                      }
                                      placeholder="הערה שתוצג ללקוח עבור רכיב זה..."
                                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-500"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Product Level Notes */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">
                            הערה ללקוח עבור שורה זו (ב-PDF)
                          </label>
                          <input
                            type="text"
                            value={item.notes.clientNotes}
                            onChange={(e) => updateItemNotes(item.cartId, "clientNotes", e.target.value)}
                            placeholder="הערת מוצר ללקוח..."
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">
                            הערה פנימית לאופרציה לשורה זו
                          </label>
                          <input
                            type="text"
                            value={item.notes.opsNotes}
                            onChange={(e) => updateItemNotes(item.cartId, "opsNotes", e.target.value)}
                            placeholder="דגשים לצוות..."
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">
                            סיבת שינוי מחיר / הנחה
                          </label>
                          <input
                            type="text"
                            value={item.notes.priceReason}
                            onChange={(e) => updateItemNotes(item.cartId, "priceReason", e.target.value)}
                            placeholder="הסבר לתמחור מיוחד..."
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200"
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

      {/* SECTION 3: Global Notes (4 Tiers) */}
      <section className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <h2 className="font-semibold text-sm text-slate-200">3. שכבות הערות גלובליות</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-slate-300">הערות כלליות ללקוח</span>
              <span className="text-[10px] text-slate-400">מופיע בהצעה</span>
            </div>
            <textarea
              rows={2}
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-slate-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-slate-300">תנאי אספקה ולוחות זמנים</span>
              <span className="text-[10px] text-slate-400">מופיע בהצעה</span>
            </div>
            <textarea
              rows={2}
              value={deliveryTerms}
              onChange={(e) => setDeliveryTerms(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-slate-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-slate-300">הערות פנימיות לאופרציה</span>
              <span className="text-[10px] text-slate-400">חסוי מהלקוח</span>
            </div>
            <textarea
              rows={2}
              value={opsNotes}
              onChange={(e) => setOpsNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-slate-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-slate-300">הערות ניהול ומכירות</span>
              <span className="text-[10px] text-slate-400">סודי להנהלה</span>
            </div>
            <textarea
              rows={2}
              value={salesNotes}
              onChange={(e) => setSalesNotes(e.target.value)}
              placeholder="סיכומי שיחה, רווחיות..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-slate-600"
            />
          </div>
        </div>
      </section>

      {/* SECTION 4: Terms & Payment / Direct Sale Options */}
      <section className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Terms or Direct Sale Inputs */}
          {mode === "direct" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <CreditCard className="w-4 h-4" />
                <span>פרטי תשלום וקליטה מיידית (מכירה ישירה)</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">סטטוס תשלום</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="שולמה מקדמה">שולמה מקדמה</option>
                    <option value="שולמה במלואה">שולמה במלואה (גמר חשבון)</option>
                    <option value="ממתינה לתשלום">ממתינה לתשלום</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">סכום ששולם בפועל (₪)</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">אמצעי תשלום</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="העברה בנקאית">העברה בנקאית</option>
                    <option value="אשראי">כרטיס אשראי</option>
                    <option value="צ׳ק">צ׳ק</option>
                    <option value="מזומן">מזומן</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">מספר חשבונית / קבלה</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="INV-..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <span className="font-semibold text-slate-300 block">תנאי תשלום ותוקף להצעה</span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">תוקף הצעה (ימים)</label>
                  <input
                    type="number"
                    value={validityDays}
                    onChange={(e) => setValidityDays(parseInt(e.target.value) || 14)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">מספר תשלומים</label>
                  <input
                    type="number"
                    value={installmentsCount}
                    onChange={(e) => setInstallmentsCount(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">תנאי פריסה</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  אחוז מקדמה נדרש: {advancePercent}% (₪{advanceAmount.toLocaleString()})
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={advancePercent}
                  onChange={(e) => setAdvancePercent(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          )}

          {/* Totals Summary */}
          <div className="bg-slate-950 rounded-xl border border-slate-800/80 p-4 space-y-2 text-xs">
            <span className="font-semibold text-slate-300 block border-b border-slate-800 pb-1.5">
              סיכום כספי לתשלום
            </span>

            <div className="flex items-center justify-between text-slate-400">
              <span>סכום ביניים:</span>
              <span className="font-mono text-slate-200">₪{subtotal.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span>הנחה:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-12 bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-center text-slate-100"
                />
                <span>%</span>
              </div>
              <span className="font-mono text-slate-400">- ₪{discountAmount.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>מע״מ (18%):</span>
              <span className="font-mono text-slate-200">₪{vatAmount.toLocaleString()}</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm">
              <strong className="text-slate-100">סה״כ כולל מע״מ:</strong>
              <strong className="text-amber-400 font-mono text-base">
                ₪{totalWithVat.toLocaleString()}
              </strong>
            </div>

            {mode === "direct" ? (
              <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>יתרה לתשלום:</span>
                <span className="font-mono font-semibold text-slate-200">
                  ₪{Math.max(0, totalWithVat - (Number(paidAmount) || 0)).toLocaleString()}
                </span>
              </div>
            ) : (
              <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>מקדמה מבוקשת ({advancePercent}%):</span>
                <span className="font-mono text-slate-200">₪{advanceAmount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">
            סה״כ {items.length} מוצרים | לתשלום:{" "}
            <strong className="text-amber-400 font-mono">₪{totalWithVat.toLocaleString()}</strong>
          </span>
          {customer.name && (
            <span className="text-slate-300">| לקוח: {customer.name}</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition disabled:opacity-50"
        >
          {mode === "direct" ? <Zap className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          <span>
            {isSubmitting
              ? "מעבד..."
              : mode === "direct"
              ? "בצע מכירה ישירה ופתיחת הפקה"
              : "שמור הצעה והפק חתימה דיגיטלית"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function NewQuoteOrDealPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-400">
          טוען נתונים...
        </div>
      }
    >
      <NewQuoteOrDealInner />
    </Suspense>
  );
}

