import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ── 1. רכיבי אופרציה בסיסיים (Components) ────────────────────────────────────
// יחידות עבודה קונקרטיות: שעת אולפן, עריכת רילס, הקלטת סאונד, סבב תיקונים
export const components = sqliteTable("components", {
  id: text("id").primaryKey(), // UUID
  componentNumber: text("component_number").notNull().unique(), // e.g. "CMP-101"
  name: text("name").notNull(),
  deliverableType: text("deliverable_type").notNull(), // 'שעות אולפן' | 'עריכת וידאו' | 'סטילס' | 'גרפיקה' | 'סאונד' | 'תיקונים'
  unitType: text("unit_type").default("יחידה"), // 'שעות' | 'יחידות' | 'סבבים'
  costEstimate: real("cost_estimate").default(0), // עלות ייצור פנימית
  defaultPrice: real("default_price").default(0), // מחיר צרכן מומלץ
  sopLink: text("sop_link"), // קישור לנוהל עבודה (SOP)
  internalNotes: text("internal_notes"), // הנחיות ברירת מחדל לאופרציה
  quoteDescriptionDefault: text("quote_description_default"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ── 2. חבילות ומוצרי מדף (Products) ──────────────────────────────────────────
// חבילת 5 רילס, יום צילום תדמית, הפקת פודקאסט
export const products = sqliteTable("products", {
  id: text("id").primaryKey(), // UUID
  productNumber: text("product_number").notNull().unique(), // e.g. "PRD-201"
  name: text("name").notNull(),
  category: text("category").default("כללי"), // 'חבילות סושיאל' | 'פודקאסטים' | 'תדמית' | 'שירותי אולפן'
  deliverableType: text("deliverable_type"),
  price: real("price").notNull().default(0),
  productionCost: real("production_cost").default(0),
  quoteDescriptionDefault: text("quote_description_default"),
  quoteNotesDefault: text("quote_notes_default"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ── 3. עץ מוצר / הרכב חבילה (Product Components BOM) ─────────────────────────
// מקשר בין מוצר לרכיבי האופרציה שהוא מכיל
export const productComponents = sqliteTable("product_components", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  componentId: text("component_id").notNull().references(() => components.id, { onDelete: "cascade" }),
  defaultQuantity: real("default_quantity").notNull().default(1),
  sortOrder: integer("sort_order").default(0),
  isOptional: integer("is_optional", { mode: "boolean" }).default(false),
});

// ── 4. הצעות מחיר (Quotes) ───────────────────────────────────────────────────
// ישות האב של הצעת מחיר
export const quotes = sqliteTable("quotes", {
  id: text("id").primaryKey(),
  quoteNumber: text("quote_number").notNull().unique(), // e.g. "Q-1048"
  crmCustomerId: text("crm_customer_id"), // מזהה לקוח ב-Call Maker (למשל "CM-90412")
  currentVersionId: text("current_version_id"), // הגרסה הפעילה
  status: text("status").notNull().default("טיוטה"), // 'טיוטה' | 'נשלחה ללקוח' | 'נחתמה' | 'נדחתה' | 'בוטלה'
  salespersonId: text("salesperson_id"),
  defaultInstallmentsCount: integer("default_installments_count").default(1),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ── 5. סנאפשוטים של גרסאות הצעה (Quote Versions - Immutable Snapshots) ───────
// מקפיא את כל פרטי הלקוח, המוצרים, הרכיבים, התנאים וההערות בעת שליחה/חתימה
export const quoteVersions = sqliteTable("quote_versions", {
  id: text("id").primaryKey(),
  quoteId: text("quote_id").notNull().references(() => quotes.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull().default(1),
  status: text("status").notNull().default("טיוטה"),
  
  // Snapshots (JSON strings)
  partySnapshot: text("party_snapshot"),     // פרטי הלקוח מ-Call Maker (שם, טלפון, מייל, ח.פ)
  itemsSnapshot: text("items_snapshot"),     // סל המוצרים + פירוק הרכיבים + מחירים + כמויות + הערות שורה
  totalsSnapshot: text("totals_snapshot"),   // סה"כ לפני הנחה, הנחה, מע"מ 18%, סה"כ לתשלום, מקדמה
  termsSnapshot: text("terms_snapshot"),     // תוקף הצעה, תנאי תשלום, תשלומים
  notesSnapshot: text("notes_snapshot"),     // כל 4 סוגי ההערות: ללקוח, תנאי אספקה, אופרציה, מכירות
  
  // חתימה דיגיטלית
  signingToken: text("signing_token").unique(),
  signedAt: text("signed_at"),
  signerName: text("signer_name"),
  signerIdNumber: text("signer_id_number"),
  signerIp: text("signer_ip"),
  signatureDataUrl: text("signature_data_url"),
  
  createdAt: text("created_at").notNull(),
});

// ── 6. עסקאות והזמנות הפקה (Deals) ──────────────────────────────────────────
// נוצרת מחתימת הצעה או פתיחה ישירה
export const deals = sqliteTable("deals", {
  id: text("id").primaryKey(),
  dealNumber: text("deal_number").notNull().unique(), // e.g. "D-1024"
  quoteId: text("quote_id").references(() => quotes.id),
  sourceQuoteVersionId: text("source_quote_version_id"),
  crmCustomerId: text("crm_customer_id"),
  customerNameSnapshot: text("customer_name_snapshot"),
  customerPhoneSnapshot: text("customer_phone_snapshot"),
  
  executionStatus: text("execution_status").notNull().default("בהפקה"), // 'בהפקה' | 'ממתין לצילום' | 'בעריכה' | 'הושלם' | 'בוטל'
  paymentStatus: text("payment_status").notNull().default("ממתינה לתשלום"), // 'ממתינה לתשלום' | 'שולמה מקדמה' | 'שולמה במלואה'
  
  totalAmountIncludingVat: real("total_amount_including_vat").notNull().default(0),
  paidAmountIncludingVat: real("paid_amount_including_vat").notNull().default(0),
  remainingAmount: real("remaining_amount").notNull().default(0),
  
  itemsSnapshot: text("items_snapshot"),
  partySnapshot: text("party_snapshot"),
  notesSnapshot: text("notes_snapshot"),
  
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ── 7. ניהול תוצרים מול הלקוחות (Deliverables - The Studio Core Engine) ──────
// כל סרטון רילס, פרק פודקאסט, גלריית תמונות, שעות אולפן
export const deliverables = sqliteTable("deliverables", {
  id: text("id").primaryKey(),
  dealId: text("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  deliverableNumber: text("deliverable_number").notNull(), // e.g. "DEL-1024-1"
  name: text("name").notNull(), // e.g. "סרטון רילס #1 - הצגת מוצר"
  parentProductName: text("parent_product_name"), // e.g. "חבילת 5 רילס"
  category: text("category").notNull().default("וידאו"), // 'וידאו' | 'סטילס' | 'שעות אולפן' | 'סאונד' | 'עיצוב'
  
  status: text("status").notNull().default("תכנון"), 
  // 'תכנון' | 'ממתין לצילום' | 'בעריכה' | 'נשלח לבדיקת לקוח' | 'סבב תיקונים' | 'אושר סופית' | 'נמסר'
  
  currentRevisionNumber: integer("current_revision_number").default(1),
  maxRevisionsAllowed: integer("max_revisions_allowed").default(2),
  
  assignedStaffName: text("assigned_staff_name"), // איש צוות / עורך
  assignedStaffRole: text("assigned_staff_role"), // 'עורך' | 'צלם' | 'מעצב'
  
  dueDate: text("due_date"),
  completedAt: text("completed_at"),
  
  // קישורי עבודה וקבצים
  rawFootageUrl: text("raw_footage_url"), // קישור דרייב לחומרי גלם
  draftPreviewUrl: text("draft_preview_url"), // קישור צפייה לטיוטה (YouTube / Vimeo / Drive)
  finalDeliveryUrl: text("final_delivery_url"), // קישור להורדה סופית באיכות מלאה
  
  // הערות
  staffNotes: text("staff_notes"), // הערות עורך / צלם
  clientFeedback: text("client_feedback"), // משוב והערות תיקונים מהלקוח
  
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ── 8. תשלומים ותקבולים (Deal Payments) ──────────────────────────────────────
export const dealPayments = sqliteTable("deal_payments", {
  id: text("id").primaryKey(),
  dealId: text("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  paymentNumber: text("payment_number").notNull(), // e.g. "PAY-1001"
  amount: real("amount").notNull().default(0),
  paymentMethod: text("payment_method").notNull().default("העברה בנקאית"), // 'העברה בנקאית' | 'אשראי' | 'מזומן' | 'צ׳ק'
  paymentPurpose: text("payment_purpose").default("מקדמה"), // 'מקדמה' | 'גמר חשבון' | 'תשלום שוטף'
  paymentDate: text("payment_date").notNull(),
  invoiceReceiptNumber: text("invoice_receipt_number"), // מספר חשבונית/קבלה
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

// ── 9. משתמשי צוות הסטודיו (Studio Staff / Users) ────────────────────────────
export const studioUsers = sqliteTable("studio_users", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("עורך"), // 'מנהל' | 'צלם' | 'עורך' | 'איש מכירות'
  phone: text("phone"),
  email: text("email"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").notNull(),
});
