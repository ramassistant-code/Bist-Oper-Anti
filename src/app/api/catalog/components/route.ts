import { NextRequest, NextResponse } from "next/server";
import { createComponent, updateComponent, deleteComponent, getAllComponents } from "@/lib/services/catalog";

export async function GET() {
  try {
    const list = await getAllComponents();
    return NextResponse.json({ success: true, components: list });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.deliverableType) {
      return NextResponse.json({ success: false, error: "נא להזין שם רכיב וסוג תוצר" }, { status: 400 });
    }
    const result = await createComponent(body);
    return NextResponse.json({ success: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "מזהה רכיב חסר" }, { status: 400 });
    }
    await updateComponent(body.id, body);
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
    await deleteComponent(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
