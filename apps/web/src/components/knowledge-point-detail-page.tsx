import Link from "next/link";
import type { BreadcrumbItem } from "@/components/breadcrumbs";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LearningAccountEntry } from "@/components/learning-account-entry";
import { LearningConsole } from "@/components/learning-console";
import { KnowledgePointLessonWorkspace } from "@/components/knowledge-point-lesson-workspace";
import type { KnowledgePointDetail, QuizQuestion } from "@shared-types/content";
import {
  getGeneratedKnowledgePointLesson,
  getGeneratedKnowledgePointLessonMediaManifest
} from "@/lib/generated-knowledge-point-lesson";
import { getKnowledgePointMedia } from "@/lib/knowledge-point-media";
import type { BottomNavigationCard } from "@/lib/knowledge-point-navigation";

function formatDuration(durationSec: number): string {
  return `${Math.ceil(durationSec / 60)} 分钟`;
}

function formatDifficultyLevel(level: string): string {
  switch (level) {
    case "basic":
      return "基础";
    case "intermediate":
      return "进阶";
    case "advanced":
      return "提高";
    case "competition":
      return "竞赛";
    default:
      return level;
  }
}

interface KnowledgePointDetailPageProps {
  knowledgePoint: KnowledgePointDetail;
  quizQuestions: QuizQuestion[];
  breadcrumbs: BreadcrumbItem[];
  returnHref: string;
  returnLabel: string;
  lessonGradeName?: string;
  nextKnowledgePoint?: BottomNavigationCard;
}

function NavigationCard({ card }: { card: BottomNavigationCard }) {
  return (
    <section className="rounded-[12px] border border-[#D9E7FF] bg-[#F7FAFF] p-5 lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 lg:w-[220px]">
          <p className="text-sm font-semibold text-[#165DFF]">{card.prompt}</p>
          <p className="mt-2 text-sm leading-7 text-[#666666]">{card.description}</p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-[#666666]">{card.eyebrow}</p>
          <p className="mt-1 truncate text-lg font-semibold text-[#333333]">{card.title}</p>
          <p className="mt-2 text-sm text-[#666666]">{card.subtitle}</p>
        </div>
        <Link
          href={card.href}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#165DFF] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0E4FCC]"
        >
          {card.buttonLabel}
        </Link>
      </div>
    </section>
  );
}

export function KnowledgePointDetailPage({
  knowledgePoint,
  quizQuestions,
  breadcrumbs,
  returnHref,
  returnLabel,
  lessonGradeName,
  nextKnowledgePoint
}: KnowledgePointDetailPageProps) {
  const generatedLesson = getGeneratedKnowledgePointLesson(knowledgePoint.id);
  const generatedLessonMedia = generatedLesson ? getGeneratedKnowledgePointLessonMediaManifest(knowledgePoint.id) : null;
  const media = getKnowledgePointMedia(knowledgePoint.id);
  const canLearnOnPage = generatedLesson !== null || !knowledgePoint.isLocked;
  const statItems = [
    { label: "难度", value: formatDifficultyLevel(knowledgePoint.difficultyLevel) },
    { label: "学习时长", value: formatDuration(knowledgePoint.durationSec) },
    { label: "练习题数", value: `${knowledgePoint.quizPreviewCount} 题` }
  ];

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 lg:px-[10%] xl:px-0">
        {generatedLesson ? (
          <>
            <div className="mb-6">
              <Breadcrumbs items={breadcrumbs} />
            </div>
            <KnowledgePointLessonWorkspace lesson={generatedLesson} media={generatedLessonMedia} gradeNameOverride={lessonGradeName} />
            {nextKnowledgePoint ? (
              <div className="mt-10">
                <NavigationCard card={nextKnowledgePoint} />
              </div>
            ) : null}
          </>
        ) : (
          <>
            <div className="mb-6 flex items-start justify-between gap-4">
              <Breadcrumbs items={breadcrumbs} />
              <div className="hidden lg:block">
                <LearningAccountEntry />
              </div>
            </div>

            <section className="grid gap-6 border-b border-[#E5E7EB] pb-8">
              <div className="flex flex-wrap items-center gap-3">
                {knowledgePoint.moduleName ? (
                  <span className="rounded-full border border-[#D9E7FF] px-4 py-2 text-sm text-[#165DFF]">{knowledgePoint.moduleName}</span>
                ) : null}
                <span className="rounded-full border border-[#E5E7EB] px-4 py-2 text-sm text-[#666666]">{knowledgePoint.topicName}</span>
                <span
                  className={`rounded-full border px-4 py-2 text-sm ${
                    canLearnOnPage ? "border-[#CFE7D4] text-[#2F7A3F]" : "border-[#F2D6A1] text-[#9A6B16]"
                  }`}
                >
                  {canLearnOnPage ? "当前可学习" : "待开通后学习"}
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="grid gap-4">
                  <div>
                    <h1 className="text-[32px] font-bold text-[#333333]">{knowledgePoint.name}</h1>
                    <p className="mt-3 max-w-3xl text-base leading-8 text-[#666666]">{knowledgePoint.intro}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {statItems.map((item) => (
                      <div key={item.label} className="rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3">
                        <p className="text-xs text-[#666666]">{item.label}</p>
                        <p className="mt-1 text-base font-semibold text-[#333333]">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <aside className="grid gap-4 rounded-[12px] border border-[#E5E7EB] bg-[#F8F9FA] p-5">
                  <div className="lg:hidden">
                    <LearningAccountEntry />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#165DFF]">知识点摘要</p>
                    <p className="mt-3 text-sm leading-7 text-[#666666]">{knowledgePoint.transcriptText}</p>
                  </div>
                  <Link
                    href={returnHref}
                    className="inline-flex w-fit items-center rounded-full border border-[#D9E7FF] px-4 py-2 text-sm text-[#666666] transition-colors hover:border-[#165DFF] hover:text-[#165DFF]"
                  >
                    {returnLabel}
                  </Link>
                </aside>
              </div>
            </section>

            <div className="mt-[60px]">
              <section className="grid gap-6 rounded-[12px] border border-[#E5E7EB] bg-white p-6 lg:p-8">
                <div className="grid gap-4 rounded-[12px] border border-[#E5E7EB] bg-[#F8F9FA] p-6">
                  <div>
                    <p className="text-sm font-semibold text-[#165DFF]">{knowledgePoint.isLocked ? "内容预览" : "课程摘要"}</p>
                    <p className="mt-3 text-sm leading-8 text-[#666666]">{knowledgePoint.transcriptText}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {statItems.map((item) => (
                      <span key={item.label} className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm text-[#666666]">
                        {item.label}：{item.value}
                      </span>
                    ))}
                  </div>
                </div>

                {media?.videoUrl ? (
                  <div className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-slate-950">
                    <video controls preload="metadata" poster={media.posterUrl} className="block w-full bg-black" src={media.videoUrl} />
                  </div>
                ) : null}
              </section>

              <LearningConsole knowledgePoint={knowledgePoint} quizQuestions={quizQuestions} />
              {nextKnowledgePoint ? (
                <div className="mt-8">
                  <NavigationCard card={nextKnowledgePoint} />
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
