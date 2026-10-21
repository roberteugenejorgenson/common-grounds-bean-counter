import { appendEntry as appendCsvEntry, readEntries as readCsvEntries, COLUMNS, encodeCsvField } from "./entries";
import { readFile } from "node:fs/promises";
import path from "node:path";

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url && !secretKey && process.env.NODE_ENV !== "production") return null;
  if (!url || !secretKey) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY.");
  }
  return { url, secretKey };
}

async function supabaseRequest(path, options = {}) {
  const { url, secretKey } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      apikey: secretKey,
      // Legacy service_role keys are JWTs and also need the bearer header.
      // New sb_secret_ keys are non-JWT API keys and must only use apikey.
      ...(secretKey.startsWith("eyJ") ? { Authorization: `Bearer ${secretKey}` } : {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${detail || response.statusText}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

function useSupabase() {
  return Boolean(process.env.SUPABASE_URL || process.env.SUPABASE_SECRET_KEY) || process.env.NODE_ENV === "production";
}

export async function readStoredEntries() {
  if (!useSupabase()) return readCsvEntries();
  const rows = await supabaseRequest("entries?select=id,week_of,location,drinks_sold,revenue,loyalty_signups,bags_sold,notes&order=week_of.desc,location.asc,id.asc");
  return rows.map((entry) => ({
    ...entry,
    drinks_sold: Number(entry.drinks_sold),
    revenue: Number(entry.revenue),
    loyalty_signups: Number(entry.loyalty_signups),
    bags_sold: Number(entry.bags_sold),
  }));
}

export async function saveStoredEntry(entry) {
  if (!useSupabase()) return appendCsvEntry(entry);
  const rows = await supabaseRequest("entries?select=id,week_of,location,drinks_sold,revenue,loyalty_signups,bags_sold,notes", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(entry),
  });
  return rows[0];
}

export async function readStoredCsv() {
  if (!useSupabase()) {
    return readFile(path.join(process.cwd(), "data", "entries.csv"), "utf8");
  }
  const entries = await readStoredEntries();
  return [COLUMNS.join(","), ...entries.map((entry) => COLUMNS.map((column) => encodeCsvField(entry[column])).join(","))].join("\n") + "\n";
}
