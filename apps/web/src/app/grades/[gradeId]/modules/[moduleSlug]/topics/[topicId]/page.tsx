import { notFound, redirect } from "next/navigation";
import { getTopicDetail } from "@/lib/catalog";
import { getModuleBySlug } from "@/lib/site-navigation";

export const dynamic = "force-dynamic";

export default async function GradeModuleTopicPage({
  params
}: {
  params: Promise<{ gradeId: string; moduleSlug: string; topicId: string }>;
}) {
  const { gradeId, moduleSlug, topicId } = await params;
  const numericGradeId = Number(gradeId);
  const numericTopicId = Number(topicId);
  const moduleItem = getModuleBySlug(moduleSlug);

  if (Number.isNaN(numericGradeId) || Number.isNaN(numericTopicId) || !moduleItem) {
    notFound();
  }

  let topic;

  try {
    topic = await getTopicDetail(numericTopicId);
  } catch {
    notFound();
  }

  if (topic.gradeId !== numericGradeId || topic.moduleName !== moduleItem.name) {
    notFound();
  }

  redirect(`/grades/${numericGradeId}?module=${moduleSlug}#topic-${numericTopicId}`);
}
