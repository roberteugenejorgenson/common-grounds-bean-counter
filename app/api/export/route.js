import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const csv = await readFile(path.join(process.cwd(), "data", "entries.csv"), "utf8");
    return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="entries.csv"' } });
  } catch {
    return NextResponse.json({ error: "Could not export entries." }, { status: 500 });
  }
}
