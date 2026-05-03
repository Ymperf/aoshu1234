import type { TopicDetail, TopicSummary } from "@shared-types/content";
import { getKnowledgePointsByTopic, getTopicsByGrade } from "@/lib/catalog";
import { MODULE_NAV_ITEMS } from "@/lib/site-navigation";

export interface BottomNavigationCard {
  title: string;
  subtitle: string;
  href: string;
  eyebrow: string;
  prompt: string;
  description: string;
  buttonLabel: string;
}

interface ResolveBottomNavigationCardOptions {
  currentTopic: TopicDetail;
  currentKnowledgePointId: number;
  returnHref: string;
  returnLabel: string;
  buildHref: (target: { gradeId: number; moduleSlug?: string; topicId: number; knowledgePointId: number }) => string;
}

function getModuleOrder(moduleName?: string): number {
  const index = MODULE_NAV_ITEMS.findIndex((item) => item.name === moduleName);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function getModuleSlug(moduleName?: string): string | undefined {
  return MODULE_NAV_ITEMS.find((item) => item.name === moduleName)?.slug;
}

function getGradeText(gradeId: number): string {
  return `${gradeId}年级`;
}

function sortTopics(topics: TopicSummary[]): TopicSummary[] {
  return [...topics].sort((left, right) => {
    const moduleDiff = getModuleOrder(left.moduleName) - getModuleOrder(right.moduleName);

    if (moduleDiff !== 0) {
      return moduleDiff;
    }

    return left.id - right.id;
  });
}

async function findFirstKnowledgePoint(topics: TopicSummary[]) {
  for (const topic of topics) {
    const knowledgePoints = await getKnowledgePointsByTopic(topic.id);
    const firstKnowledgePoint = knowledgePoints[0];

    if (firstKnowledgePoint) {
      return { topic, knowledgePoint: firstKnowledgePoint };
    }
  }

  return null;
}

function buildCard(input: BottomNavigationCard): BottomNavigationCard {
  return input;
}

export async function resolveBottomNavigationCard({
  currentTopic,
  currentKnowledgePointId,
  returnHref,
  returnLabel,
  buildHref
}: ResolveBottomNavigationCardOptions): Promise<BottomNavigationCard> {
  const currentTopicKnowledgePoints = await getKnowledgePointsByTopic(currentTopic.id);
  const currentKnowledgePointIndex = currentTopicKnowledgePoints.findIndex((item) => item.id === currentKnowledgePointId);
  const nextKnowledgePoint = currentKnowledgePointIndex >= 0 ? currentTopicKnowledgePoints[currentKnowledgePointIndex + 1] : undefined;

  if (nextKnowledgePoint) {
    return buildCard({
      title: nextKnowledgePoint.name,
      subtitle: "当前专题",
      href: buildHref({
        gradeId: currentTopic.gradeId,
        moduleSlug: getModuleSlug(currentTopic.moduleName),
        topicId: currentTopic.id,
        knowledgePointId: nextKnowledgePoint.id
      }),
      eyebrow: "下一个知识点",
      prompt: "已学完当前知识点？",
      description: "继续下一节，学习节奏更连贯。",
      buttonLabel: "下一知识点"
    });
  }

  const currentGradeTopics = sortTopics(await getTopicsByGrade(currentTopic.gradeId));
  const currentModuleTopics = currentGradeTopics.filter((topic) => topic.moduleName === currentTopic.moduleName);
  const currentTopicIndex = currentModuleTopics.findIndex((topic) => topic.id === currentTopic.id);

  if (currentTopicIndex >= 0) {
    const nextTopicInModule = await findFirstKnowledgePoint(currentModuleTopics.slice(currentTopicIndex + 1));

    if (nextTopicInModule) {
      return buildCard({
        title: nextTopicInModule.knowledgePoint.name,
        subtitle: `${nextTopicInModule.topic.moduleName ?? ""} · ${nextTopicInModule.topic.name}`.trim(),
        href: buildHref({
          gradeId: nextTopicInModule.topic.gradeId,
          moduleSlug: getModuleSlug(nextTopicInModule.topic.moduleName),
          topicId: nextTopicInModule.topic.id,
          knowledgePointId: nextTopicInModule.knowledgePoint.id
        }),
        eyebrow: "下一个专题",
        prompt: "当前专题已学完",
        description: "继续进入同模块下一个专题，保持学习连续性。",
        buttonLabel: "进入下一专题"
      });
    }
  }

  const currentModuleOrder = getModuleOrder(currentTopic.moduleName);
  const nextModuleTopicsSameGrade = currentGradeTopics.filter((topic) => getModuleOrder(topic.moduleName) > currentModuleOrder);
  const nextModuleTarget = await findFirstKnowledgePoint(nextModuleTopicsSameGrade);

  if (nextModuleTarget) {
    return buildCard({
      title: nextModuleTarget.knowledgePoint.name,
      subtitle: `${nextModuleTarget.topic.moduleName ?? ""} · ${nextModuleTarget.topic.name}`.trim(),
      href: buildHref({
        gradeId: nextModuleTarget.topic.gradeId,
        moduleSlug: getModuleSlug(nextModuleTarget.topic.moduleName),
        topicId: nextModuleTarget.topic.id,
        knowledgePointId: nextModuleTarget.knowledgePoint.id
      }),
      eyebrow: "同年级下一个模块",
      prompt: "当前模块已学完",
      description: "继续进入同年级下一个模块，保持年级内学习路径连续。",
      buttonLabel: "进入下一模块"
    });
  }

  for (let nextGradeId = currentTopic.gradeId + 1; nextGradeId <= 6; nextGradeId += 1) {
    const nextGradeTopics = sortTopics(await getTopicsByGrade(nextGradeId));
    const nextGradeTarget = await findFirstKnowledgePoint(nextGradeTopics);

    if (nextGradeTarget) {
      return buildCard({
        title: nextGradeTarget.knowledgePoint.name,
        subtitle: `${getGradeText(nextGradeId)} · ${nextGradeTarget.topic.moduleName ?? ""} · ${nextGradeTarget.topic.name}`.trim(),
        href: buildHref({
          gradeId: nextGradeTarget.topic.gradeId,
          moduleSlug: getModuleSlug(nextGradeTarget.topic.moduleName),
          topicId: nextGradeTarget.topic.id,
          knowledgePointId: nextGradeTarget.knowledgePoint.id
        }),
        eyebrow: "下一个年级",
        prompt: "当前年级已学完",
        description: "继续进入下一个年级的首个学习项。",
        buttonLabel: "进入下一年级"
      });
    }
  }

  return buildCard({
    title: returnLabel,
    subtitle: `${currentTopic.moduleName ?? ""} · ${currentTopic.name}`.trim(),
    href: returnHref,
    eyebrow: "返回入口",
    prompt: "当前学习路径已浏览完成",
    description: "可以返回上一层，继续查看导航或切换其他内容。",
    buttonLabel: "返回上一页"
  });
}
