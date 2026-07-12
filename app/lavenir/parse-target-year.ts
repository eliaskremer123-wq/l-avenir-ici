import type { Project } from "./types";

/** Trim, lowercase, and strip diacritics for stable categorical matching. */
function normalizeTargetYearInput(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function parseTargetYear(raw: string): Project["targetYear"] {
  if (!raw || raw.trim() === "") return "indeterminate";

  const normalized = normalizeTargetYearInput(raw);

  if (normalized === "deja actif") return "active";
  if (normalized === "indetermine") return "indeterminate";
  if (normalized.includes("2035+") || normalized.includes("2030+")) return "longterm";

  const year = parseInt(raw.trim(), 10);
  if (!isNaN(year) && year >= 2024 && year <= 2040) return year;

  return "indeterminate";
}

function isParsedTargetYear(value: unknown): value is Project["targetYear"] {
  if (typeof value === "number" && Number.isFinite(value)) return true;
  return value === "active" || value === "indeterminate" || value === "longterm";
}

type TargetYearFieldInput = {
  preParsed?: unknown;
  openingYearRaw?: string;
  legacyTimelineRaw?: string;
};

/**
 * Canonical targetYear resolution for every ingestion path (Sheet, CSV, static).
 * Status is never inferred here — only opening-year semantics.
 */
export function resolveTargetYearFromFields(
  fields: TargetYearFieldInput,
): Project["targetYear"] {
  const { preParsed, openingYearRaw, legacyTimelineRaw } = fields;

  if (isParsedTargetYear(preParsed)) {
    return preParsed;
  }

  if (typeof preParsed === "string" && preParsed.trim()) {
    return parseTargetYear(preParsed);
  }

  if (openingYearRaw?.trim()) {
    return parseTargetYear(openingYearRaw);
  }

  if (legacyTimelineRaw?.trim()) {
    return parseTargetYear(legacyTimelineRaw);
  }

  return "indeterminate";
}
