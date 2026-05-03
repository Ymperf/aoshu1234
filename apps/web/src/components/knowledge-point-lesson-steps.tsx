"use client";

import type React from "react";
import { KnowledgePointLessonIllustrations } from "@/components/knowledge-point-lesson-illustrations";
import { MathRichText } from "@/components/math-rich-text";
import type {
  KnowledgePointLessonExampleContent,
  KnowledgePointLessonIllustration,
  KnowledgePointLessonSourceSections
} from "@/lib/knowledge-point-lesson";

interface KnowledgePointLessonStepsProps {
  example: KnowledgePointLessonExampleContent;
  illustrations: KnowledgePointLessonIllustration[];
  sourceSections?: KnowledgePointLessonSourceSections;
}

function shouldRenderIllustrationBelowProblem(problemText?: string) {
  if (!problemText?.trim()) {
    return false;
  }

  const hasFigureCue = /(如图|如下图|上图|图中)/u.test(problemText);
  const hasPointRelationCue = /([A-Z]{2,4})|(点[A-Z])|(∥)|(交于点[A-Z])|(梯形[A-Z]{4})|(三角形[A-Z]{3})/u.test(problemText);

  return hasFigureCue || hasPointRelationCue;
}

function ExampleBlock({
  title,
  emoji,
  accentClass,
  content,
  children
}: {
  title: string;
  emoji: string;
  accentClass: string;
  content?: string;
  children?: React.ReactNode;
}) {
  if (!content?.trim() && !children) {
    return null;
  }

  return (
    <div className="grid gap-3 border-b border-[#E5E7EB] pb-5 last:border-b-0 last:pb-0">
      <h3 className={`flex items-center gap-2 text-base font-semibold ${accentClass}`}>
        <span aria-hidden="true">{emoji}</span>
        <span>{title}</span>
      </h3>
      {content ? <MathRichText content={content} className="whitespace-pre-wrap text-[15px] leading-8 text-[#5B6472]" /> : null}
      {children}
    </div>
  );
}

export function KnowledgePointLessonSteps({ example, illustrations, sourceSections }: KnowledgePointLessonStepsProps) {
  const exampleIllustrations = illustrations.filter((item) => item.placement === "example");
  const sourceExample = sourceSections?.example;
  const renderIllustrationBelowProblem = shouldRenderIllustrationBelowProblem(sourceExample?.title ?? example.problemStatement);

  if (sourceExample) {
    return (
      <section className="rounded-[12px] border border-[#D9E7FF] bg-white p-6">
        <h2 className="text-xl font-semibold text-[#333333]">📘 例题解析</h2>
        <div className="mt-5 grid gap-5">
          <ExampleBlock title="例题题目" emoji="📍" accentClass="text-[#165DFF]" content={sourceExample.title}>
            {renderIllustrationBelowProblem && exampleIllustrations.length > 0 ? (
              <div className="mt-2">
                <KnowledgePointLessonIllustrations items={exampleIllustrations} />
              </div>
            ) : null}
          </ExampleBlock>
          <ExampleBlock title="解题思路" emoji="🧠" accentClass="text-[#0F766E]" content={sourceExample.think} />
          <ExampleBlock title="解题步骤" emoji="🪪" accentClass="text-[#7C3AED]" content={sourceExample.steps} />
          <ExampleBlock title="本题答案" emoji="✅" accentClass="text-[#DC2626]" content={sourceExample.answer}>
            {!renderIllustrationBelowProblem && exampleIllustrations.length > 0 ? (
              <div className="mt-2">
                <KnowledgePointLessonIllustrations items={exampleIllustrations} />
              </div>
            ) : null}
          </ExampleBlock>
          <ExampleBlock title="方法总结" emoji="📌" accentClass="text-[#D97706]" content={sourceExample.summary} />
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-line/80 bg-white p-6 shadow-card">
      <h2 className="text-base font-medium tracking-[0.08em] text-slate-500">{example.title ?? "例题解析"}</h2>
      {example.problemStatement ? (
        <div className="mt-5 rounded-[24px] border border-primary/12 bg-primary-soft/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">例题</p>
          <MathRichText content={example.problemStatement} className="mt-2 whitespace-pre-wrap text-[16px] leading-8 text-slate-800" />
          {exampleIllustrations.length > 0 ? (
            <div className="mt-4">
              <KnowledgePointLessonIllustrations items={exampleIllustrations} />
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {example.steps.map((step, index) => {
          const relatedIllustrations = illustrations.filter((item) => step.illustrationIds?.includes(item.id) || item.relatedStepId === step.id);
          return (
            <article key={step.id} className="rounded-[24px] border border-line/80 bg-slate-50/80 px-5 py-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                {step.icon ? `${step.icon} ` : ""}
                关键步骤 {index + 1}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-slate-950">{step.title}</h3>
              <MathRichText content={step.explanation} className="mt-3 whitespace-pre-wrap text-[15px] leading-8 text-slate-700" />
              {relatedIllustrations.length > 0 ? (
                <div className="mt-4">
                  <KnowledgePointLessonIllustrations items={relatedIllustrations} />
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
