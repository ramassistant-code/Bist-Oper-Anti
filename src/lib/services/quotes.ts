import { db, quotes, quoteVersions } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

export interface CreateQuoteInput {
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
    notes?: {
      clientNotes?: string;
      opsNotes?: string;
      priceReason?: string;
    };
  }>;
  totals: {
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    beforeVat: number;
    vatRate: number; // e.g. 0.18
    vatAmount: number;
    totalWithVat: number;
    advancePaymentAmount: number;
  };
  terms: {
    validityDays: number;
    paymentTerms: string;
    installmentsCount: number;
  };
  notes: {
    clientNotes: string;
    deliveryTerms: string;
    opsNotes: string;
    salesNotes: string;
  };
}

export async function createQuote(input: CreateQuoteInput) {
  // Generate quote number like Q-1049
  const existingQuotes = await db.select({ quoteNumber: quotes.quoteNumber }).from(quotes).orderBy(desc(quotes.createdAt)).limit(1);
  let nextNum = 1001;
  if (existingQuotes.length > 0 && existingQuotes[0].quoteNumber.startsWith("Q-")) {
    const parsed = parseInt(existingQuotes[0].quoteNumber.replace("Q-", ""), 10);
    if (!isNaN(parsed)) {
      nextNum = parsed + 1;
    }
  }
  const quoteNumber = `Q-${nextNum}`;
  const quoteId = `quo-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const versionId = `qver-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const signingToken = "sign_" + crypto.randomBytes(16).toString("hex");
  const now = new Date().toISOString();

  // Create Quote Version (Immutable snapshot)
  await db.insert(quoteVersions).values({
    id: versionId,
    quoteId: quoteId,
    versionNumber: 1,
    status: "טיוטה",
    partySnapshot: JSON.stringify(input.party),
    itemsSnapshot: JSON.stringify(input.items),
    totalsSnapshot: JSON.stringify(input.totals),
    termsSnapshot: JSON.stringify(input.terms),
    notesSnapshot: JSON.stringify(input.notes),
    signingToken,
    createdAt: now,
  });

  // Create Parent Quote
  await db.insert(quotes).values({
    id: quoteId,
    quoteNumber,
    crmCustomerId: input.crmCustomerId || null,
    currentVersionId: versionId,
    status: "טיוטה",
    defaultInstallmentsCount: input.terms.installmentsCount || 1,
    createdAt: now,
    updatedAt: now,
  });

  return {
    quoteId,
    quoteNumber,
    versionId,
    signingToken,
  };
}

export async function getQuotesList() {
  const allQuotes = await db.select().from(quotes).orderBy(desc(quotes.createdAt));
  
  const results = await Promise.all(
    allQuotes.map(async (q) => {
      let version = null;
      if (q.currentVersionId) {
        const v = await db.select().from(quoteVersions).where(eq(quoteVersions.id, q.currentVersionId)).limit(1);
        if (v.length > 0) {
          version = {
            ...v[0],
            party: v[0].partySnapshot ? JSON.parse(v[0].partySnapshot) : null,
            totals: v[0].totalsSnapshot ? JSON.parse(v[0].totalsSnapshot) : null,
          };
        }
      }
      return {
        ...q,
        version,
      };
    })
  );

  return results;
}

export async function getQuoteById(id: string) {
  const quoteList = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1);
  if (quoteList.length === 0) return null;

  const quote = quoteList[0];
  const versions = await db.select().from(quoteVersions).where(eq(quoteVersions.quoteId, id)).orderBy(desc(quoteVersions.versionNumber));
  
  const parsedVersions = versions.map((v) => ({
    ...v,
    party: v.partySnapshot ? JSON.parse(v.partySnapshot) : null,
    items: v.itemsSnapshot ? JSON.parse(v.itemsSnapshot) : [],
    totals: v.totalsSnapshot ? JSON.parse(v.totalsSnapshot) : null,
    terms: v.termsSnapshot ? JSON.parse(v.termsSnapshot) : null,
    notes: v.notesSnapshot ? JSON.parse(v.notesSnapshot) : null,
  }));

  return {
    ...quote,
    versions: parsedVersions,
    currentVersion: parsedVersions.find((v) => v.id === quote.currentVersionId) || parsedVersions[0] || null,
  };
}

export async function getQuoteBySigningToken(token: string) {
  const versions = await db.select().from(quoteVersions).where(eq(quoteVersions.signingToken, token)).limit(1);
  if (versions.length === 0) return null;

  const version = versions[0];
  const quoteList = await db.select().from(quotes).where(eq(quotes.id, version.quoteId)).limit(1);
  const quote = quoteList[0] || null;

  return {
    quote,
    version: {
      ...version,
      party: version.partySnapshot ? JSON.parse(version.partySnapshot) : null,
      items: version.itemsSnapshot ? JSON.parse(version.itemsSnapshot) : [],
      totals: version.totalsSnapshot ? JSON.parse(version.totalsSnapshot) : null,
      terms: version.termsSnapshot ? JSON.parse(version.termsSnapshot) : null,
      // Note: Only client-facing notes are exposed here! Internal and sales notes remain hidden.
      clientNotes: version.notesSnapshot ? JSON.parse(version.notesSnapshot).clientNotes : "",
      deliveryTerms: version.notesSnapshot ? JSON.parse(version.notesSnapshot).deliveryTerms : "",
    },
  };
}

export async function signQuoteVersion(token: string, signerName: string, signerIdNumber: string) {
  const versions = await db.select().from(quoteVersions).where(eq(quoteVersions.signingToken, token)).limit(1);
  if (versions.length === 0) throw new Error("הצעה לא נמצאה לפי מזהה חתימה");

  const version = versions[0];
  const now = new Date().toISOString();

  // 1. Update version
  await db
    .update(quoteVersions)
    .set({
      status: "נחתמה",
      signedAt: now,
      signerName,
      signerIdNumber,
    })
    .where(eq(quoteVersions.id, version.id));

  // 2. Update parent quote
  await db
    .update(quotes)
    .set({
      status: "נחתמה",
      updatedAt: now,
    })
    .where(eq(quotes.id, version.quoteId));

  return { success: true };
}

