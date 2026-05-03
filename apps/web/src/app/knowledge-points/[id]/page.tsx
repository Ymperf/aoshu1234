import { notFound } from "next/navigation";
import { KnowledgePointDetailPage } from "@/components/knowledge-point-detail-page";
import { getKnowledgePointDetail, getQuizQuestionsByKnowledgePoint, getTopicDetail } from "@/lib/catalog";
import { resolveBottomNavigationCard } from "@/lib/knowledge-point-navigation";
import { getGradeLabel, getModuleBySlug } from "@/lib/site-navigation";

export const dynamic = "force-dynamic";

export default async function KnowledgePointPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; gradeId?: string; module?: string }>;
}) {
  const { id } = await params;
  const { from, gradeId, module } = await searchParams;
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    notFound();
  }

  const [knowledgePoint, quizQuestions] = await Promise.all([
    getKnowledgePointDetail(numericId),
    getQuizQuestionsByKnowledgePoint(numericId)
  ]);
  const topic = await getTopicDetail(knowledgePoint.topicId);

  let breadcrumbs = [{ label: "首页", href: "/" }] as Array<{ label: string; href?: string }>;
  let returnHref = `/topics/${knowledgePoint.topicId}`;
  let returnLabel = "返回专题页";

  if (from === "grade" && gradeId) {
    const numericGradeId = Number(gradeId);

    if (!Number.isNaN(numericGradeId)) {
      const gradeLabel = getGradeLabel(numericGradeId);
      const moduleQuery = module ? `?module=${encodeURIComponent(module)}` : "";
      returnHref = `/grades/${numericGradeId}${moduleQuery}`;
      returnLabel = "返回年级导航页";
      breadcrumbs = [...breadcrumbs, { label: gradeLabel, href: returnHref }, { label: knowledgePoint.name }];
    }
  } else if (from === "module" && module) {
    const moduleItem = getModuleBySlug(module);

    if (moduleItem) {
      const gradeQuery = gradeId ? `?grade=${encodeURIComponent(gradeId)}` : "";
      returnHref = `/modules/${module}${gradeQuery}`;
      returnLabel = "返回模块导航页";
      breadcrumbs = [...breadcrumbs, { label: moduleItem.name, href: returnHref }, { label: knowledgePoint.name }];
    }
  }

  if (breadcrumbs.length === 1) {
    breadcrumbs = [...breadcrumbs, { label: knowledgePoint.topicName, href: `/topics/${knowledgePoint.topicId}` }, { label: knowledgePoint.name }];
  }

  const navigationCard = await resolveBottomNavigationCard({
    currentTopic: topic,
    currentKnowledgePointId: numericId,
    returnHref,
    returnLabel,
    buildHref: (target) => {
      if (from === "grade") {
        if (!target.moduleSlug) {
          return `/knowledge-points/${target.knowledgePointId}`;
        }

        return `/grades/${target.gradeId}/modules/${target.moduleSlug}/topics/${target.topicId}/knowledge-points/${target.knowledgePointId}`;
      }

      if (from === "module") {
        if (!target.moduleSlug) {
          return `/knowledge-points/${target.knowledgePointId}`;
        }

        return `/modules/${target.moduleSlug}/topics/${target.topicId}/knowledge-points/${target.knowledgePointId}`;
      }

      return `/knowledge-points/${target.knowledgePointId}`;
    }
  });

  return (
    <KnowledgePointDetailPage
      knowledgePoint={knowledgePoint}
      quizQuestions={quizQuestions}
      breadcrumbs={breadcrumbs}
      returnHref={returnHref}
      returnLabel={returnLabel}
      lessonGradeName={topic.gradeName}
      nextKnowledgePoint={navigationCard}
    />
  );
}
