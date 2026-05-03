import type { ChickenRabbitMediaManifest, ChickenRabbitTimingPayload } from "@/lib/chicken-rabbit-demo";

export type KnowledgePointLessonSceneType =
  | "intro_problem"
  | "guessing_problem"
  | "compare_traits"
  | "assume_all_chicken"
  | "delta_legs"
  | "replace_pattern"
  | "solve_verify"
  | "summary";

export interface KnowledgePointLessonScene {
  id: string;
  title: string;
  durationSec: number;
  sceneType: KnowledgePointLessonSceneType;
  objective: string;
  narration: string[];
  caption: string;
}

export interface KnowledgePointLessonQuizQuestion {
  id: string;
  role?: "recognition" | "core" | "variant" | "trap" | "challenge";
  type: "single_choice" | "fill_blank" | "application";
  stem: string;
  options?: string[];
  answer: string;
  analysis: string;
  commonMistake: string;
  difficulty?: "basic" | "intermediate" | "advanced";
  templateId?: string;
  skillTags?: string[];
  canAutoVerify?: boolean;
}

export interface KnowledgePointLessonStepSummaryItem {
  title: string;
  description: string;
}

export interface KnowledgePointLessonMeta {
  title: string;
  subtitle?: string;
  gradeName: string;
  moduleName?: string;
  topicName: string;
  difficultyLabel?: string;
  problemFamily?: string;
  questionFamily?: string;
  targetDurationSec?: number;
}

export interface KnowledgePointLessonIntroCard {
  id: string;
  title: string;
  icon?: string;
  tone?: "slate" | "blue" | "amber" | "emerald";
  type: "text" | "tags" | "formula" | "bullets";
  content: string | string[];
  illustrationIds?: string[];
}

export interface KnowledgePointLessonIntroSectionItem {
  label: string;
  value: string | string[];
}

export interface KnowledgePointLessonIntroFocusSection {
  title: string;
  content: string;
}

export interface KnowledgePointLessonIntroGroupSection {
  title: string;
  items: KnowledgePointLessonIntroSectionItem[];
  illustrationIds?: string[];
}

export interface KnowledgePointLessonIntroSections {
  focus: KnowledgePointLessonIntroFocusSection;
  model: KnowledgePointLessonIntroGroupSection;
  method: KnowledgePointLessonIntroGroupSection;
}

export interface KnowledgePointLessonExampleStep {
  id: string;
  title: string;
  icon?: string;
  explanation: string;
  illustrationIds?: string[];
}

export interface KnowledgePointLessonIllustration {
  id: string;
  title: string;
  kind: "svg" | "inline_svg";
  placement: "intro" | "example" | "step" | "standalone";
  relatedStepId?: string;
  alt: string;
  caption?: string;
  assetPath?: string;
  svgContent?: string;
}

export interface KnowledgePointLessonBreadcrumbs {
  gradeName: string;
  moduleName?: string;
  topicName: string;
}

export interface KnowledgePointLessonIntroContent {
  summary: string;
  cards?: KnowledgePointLessonIntroCard[];
  sections?: KnowledgePointLessonIntroSections;
}

export interface KnowledgePointLessonExampleContent {
  title?: string;
  problemStatement?: string;
  knownConditions?: string[];
  targetQuestion?: string;
  answer?: string;
  steps: KnowledgePointLessonExampleStep[];
  keyTakeaways?: string[];
}

export interface KnowledgePointLessonPracticeContent {
  questions: KnowledgePointLessonQuizQuestion[];
}

export interface KnowledgePointLessonNarrationContent {
  spokenScript: string;
  scenes: KnowledgePointLessonScene[];
}

export interface KnowledgePointLessonSourceSections {
  knowledge?: {
    definition?: string;
    thinking?: string;
    formula?: string;
    mistakes?: string;
    features?: string;
  };
  example?: {
    title?: string;
    think?: string;
    steps?: string;
    answer?: string;
    summary?: string;
  };
}

export interface KnowledgePointLessonVideoPlanCondition {
  text: string;
  row?: string;
  column?: string;
  mark?: "yes" | "no";
}

export interface KnowledgePointLessonVideoPlanMark {
  row: string;
  column: string;
  mark: "yes" | "no";
}

export interface KnowledgePointLessonVideoPlanBeat {
  title: string;
  description: string;
  marks: KnowledgePointLessonVideoPlanMark[];
  focus?: {
    row: string;
    column: string;
  };
  highlightConditionIndex?: number;
}

export interface KnowledgePointLessonVideoPlan {
  template: "logic_table" | "generic";
  title: string;
  subtitle?: string;
  problem?: string;
  rows?: string[];
  columns?: string[];
  conditions?: KnowledgePointLessonVideoPlanCondition[];
  conditionBeats?: KnowledgePointLessonVideoPlanBeat[];
  reasoningBeats?: KnowledgePointLessonVideoPlanBeat[];
  finalMarks?: KnowledgePointLessonVideoPlanMark[];
  answers?: Array<{
    label: string;
    value: string;
  }>;
  methodSteps?: string[];
  practicePrompt?: string;
}

export interface KnowledgePointLessonPackage {
  schemaVersion?: string;
  id: string;
  knowledgePointId: number;
  topicId: number;
  problemFamily?: string;
  questionFamily?: string;
  title: string;
  subtitle?: string;
  intro: string;
  difficultyLabel?: string;
  breadcrumbs?: KnowledgePointLessonBreadcrumbs;
  problemStatement?: string;
  knownConditions?: string[];
  targetQuestion?: string;
  corePrinciples?: string[];
  coreFormulas?: string[];
  stepSummary?: KnowledgePointLessonStepSummaryItem[];
  tips?: string[];
  targetDurationSec: number;
  totalHeads?: number;
  totalLegs?: number;
  solvedChickenCount?: number;
  solvedRabbitCount?: number;
  spokenScript?: string;
  keyTakeaways: string[];
  scenes: KnowledgePointLessonScene[];
  quizQuestions: KnowledgePointLessonQuizQuestion[];
  meta?: KnowledgePointLessonMeta;
  introContent?: KnowledgePointLessonIntroContent;
  exampleContent?: KnowledgePointLessonExampleContent;
  practiceContent?: KnowledgePointLessonPracticeContent;
  narrationContent?: KnowledgePointLessonNarrationContent;
  sourceSections?: KnowledgePointLessonSourceSections;
  videoPlan?: KnowledgePointLessonVideoPlan;
  illustrations?: KnowledgePointLessonIllustration[];
  mediaPlan?: {
    videoPlanned?: boolean;
    audioPlanned?: boolean;
  };
  generationMeta?: {
    version: string;
    generatedAt: string;
    reviewStatus: "draft" | "checked" | "published";
    generationMode?: string;
    sourceProfile?: string;
  };
}

export type KnowledgePointLessonMediaManifest = ChickenRabbitMediaManifest;
export type KnowledgePointLessonTimingPayload = ChickenRabbitTimingPayload;
