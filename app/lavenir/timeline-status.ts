import type { Project } from "./types";

type ProjectTimelineStatus = "active" | "upcoming" | "longterm" | "unknown";

function resolveNumericYear(
  targetYear: Project["targetYear"],
): number | null {
  if (typeof targetYear === "number" && Number.isFinite(targetYear)) {
    return targetYear;
  }
  if (typeof targetYear === "string" && /^\d{4}$/.test(targetYear.trim())) {
    return Number(targetYear.trim());
  }
  return null;
}

/**
 * Derive a display status from the factual targetYear and the current calendar year.
 * targetYear itself is never mutated — only interpreted for UI.
 */
function getProjectTimelineStatus(
  targetYear: Project["targetYear"],
  currentYear = new Date().getFullYear(),
): ProjectTimelineStatus {
  if (targetYear === "active") return "active";
  if (targetYear === "longterm") return "longterm";
  if (targetYear === "indeterminate" || targetYear == null) return "unknown";

  const year = resolveNumericYear(targetYear);
  if (year === null) return "unknown";

  return year <= currentYear ? "active" : "upcoming";
}

function formatOpeningClause(
  targetYear: Project["targetYear"],
  currentYear: number,
): string | null {
  const timelineStatus = getProjectTimelineStatus(targetYear, currentYear);

  if (timelineStatus === "unknown" || timelineStatus === "active") return null;
  if (timelineStatus === "longterm") return "Ouverture long terme";

  const year = resolveNumericYear(targetYear);
  return year !== null ? `Ouverture ${year}` : null;
}

/**
 * User-facing French label combining project stage (status) and expected opening (targetYear).
 */
export function formatProjectStatusLabel(
  project: Pick<Project, "status" | "targetYear">,
  currentYear = new Date().getFullYear(),
): string | null {
  const timelineStatus = getProjectTimelineStatus(project.targetYear, currentYear);

  if (timelineStatus === "unknown") {
    return "Chronologie indéterminée";
  }

  if (timelineStatus === "active") {
    return "Déjà actif";
  }

  const stage = (project.status ?? "").trim() || null;
  const opening = formatOpeningClause(project.targetYear, currentYear);

  if (stage && opening) return `${stage} · ${opening}`;
  if (opening) return opening;
  if (stage) return stage;

  return null;
}

/** Canonical timeline label stored on Project — derived from targetYear, not Chronologie. */
export function deriveProjectTimeline(
  targetYear: Project["targetYear"],
  currentYear = new Date().getFullYear(),
): string {
  const status = getProjectTimelineStatus(targetYear, currentYear);

  if (status === "active") return "Déjà actif";
  if (status === "longterm") return "Long terme";
  if (status === "upcoming") {
    const year = resolveNumericYear(targetYear);
    return year !== null ? String(year) : "Indéterminé";
  }

  return "Indéterminé";
}
