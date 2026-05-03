import Link from "next/link";
import type { KnowledgePointSummary, TopicDetail } from "@shared-types/content";
import type { BreadcrumbItem } from "@/components/breadcrumbs";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getModuleCardThemeByName } from "@/lib/module-card-theme";

interface TopicDetailPageProps {
  topic: TopicDetail;
  knowledgePoints: KnowledgePointSummary[];
  breadcrumbs: BreadcrumbItem[];
  createKnowledgePointHref: (knowledgePointId: number) => string;
}

function formatDifficultyLevel(level: string) {
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

function formatDuration(durationSec: number) {
  return `${Math.ceil(durationSec / 60)} 分钟`;
}

export function TopicDetailPage({ topic, knowledgePoints, breadcrumbs, createKnowledgePointHref }: TopicDetailPageProps) {
  const theme = getModuleCardThemeByName(topic.moduleName);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 lg:px-[10%] xl:px-0">
        <Breadcrumbs items={breadcrumbs} />

        <section className="border-b border-[#E5E7EB] pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[#D9E7FF] px-4 py-2 text-sm text-[#165DFF]">{topic.gradeName}</span>
            {topic.moduleName ? <span className="rounded-full border border-[#E5E7EB] px-4 py-2 text-sm text-[#666666]">{topic.moduleName}</span> : null}
            <span className="rounded-full border border-[#E5E7EB] px-4 py-2 text-sm text-[#666666]">{knowledgePoints.length} 个知识点</span>
            <span className="rounded-full border border-[#E5E7EB] px-4 py-2 text-sm text-[#666666]">{topic.isFree ? "免费专题" : "付费专题"}</span>
          </div>
          <h1 className="mt-4 text-[32px] font-bold text-[#333333]">{topic.name}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#666666]">{topic.intro}</p>
        </section>

        <section className="mt-[48px]">
          <div className="flex items-center gap-3">
            <div className="h-5 w-[3px] rounded-full bg-[#165DFF]" />
            <p className="text-sm font-semibold text-[#344054]">该专题下的全部知识点</p>
          </div>

          <div className="mt-5 grid gap-3">
            {knowledgePoints.map((knowledgePoint) => (
              <Link
                key={knowledgePoint.id}
                href={createKnowledgePointHref(knowledgePoint.id)}
                className={`group rounded-[16px] border px-5 py-5 transition-all duration-300 ${theme.itemSurfaceClass} ${theme.itemBorderClass} ${theme.itemHoverClass}`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex shrink-0 items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${theme.accentDotClass}`} />
                    <span className={`h-10 w-px ${theme.accentLineClass}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`text-[17px] font-medium leading-7 text-[#1F2937] transition-colors ${theme.itemTitleHoverClass}`}>
                          {knowledgePoint.name}
                        </p>
                        <p className="mt-1 text-sm leading-7 text-[#667085]">{knowledgePoint.intro}</p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs ${
                          knowledgePoint.isLocked ? "bg-[#FFF7E8] text-[#9A6B16]" : "bg-[#ECFDF3] text-[#027A48]"
                        }`}
                      >
                        {knowledgePoint.isLocked ? "待解锁" : "可学习"}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#667085]">
                      <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1">
                        难度 {formatDifficultyLevel(knowledgePoint.difficultyLevel)}
                      </span>
                      <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1">
                        时长 {formatDuration(knowledgePoint.durationSec)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
