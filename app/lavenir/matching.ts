import { ANALYSIS_STEPS, getProjectsSync, QUESTIONS } from "./data";
import type { Answers, Project, QuestionId, Recommendation } from "./types";

export { ANALYSIS_STEPS };

function normalizeCity(city: string): string {
  return city.trim().toLocaleLowerCase("fr");
}

/** Filters projects by city before ranking. Falls back to the full set when no city or no matches. */
export function filterProjectsByCity(
  projects: Project[],
  city?: string,
): Project[] {
  const normalized = city?.trim();
  if (!normalized) return projects;

  const needle = normalizeCity(normalized);
  const filtered = projects.filter(
    (project) => normalizeCity(project.locationCity) === needle,
  );

  return filtered.length > 0 ? filtered : projects;
}

function getReflectionPhrases(answers: Answers): string[] {
  const phrases: string[] = [];

  for (const question of QUESTIONS) {
    if (question.id === "location" || !question.options) continue;
    const value = answers[question.id];
    if (!Array.isArray(value)) continue;

    for (const optionId of value) {
      const option = question.options.find((o) => o.id === optionId);
      if (option) phrases.push(option.reflectionPhrase);
    }
  }

  return [...new Set(phrases)];
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

export function computeRecommendations(answers: Answers): Recommendation[] {
  const city = getResolvedLocation(answers);
  const projects = filterProjectsByCity(getProjectsSync(), city);
  const scores: Record<string, number> = {};
  for (const project of projects) scores[project.id] = 0;

  for (const question of QUESTIONS) {
    if (question.id === "location" || !question.options) continue;
    const value = answers[question.id];
    if (!Array.isArray(value)) continue;

    for (const optionId of value) {
      const option = question.options.find((o) => o.id === optionId);
      if (!option) continue;
      for (const [projectId, weight] of Object.entries(option.projectWeights)) {
        if (!(projectId in scores)) continue;
        scores[projectId] = (scores[projectId] ?? 0) + (weight ?? 0);
      }
    }
  }

  const phrases = getReflectionPhrases(answers);
  const traitSample = formatPhraseList(phrases.slice(0, 2));

  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([projectId, score]) => {
      const project = projects.find((p) => p.id === projectId)!;
      const template =
        project.matchTemplates[score % project.matchTemplates.length];
      return {
        projectId,
        score,
        personalMatch: template.replace("{traits}", traitSample),
      };
    });
}

export function buildPersonalSummary(
  answers: Answers,
  recommendations: Recommendation[],
): string {
  const phrases = getReflectionPhrases(answers);
  const traits = formatPhraseList(phrases.slice(0, 3));
  const top = getProjectsSync().find((p) => p.id === recommendations[0]?.projectId);

  const optionalNote =
    typeof answers.optional === "string" && answers.optional.trim()
      ? " Vous nous avez aussi confié quelque chose de personnel — nous en avons tenu compte."
      : "";

  if (!top) {
    return `Vos réponses font ressortir un intérêt pour ${traits}. Certaines transformations régionales peuvent être intéressantes à explorer à partir de cette curiosité.${optionalNote}`;
  }

  return `Ce qui ressort de vos réponses, c'est un intérêt pour ${traits}. ${top.name} fait partie des transformations régionales qui correspondent aux intérêts que vous avez partagés, notamment autour de ${top.sector.toLowerCase()}.${optionalNote} Vous n'avez pas à vous figer aujourd'hui — mais vous pouvez déjà explorer ce que ce secteur pourrait vous apprendre.`;
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
