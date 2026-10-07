import { db, products, components, productComponents } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function getCatalogProducts() {
  const allProducts = await db.select().from(products).where(eq(products.isActive, true));
  
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
  return await db.select().from(components).where(eq(components.isActive, true));
}
