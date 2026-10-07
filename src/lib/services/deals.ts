import { db, deals, deliverables, dealPayments } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export interface CreateDirectSaleInput {
  crmCustomerId?: string;
  party: {
    name: string;
    phone: string;
    email?: string;
    companyName?: string;
    vatNumber?: string;
    address?: string;
  };
  items: Array<{
    id: string;
    productId: string;
    productNumber: string;
    name: string;
    quantity: number;
    unitPrice: number;
    notes?: {
      clientNotes?: string;
      opsNotes?: string;
      priceReason?: string;
    };
    components: Array<{
      id: string;
      componentId: string;
      name: string;
      deliverableType: string;
      unitType: string;
      quantity: number;
      internalNotes?: string;
      clientNotes?: string;
    }>;
  }>;
  totals: {
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    beforeVat: number;
    vatRate: number;
    vatAmount: number;
    totalWithVat: number;
    advancePaymentAmount: number;
  };
  payment: {
    paymentStatus: string; // 'ממתינה לתשלום' | 'שולמה מקדמה' | 'שולמה במלואה'
    paidAmount: number;
    paymentMethod: string; // 'העברה בנקאית' | 'אשראי' | 'מזומן' | 'צ׳ק'
    invoiceNumber?: string;
  };
  notes: {
    clientNotes: string;
    deliveryTerms: string;
    opsNotes: string;
    salesNotes: string;
  };
}

export async function createDirectSale(input: CreateDirectSaleInput) {
  const existingDeals = await db
    .select({ dealNumber: deals.dealNumber })
    .from(deals)
    .orderBy(desc(deals.createdAt))
    .limit(1);

  let nextNum = 1026;
  if (existingDeals.length > 0 && existingDeals[0].dealNumber.startsWith("D-")) {
    const parsed = parseInt(existingDeals[0].dealNumber.replace("D-", ""), 10);
    if (!isNaN(parsed)) {
      nextNum = parsed + 1;
    }
  }

  const dealNumber = `D-${nextNum}`;
  const dealId = `deal-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  const totalAmount = input.totals.totalWithVat;
  const paidAmount = input.payment.paidAmount || 0;
  const remainingAmount = Math.max(0, totalAmount - paidAmount);

  // 1. Create Deal
  await db.insert(deals).values({
    id: dealId,
    dealNumber,
    crmCustomerId: input.crmCustomerId || null,
    customerNameSnapshot: input.party.name + (input.party.companyName ? ` (${input.party.companyName})` : ""),
    customerPhoneSnapshot: input.party.phone,
    executionStatus: "בהפקה",
    paymentStatus: input.payment.paymentStatus || (paidAmount > 0 ? "שולמה מקדמה" : "ממתינה לתשלום"),
    totalAmountIncludingVat: totalAmount,
    paidAmountIncludingVat: paidAmount,
    remainingAmount,
    itemsSnapshot: JSON.stringify(input.items),
    partySnapshot: JSON.stringify(input.party),
    notesSnapshot: JSON.stringify(input.notes),
    createdAt: now,
    updatedAt: now,
  });

  // 2. Record Payment if provided
  if (paidAmount > 0) {
    const payId = `pay-${Date.now()}`;
    await db.insert(dealPayments).values({
      id: payId,
      dealId,
      paymentNumber: `PAY-${Date.now().toString().slice(-4)}`,
      amount: paidAmount,
      paymentMethod: input.payment.paymentMethod || "העברה בנקאית",
      paymentPurpose: paidAmount >= totalAmount ? "גמר חשבון" : "מקדמה",
      paymentDate: new Date().toISOString().slice(0, 10),
      invoiceReceiptNumber: input.payment.invoiceNumber || null,
      notes: "תשלום נקלט בעת פתיחת מכירה ישירה",
      createdAt: now,
    });
  }

  // 3. Unpack Deliverables into Production Pipeline
  let deliverableCounter = 1;
  const deliverablesToInsert = [];

  for (const item of input.items) {
    if (item.components && item.components.length > 0) {
      for (const comp of item.components) {
        // If component is a concrete deliverable (video edit, episode, session, etc.)
        const totalQty = (comp.quantity || 1) * (item.quantity || 1);
        for (let i = 1; i <= totalQty; i++) {
          const suffix = totalQty > 1 ? ` #${i}` : "";
          deliverablesToInsert.push({
            id: `del-${Date.now()}-${deliverableCounter}`,
            dealId,
            deliverableNumber: `DEL-${nextNum}-${deliverableCounter++}`,
            name: `${comp.name}${suffix}`,
            parentProductName: item.name,
            category: comp.deliverableType || "וידאו",
            status: comp.deliverableType === "שעות אולפן" ? "ממתין לצילום" : "בעריכה",
            currentRevisionNumber: 1,
            maxRevisionsAllowed: comp.deliverableType === "תיקונים" ? 1 : 2,
            assignedStaffName: null,
            assignedStaffRole: comp.deliverableType === "שעות אולפן" ? "צלם" : "עורך",
            dueDate: null,
            rawFootageUrl: null,
            draftPreviewUrl: null,
            finalDeliveryUrl: null,
            staffNotes: comp.internalNotes || item.notes?.opsNotes || null,
            clientFeedback: null,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    } else {
      // Fallback single deliverable for the item
      for (let i = 1; i <= (item.quantity || 1); i++) {
        deliverablesToInsert.push({
          id: `del-${Date.now()}-${deliverableCounter}`,
          dealId,
          deliverableNumber: `DEL-${nextNum}-${deliverableCounter++}`,
          name: `${item.name}${item.quantity > 1 ? ` #${i}` : ""}`,
          parentProductName: item.name,
          category: "וידאו",
          status: "בעריכה",
          currentRevisionNumber: 1,
          maxRevisionsAllowed: 2,
          assignedStaffName: null,
          assignedStaffRole: "עורך",
          dueDate: null,
          rawFootageUrl: null,
          draftPreviewUrl: null,
          finalDeliveryUrl: null,
          staffNotes: item.notes?.opsNotes || null,
          clientFeedback: null,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }

  if (deliverablesToInsert.length > 0) {
    await db.insert(deliverables).values(deliverablesToInsert);
  }

  return {
    dealId,
    dealNumber,
    deliverablesCount: deliverablesToInsert.length,
  };
}
