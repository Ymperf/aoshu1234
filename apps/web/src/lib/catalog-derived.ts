import type { CourseCatalog, KnowledgePointSummary, ModuleSummary, TopicSummary } from "@shared-types/content";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { MODULE_NAV_ITEMS, getModuleByName, getGradeLabel } from "@/lib/site-navigation";

interface GeneratedCatalog extends CourseCatalog {
  modules?: ModuleSummary[];
}

const CATALOG_CANDIDATES = [
  resolve(process.cwd(), "..", "..", "data", "generated", "content-json", "course-catalog.json"),
  resolve(process.cwd(), "data", "generated", "content-json", "course-catalog.json")
];

let cachedCatalog: GeneratedCatalog | null = null;

function loadCatalog(): GeneratedCatalog {
  if (cachedCatalog) {
    return cachedCatalog;
  }

  const filePath = CATALOG_CANDIDATES.find((candidate) => existsSync(candidate));

  if (!filePath) {
    cachedCatalog = {
      grades: [],
      modules: [],
      topics: [],
      knowledgePoints: []
    };

    return cachedCatalog;
  }

  cachedCatalog = JSON.parse(readFileSync(filePath, "utf-8")) as GeneratedCatalog;
  return cachedCatalog;
}

function sortModules<T extends { name: string }>(items: T[]): T[] {
  const order = new Map(MODULE_NAV_ITEMS.map((item, index) => [item.name, index]));
  return [...items].sort((left, right) => (order.get(left.name) ?? 999) - (order.get(right.name) ?? 999));
}

export interface GradeModuleSection {
  id: number;
  name: string;
  slug?: string;
  intro: string;
  topicCount: number;
  topics: TopicSummary[];
}

export interface ModuleGradeSection {
  gradeId: number;
  gradeName: string;
  topics: TopicSummary[];
}

export interface TopicKnowledgeGroup {
  id: number;
  gradeId: number;
  gradeName: string;
  moduleId?: number;
  moduleName?: string;
  name: string;
  intro: string;
  isFree: boolean;
  knowledgePointCount: number;
  knowledgePoints: KnowledgePointSummary[];
}

export interface GradeTopicKnowledgeModuleSection extends GradeModuleSection {
  topics: TopicKnowledgeGroup[];
}

export interface ModuleGradeTopicKnowledgeSection extends ModuleGradeSection {
  topics: TopicKnowledgeGroup[];
}

export async function getGradeModules(gradeId: number): Promise<GradeModuleSection[]> {
  const catalog = loadCatalog();
  const modules = (catalog.modules ?? []).filter((module) => module.gradeId === gradeId);

  return sortModules(modules).map((module) => ({
    ...module,
    slug: getModuleByName(module.name)?.slug,
    topics: catalog.topics.filter((topic) => topic.gradeId === gradeId && topic.moduleId === module.id)
  }));
}

export async function getModuleTopicGroups(moduleName: string): Promise<ModuleGradeSection[]> {
  const catalog = loadCatalog();
  const topics = catalog.topics.filter((topic) => topic.moduleName === moduleName);
  const gradeIds = [...new Set(topics.map((topic) => topic.gradeId))].sort((left, right) => left - right);

  return gradeIds.map((gradeId) => ({
    gradeId,
    gradeName: getGradeLabel(gradeId),
    topics: topics.filter((topic) => topic.gradeId === gradeId)
  }));
}

function buildTopicKnowledgeGroups(topics: TopicSummary[], knowledgePoints: GeneratedCatalog["knowledgePoints"]): TopicKnowledgeGroup[] {
  return topics.map((topic) => ({
    ...topic,
    gradeName: getGradeLabel(topic.gradeId),
    knowledgePoints: knowledgePoints
      .filter((knowledgePoint) => knowledgePoint.topicId === topic.id)
      .map(({ topicName: _topicName, transcriptText: _transcriptText, quizPreviewCount: _quizPreviewCount, knowledgePointNote: _knowledgePointNote, ...rest }) => ({
        ...rest,
        isLocked: topic.isFree ? false : rest.isLocked
      }))
  }));
}

export async function getGradeTopicKnowledgeGroups(gradeId: number): Promise<GradeTopicKnowledgeModuleSection[]> {
  const catalog = loadCatalog();
  const modules = (catalog.modules ?? []).filter((module) => module.gradeId === gradeId);
  const gradeTopics = catalog.topics.filter((topic) => topic.gradeId === gradeId);

  return sortModules(modules).map((module) => {
    const moduleTopics = gradeTopics.filter((topic) => topic.moduleId === module.id);

    return {
      ...module,
      slug: getModuleByName(module.name)?.slug,
      topics: buildTopicKnowledgeGroups(moduleTopics, catalog.knowledgePoints)
    };
  });
}

export async function getModuleGradeTopicKnowledgeGroups(moduleName: string): Promise<ModuleGradeTopicKnowledgeSection[]> {
  const catalog = loadCatalog();
  const topics = catalog.topics.filter((topic) => topic.moduleName === moduleName);
  const gradeIds = [...new Set(topics.map((topic) => topic.gradeId))].sort((left, right) => left - right);

  return gradeIds.map((gradeId) => {
    const gradeTopics = topics.filter((topic) => topic.gradeId === gradeId);

    return {
      gradeId,
      gradeName: getGradeLabel(gradeId),
      topics: buildTopicKnowledgeGroups(gradeTopics, catalog.knowledgePoints)
    };
  });
}
