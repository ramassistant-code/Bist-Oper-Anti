import { NextRequest, NextResponse } from "next/server";
import { createProduct, updateProduct, deleteProduct, getCatalogProducts } from "@/lib/services/catalog";

export async function GET() {
  try {
    const list = await getCatalogProducts();
    return NextResponse.json({ success: true, products: list });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || body.price === undefined) {
      return NextResponse.json({ success: false, error: "נא להזין שם מוצר ומחיר" }, { status: 400 });
    }
    const result = await createProduct(body);
    return NextResponse.json({ success: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "מזהה מוצר חסר" }, { status: 400 });
    }
    await updateProduct(body.id, body);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "מזהה חסר" }, { status: 400 });
    await deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
