import { NextRequest, NextResponse } from "next/server";
import { getQuotesList, createQuote } from "@/lib/services/quotes";

export async function GET() {
  try {
    const list = await getQuotesList();
    return NextResponse.json({ success: true, quotes: list });
  } catch (error: any) {
    console.error("GET quotes error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createQuote(body);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("POST quote error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
