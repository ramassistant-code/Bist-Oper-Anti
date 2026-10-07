import { NextResponse } from "next/server";
import { getDashboardDeliverables, seedSampleDeliverablesIfEmpty } from "@/lib/services/deliverables";

export async function GET() {
  try {
    await seedSampleDeliverablesIfEmpty();
    const items = await getDashboardDeliverables();
    return NextResponse.json({ success: true, deliverables: items });
  } catch (error: any) {
    console.error("GET deliverables error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
