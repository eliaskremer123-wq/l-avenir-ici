export type Stage =
  | "welcome"
  | "understand"
  | "reflect"
  | "analyze"
  | "discover"
  | "continue";

export type QuestionId =
  | "location"
  | "workStyle"
  | "curiosity"
  | "environment"
  | "motivation"
  | "optional";

export type LocationChoice = "saint-avold" | "other" | "";

export type Answers = {
  location: LocationChoice;
  locationDetail: string;
  workStyle: string[];
  curiosity: string[];
  environment: string[];
  motivation: string[];
  optional: string;
};

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
  variant?: "location";
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
  locationCity: string;
  locationLabel: string;
  preparationSteps: string[];
  futureSkills: string[];
  sectorTags: string[];
  constraints: string[];
};

export type TerritoryTopic = {
  id: string;
  title: string;
  summary: string;
  detail: string;
};
