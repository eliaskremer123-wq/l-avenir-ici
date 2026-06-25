export type Stage =
  | "welcome"
  | "understand"
  | "reflect"
  | "analyze"
  | "discover"
  | "continue";

export type QuestionId =
  | "workStyle"
  | "curiosity"
  | "environment"
  | "motivation"
  | "optional";

export type Answers = Record<QuestionId, string[] | string>;

export type QuestionOption = {
  id: string;
  label: string;
  projectWeights: Partial<Record<string, number>>;
  reflectionPhrase: string;
};

export type Question = {
  id: QuestionId;
  dimension: string;
  prompt: string;
  subtitle?: string;
  multi: boolean;
  optional?: boolean;
  options?: QuestionOption[];
};

export type Recommendation = {
  projectId: string;
  score: number;
  personalMatch: string;
};

export type Project = {
  id: string;
  name: string;
  sector: string;
  careers: string[];
  skills: string[];
  timeline: string;
  matchTemplates: string[];
  learnMore: string;
};

export type TerritoryTopic = {
  id: string;
  title: string;
  summary: string;
  detail: string;
};
