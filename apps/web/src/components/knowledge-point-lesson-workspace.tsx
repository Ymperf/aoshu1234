"use client";

import { useState } from "react";
import { KnowledgePointLessonIntro } from "@/components/knowledge-point-lesson-intro";
import { KnowledgePointLessonMedia } from "@/components/knowledge-point-lesson-media";
import { KnowledgePointLessonQuiz } from "@/components/knowledge-point-lesson-quiz";
import { KnowledgePointLessonSteps } from "@/components/knowledge-point-lesson-steps";
import type {
  KnowledgePointLessonExampleContent,
  KnowledgePointLessonIntroContent,
  KnowledgePointLessonMediaManifest,
  KnowledgePointLessonPackage
} from "@/lib/knowledge-point-lesson";

interface KnowledgePointLessonWorkspaceProps {
  lesson: KnowledgePointLessonPackage;
  media: KnowledgePointLessonMediaManifest | null;
  gradeNameOverride?: string;
}

type TabId = "lesson" | "practice";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "lesson", label: "学习讲解" },
  { id: "practice", label: "开始练习" }
];

function splitSentences(text: string) {
  return text
    .split(/(?<=[。！？])/u)
    .map((item) => item.trim())
    .filter(Boolean);
}

function summarizeText(text: string, limit = 2) {
  return splitSentences(text).slice(0, limit).join("");
}

function buildFallbackPoster(title: string, subtitle?: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#F5F9FF"/>
          <stop offset="100%" stop-color="#E6F0FF"/>
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#bg)"/>
      <circle cx="1280" cy="160" r="180" fill="#DCE9FF"/>
      <circle cx="280" cy="760" r="220" fill="#EDF4FF"/>
      <rect x="120" y="120" width="180" height="52" rx="26" fill="#165DFF"/>
      <text x="210" y="153" text-anchor="middle" font-size="24" font-family="Segoe UI, PingFang SC, Microsoft YaHei, sans-serif" fill="#FFFFFF">学习讲解</text>
      <text x="120" y="280" font-size="60" font-weight="700" font-family="Segoe UI, PingFang SC, Microsoft YaHei, sans-serif" fill="#1D2939">${title}</text>
      <foreignObject x="120" y="340" width="1120" height="220">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Segoe UI, PingFang SC, Microsoft YaHei, sans-serif; font-size: 28px; line-height: 1.7; color: #526075;">
          ${subtitle ?? "点击播放视频，查看完整讲解。"}
        </div>
      </foreignObject>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildFallbackIntroContent(lesson: KnowledgePointLessonPackage): KnowledgePointLessonIntroContent {
  return {
    summary: lesson.intro,
    cards: [
      lesson.problemStatement
        ? {
            id: "problem-model",
            title: "题目模型",
            icon: "🧩",
            tone: "blue" as const,
            type: "text" as const,
            content: lesson.problemStatement
          }
        : null,
      lesson.knownConditions?.length
        ? {
            id: "known-conditions",
            title: "已知条件",
            icon: "📌",
            tone: "amber" as const,
            type: "tags" as const,
            content: lesson.knownConditions
          }
        : null,
      lesson.targetQuestion
        ? {
            id: "target-question",
            title: "要解决什么",
            icon: "🎯",
            tone: "emerald" as const,
            type: "text" as const,
            content: lesson.targetQuestion
          }
        : null,
      lesson.corePrinciples?.length
        ? {
            id: "core-principles",
            title: "原理依据",
            icon: "🧠",
            tone: "blue" as const,
            type: "tags" as const,
            content: lesson.corePrinciples
          }
        : null,
      lesson.coreFormulas?.length
        ? {
            id: "core-formulas",
            title: "核心公式",
            icon: "🧮",
            tone: "slate" as const,
            type: "formula" as const,
            content: lesson.coreFormulas
          }
        : null,
      lesson.tips?.length
        ? {
            id: "tips",
            title: "技巧提醒",
            icon: "✍️",
            tone: "emerald" as const,
            type: "bullets" as const,
            content: lesson.tips
          }
        : null
    ].filter((item): item is NonNullable<typeof item> => item !== null)
  };
}

function buildDefaultStepCards(stepItems: Array<{ title: string; description: string }>) {
  const cardCount = Math.min(5, stepItems.length);
  const groupSize = Math.max(1, Math.ceil(stepItems.length / cardCount));
  const icons = ["🔍", "🪄", "📝", "🧠", "✅"];

  return Array.from({ length: cardCount }, (_, index) => {
    const group = stepItems.slice(index * groupSize, (index + 1) * groupSize);
    return {
      id: `fallback-step-${index + 1}`,
      icon: icons[index] ?? "📌",
      title: group.map((item) => item.title).join(" / "),
      explanation: summarizeText(group.map((item) => item.description).join(""), 2)
    };
  }).filter((item) => item.explanation);
}

function buildFallbackExampleContent(lesson: KnowledgePointLessonPackage): KnowledgePointLessonExampleContent {
  const stepItems =
    lesson.stepSummary?.length
      ? lesson.stepSummary
      : lesson.scenes.map((scene) => ({ title: scene.title, description: scene.caption }));

  if (
    lesson.problemFamily === "chicken_rabbit_same_cage" &&
    typeof lesson.totalHeads === "number" &&
    typeof lesson.totalLegs === "number" &&
    typeof lesson.solvedChickenCount === "number" &&
    typeof lesson.solvedRabbitCount === "number"
  ) {
    const baselineLegs = lesson.totalHeads * 2;
    const extraLegs = lesson.totalLegs - baselineLegs;

    return {
      title: "例题解析",
      problemStatement: lesson.problemStatement,
      knownConditions: lesson.knownConditions,
      targetQuestion: lesson.targetQuestion,
      answer: `鸡有 ${lesson.solvedChickenCount} 只，兔有 ${lesson.solvedRabbitCount} 只。`,
      steps: [
        {
          id: "step-1",
          icon: "📍",
          title: "先看头数和腿数",
          explanation: `头数先确定总只数：${lesson.totalHeads} 个头就是 ${lesson.totalHeads} 只。真正用来区分鸡和兔的，是不同的腿数。`
        },
        {
          id: "step-2",
          icon: "🐔",
          title: "先假设全是鸡",
          explanation: `把 ${lesson.totalHeads} 只都先看成鸡，得到基准腿数：${lesson.totalHeads}×2=${baselineLegs}。`
        },
        {
          id: "step-3",
          icon: "➡️",
          title: "算出多出来的腿",
          explanation: `实际腿数是 ${lesson.totalLegs} 条，比基准多 ${extraLegs} 条；这部分就是“把鸡换成兔”以后多出来的腿。`
        },
        {
          id: "step-4",
          icon: "🐇",
          title: "用腿差反推出兔数",
          explanation: `1 只兔比 1 只鸡多 2 条腿，所以兔数 = ${extraLegs}÷2=${lesson.solvedRabbitCount}。`
        },
        {
          id: "step-5",
          icon: "✅",
          title: "求鸡数并检验",
          explanation: `鸡数 = ${lesson.totalHeads}-${lesson.solvedRabbitCount}=${lesson.solvedChickenCount}，再代入头数和腿数同时检验。`
        }
      ],
      keyTakeaways: lesson.keyTakeaways
    };
  }

  return {
    title: "例题解析",
    problemStatement: lesson.problemStatement,
    knownConditions: lesson.knownConditions,
    targetQuestion: lesson.targetQuestion,
    steps: buildDefaultStepCards(stepItems),
    keyTakeaways: lesson.keyTakeaways
  };
}

export function KnowledgePointLessonWorkspace({ lesson, media }: KnowledgePointLessonWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<TabId>("lesson");
  const fallbackPoster = buildFallbackPoster(lesson.title, lesson.problemStatement ?? lesson.intro);
  const subtitle = lesson.meta?.subtitle ?? lesson.subtitle;
  const difficultyLabel = lesson.meta?.difficultyLabel ?? lesson.difficultyLabel;
  const introContent = lesson.introContent ?? buildFallbackIntroContent(lesson);
  const exampleContent = lesson.exampleContent ?? buildFallbackExampleContent(lesson);
  const illustrations = lesson.illustrations ?? [];

  return (
    <section className="grid gap-6 rounded-[12px] border border-[#E5E7EB] bg-white p-6 lg:p-8">
      <div className="grid gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">{lesson.meta?.title ?? lesson.title}</h1>
            {subtitle ? <p className="mt-3 text-base leading-8 text-slate-600">{subtitle}</p> : null}
          </div>
          {difficultyLabel ? (
            <span className="rounded-full bg-primary-soft px-4 py-2 text-sm font-semibold text-primary">{difficultyLabel}</span>
          ) : null}
        </div>

        <div className="border-b border-[#E5E7EB]">
          <div className="flex gap-8">
            {TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative pb-4 text-base font-medium transition ${
                    isActive ? "text-primary" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full transition ${
                      isActive ? "bg-primary" : "bg-transparent"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {activeTab === "lesson" ? (
        <div className="grid gap-6">
          <KnowledgePointLessonIntro intro={introContent} illustrations={illustrations} sourceSections={lesson.sourceSections} />
          <KnowledgePointLessonSteps example={exampleContent} illustrations={illustrations} sourceSections={lesson.sourceSections} />
          <KnowledgePointLessonMedia media={media} fallbackPoster={fallbackPoster} />
        </div>
      ) : (
        <KnowledgePointLessonQuiz lesson={lesson} />
      )}
    </section>
  );
}
