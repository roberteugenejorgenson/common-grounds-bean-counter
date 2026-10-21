import { NextResponse } from "next/server";
import { readStoredCsv } from "../../../lib/data-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const csv = await readStoredCsv();
    return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="entries.csv"' } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Could not export entries." }, { status: 500 });
  }
}
