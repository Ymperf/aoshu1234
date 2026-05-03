import { notFound, redirect } from "next/navigation";
import { getTopicDetail } from "@/lib/catalog";
import { getModuleBySlug } from "@/lib/site-navigation";

export const dynamic = "force-dynamic";

export default async function ModuleTopicPage({
  params
}: {
  params: Promise<{ moduleSlug: string; topicId: string }>;
}) {
  const { moduleSlug, topicId } = await params;
  const numericTopicId = Number(topicId);
  const moduleItem = getModuleBySlug(moduleSlug);

  if (Number.isNaN(numericTopicId) || !moduleItem) {
    notFound();
  }

  let topic;

  try {
    topic = await getTopicDetail(numericTopicId);
  } catch {
    notFound();
  }

  if (topic.moduleName !== moduleItem.name) {
    notFound();
  }

  redirect(`/modules/${moduleSlug}?grade=${topic.gradeId}#topic-${numericTopicId}`);
}
