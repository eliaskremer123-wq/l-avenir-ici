import "server-only";
import { google } from "googleapis";

/**
 * Sheets connector — RAW ingestion layer ONLY.
 *
 * Responsibility:
 * - Authenticate against the Google Sheets API with a service account.
 * - Read the first sheet, treating row 1 as headers.
 * - Return raw row objects keyed by header.
 *
 * This module never maps to the `Project` type and never makes business
 * decisions about the data. Validation/normalization happens later in the
 * data-safety layer. Keep this file dependency-free of UI and matching logic.
 */

const SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
// CRITICAL: env-stored private keys escape newlines as literal "\n".
// Restore real newlines or the PEM parser will reject the key.
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

type RawRow = Record<string, string>;

export type EnrichedRawRow = RawRow & {
  submittedAt?: string;
};

function parseSubmittedAt(raw: string): string | undefined {
  if (!raw || raw.trim() === "") return undefined;
  const date = new Date(raw.trim());
  if (isNaN(date.getTime())) return undefined;
  const formatted = date.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
  return `${formatted}.`;
}

function enrichRawRow(record: RawRow): EnrichedRawRow {
  const timestampRaw = record.Timestamp ?? "";
  const submittedAt = parseSubmittedAt(timestampRaw);

  return {
    ...record,
    ...(submittedAt ? { submittedAt } : {}),
  } as EnrichedRawRow;
}

export function hasSheetCredentials(): boolean {
  return Boolean(SHEET_ID && CLIENT_EMAIL && PRIVATE_KEY);
}

/**
 * Fetch raw rows from the configured Google Sheet.
 *
 * Returns an array of plain objects mapping header -> cell value. Does NOT
 * map to `Project`. Throws if credentials are missing or the API call fails;
 * callers are responsible for falling back to a safe dataset.
 */
export async function getProjectsFromSheet(): Promise<EnrichedRawRow[]> {
  if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    throw new Error(
      "Missing Google Sheets credentials (GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, NEXT_PUBLIC_GOOGLE_SHEET_ID).",
    );
  }

  const auth = new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: [SHEETS_SCOPE],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    // Read the whole first sheet; row 1 is treated as headers below.
    range: "A1:Z1000",
  });

  const values = response.data.values;

  if (!Array.isArray(values) || values.length < 2) {
    return [];
  }

  const [headerRow, ...dataRows] = values;
  const headers = headerRow.map((header) => String(header ?? "").trim());

  return dataRows.map((row) => {
    const record: RawRow = {};
    headers.forEach((header, index) => {
      if (!header) return;
      record[header] = String(row[index] ?? "").trim();
    });
    return enrichRawRow(record);
  });
}
