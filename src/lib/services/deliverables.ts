import { db, deals, deliverables } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export async function getDashboardDeliverables() {
  const items = await db
    .select({
      id: deliverables.id,
      deliverableNumber: deliverables.deliverableNumber,
      name: deliverables.name,
      parentProductName: deliverables.parentProductName,
      category: deliverables.category,
      status: deliverables.status,
      currentRevisionNumber: deliverables.currentRevisionNumber,
      maxRevisionsAllowed: deliverables.maxRevisionsAllowed,
      assignedStaffName: deliverables.assignedStaffName,
      assignedStaffRole: deliverables.assignedStaffRole,
      dueDate: deliverables.dueDate,
      rawFootageUrl: deliverables.rawFootageUrl,
      draftPreviewUrl: deliverables.draftPreviewUrl,
      finalDeliveryUrl: deliverables.finalDeliveryUrl,
      staffNotes: deliverables.staffNotes,
      clientFeedback: deliverables.clientFeedback,
      dealId: deliverables.dealId,
      customerName: deals.customerNameSnapshot,
      customerPhone: deals.customerPhoneSnapshot,
      dealNumber: deals.dealNumber,
    })
    .from(deliverables)
    .innerJoin(deals, eq(deliverables.dealId, deals.id))
    .orderBy(desc(deliverables.createdAt));

  return items;
}

export async function seedSampleDeliverablesIfEmpty() {
  const existing = await db.select().from(deliverables).limit(1);
  if (existing.length > 0) return;

  const now = new Date().toISOString();

  // Create Deal 1
  const deal1Id = "deal-1024";
  await db.insert(deals).values({
    id: deal1Id,
    dealNumber: "D-1024",
    crmCustomerId: "CM-8021",
    customerNameSnapshot: "מסעדת השף בע״מ (יוסי כהן)",
    customerPhoneSnapshot: "050-1234567",
    executionStatus: "בהפקה",
    paymentStatus: "שולמה מקדמה",
    totalAmountIncludingVat: 2832,
    paidAmountIncludingVat: 1416,
    remainingAmount: 1416,
    createdAt: now,
    updatedAt: now,
  });

  // Create Deal 2
  const deal2Id = "deal-1022";
  await db.insert(deals).values({
    id: deal2Id,
    dealNumber: "D-1022",
    crmCustomerId: "CM-8022",
    customerNameSnapshot: "רוזן נדל״ן פרימיום (מיכל רוזן)",
    customerPhoneSnapshot: "054-9876543",
    executionStatus: "בהפקה",
    paymentStatus: "שולמה מקדמה",
    totalAmountIncludingVat: 1416,
    paidAmountIncludingVat: 708,
    remainingAmount: 708,
    createdAt: now,
    updatedAt: now,
  });

  // Create Deal 3
  const deal3Id = "deal-1025";
  await db.insert(deals).values({
    id: deal3Id,
    dealNumber: "D-1025",
    crmCustomerId: "CM-8024",
    customerNameSnapshot: "שפירא ושות׳ משרד עורכי דין (דנה שפירא)",
    customerPhoneSnapshot: "053-4447890",
    executionStatus: "ממתין לצילום",
    paymentStatus: "ממתינה לתשלום",
    totalAmountIncludingVat: 2124,
    paidAmountIncludingVat: 0,
    remainingAmount: 2124,
    createdAt: now,
    updatedAt: now,
  });

  // Add Deliverables
  await db.insert(deliverables).values([
    {
      id: "del-1",
      dealId: deal1Id,
      deliverableNumber: "DEL-1024-1",
      name: "סרטון רילס #1 - הצגת שף והכנת המנה",
      parentProductName: "חבילת 5 סרטוני רילס לעסקים",
      category: "וידאו",
      status: "בעריכה",
      currentRevisionNumber: 1,
      maxRevisionsAllowed: 2,
      assignedStaffName: "איתי כהן",
      assignedStaffRole: "עורך",
      dueDate: "10/10/2026",
      rawFootageUrl: "https://drive.google.com/drive/folders/sample-raw-1",
      draftPreviewUrl: null,
      finalDeliveryUrl: null,
      staffNotes: "חיתוך מהיר, כתוביות בולטות, צבעים חמים למזון",
      clientFeedback: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "del-2",
      dealId: deal1Id,
      deliverableNumber: "DEL-1024-2",
      name: "סרטון רילס #2 - מנת הדגל בטאבון לוהט",
      parentProductName: "חבילת 5 סרטוני רילס לעסקים",
      category: "וידאו",
      status: "נשלח לבדיקת לקוח",
      currentRevisionNumber: 1,
      maxRevisionsAllowed: 2,
      assignedStaffName: "איתי כהן",
      assignedStaffRole: "עורך",
      dueDate: "12/10/2026",
      rawFootageUrl: "https://drive.google.com/drive/folders/sample-raw-1",
      draftPreviewUrl: "https://vimeo.com/sample-draft-2",
      finalDeliveryUrl: null,
      staffNotes: "טיוטה ראשונה נשלחה בווטסאפ ללקוח",
      clientFeedback: "ממתינים להערות הלקוח עד יום חמישי",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "del-3",
      dealId: deal2Id,
      deliverableNumber: "DEL-1022-1",
      name: "פרק פודקאסט #4 - תחזית השקעות נדל״ן 2026",
      parentProductName: "הפקת פודקאסט מצולם - פרק בודד",
      category: "סאונד",
      status: "סבב תיקונים",
      currentRevisionNumber: 2,
      maxRevisionsAllowed: 2,
      assignedStaffName: "איתי כהן",
      assignedStaffRole: "עורך",
      dueDate: "08/10/2026",
      rawFootageUrl: "https://drive.google.com/drive/folders/sample-raw-2",
      draftPreviewUrl: "https://youtube.com/sample-unlisted-3",
      finalDeliveryUrl: null,
      staffNotes: "הלקוחה ביקשה להחליף את כתובית הפתיחה בדקה 04:12",
      clientFeedback: "נא לשנות את התואר של המרואיין מרואה חשבון לשמאי מקרקעין",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "del-4",
      dealId: deal3Id,
      deliverableNumber: "DEL-1025-1",
      name: "צילומי סטילס תדמית משרד ושותפים",
      parentProductName: "יום צילומי תדמית ופורטרט עסקי באולפן",
      category: "סטילס",
      status: "ממתין לצילום",
      currentRevisionNumber: 1,
      maxRevisionsAllowed: 1,
      assignedStaffName: "דניאל לוי",
      assignedStaffRole: "צלם",
      dueDate: "14/10/2026",
      rawFootageUrl: null,
      draftPreviewUrl: null,
      finalDeliveryUrl: null,
      staffNotes: "מועד הצילום נקבע ליום ג׳ 10:00 באולפן",
      clientFeedback: null,
      createdAt: now,
      updatedAt: now,
    },
  ]);
}
