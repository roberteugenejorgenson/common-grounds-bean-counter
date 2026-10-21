import { NextResponse } from "next/server";
import { readStoredEntries, saveStoredEntry } from "../../../lib/data-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const LOCATIONS = ["Downtown", "Uptown", "Design District", "Bishop Arts"];
const NUMERIC_FIELDS = ["drinks_sold", "revenue", "loyalty_signups", "bags_sold"];

export async function GET() {
  try {
    const entries = await readStoredEntries();
    entries.sort((a, b) => b.week_of.localeCompare(a.week_of) || a.location.localeCompare(b.location));
    return NextResponse.json({ entries });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Could not read entries." }, { status: 500 });
  }
}

export async function POST(request) {
  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Submit the entry as a JSON object." }, { status: 400 });
  }

  const week = typeof body.week_of === "string" ? body.week_of.trim() : "";
  const location = typeof body.location === "string" ? body.location.trim() : "";
  if (!week) {
    return NextResponse.json({ error: "Enter a week date." }, { status: 400 });
  }
  const weekDate = new Date(`${week}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(week) || Number.isNaN(weekDate.getTime()) || weekDate.toISOString().slice(0, 10) !== week) {
    return NextResponse.json({ error: "Enter a valid week date." }, { status: 400 });
  }
  if (!location) return NextResponse.json({ error: "Select a café." }, { status: 400 });
  if (!LOCATIONS.includes(location)) {
    return NextResponse.json({ error: "Select one of the listed cafés." }, { status: 400 });
  }
  const values = {};
  for (const field of NUMERIC_FIELDS) {
    const value = body[field];
    const label = {
      drinks_sold: "Drinks sold",
      revenue: "Revenue",
      loyalty_signups: "Loyalty signups",
      bags_sold: "Bags sold",
    }[field];
    if (value === null || value === undefined || (typeof value === "string" && !value.trim())) {
      return NextResponse.json({ error: `${label} is required.` }, { status: 400 });
    }
    if ((typeof value !== "number" && typeof value !== "string") || !Number.isFinite(Number(value))) {
      return NextResponse.json({ error: `${label} must be a valid number.` }, { status: 400 });
    }
    if (Number(value) < 0) {
      return NextResponse.json({ error: `${label} cannot be negative.` }, { status: 400 });
    }
    values[field] = Number(value);
  }
  if (body.notes !== undefined && body.notes !== null && typeof body.notes !== "string") {
    return NextResponse.json({ error: "Notes must be text." }, { status: 400 });
  }
  const entry = { week_of: week, location, ...values, notes: (body.notes ?? "").trim() };
  try {
    const savedEntry = await saveStoredEntry(entry);
    return NextResponse.json({ entry: savedEntry ? { ...savedEntry, id: savedEntry.id ?? `${entry.week_of}-${entry.location}` } : entry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Could not save the entry." }, { status: 500 });
  }
}
