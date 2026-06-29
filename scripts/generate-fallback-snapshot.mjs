// Regenerates app/lavenir/fallback-snapshot.ts from the canonical CSV snapshot.
//
// Usage: node scripts/generate-fallback-snapshot.mjs
//
// The CSV at app/lavenir/fallback-projects.csv is the human-editable snapshot of
// the project spreadsheet. This script embeds it verbatim as a string so it can
// be bundled on both the server and the client as the offline fallback dataset.
// No recommendation/matching code needs to change when the snapshot updates.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const csvPath = join(root, "app/lavenir/fallback-projects.csv");
const outPath = join(root, "app/lavenir/fallback-snapshot.ts");

const csv = readFileSync(csvPath, "utf8");

const contents = `// AUTO-GENERATED SNAPSHOT — do not edit by hand.
//
// This is a verbatim snapshot of the project spreadsheet, exported to CSV and
// embedded as a string so it can be bundled on both server and client as the
// offline fallback dataset.
//
// To refresh the snapshot:
//   1. Replace app/lavenir/fallback-projects.csv with a new export.
//   2. Ensure the preparation column header reads "Comment se préparer"
//      (Google Forms exports it as a duplicate "Timestamp").
//   3. Run: node scripts/generate-fallback-snapshot.mjs
//
// Nothing in the recommendation engine needs to change when the snapshot updates.

export const FALLBACK_CSV = ${JSON.stringify(csv)};
`;

writeFileSync(outPath, contents);
console.log(`Wrote ${outPath} (${csv.length} chars).`);
