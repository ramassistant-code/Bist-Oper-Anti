import { NextRequest, NextResponse } from "next/server";
import { createDirectSale } from "@/lib/services/deals";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createDirectSale(body);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Direct Sale API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
