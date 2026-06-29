import { FALLBACK_CSV } from "./fallback-snapshot";

/**
 * Offline fallback ingestion layer — the CSV-snapshot equivalent of `sheets.ts`.
 *
 * Responsibility:
 * - Parse the embedded CSV snapshot into raw row objects keyed by header.
 * - Return RAW ROW OBJECTS only.
 *
 * Like `sheets.ts`, this module never maps to the `Project` type and makes no
 * business decisions about the data. The exact same downstream pipeline
 * (`safeParseProjects`) handles ids, arrays, normalization and validation, so a
 * Sheet row and a CSV row produce identical `Project` objects.
 *
 * This file is pure (no Node-only APIs), so the snapshot can be bundled on both
 * the server and the client.
 */

type RawRow = Record<string, string>;

/**
 * Minimal RFC 4180-style CSV parser. Handles quoted fields, embedded commas,
 * embedded newlines, and escaped double quotes ("").
 */
function parseCsv(text: string): string[][] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];

    if (inQuotes) {
      if (char === '"') {
        if (normalized[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  // Flush the trailing field/row if the file does not end with a newline.
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/**
 * Disambiguate repeated headers so no column silently overwrites another.
 * Real-world Google Forms exports can repeat a header (e.g. "Timestamp"); the
 * canonical snapshot already relabels the preparation column, and this keeps any
 * remaining duplicates addressable rather than lost.
 */
function dedupeHeaders(headers: string[]): string[] {
  const counts = new Map<string, number>();
  return headers.map((header) => {
    const key = header.toLowerCase();
    const seen = counts.get(key) ?? 0;
    counts.set(key, seen + 1);
    return seen === 0 ? header : `${header} (${seen + 1})`;
  });
}

/**
 * Parse the embedded CSV snapshot into raw header-keyed rows.
 * Returns `[]` if the snapshot is empty or malformed.
 */
export function getFallbackProjectRows(): RawRow[] {
  const matrix = parseCsv(FALLBACK_CSV).filter((cells) =>
    cells.some((cell) => cell.trim() !== ""),
  );

  if (matrix.length < 2) return [];

  const headers = dedupeHeaders(matrix[0].map((header) => header.trim()));

  return matrix.slice(1).map((cells) => {
    const record: RawRow = {};
    headers.forEach((header, index) => {
      if (!header) return;
      record[header] = (cells[index] ?? "").trim();
    });
    return record;
  });
}
