import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { TopicKnowledgeGroupList } from "@/components/topic-knowledge-group-list";
import { getGrades } from "@/lib/catalog";
import { getGradeTopicKnowledgeGroups } from "@/lib/catalog-derived";
import { getModuleCardThemeBySlug } from "@/lib/module-card-theme";
import { getGradeLabel } from "@/lib/site-navigation";

export const dynamic = "force-dynamic";

export default async function GradePage({
  params,
  searchParams
}: {
  params: Promise<{ gradeId: string }>;
  searchParams: Promise<{ module?: string }>;
}) {
  const { gradeId } = await params;
  const { module: activeModuleSlug } = await searchParams;
  const numericGradeId = Number(gradeId);

  if (Number.isNaN(numericGradeId)) {
    notFound();
  }

  const gradeExists = (await getGrades()).some((item) => item.id === numericGradeId);

  if (!gradeExists) {
    notFound();
  }

  const moduleSections = await getGradeTopicKnowledgeGroups(numericGradeId);

  if (moduleSections.length === 0) {
    notFound();
  }

  const gradeLabel = getGradeLabel(numericGradeId);
  const activeSection = moduleSections.find((section) => section.slug === activeModuleSlug) ?? moduleSections[0];
  const activeTheme = getModuleCardThemeBySlug(activeSection.slug);

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 lg:px-[10%] xl:px-0">
        <section className="grid gap-6">
          <Breadcrumbs items={[{ label: "首页", href: "/" }, { label: gradeLabel }]} />

          <div className="grid gap-3">
            <p className="text-sm font-semibold tracking-[0.12em] text-[#165DFF]">按模块学习</p>
            <h1 className="text-[34px] font-bold tracking-tight text-[#0F172A]">{gradeLabel}</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            {moduleSections.map((section) => {
              const isActive = activeSection.id === section.id;

              return (
                <Link
                  key={section.id}
                  href={`/grades/${numericGradeId}?module=${section.slug ?? ""}`}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "border-[#165DFF] bg-[#165DFF] text-white shadow-[0_10px_24px_rgba(22,93,255,0.16)]"
                      : "border-[#D9E2F0] bg-white text-[#475467] hover:border-[#165DFF] hover:text-[#165DFF]"
                  }`}
                >
                  {section.name}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-10 grid gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[28px] font-semibold tracking-tight text-[#0F172A]">{activeSection.name}</h2>
            <span className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm text-[#64748B]">
              {activeSection.topics.length} 个专题
            </span>
          </div>

          <TopicKnowledgeGroupList
            topics={activeSection.topics}
            createTopicHref={() => null}
            createKnowledgePointHref={(knowledgePointId, topic) =>
              activeSection.slug
                ? `/grades/${numericGradeId}/modules/${activeSection.slug}/topics/${topic.id}/knowledge-points/${knowledgePointId}`
                : `/knowledge-points/${knowledgePointId}?from=grade&gradeId=${numericGradeId}`
            }
            emptyText="当前模块下暂无可展示的知识点。"
            cardTheme={activeTheme}
          />
        </section>
      </div>
    </main>
  );
}
