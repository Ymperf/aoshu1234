import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getKnowledgePointsByTopic, getTopicsByGrade } from "@/lib/catalog";
import { getModuleCardThemeBySlug } from "@/lib/module-card-theme";
import { getGradeLabel, getModuleBySlug } from "@/lib/site-navigation";

export const dynamic = "force-dynamic";

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

export default async function GradeModulePage({
  params
}: {
  params: Promise<{ gradeId: string; moduleSlug: string }>;
}) {
  const { gradeId, moduleSlug } = await params;
  const numericGradeId = Number(gradeId);
  const moduleItem = getModuleBySlug(moduleSlug);

  if (Number.isNaN(numericGradeId) || !moduleItem) {
    notFound();
  }

  const topics = (await getTopicsByGrade(numericGradeId)).filter((topic) => topic.moduleName === moduleItem.name);

  if (topics.length === 0) {
    notFound();
  }

  const topicsWithKnowledgePoints = await Promise.all(
    topics.map(async (topic) => ({
      topic,
      knowledgePoints: await getKnowledgePointsByTopic(topic.id)
    }))
  );

  const gradeLabel = getGradeLabel(numericGradeId);
  const moduleTheme = getModuleCardThemeBySlug(moduleSlug);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 lg:px-[10%] xl:px-0">
        <Breadcrumbs items={[{ label: "首页", href: "/" }, { label: gradeLabel, href: `/grades/${numericGradeId}` }, { label: moduleItem.name }]} />

        <section className="border-b border-[#E5E7EB] pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[#D9E7FF] px-4 py-2 text-sm text-[#165DFF]">{gradeLabel}</span>
            <span className="rounded-full border border-[#E5E7EB] px-4 py-2 text-sm text-[#666666]">{moduleItem.name}</span>
            <span className="rounded-full border border-[#E5E7EB] px-4 py-2 text-sm text-[#666666]">{topics.length} 个专题</span>
          </div>
          <h1 className="mt-4 text-[32px] font-bold text-[#333333]">
            {gradeLabel} · {moduleItem.name}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#666666]">{moduleItem.description}</p>
        </section>

        <section className="mt-[48px] grid gap-8">
          {topicsWithKnowledgePoints.map(({ topic, knowledgePoints }) => (
            <section
              key={topic.id}
              className={`rounded-[20px] border p-6 shadow-[0_8px_24px_rgba(22,93,255,0.06)] transition-all duration-300 ${moduleTheme.sectionSurfaceClass} ${moduleTheme.sectionBorderClass} ${moduleTheme.sectionHoverClass}`}
            >
              <div className="border-b border-[#EAF1FF] pb-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-4xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.08em] ${moduleTheme.secondaryPillClass}`}>
                        专题
                      </span>
                      <span className={`rounded-full border px-3 py-1 text-xs ${moduleTheme.primaryPillClass}`}>
                        {knowledgePoints.length} 个知识点
                      </span>
                      <span className="rounded-full border border-[#E5E7EB] px-3 py-1 text-xs text-[#5B6472]">
                        {topic.isFree ? "免费专题" : "付费专题"}
                      </span>
                    </div>
                    <h2 className="mt-4 text-[22px] font-semibold leading-8 text-[#1F2937]">{topic.name}</h2>
                    <p className="mt-3 max-w-4xl text-sm leading-7 text-[#667085]">{topic.intro}</p>
                  </div>

                  <Link
                    href={`/grades/${numericGradeId}/modules/${moduleSlug}/topics/${topic.id}`}
                    className="inline-flex items-center rounded-full border border-[#D9E7FF] bg-white px-4 py-2 text-sm text-[#475467] transition-colors hover:border-[#165DFF] hover:text-[#165DFF]"
                  >
                    查看专题
                  </Link>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-[3px] rounded-full bg-[#165DFF]" />
                  <p className="text-sm font-semibold text-[#344054]">专题下的知识点预览</p>
                </div>

                <div className="mt-4 grid gap-3">
                  {knowledgePoints.slice(0, 4).map((knowledgePoint) => (
                    <Link
                      key={knowledgePoint.id}
                      href={`/grades/${numericGradeId}/modules/${moduleSlug}/topics/${topic.id}/knowledge-points/${knowledgePoint.id}`}
                      className={`group rounded-[14px] border px-4 py-4 transition-all duration-300 ${moduleTheme.itemSurfaceClass} ${moduleTheme.itemBorderClass} ${moduleTheme.itemHoverClass}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1 flex shrink-0 items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${moduleTheme.accentDotClass}`} />
                          <span className={`h-8 w-px ${moduleTheme.accentLineClass}`} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className={`text-[16px] font-medium leading-7 text-[#1F2937] transition-colors ${moduleTheme.itemTitleHoverClass}`}>
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

                <div className="mt-4">
                  <Link
                    href={`/grades/${numericGradeId}/modules/${moduleSlug}/topics/${topic.id}`}
                    className="inline-flex items-center text-sm font-medium text-[#165DFF] transition-colors hover:text-[#0E42D2]"
                  >
                    进入该专题查看全部知识点
                  </Link>
                </div>
              </div>
            </section>
          ))}
        </section>
      </div>
    </main>
  );
}
