import { parseTargetYear, resolveTargetYearFromFields } from "../app/lavenir/parse-target-year.ts";
import { deriveProjectTimeline } from "../app/lavenir/timeline-status.ts";

let failed = false;

function fail(message) {
  console.error(`FAIL: ${message}`);
  failed = true;
}

function ok(label, detail = "") {
  console.log(`OK: ${label}${detail ? ` ${detail}` : ""}`);
}

// --- parseTargetYear unit cases ---
const parseCases = [
  ["Déjà actif", "active"],
  ["Deja Actif", "active"],
  ["DEJA ACTIF", "active"],
  ["Déjà Actif", "active"],
  ["Indéterminé", "indeterminate"],
  ["Indetermine", "indeterminate"],
  ["2035+", "longterm"],
  ["2029", 2029],
  ["2027", 2027],
];

console.log("parseTargetYear");
for (const [input, expected] of parseCases) {
  const result = parseTargetYear(input);
  if (result === expected) {
    ok(`${JSON.stringify(input)} → ${JSON.stringify(result)}`);
  } else {
    fail(
      `${JSON.stringify(input)} → ${JSON.stringify(result)} (expected ${JSON.stringify(expected)})`,
    );
  }
}

// --- resolveTargetYearFromFields + deriveProjectTimeline integration ---
const BASE_ROW = {
  "Nom de Projet": "Test",
  Ville: "Saint-Avold",
  Secteur: "Chimie",
  Statut: "Spéculatif",
};

function normalizeTimelineFields(row) {
  const targetYear = resolveTargetYearFromFields({
    openingYearRaw: row["Année d'ouverture prévue"] ?? "",
    legacyTimelineRaw: row.Chronologie ?? "",
  });
  const status = (row.Statut ?? row.status ?? "Spéculatif").trim();
  return {
    targetYear,
    timeline: deriveProjectTimeline(targetYear),
    status,
  };
}

function assertEqual(actual, expected, label) {
  for (const [key, value] of Object.entries(expected)) {
    if (actual[key] !== value) {
      fail(
        `${label}: ${key} = ${JSON.stringify(actual[key])}, expected ${JSON.stringify(value)}`,
      );
      return false;
    }
  }
  return true;
}

const integrationCases = [
  {
    label: "CIRC",
    row: {
      ...BASE_ROW,
      "Nom de Projet": "CIRC",
      "Année d'ouverture prévue": "2029",
      Statut: "En construction",
    },
    expected: {
      targetYear: 2029,
      timeline: "2029",
      status: "En construction",
    },
  },
  {
    label: "GazelEnergie",
    row: {
      ...BASE_ROW,
      "Nom de Projet": "GazelEnergie",
      Secteur: "Energie",
      "Année d'ouverture prévue": "2027",
      Statut: "Confirmé",
    },
    expected: {
      targetYear: 2027,
      timeline: "2027",
      status: "Confirmé",
    },
  },
  {
    label: "Afyren",
    row: {
      ...BASE_ROW,
      "Nom de Projet": "Afyren",
      "Année d'ouverture prévue": "Déjà actif",
      Statut: "Confirmé",
    },
    expected: {
      targetYear: "active",
      timeline: "Déjà actif",
      status: "Confirmé",
    },
  },
  {
    label: "Indeterminate",
    row: {
      ...BASE_ROW,
      "Nom de Projet": "Carling reconversion",
      "Année d'ouverture prévue": "",
      Statut: "Spéculatif",
    },
    expected: {
      targetYear: "indeterminate",
      timeline: "Indéterminé",
      status: "Spéculatif",
    },
  },
];

console.log("\nintegration / CSV vs Sheet parity");
for (const testCase of integrationCases) {
  const csvFields = normalizeTimelineFields(testCase.row);
  const sheetFields = normalizeTimelineFields({
    ...testCase.row,
    Timestamp: "6/27/2026 12:22:06",
  });

  const expectedOk = assertEqual(csvFields, testCase.expected, testCase.label);
  const parityOk =
    JSON.stringify(csvFields) === JSON.stringify(sheetFields);

  if (expectedOk && parityOk) {
    ok(testCase.label, JSON.stringify(csvFields));
  } else if (!parityOk) {
    fail(`${testCase.label}: CSV vs Sheet mismatch ${JSON.stringify(csvFields)} vs ${JSON.stringify(sheetFields)}`);
  }
}

console.log("\nlegacy Chronologie fallback");
const afyrenLegacy = resolveTargetYearFromFields({
  legacyTimelineRaw: "Déjà actif",
});
if (afyrenLegacy === "active") {
  ok('Chronologie "Déjà actif" → active');
} else {
  fail(`legacy Chronologie: expected "active", got ${JSON.stringify(afyrenLegacy)}`);
}

if (failed) {
  console.error("\nTarget year verification failed.");
  process.exit(1);
}

console.log("\nAll target year checks passed.");
