import { notFound } from "next/navigation";
import type { BreadcrumbItem } from "@/components/breadcrumbs";
import { TopicDetailPage } from "@/components/topic-detail-page";
import { getKnowledgePointsByTopic, getTopicDetail } from "@/lib/catalog";
import { getGradeLabel, getModuleByName } from "@/lib/site-navigation";

export const dynamic = "force-dynamic";

export default async function TopicPage({
  params
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const numericTopicId = Number(topicId);

  if (Number.isNaN(numericTopicId)) {
    notFound();
  }

  try {
    const [topic, knowledgePoints] = await Promise.all([getTopicDetail(numericTopicId), getKnowledgePointsByTopic(numericTopicId)]);
    const gradeLabel = getGradeLabel(topic.gradeId);
    const moduleItem = getModuleByName(topic.moduleName);
    const breadcrumbs: BreadcrumbItem[] = [{ label: "首页", href: "/" }, { label: gradeLabel, href: `/grades/${topic.gradeId}` }];

    if (topic.moduleName) {
      breadcrumbs.push(
        moduleItem
          ? { label: moduleItem.name, href: `/grades/${topic.gradeId}?module=${moduleItem.slug}` }
          : { label: topic.moduleName }
      );
    }

    breadcrumbs.push({ label: topic.name });

    return (
      <TopicDetailPage
        topic={topic}
        knowledgePoints={knowledgePoints}
        breadcrumbs={breadcrumbs}
        createKnowledgePointHref={(knowledgePointId) =>
          moduleItem
            ? `/grades/${topic.gradeId}/modules/${moduleItem.slug}/topics/${topic.id}/knowledge-points/${knowledgePointId}`
            : `/knowledge-points/${knowledgePointId}`
        }
      />
    );
  } catch {
    notFound();
  }
}
