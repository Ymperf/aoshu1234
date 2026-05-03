import Link from "next/link";
import type { TopicKnowledgeGroup } from "@/lib/catalog-derived";
import type { ModuleCardTheme } from "@/lib/module-card-theme";
import { getModuleCardThemeByName } from "@/lib/module-card-theme";

interface TopicKnowledgeGroupListProps {
  topics: TopicKnowledgeGroup[];
  createTopicHref?: (topic: TopicKnowledgeGroup) => string | null;
  createKnowledgePointHref: (knowledgePointId: number, topic: TopicKnowledgeGroup) => string;
  emptyText?: string;
  cardTheme?: ModuleCardTheme;
}

const titleClampStyle = {
  display: "-webkit-box",
  WebkitBoxOrient: "vertical" as const,
  WebkitLineClamp: 2,
  overflow: "hidden"
};

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

function getDifficultyBadgeClass(level: string) {
  switch (level) {
    case "basic":
      return "border-slate-200 bg-white/90 text-slate-700";
    case "intermediate":
      return "border-sky-200 bg-sky-50/90 text-sky-700";
    case "advanced":
      return "border-violet-200 bg-violet-50/90 text-violet-700";
    case "competition":
      return "border-rose-200 bg-rose-50/90 text-rose-700";
    default:
      return "border-slate-200 bg-white/90 text-slate-700";
  }
}

export function TopicKnowledgeGroupList({
  topics,
  createTopicHref = (topic) => `/topics/${topic.id}`,
  createKnowledgePointHref,
  emptyText = "当前条件下暂无可展示的知识点。",
  cardTheme
}: TopicKnowledgeGroupListProps) {
  if (topics.length === 0) {
    return <div className="rounded-[20px] border border-[#E5E7EB] bg-white px-5 py-8 text-sm text-[#64748B]">{emptyText}</div>;
  }

  const theme = cardTheme ?? getModuleCardThemeByName(topics[0]?.moduleName);

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {topics.map((topic) => {
        const topicHref = createTopicHref(topic);

        return (
          <section
            key={topic.id}
            id={`topic-${topic.id}`}
            className={`scroll-mt-24 rounded-[24px] border p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)] transition-all duration-300 ${theme.sectionSurfaceClass} ${theme.sectionBorderClass} ${theme.sectionHoverClass}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-[22px] font-semibold tracking-tight text-[#1F2937]">
                {topicHref ? (
                  <Link href={topicHref} className={`transition-colors ${theme.itemTitleHoverClass}`}>
                    {topic.name}
                  </Link>
                ) : (
                  <span>{topic.name}</span>
                )}
              </h3>
              <span className={`rounded-full border px-3 py-1.5 text-sm ${theme.secondaryPillClass}`}>
                {topic.knowledgePoints.length} 个知识点
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {topic.knowledgePoints.map((knowledgePoint) => (
                <Link
                  key={knowledgePoint.id}
                  href={createKnowledgePointHref(knowledgePoint.id, topic)}
                  className={`group relative rounded-[20px] border p-4 transition-all duration-300 hover:-translate-y-0.5 ${theme.itemSurfaceClass} ${theme.itemBorderClass} ${theme.itemHoverClass}`}
                >
                  <span
                    className={`absolute right-4 top-4 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getDifficultyBadgeClass(
                      knowledgePoint.difficultyLevel
                    )}`}
                  >
                    {formatDifficultyLevel(knowledgePoint.difficultyLevel)}
                  </span>

                  <div className="flex min-h-[112px] items-center justify-center px-2 text-center">
                    <p
                      className={`text-[17px] font-semibold leading-7 text-[#1F2937] transition-colors duration-200 ${theme.itemTitleHoverClass}`}
                      style={titleClampStyle}
                    >
                      {knowledgePoint.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
