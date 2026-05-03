import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { TopicKnowledgeGroupList } from "@/components/topic-knowledge-group-list";
import { getModuleGradeTopicKnowledgeGroups } from "@/lib/catalog-derived";
import { getModuleCardThemeBySlug } from "@/lib/module-card-theme";
import { getModuleBySlug } from "@/lib/site-navigation";

export const dynamic = "force-dynamic";

export default async function ModulePage({
  params,
  searchParams
}: {
  params: Promise<{ moduleSlug: string }>;
  searchParams: Promise<{ grade?: string }>;
}) {
  const { moduleSlug } = await params;
  const { grade: activeGrade } = await searchParams;
  const moduleItem = getModuleBySlug(moduleSlug);

  if (!moduleItem) {
    notFound();
  }

  const gradeSections = await getModuleGradeTopicKnowledgeGroups(moduleItem.name);
  const moduleTheme = getModuleCardThemeBySlug(moduleSlug);

  if (gradeSections.length === 0) {
    notFound();
  }

  const filteredSections = activeGrade ? gradeSections.filter((section) => String(section.gradeId) === activeGrade) : gradeSections;
  const topicCount = gradeSections.reduce((total, section) => total + section.topics.length, 0);
  const knowledgePointCount = gradeSections.reduce(
    (total, section) => total + section.topics.reduce((sum, topic) => sum + topic.knowledgePoints.length, 0),
    0
  );

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 lg:px-[10%] xl:px-0">
        <Breadcrumbs items={[{ label: "首页", href: "/" }, { label: moduleItem.name }]} />

        <section className="border-b border-[#E5E7EB] pb-6">
          <p className="text-sm font-medium text-[#165DFF]">按模块学习</p>
          <h1 className="mt-2 text-[32px] font-bold text-[#333333]">{moduleItem.name}专题与知识点</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#666666]">{moduleItem.description}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#666666]">
            <span className="rounded-full border border-[#E5E7EB] px-4 py-2">{gradeSections.length} 个年级</span>
            <span className="rounded-full border border-[#E5E7EB] px-4 py-2">{topicCount} 个专题</span>
            <span className="rounded-full border border-[#E5E7EB] px-4 py-2">{knowledgePointCount} 个知识点</span>
          </div>
        </section>

        <section className="mt-[60px]">
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/modules/${moduleSlug}`}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                activeGrade ? "border-[#D9E7FF] text-[#666666] hover:border-[#165DFF] hover:text-[#165DFF]" : "border-[#165DFF] bg-[#165DFF] text-white"
              }`}
            >
              全部年级
            </Link>
            {gradeSections.map((section) => (
              <Link
                key={section.gradeId}
                href={`/modules/${moduleSlug}?grade=${section.gradeId}`}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  activeGrade === String(section.gradeId)
                    ? "border-[#165DFF] bg-[#165DFF] text-white"
                    : "border-[#D9E7FF] text-[#666666] hover:border-[#165DFF] hover:text-[#165DFF]"
                }`}
              >
                {section.gradeName}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-[60px] grid gap-[60px]">
          {filteredSections.map((section) => (
            <section key={section.gradeId} className="grid gap-6">
              <div className="border-b border-[#E5E7EB] pb-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[24px] font-semibold text-[#333333]">{section.gradeName}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-[#666666]">
                      查看 {moduleItem.name} 模块在 {section.gradeName} 下的专题与知识点。
                    </p>
                  </div>
                  <span className="rounded-full border border-[#D9E7FF] px-4 py-2 text-sm text-[#666666]">{section.topics.length} 个专题</span>
                </div>
              </div>

              <TopicKnowledgeGroupList
                topics={section.topics}
                createTopicHref={() => null}
                createKnowledgePointHref={(knowledgePointId, topic) => `/modules/${moduleSlug}/topics/${topic.id}/knowledge-points/${knowledgePointId}`}
                emptyText="当前年级下暂无可展示的知识点。"
                cardTheme={moduleTheme}
              />
            </section>
          ))}
        </section>
      </div>
    </main>
  );
}
