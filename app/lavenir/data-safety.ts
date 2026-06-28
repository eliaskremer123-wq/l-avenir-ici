import type { Project } from "./types";

type RawRecord = Record<string, unknown>;

export function safeString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

/**
 * Split a messy multi-value cell into clean, human-readable strings.
 *
 * CRITICAL: we NEVER split on commas. Teacher input frequently contains commas
 * inside a single item ("techniciens (mécanique, électrique)") and grouped
 * numbers ("1,900 emplois"). Splitting on commas would shred these into broken
 * tokens. We only split on explicit list separators: semicolons and newlines.
 *
 * Accepts already-structured arrays (the curated mock dataset) as well as raw
 * strings (the Google Sheet), and never returns undefined.
 */
export function safeArray(value: unknown): string[] {
  if (value === null || value === undefined) return [];

  const items = Array.isArray(value) ? value : [value];

  return items
    .flatMap((item) => splitListValue(item))
    .map((item) => normalizeNumberString(item))
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitListValue(item: unknown): string[] {
  if (item === null || item === undefined) return [];
  if (Array.isArray(item)) return item.flatMap(splitListValue);
  // Only semicolons and newlines are treated as list separators.
  return String(item).split(/[\n;]+/);
}

/**
 * Repair grouped-number formatting WITHOUT corrupting prose.
 *
 * Removes the thousands-separator comma between digits ("1,900" -> "1900") so a
 * number survives as a single intact token, while leaving every other comma
 * (list separators, French punctuation) untouched. This is lossless for text.
 */
export function normalizeNumberString(input?: string): string {
  if (!input) return "";
  return input.replace(/(\d),(?=\d{3}(?:\D|$))/g, "$1").trim();
}

/**
 * Normalize a sheet header so lookups survive accents, parentheses, casing and
 * trailing spaces. e.g. "Description (exemple: ...) " -> "description".
 */
export function normalizeHeader(header: string): string {
  return safeString(header)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeForComparison(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[-_']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function capitalizeWords(value: string): string {
  return value
    .toLocaleLowerCase("fr")
    .split(/(\s+|-)/)
    .map((part) => {
      if (part.trim() === "" || part === "-") return part;
      return part.charAt(0).toLocaleUpperCase("fr") + part.slice(1);
    })
    .join("");
}

export function normalizeCity(input: string): string {
  const cleaned = safeString(input);
  if (!cleaned) return "";

  const normalized = normalizeForComparison(cleaned);
  const knownCities: Record<string, string> = {
    "saint avold": "Saint-Avold",
    carling: "Carling",
    forbach: "Forbach",
    hambach: "Hambach",
  };

  return knownCities[normalized] ?? capitalizeWords(cleaned);
}

/**
 * Resolve a field value from a raw row using resilient header matching:
 * exact key, then normalized equality, prefix, and partial (contains) match.
 * This lets variants like "Types d'emploi/opportunités créés", "Types d'emploi"
 * and "opportunités" all resolve to the same field.
 */
function readRawField(raw: unknown, keys: string[]): unknown {
  if (raw === null || typeof raw !== "object") return undefined;

  const record = raw as RawRecord;

  // 1. Exact header match (fast path).
  for (const key of keys) {
    if (record[key] !== undefined) return record[key];
  }

  // 2. Normalized header match with equality / prefix / partial fallbacks.
  const normalizedKeys = keys.map(normalizeHeader).filter(Boolean);
  for (const [rawKey, value] of Object.entries(record)) {
    const header = normalizeHeader(rawKey);
    if (!header) continue;
    if (
      normalizedKeys.some(
        (key) =>
          header === key || header.startsWith(key) || header.includes(key),
      )
    ) {
      return value;
    }
  }

  return undefined;
}

function slug(value: string): string {
  return (
    normalizeForComparison(value)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "project"
  );
}

function cleanText(value: unknown): string {
  return normalizeNumberString(safeString(value));
}

/**
 * Strict shape validation before a project leaves the pipeline. Invalid rows
 * are filtered out rather than crashing the ingestion.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateProject(p: any): boolean {
  return (
    typeof p?.id === "string" &&
    typeof p?.name === "string" &&
    typeof p?.city === "string" &&
    typeof p?.sector === "string" &&
    Array.isArray(p?.skills) &&
    Array.isArray(p?.careers)
  );
}

// External rows are intentionally typed as any at the boundary.
// All access still goes through defensive normalization helpers below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeMapToProject(raw: any, fallbackIndex: number): Project {
  try {
    const name = cleanText(
      readRawField(raw, ["name", "Nom de Projet", "Nom du projet", "Nom", "Project", "Projet"]),
    );
    const city = normalizeCity(
      safeString(readRawField(raw, ["Ville", "Emplacement", "city", "City"])),
    );

    return {
      id: slug(`${name} ${city} ${fallbackIndex}`),
      name,
      city,
      sector: cleanText(readRawField(raw, ["sector", "Secteur"])),
      description: cleanText(readRawField(raw, ["description", "Description"])),
      careers: safeArray(
        readRawField(raw, [
          "careers",
          "Types d'emploi",
          "Types d'emploi/opportunités créés",
          "opportunités",
          "Métiers",
          "metiers",
        ]),
      ),
      skills: safeArray(
        readRawField(raw, [
          "skills",
          "Compétences",
          "Compétences ou centres d'intérêt requis",
          "centres d'intérêt",
          "competences",
        ]),
      ),
      preparationSteps: safeArray(
        readRawField(raw, [
          "preparationSteps",
          "Preparation Steps",
          "Comment se préparer",
          "Préparation",
        ]),
      ),
      timeline:
        cleanText(readRawField(raw, ["timeline", "Timeline", "Chronologie", "Horizon"])) ||
        "Indéterminé",
      status:
        cleanText(readRawField(raw, ["status", "Status", "Statut"])) || "Spéculatif",
      learnMore:
        safeString(
          readRawField(raw, [
            "learnMore",
            "Lien pour en savoir plus",
            "Learn More",
            "URL",
            "Lien",
          ]),
        ) || "#",
      matchTemplates: safeArray(
        readRawField(raw, ["matchTemplates", "Match Templates", "Templates"]),
      ),
    };
  } catch (error) {
    console.warn("Unable to map project row safely; using fallback project.", {
      error,
      fallbackIndex,
    });

    return {
      id: slug(`project ${fallbackIndex}`),
      name: "",
      city: "",
      sector: "",
      description: "",
      careers: [],
      skills: [],
      preparationSteps: [],
      timeline: "Indéterminé",
      status: "Spéculatif",
      learnMore: "#",
      matchTemplates: [],
    };
  }
}

/**
 * Full ingestion pipeline:
 * raw row → normalize headers → safe field mapping → safeArray parsing →
 * number normalization → validateProject → clean Project[].
 *
 * Invalid or unparseable rows are skipped, never crashing the pipeline.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeParseProjects(rows: any[]): Project[] {
  if (!Array.isArray(rows)) {
    console.warn("Expected project rows to be an array; received fallback empty list.");
    return [];
  }

  const projects: Project[] = [];

  rows.forEach((row, index) => {
    try {
      const project = safeMapToProject(row, index);
      if (validateProject(project)) {
        projects.push(project);
      } else {
        console.warn("Skipping project row that failed validation.", { index });
      }
    } catch (error) {
      console.warn("Skipping project row after safe parsing failure.", {
        error,
        index,
      });
    }
  });

  return projects;
}
