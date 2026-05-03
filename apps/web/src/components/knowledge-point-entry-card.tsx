import Link from "next/link";
import type { KnowledgePointSummary } from "@shared-types/content";
import { getModuleCardThemeByName } from "@/lib/module-card-theme";

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

interface KnowledgePointEntryCardProps {
  knowledgePoint: KnowledgePointSummary;
  href: string;
}

export function KnowledgePointEntryCard({ knowledgePoint, href }: KnowledgePointEntryCardProps) {
  const theme = getModuleCardThemeByName(knowledgePoint.moduleName);

  return (
    <Link
      href={href}
      className={`group flex min-h-[180px] flex-col rounded-[12px] border p-5 transition-all duration-300 hover:-translate-y-1 ${theme.itemSurfaceClass} ${theme.itemBorderClass} ${theme.itemHoverClass}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className={`text-base font-semibold leading-7 text-[#333333] transition-colors duration-200 ${theme.itemTitleHoverClass}`}>
          {knowledgePoint.name}
        </h3>
        <span className="shrink-0 rounded-full border border-[#D9E7FF] px-3 py-1 text-xs text-[#666666]">
          {knowledgePoint.isLocked ? "待解锁" : "可学习"}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#666666]">{knowledgePoint.intro}</p>

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <span className="rounded-full border border-[#D9E7FF] px-3 py-1 text-xs text-[#666666]">
          难度 {formatDifficultyLevel(knowledgePoint.difficultyLevel)}
        </span>
        <span className="rounded-full border border-[#D9E7FF] px-3 py-1 text-xs text-[#666666]">
          时长 {formatDuration(knowledgePoint.durationSec)}
        </span>
      </div>
    </Link>
  );
}
