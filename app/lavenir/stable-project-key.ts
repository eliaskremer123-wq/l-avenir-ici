/** Deterministic key from identity fields — independent of sheet row index. */
export function buildStableProjectKey(
  name: string,
  city: string,
  sector: string,
): string {
  const normalized = [name, city, sector]
    .map((part) =>
      part
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[-_']/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean)
    .join(" ");

  return (
    normalized
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "project"
  );
}
