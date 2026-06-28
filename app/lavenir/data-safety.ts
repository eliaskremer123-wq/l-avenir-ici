import type { Project } from "./types";

type RawRecord = Record<string, unknown>;

export function safeString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export function safeArray(value: unknown): string[] {
  if (value === null || value === undefined) return [];

  const values = Array.isArray(value) ? value : String(value).split(",");

  return values
    .flatMap((item) => (Array.isArray(item) ? item : [item]))
    .map(safeString)
    .filter(Boolean);
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

function readRawField(raw: unknown, keys: string[]): unknown {
  if (raw === null || typeof raw !== "object") return undefined;

  const record = raw as RawRecord;
  for (const key of keys) {
    if (record[key] !== undefined) return record[key];
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

// External rows are intentionally typed as any at the boundary.
// All access still goes through defensive normalization helpers below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeMapToProject(raw: any, fallbackIndex: number): Project {
  try {
    const name = safeString(readRawField(raw, ["name", "Nom", "Project", "Projet"]));
    const city = normalizeCity(
      safeString(readRawField(raw, ["Emplacement", "city", "City", "Ville"])),
    );

    return {
      id: slug(`${name} ${city} ${fallbackIndex}`),
      name,
      city,
      sector: safeString(readRawField(raw, ["sector", "Secteur"])),
      description: safeString(readRawField(raw, ["description", "Description"])),
      careers: safeArray(readRawField(raw, ["careers", "Métiers", "metiers"])),
      skills: safeArray(readRawField(raw, ["skills", "Compétences", "competences"])),
      preparationSteps: safeArray(
        readRawField(raw, [
          "preparationSteps",
          "Preparation Steps",
          "Comment se préparer",
          "Préparation",
        ]),
      ),
      timeline:
        safeString(readRawField(raw, ["timeline", "Timeline", "Horizon"])) ||
        "Indéterminé",
      status:
        safeString(readRawField(raw, ["status", "Status", "Statut"])) ||
        "Spéculatif",
      learnMore:
        safeString(readRawField(raw, ["learnMore", "Learn More", "URL", "Lien"])) ||
        "#",
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeParseProjects(rows: any[]): Project[] {
  if (!Array.isArray(rows)) {
    console.warn("Expected project rows to be an array; received fallback empty list.");
    return [];
  }

  const projects: Project[] = [];

  rows.forEach((row, index) => {
    try {
      projects.push(safeMapToProject(row, index));
    } catch (error) {
      console.warn("Skipping project row after safe parsing failure.", {
        error,
        index,
      });
    }
  });

  return projects;
}
