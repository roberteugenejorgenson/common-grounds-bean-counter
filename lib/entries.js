import { readFile, appendFile } from "node:fs/promises";
import path from "node:path";

const FILE = path.join(process.cwd(), "data", "entries.csv");
const COLUMNS = ["week_of", "location", "drinks_sold", "revenue", "loyalty_signups", "bags_sold", "notes"];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"' && field === "") quoted = true;
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += char;
  }
  if (field || row.length) { row.push(field.replace(/\r$/, "")); rows.push(row); }
  return rows;
}

export function encodeCsvField(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function readEntries() {
  const rows = parseCsv(await readFile(FILE, "utf8"));
  const headers = rows.shift() || [];
  return rows.filter((row) => row.length && row.some(Boolean)).map((row, index) => {
    const entry = Object.fromEntries(headers.map((header, i) => [header, row[i] ?? ""]));
    for (const key of ["drinks_sold", "revenue", "loyalty_signups", "bags_sold"]) entry[key] = Number(entry[key]) || 0;
    entry.id = `${entry.week_of}-${entry.location}-${index}`;
    return entry;
  });
}

export async function appendEntry(entry) {
  const line = COLUMNS.map((column) => encodeCsvField(entry[column])).join(",") + "\n";
  await appendFile(FILE, line, "utf8");
}

export { COLUMNS };
