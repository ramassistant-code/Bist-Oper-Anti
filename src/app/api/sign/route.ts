import { NextRequest, NextResponse } from "next/server";
import { signQuoteVersion } from "@/lib/services/quotes";

export async function POST(request: NextRequest) {
  try {
    const { token, signerName, signerIdNumber } = await request.json();
    if (!token || !signerName || !signerIdNumber) {
      return NextResponse.json({ success: false, error: "נא למלא את כל השדות הנדרשים לחתימה" }, { status: 400 });
    }

    const result = await signQuoteVersion(token, signerName, signerIdNumber);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Sign API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
