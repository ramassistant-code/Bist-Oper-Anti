import { NextResponse } from "next/server";
import { getCatalogProducts, getAllComponents } from "@/lib/services/catalog";

export async function GET() {
  try {
    const [productsList, componentsList] = await Promise.all([
      getCatalogProducts(),
      getAllComponents(),
    ]);

    return NextResponse.json({
      success: true,
      products: productsList,
      components: componentsList,
    });
  } catch (error: any) {
    console.error("Catalog API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch catalog" },
      { status: 500 }
    );
  }
}
