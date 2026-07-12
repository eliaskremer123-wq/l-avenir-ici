import { ANALYSIS_STEPS, QUESTIONS } from "./data";
import type { Answers, Project, QuestionId, Recommendation } from "./types";

export { ANALYSIS_STEPS };

const MAX_RESULTS = 5;

// Field weights for data-grounded scoring. Higher = stronger signal.
const FIELD_WEIGHTS = {
  sector: 3,
  skills: 2,
  careers: 1,
  description: 1,
  city: 1,
} as const;

function normalizeCity(city: string): string {
  return city.trim().toLocaleLowerCase("fr");
}

/** Kept for compatibility; no longer used to hard-filter recommendations. */
export function filterProjectsByCity(
  projects: Project[],
  city?: string,
): Project[] {
  const normalized = city?.trim();
  if (!normalized) return projects;

  const needle = normalizeCity(normalized);
  const filtered = projects.filter(
    (project) => normalizeCity(project.city) === needle,
  );

  return filtered.length > 0 ? filtered : projects;
}

const STOPWORDS = new Set([
  "avec", "dans", "pour", "vous", "votre", "vos", "des", "les", "une", "sur",
  "aux", "qui", "que", "ces", "sont", "plus", "aussi", "leur", "leurs", "etre",
  "sans", "par", "mais", "comme", "tout", "tous", "toutes", "chose", "choses",
  "entre", "selon", "ainsi", "plutot", "nouvelles", "nouveau", "nouvelle",
  "nouveaux",
]);

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Significant tokens (length >= 4, no stopwords) for overlap scoring. */
function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4 && !STOPWORDS.has(token));
}

type SelectedOption = { phrase: string; tokens: string[] };

/** The user's explicit selections, turned into grounded keyword sets. */
function getSelectedOptions(answers: Answers): SelectedOption[] {
  const selected: SelectedOption[] = [];

  for (const question of QUESTIONS) {
    if (question.id === "location" || !question.options) continue;
    const value = answers[question.id];
    if (!Array.isArray(value)) continue;

    for (const optionId of value) {
      const option = question.options.find((o) => o.id === optionId);
      if (!option) continue;
      selected.push({
        phrase: option.reflectionPhrase,
        tokens: [
          ...new Set(tokenize(`${option.label} ${option.reflectionPhrase}`)),
        ],
      });
    }
  }

  return selected;
}

function getReflectionPhrases(answers: Answers): string[] {
  return [...new Set(getSelectedOptions(answers).map((option) => option.phrase))];
}

function formatPhraseList(phrases: string[]): string {
  if (phrases.length === 0) return "explorer de nouvelles directions";
  if (phrases.length === 1) return phrases[0];
  if (phrases.length === 2) return `${phrases[0]} et ${phrases[1]}`;

  const head = phrases.slice(0, -1).join(", ");
  return `${head} et ${phrases[phrases.length - 1]}`;
}

export function buildReflection(answers: Answers): string {
  const phrases = getReflectionPhrases(answers);
  const formatted = formatPhraseList(phrases.slice(0, 4));

  return `D'après ce que vous nous avez partagé, vous semblez apprécier ${formatted}.`;
}

type ProjectIndex = {
  sector: Set<string>;
  skills: Set<string>;
  careers: Set<string>;
  description: Set<string>;
};

function buildProjectIndex(project: Project): ProjectIndex {
  return {
    sector: new Set(tokenize(project.sector ?? "")),
    skills: new Set(tokenize((project.skills ?? []).join(" "))),
    careers: new Set(tokenize((project.careers ?? []).join(" "))),
    description: new Set(tokenize(project.description ?? "")),
  };
}

/**
 * Score a project purely from data fields: sector / skills / careers /
 * description keyword overlap with the user's explicit selections, plus a light
 * city-match bonus. No personality inference. Returns the score and the user
 * phrases that actually overlapped (used for grounded narrative).
 */
function scoreProject(
  project: Project,
  selectedOptions: SelectedOption[],
  resolvedCity: string,
): { score: number; matchedPhrases: string[] } {
  const index = buildProjectIndex(project);
  let score = 0;
  const matchedPhrases: string[] = [];

  for (const option of selectedOptions) {
    let contributed = false;
    for (const token of option.tokens) {
      if (index.sector.has(token)) {
        score += FIELD_WEIGHTS.sector;
        contributed = true;
      }
      if (index.skills.has(token)) {
        score += FIELD_WEIGHTS.skills;
        contributed = true;
      }
      if (index.careers.has(token)) {
        score += FIELD_WEIGHTS.careers;
        contributed = true;
      }
      if (index.description.has(token)) {
        score += FIELD_WEIGHTS.description;
        contributed = true;
      }
    }
    if (contributed) matchedPhrases.push(option.phrase);
  }

  if (
    resolvedCity &&
    normalizeCity(project.city ?? "") === normalizeCity(resolvedCity)
  ) {
    score += FIELD_WEIGHTS.city;
  }

  return { score, matchedPhrases: [...new Set(matchedPhrases)] };
}

function buildMatchSentence(matchedPhrases: string[]): string {
  if (matchedPhrases.length === 0) return "";
  const themes = formatPhraseList(matchedPhrases.slice(0, 3));
  return `Ce secteur recoupe vos sélections autour de ${themes}.`;
}

/**
 * Pure ranked top-K retrieval. Scores ALL projects, sorts descending (stable on
 * ties), and ALWAYS returns the top 5 (or the whole dataset if it has fewer
 * than 5). No thresholds, no minimum-score filtering, no single-result collapse.
 * Even when every score is 0 (low-confidence), it still returns the top ranked
 * projects for graceful degradation.
 */
export function computeRecommendations(
  answers: Answers,
  projects: Project[],
): Recommendation[] {
  const pool = Array.isArray(projects) ? projects.filter(Boolean) : [];
  if (pool.length === 0) return [];

  const selectedOptions = getSelectedOptions(answers);
  const resolvedCity = getResolvedLocation(answers);

  const ranked = pool
    .map((project, index) => {
      const { score, matchedPhrases } = scoreProject(
        project,
        selectedOptions,
        resolvedCity,
      );
      return { project, index, score, matchedPhrases };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index);

  return ranked.slice(0, Math.min(MAX_RESULTS, pool.length)).map((entry) => ({
    stableProjectKey: entry.project.stableProjectKey,
    projectId: entry.project.id,
    score: entry.score,
    personalMatch: buildMatchSentence(entry.matchedPhrases),
  }));
}

/**
 * Non-inferential, data-grounded framing for the results page. Makes no claim
 * about the user's personality, motivations, or interests — it only states that
 * sectors were matched from their explicit selections and frames the cards below
 * as real, explorable industrial transitions in the region.
 */
export function buildPersonalSummary(): string {
  return [
    "D'après vos sélections, nous avons identifié plusieurs secteurs industriels en lien avec vos réponses.",
    "Ils correspondent à des transitions industrielles réelles, actuellement en cours dans la région de Saint-Avold.",
    "Voici des pistes concrètes que vous pouvez explorer — pas des prédictions, mais de réelles opportunités liées à des projets industriels en cours.",
    "Vous pouvez explorer chacune de ces directions sans vous engager : c'est un point de départ pour découvrir.",
  ].join(" ");
}

export function getResolvedLocation(answers: Answers): string {
  if (answers.location === "saint-avold") return "Saint-Avold";
  if (answers.location === "other") return answers.locationDetail.trim();
  return "";
}

export function getQuestionAnswerCount(
  questionId: QuestionId,
  answers: Answers,
): number {
  if (questionId === "location") {
    if (answers.location === "saint-avold") return 1;
    if (answers.location === "other" && answers.locationDetail.trim()) return 1;
    return 0;
  }
  if (questionId === "optional") {
    return typeof answers.optional === "string" && answers.optional.trim()
      ? 1
      : 0;
  }
  const value = answers[questionId];
  return Array.isArray(value) ? value.length : 0;
}

export function canAdvanceQuestion(
  questionId: QuestionId,
  answers: Answers,
): boolean {
  if (questionId === "location") {
    if (answers.location === "saint-avold") return true;
    if (answers.location === "other") return answers.locationDetail.trim().length > 0;
    return false;
  }

  const question = QUESTIONS.find((q) => q.id === questionId);
  if (!question) return false;
  if (question.optional) return true;
  const value = answers[questionId as Exclude<QuestionId, "location">];
  return Array.isArray(value) ? value.length > 0 : false;
}
