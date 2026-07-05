export type Stage =
  | "welcome"
  | "understand"
  | "reflect"
  | "analyze"
  | "transition"
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

  city: string;

  sector: string;

  description: string;

  careers: string[];

  skills: string[];

  preparationSteps: string[];

  timeline: string;

  status: string;

  learnMore: string;

  matchTemplates: string[];

  imageUrl?: string;

  videoUrl?: string;
};

export type TerritoryTopic = {
  id: string;
  title: string;
  summary: string;
  detail: string;
};
