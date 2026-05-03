import lessonData from "./chicken-rabbit-demo.json";

export interface ChickenRabbitScene {
  id: string;
  title: string;
  durationSec: number;
  sceneType:
    | "intro_problem"
    | "guessing_problem"
    | "compare_traits"
    | "assume_all_chicken"
    | "delta_legs"
    | "replace_pattern"
    | "solve_verify"
    | "summary";
  objective: string;
  narration: string[];
  caption: string;
}

export interface ChickenRabbitQuizQuestion {
  id: string;
  type: "single_choice" | "fill_blank" | "application";
  stem: string;
  options?: string[];
  answer: string;
  analysis: string;
  commonMistake: string;
}

export interface ChickenRabbitLessonPackage {
  id: string;
  knowledgePointId: number;
  topicId: number;
  title: string;
  subtitle: string;
  intro: string;
  targetDurationSec: number;
  totalHeads: number;
  totalLegs: number;
  solvedChickenCount: number;
  solvedRabbitCount: number;
  spokenScript: string;
  keyTakeaways: string[];
  scenes: ChickenRabbitScene[];
  quizQuestions: ChickenRabbitQuizQuestion[];
}

export interface ChickenRabbitSentenceTiming {
  index: number;
  sceneId: string;
  sceneIndex: number;
  text: string;
  startSec: number;
  endSec: number;
  durationSec: number;
}

export interface ChickenRabbitSceneTiming {
  sceneId: string;
  sceneIndex: number;
  title: string;
  startSec: number;
  endSec: number;
  durationSec: number;
}

export interface ChickenRabbitTimingPayload {
  voice: string;
  audioDurationSec: number;
  generatedAt: string;
  sentences: ChickenRabbitSentenceTiming[];
  scenes: ChickenRabbitSceneTiming[];
  words: Array<{
    text: string;
    startSec: number;
    endSec: number;
    durationSec: number;
  }>;
}

export interface ChickenRabbitMediaManifest {
  generatedAt: string;
  audioUrl?: string;
  videoUrl?: string;
  posterUrl?: string;
  sentenceTimingUrl?: string;
  wordTimingUrl?: string;
  sceneTimingUrl?: string;
  audioDurationSec?: number;
  hasVideo: boolean;
  hasAudio: boolean;
  isConsistent?: boolean;
  inconsistencyReason?: string;
  lessonUpdatedAt?: string;
  mediaUpdatedAt?: string;
  staleArtifacts?: string[];
}

export const chickenRabbitDemoLesson = lessonData as ChickenRabbitLessonPackage;
