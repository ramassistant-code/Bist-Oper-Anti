import { db, products, components, productComponents } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export async function getCatalogProducts() {
  const allProducts = await db.select().from(products).where(eq(products.isActive, true)).orderBy(desc(products.createdAt));
  
  // For each product, fetch BOM components
  const results = await Promise.all(
    allProducts.map(async (prod) => {
      const bomItems = await db
        .select({
          id: productComponents.id,
          componentId: productComponents.componentId,
          defaultQuantity: productComponents.defaultQuantity,
          sortOrder: productComponents.sortOrder,
          isOptional: productComponents.isOptional,
          componentName: components.name,
          deliverableType: components.deliverableType,
          unitType: components.unitType,
          costEstimate: components.costEstimate,
          defaultPrice: components.defaultPrice,
          internalNotes: components.internalNotes,
          quoteDescriptionDefault: components.quoteDescriptionDefault,
        })
        .from(productComponents)
        .leftJoin(components, eq(productComponents.componentId, components.id))
        .where(eq(productComponents.productId, prod.id));

      return {
        ...prod,
        components: bomItems,
      };
    })
  );

  return results;
}

export async function getAllComponents() {
  return await db.select().from(components).where(eq(components.isActive, true)).orderBy(desc(components.createdAt));
}

// ── Components CRUD ──────────────────────────────────────────────────────────

export async function createComponent(data: {
  componentNumber?: string;
  name: string;
  deliverableType: string;
  unitType?: string;
  costEstimate?: number;
  defaultPrice?: number;
  sopLink?: string;
  internalNotes?: string;
  quoteDescriptionDefault?: string;
}) {
  const id = `cmp-${Date.now()}`;
  const now = new Date().toISOString();
  const componentNumber = data.componentNumber || `CMP-${Math.floor(100 + Math.random() * 900)}`;

  await db.insert(components).values({
    id,
    componentNumber,
    name: data.name,
    deliverableType: data.deliverableType,
    unitType: data.unitType || "יחידה",
    costEstimate: Number(data.costEstimate) || 0,
    defaultPrice: Number(data.defaultPrice) || 0,
    sopLink: data.sopLink || null,
    internalNotes: data.internalNotes || null,
    quoteDescriptionDefault: data.quoteDescriptionDefault || null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  return { id, componentNumber };
}

export async function updateComponent(
  id: string,
  data: Partial<{
    name: string;
    deliverableType: string;
    unitType: string;
    costEstimate: number;
    defaultPrice: number;
    sopLink: string;
    internalNotes: string;
    quoteDescriptionDefault: string;
    isActive: boolean;
  }>
) {
  const now = new Date().toISOString();
  await db
    .update(components)
    .set({
      ...data,
      costEstimate: data.costEstimate !== undefined ? Number(data.costEstimate) : undefined,
      defaultPrice: data.defaultPrice !== undefined ? Number(data.defaultPrice) : undefined,
      updatedAt: now,
    })
    .where(eq(components.id, id));

  return { success: true };
}

export async function deleteComponent(id: string) {
  await db.update(components).set({ isActive: false }).where(eq(components.id, id));
  return { success: true };
}

// ── Products CRUD with BOM ───────────────────────────────────────────────────

export async function createProduct(data: {
  productNumber?: string;
  name: string;
  category?: string;
  deliverableType?: string;
  price: number;
  productionCost?: number;
  quoteDescriptionDefault?: string;
  quoteNotesDefault?: string;
  bomComponents?: Array<{
    componentId: string;
    quantity: number;
  }>;
}) {
  const id = `prd-${Date.now()}`;
  const now = new Date().toISOString();
  const productNumber = data.productNumber || `PRD-${Math.floor(200 + Math.random() * 800)}`;

  await db.insert(products).values({
    id,
    productNumber,
    name: data.name,
    category: data.category || "חבילות סושיאל",
    deliverableType: data.deliverableType || "וידאו",
    price: Number(data.price) || 0,
    productionCost: Number(data.productionCost) || 0,
    quoteDescriptionDefault: data.quoteDescriptionDefault || null,
    quoteNotesDefault: data.quoteNotesDefault || null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  // Insert BOM components if provided
  if (data.bomComponents && data.bomComponents.length > 0) {
    const bomRows = data.bomComponents.map((c, idx) => ({
      id: `bom-${Date.now()}-${idx}`,
      productId: id,
      componentId: c.componentId,
      defaultQuantity: Number(c.quantity) || 1,
      sortOrder: idx + 1,
      isOptional: false,
    }));
    await db.insert(productComponents).values(bomRows);
  }

  return { id, productNumber };
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    category?: string;
    deliverableType?: string;
    price?: number;
    productionCost?: number;
    quoteDescriptionDefault?: string;
    quoteNotesDefault?: string;
    bomComponents?: Array<{
      componentId: string;
      quantity: number;
    }>;
  }
) {
  const now = new Date().toISOString();

  await db
    .update(products)
    .set({
      name: data.name,
      category: data.category,
      deliverableType: data.deliverableType,
      price: data.price !== undefined ? Number(data.price) : undefined,
      productionCost: data.productionCost !== undefined ? Number(data.productionCost) : undefined,
      quoteDescriptionDefault: data.quoteDescriptionDefault,
      quoteNotesDefault: data.quoteNotesDefault,
      updatedAt: now,
    })
    .where(eq(products.id, id));

  // Update BOM if specified
  if (data.bomComponents) {
    await db.delete(productComponents).where(eq(productComponents.productId, id));
    if (data.bomComponents.length > 0) {
      const bomRows = data.bomComponents.map((c, idx) => ({
        id: `bom-${Date.now()}-${idx}`,
        productId: id,
        componentId: c.componentId,
        defaultQuantity: Number(c.quantity) || 1,
        sortOrder: idx + 1,
        isOptional: false,
      }));
      await db.insert(productComponents).values(bomRows);
    }
  }

  return { success: true };
}

export async function deleteProduct(id: string) {
  await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  return { success: true };
}
