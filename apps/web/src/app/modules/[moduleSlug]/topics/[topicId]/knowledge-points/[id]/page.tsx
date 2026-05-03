import { notFound } from "next/navigation";
import { KnowledgePointDetailPage } from "@/components/knowledge-point-detail-page";
import { getKnowledgePointDetail, getQuizQuestionsByKnowledgePoint, getTopicDetail } from "@/lib/catalog";
import { resolveBottomNavigationCard } from "@/lib/knowledge-point-navigation";
import { getModuleBySlug } from "@/lib/site-navigation";

export const dynamic = "force-dynamic";

export default async function ModuleTopicKnowledgePointPage({
  params
}: {
  params: Promise<{ moduleSlug: string; topicId: string; id: string }>;
}) {
  const { moduleSlug, topicId, id } = await params;
  const numericTopicId = Number(topicId);
  const numericKnowledgePointId = Number(id);
  const moduleItem = getModuleBySlug(moduleSlug);

  if (Number.isNaN(numericTopicId) || Number.isNaN(numericKnowledgePointId) || !moduleItem) {
    notFound();
  }

  const [topic, knowledgePoint, quizQuestions] = await Promise.all([
    getTopicDetail(numericTopicId),
    getKnowledgePointDetail(numericKnowledgePointId),
    getQuizQuestionsByKnowledgePoint(numericKnowledgePointId)
  ]);

  if (topic.moduleName !== moduleItem.name || knowledgePoint.topicId !== numericTopicId) {
    notFound();
  }

  const topicAnchorHref = `/modules/${moduleSlug}?grade=${topic.gradeId}#topic-${numericTopicId}`;
  const navigationCard = await resolveBottomNavigationCard({
    currentTopic: topic,
    currentKnowledgePointId: numericKnowledgePointId,
    returnHref: topicAnchorHref,
    returnLabel: "返回当前专题",
    buildHref: (target) => {
      if (!target.moduleSlug) {
        return `/knowledge-points/${target.knowledgePointId}`;
      }

      return `/modules/${target.moduleSlug}/topics/${target.topicId}/knowledge-points/${target.knowledgePointId}`;
    }
  });

  return (
    <KnowledgePointDetailPage
      knowledgePoint={knowledgePoint}
      quizQuestions={quizQuestions}
      breadcrumbs={[
        { label: "首页", href: "/" },
        { label: moduleItem.name, href: `/modules/${moduleSlug}` },
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
