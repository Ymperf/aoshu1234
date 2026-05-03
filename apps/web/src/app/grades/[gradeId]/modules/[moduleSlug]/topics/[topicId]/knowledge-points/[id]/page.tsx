import { notFound } from "next/navigation";
import { KnowledgePointDetailPage } from "@/components/knowledge-point-detail-page";
import { getKnowledgePointDetail, getQuizQuestionsByKnowledgePoint, getTopicDetail } from "@/lib/catalog";
import { resolveBottomNavigationCard } from "@/lib/knowledge-point-navigation";
import { getGradeLabel, getModuleBySlug } from "@/lib/site-navigation";

export const dynamic = "force-dynamic";

export default async function GradeModuleTopicKnowledgePointPage({
  params
}: {
  params: Promise<{ gradeId: string; moduleSlug: string; topicId: string; id: string }>;
}) {
  const { gradeId, moduleSlug, topicId, id } = await params;
  const numericGradeId = Number(gradeId);
  const numericTopicId = Number(topicId);
  const numericKnowledgePointId = Number(id);
  const moduleItem = getModuleBySlug(moduleSlug);

  if (Number.isNaN(numericGradeId) || Number.isNaN(numericTopicId) || Number.isNaN(numericKnowledgePointId) || !moduleItem) {
    notFound();
  }

  const [topic, knowledgePoint, quizQuestions] = await Promise.all([
    getTopicDetail(numericTopicId),
    getKnowledgePointDetail(numericKnowledgePointId),
    getQuizQuestionsByKnowledgePoint(numericKnowledgePointId)
  ]);

  if (topic.gradeId !== numericGradeId || topic.moduleName !== moduleItem.name || knowledgePoint.topicId !== numericTopicId) {
    notFound();
  }

  const gradeLabel = getGradeLabel(numericGradeId);
  const topicAnchorHref = `/grades/${numericGradeId}?module=${moduleSlug}#topic-${numericTopicId}`;
  const navigationCard = await resolveBottomNavigationCard({
    currentTopic: topic,
    currentKnowledgePointId: numericKnowledgePointId,
    returnHref: topicAnchorHref,
    returnLabel: "返回当前专题",
    buildHref: (target) => {
      if (!target.moduleSlug) {
        return `/knowledge-points/${target.knowledgePointId}`;
      }

      return `/grades/${target.gradeId}/modules/${target.moduleSlug}/topics/${target.topicId}/knowledge-points/${target.knowledgePointId}`;
    }
  });

  return (
    <KnowledgePointDetailPage
      knowledgePoint={knowledgePoint}
      quizQuestions={quizQuestions}
      breadcrumbs={[
        { label: "首页", href: "/" },
        { label: gradeLabel, href: `/grades/${numericGradeId}` },
        { label: moduleItem.name, href: `/grades/${numericGradeId}?module=${moduleSlug}` },
        { label: topic.name, href: topicAnchorHref },
        { label: knowledgePoint.name }
      ]}
      returnHref={topicAnchorHref}
      returnLabel="返回当前专题"
      lessonGradeName={topic.gradeName}
      nextKnowledgePoint={navigationCard}
    />
  );
}
