import { NextRequest, NextResponse } from "next/server";
import { searchCrmCustomers } from "@/lib/crm/adapter";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    
    const customers = await searchCrmCustomers(query);
    
    return NextResponse.json({
      success: true,
      query,
      customers,
    });
  } catch (error: any) {
    console.error("CRM Search Route Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to search CRM" },
      { status: 500 }
    );
  }
}
