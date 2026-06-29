import { safeParseProjects } from "./data-safety";
import { getFallbackProjectRows } from "./fallback";
import type { Project, Question, TerritoryTopic } from "./types";

export const QUESTIONS: Question[] = [
  {
    id: "location",
    dimension: "Votre territoire",
    prompt: "Où étudiez-vous ou habitez-vous ?",
    subtitle: "Cela nous aide à situer vos opportunités dans le bon contexte.",
    multi: false,
    variant: "location",
  },
  {
    id: "workStyle",
    dimension: "Votre façon de travailler",
    prompt: "Quand vous sentez-vous le plus engagé(e) ?",
    subtitle: "Choisissez ce qui vous ressemble — plusieurs réponses possibles.",
    multi: true,
    options: [
      {
        id: "problems",
        label: "Résoudre des problèmes difficiles",
        projectWeights: { hydrogen: 3, maintenance: 2, chemistry: 2 },
        reflectionPhrase: "résoudre des problèmes complexes",
      },
      {
        id: "building",
        label: "Construire des choses concrètes",
        projectWeights: { maintenance: 3, infrastructure: 3, chemistry: 1 },
        reflectionPhrase: "voir le résultat concret de votre travail",
      },
      {
        id: "helping",
        label: "Aider les autres",
        projectWeights: { logistics: 2, maintenance: 1 },
        reflectionPhrase: "être utile aux équipes et aux personnes",
      },
      {
        id: "organizing",
        label: "Organiser des projets",
        projectWeights: { logistics: 3, infrastructure: 1 },
        reflectionPhrase: "structurer et coordonner des projets",
      },
      {
        id: "outdoors",
        label: "Travailler en extérieur",
        projectWeights: { infrastructure: 3, maintenance: 2 },
        reflectionPhrase: "évoluer sur le terrain plutôt que derrière un écran",
      },
      {
        id: "creating",
        label: "Créer de nouvelles idées",
        projectWeights: { hydrogen: 2, chemistry: 3 },
        reflectionPhrase: "imaginer des solutions nouvelles",
      },
    ],
  },
  {
    id: "curiosity",
    dimension: "Votre curiosité",
    prompt: "Quels sujets retiennent naturellement votre attention ?",
    subtitle: "Pas besoin d'être expert — parlez-nous de ce qui vous intrigue.",
    multi: true,
    options: [
      {
        id: "science",
        label: "Sciences",
        projectWeights: { hydrogen: 3, chemistry: 3 },
        reflectionPhrase: "comprendre comment les choses fonctionnent",
      },
      {
        id: "technology",
        label: "Technologie",
        projectWeights: { hydrogen: 3, maintenance: 2, infrastructure: 2 },
        reflectionPhrase: "les innovations techniques",
      },
      {
        id: "environment",
        label: "Environnement",
        projectWeights: { hydrogen: 3, chemistry: 3, infrastructure: 2 },
        reflectionPhrase: "la transition écologique",
      },
      {
        id: "logistics",
        label: "Logistique",
        projectWeights: { logistics: 4 },
        reflectionPhrase: "comment les flux et les ressources circulent",
      },
      {
        id: "business",
        label: "Commerce",
        projectWeights: { logistics: 2, infrastructure: 1 },
        reflectionPhrase: "l'organisation et le sens des affaires",
      },
      {
        id: "digital",
        label: "Numérique",
        projectWeights: { hydrogen: 2, logistics: 2, maintenance: 1 },
        reflectionPhrase: "les outils numériques et les données",
      },
      {
        id: "chemistry",
        label: "Sciences",
        projectWeights: { chemistry: 4, hydrogen: 1 },
        reflectionPhrase: "la chimie et les matériaux",
      },
      {
        id: "mechanics",
        label: "Travail manuel",
        projectWeights: { maintenance: 4, infrastructure: 2 },
        reflectionPhrase: "les machines et les systèmes mécaniques",
      },
    ],
  },
  {
    id: "environment",
    dimension: "Votre environnement idéal",
    prompt: "Quel type de lieu de travail vous semble le plus juste ?",
    subtitle: "Imaginez un quotidien qui vous conviendrait vraiment.",
    multi: true,
    options: [
      {
        id: "smallTeams",
        label: "Petites équipes soudées",
        projectWeights: { maintenance: 2, logistics: 1 },
        reflectionPhrase: "travailler en proximité avec une équipe",
      },
      {
        id: "industrial",
        label: "Grands sites industriels",
        projectWeights: { hydrogen: 3, chemistry: 3, maintenance: 2 },
        reflectionPhrase: "l'ampleur et l'énergie des sites industriels",
      },
      {
        id: "office",
        label: "Bureaux & espaces calmes",
        projectWeights: { logistics: 2, hydrogen: 1 },
        reflectionPhrase: "des environnements où réfléchir et planifier",
      },
      {
        id: "outdoors",
        label: "Extérieur & chantiers",
        projectWeights: { infrastructure: 4, maintenance: 2 },
        reflectionPhrase: "le terrain et les chantiers",
      },
      {
        id: "lab",
        label: "Laboratoires",
        projectWeights: { chemistry: 4, hydrogen: 2 },
        reflectionPhrase: "l'analyse et la rigueur en laboratoire",
      },
      {
        id: "workshop",
        label: "Ateliers & workshops",
        projectWeights: { maintenance: 4, infrastructure: 1 },
        reflectionPhrase: "manier les outils et intervenir concrètement",
      },
    ],
  },
  {
    id: "motivation",
    dimension: "Ce qui compte pour vous",
    prompt: "Qu'est-ce qui compte le plus pour vous aujourd'hui ?",
    subtitle: "Il n'y a pas de mauvaise réponse — seulement la vôtre.",
    multi: true,
    options: [
      {
        id: "stability",
        label: "La stabilité",
        projectWeights: { maintenance: 2, logistics: 2, infrastructure: 2 },
        reflectionPhrase: "construire sur des bases solides",
      },
      {
        id: "impact",
        label: "Avoir un impact",
        projectWeights: { hydrogen: 3, chemistry: 3, infrastructure: 2 },
        reflectionPhrase: "contribuer à quelque chose de plus grand",
      },
      {
        id: "learning",
        label: "Apprendre en continu",
        projectWeights: { hydrogen: 2, chemistry: 2, maintenance: 2 },
        reflectionPhrase: "progresser et acquérir de nouvelles compétences",
      },
      {
        id: "creativity",
        label: "La créativité",
        projectWeights: { chemistry: 2, hydrogen: 2 },
        reflectionPhrase: "trouver des approches originales",
      },
      {
        id: "salary",
        label: "Un bon salaire",
        projectWeights: { maintenance: 2, logistics: 2, infrastructure: 2 },
        reflectionPhrase: "la sécurité financière",
      },
      {
        id: "teamwork",
        label: "Le travail d'équipe",
        projectWeights: { logistics: 2, maintenance: 2, chemistry: 1 },
        reflectionPhrase: "avancer ensemble",
      },
    ],
  },
  {
    id: "optional",
    dimension: "Enfin",
    prompt: "Y a-t-il autre chose que vous aimeriez nous dire ?",
    subtitle: "Optionnel — une contrainte, une envie, une hésitation… Tout ce qui vous semble utile.",
    multi: false,
    optional: true,
  },
];

export const ANALYSIS_STEPS = [
  "Comprendre vos intérêts",
  "Explorer les projets industriels",
  "Repérer les compétences partagées",
  "Trouver des connexions significatives",
  "Préparer vos pistes à explorer",
];

/**
 * Local fallback dataset.
 *
 * Built from the CSV snapshot of the real project spreadsheet
 * (`fallback-projects.csv` → `fallback-snapshot.ts`), passed through the EXACT
 * same ingestion pipeline as the live Google Sheet (`safeParseProjects`). A
 * Sheet row and a CSV row therefore produce identical `Project` objects — ids,
 * arrays, skills, careers, preparationSteps, timeline, links and validation are
 * all handled in one place. There are no hand-written / AI-generated projects.
 *
 * To update this dataset, refresh the CSV snapshot (see fallback-snapshot.ts).
 */
export const PROJECTS: Project[] = safeParseProjects(getFallbackProjectRows());

/**
 * Source of raw, untrusted project rows (e.g. the Google Sheet connector).
 * Returns header-keyed row objects; never trusted, never mapped to `Project`.
 */
export type RawProjectSource = () => Promise<unknown[]>;

/** Where the served project data ultimately came from. Developer-facing only. */
export type ProjectDataSource = "sheet" | "fallback";

/**
 * Orchestration layer — single source of truth for project data.
 *
 * Loading order:
 *   1. Attempt the external source (the Google Sheet, when wired in by the API).
 *   2. If it succeeds with usable rows, use the live Sheet.
 *   3. If it is absent, errors, or returns empty/invalid data, use the local
 *      CSV fallback snapshot.
 *
 * Both branches run through `safeParseProjects`, so the matching engine and UI
 * receive the same `Project[]` shape and cannot tell where the data came from.
 *
 * Returns the resolved projects plus a developer-facing `source` tag (used for
 * logging / response metadata only — never surfaced in the UI). Never throws.
 */
export async function loadProjects(
  source?: RawProjectSource,
): Promise<{ projects: Project[]; source: ProjectDataSource }> {
  if (!source) {
    console.warn(
      "[data] No external source provided — using local CSV fallback snapshot.",
    );
    return { projects: PROJECTS, source: "fallback" };
  }

  try {
    const rawRows = await source();
    const parsed = safeParseProjects(rawRows);

    if (parsed.length === 0) {
      console.warn(
        "[data] External source returned no usable rows — using local CSV fallback snapshot.",
      );
      return { projects: PROJECTS, source: "fallback" };
    }

    console.info(
      `[data] Loaded ${parsed.length} projects from external source (Google Sheet).`,
    );
    return { projects: parsed, source: "sheet" };
  } catch (error) {
    console.warn(
      "[data] Failed to load from external source — using local CSV fallback snapshot.",
      error,
    );
    return { projects: PROJECTS, source: "fallback" };
  }
}

/** Convenience wrapper returning just the resolved projects. Never throws. */
export async function getProjects(source?: RawProjectSource): Promise<Project[]> {
  return (await loadProjects(source)).projects;
}

/** Synchronous project access for matching until recommendation flow is async. */
export function getProjectsSync(): Project[] {
  return PROJECTS;
}

export const TERRITORY_TOPICS: TerritoryTopic[] = [
  {
    id: "hydrogen",
    title: "L'hydrogène bas carbone",
    summary:
      "Carling-Saint-Avold se positionne comme un pôle énergétique majeur en Lorraine.",
    detail:
      "La production d'hydrogène vert vise à décarboner l'industrie locale et à faire émerger de nouvelles compétences dans l'énergie de demain — un tournant visible depuis chez vous.",
  },
  {
    id: "chemistry",
    title: "La chimie circulaire",
    summary:
      "Les anciens sites chimiques se transforment pour recycler et valoriser les matériaux.",
    detail:
      "Plutôt que de tout jeter, l'industrie repense ses cycles : moins de déchets, plus de savoir-faire techniques à découvrir, et une filière qui a du sens pour l'environnement.",
  },
  {
    id: "transition",
    title: "La transition industrielle",
    summary:
      "Saint-Avold ne disparaît pas — elle se réinvente autour de nouvelles activités.",
    detail:
      "Des milliers d'emplois industriels ont existé ici. La reconversion n'efface pas cette histoire : elle la prolonge avec de nouveaux métiers, souvent plus proches de ce qui se construit aujourd'hui en Europe.",
  },
  {
    id: "investment",
    title: "Les investissements de demain",
    summary:
      "Des milliards d'euros sont engagés pour reconstruire la base industrielle régionale.",
    detail:
      "Ces projets ne sont pas abstraits : ils signifient des formations, des stages, des immersions et des secteurs à explorer pour les jeunes du territoire.",
  },
];
