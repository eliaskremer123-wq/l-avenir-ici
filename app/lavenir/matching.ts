import { ANALYSIS_STEPS, PROJECTS, QUESTIONS } from "./data";
import type { Answers, QuestionId, Recommendation } from "./types";

export { ANALYSIS_STEPS };

function getReflectionPhrases(answers: Answers): string[] {
  const phrases: string[] = [];

  for (const question of QUESTIONS) {
    if (!question.options) continue;
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
  const scores: Record<string, number> = {};
  for (const project of PROJECTS) scores[project.id] = 0;

  for (const question of QUESTIONS) {
    if (!question.options) continue;
    const value = answers[question.id];
    if (!Array.isArray(value)) continue;

    for (const optionId of value) {
      const option = question.options.find((o) => o.id === optionId);
      if (!option) continue;
      for (const [projectId, weight] of Object.entries(option.projectWeights)) {
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
      const project = PROJECTS.find((p) => p.id === projectId)!;
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
  const top = PROJECTS.find((p) => p.id === recommendations[0]?.projectId);

  const optionalNote =
    typeof answers.optional === "string" && answers.optional.trim()
      ? " Vous nous avez aussi confié quelque chose de personnel — nous en avons tenu compte."
      : "";

  if (!top) {
    return `Votre profil mêle ${traits}. Saint-Avold construit justement les filières où ce type de curiosité peut s'exprimer.${optionalNote}`;
  }

  return `Ce qui ressort de vos réponses, c'est une personne attirée par ${traits}. Ce n'est pas un hasard si ${top.name} apparaît en tête : cette filière ${top.sector.toLowerCase()} répond à la fois à vos envies et aux grands chantiers du territoire.${optionalNote} Vous n'avez pas à vous figer aujourd'hui — mais vous pouvez déjà vous projeter.`;
}

export function getQuestionAnswerCount(
  questionId: QuestionId,
  answers: Answers,
): number {
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
  const question = QUESTIONS.find((q) => q.id === questionId);
  if (!question) return false;
  if (question.optional) return true;
  return getQuestionAnswerCount(questionId, answers) > 0;
}
