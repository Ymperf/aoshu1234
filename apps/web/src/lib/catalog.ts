import type {
  ContentCatalogOverview,
  ContentImportSummary,
  GradeDetail,
  GradeSummary,
  KnowledgePointDetail,
  KnowledgePointSummary,
  QuizQuestion,
  SearchResultGroup,
  SystemHealth,
  TopicDetail,
  TopicSummary
} from "@shared-types/content";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

interface GeneratedCourseCatalog {
  grades: GradeSummary[];
  modules?: Array<{ id: number; gradeId: number; name: string; intro: string; topicCount: number }>;
  topics: TopicSummary[];
  knowledgePoints: KnowledgePointDetail[];
  quizQuestions?: QuizQuestion[];
}

const GENERATED_CATALOG_PATH = resolve(process.cwd(), "..", "..", "data", "generated", "content-json", "course-catalog.json");
const GENERATED_SQL_PATH = "data/generated/sql/content-seed.sql";

let cachedCatalog: GeneratedCourseCatalog | null = null;

function loadCatalog(): GeneratedCourseCatalog {
  if (cachedCatalog) {
    return cachedCatalog;
  }

  if (!existsSync(GENERATED_CATALOG_PATH)) {
    cachedCatalog = {
      grades: [],
      topics: [],
      knowledgePoints: [],
      quizQuestions: []
    };
    return cachedCatalog;
  }

  const raw = readFileSync(GENERATED_CATALOG_PATH, "utf-8");
  cachedCatalog = JSON.parse(raw) as GeneratedCourseCatalog;
  return cachedCatalog;
}

function findGrade(gradeId: number): GradeSummary | undefined {
  return loadCatalog().grades.find((item) => item.id === gradeId);
}

function findTopic(topicId: number): TopicSummary | undefined {
  return loadCatalog().topics.find((item) => item.id === topicId);
}

function withTopicGrade(topic: TopicSummary): TopicDetail {
  const grade = findGrade(topic.gradeId);
  return {
    ...topic,
    gradeName: grade?.name ?? `${topic.gradeId} 年级`
  };
}

function withKnowledgePointDetails(knowledgePoint: KnowledgePointDetail): KnowledgePointDetail {
  const topic = findTopic(knowledgePoint.topicId);
  return {
    ...knowledgePoint,
    isLocked: topic?.isFree ? false : knowledgePoint.isLocked,
    topicName: topic?.name ?? knowledgePoint.topicName
  };
}

function normalizeText(value?: string): string {
  return (value ?? "").trim().toLowerCase();
}

function makeSearchItem<T extends { id: number }>(base: {
  entityType: "grade" | "topic" | "knowledge_point";
  id: number;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  gradeId?: number;
  gradeName?: string;
  topicId?: number;
  topicName?: string;
  isFree?: boolean;
  isLocked?: boolean;
}) {
  return base;
}

async function fetchApi<T>(path: string): Promise<T> {
  const catalog = loadCatalog();

  if (path === "grades") {
    return catalog.grades as T;
  }

  if (path === "catalog/overview") {
    return {
      gradeCount: catalog.grades.length,
      topicCount: catalog.topics.length,
      knowledgePointCount: catalog.knowledgePoints.length,
      freeTopicCount: catalog.topics.filter((topic) => topic.isFree).length,
      lockedKnowledgePointCount: catalog.knowledgePoints.filter((item) => item.isLocked).length,
      dataAccessMode: "generated_json",
      sourceType: "generated",
      sourceWorkbook: GENERATED_CATALOG_PATH,
      generatedAt: new Date().toISOString(),
      releaseVersionTag: undefined
    } as T;
  }

  if (path === "content-imports/latest") {
    return {
      sourceWorkbook: GENERATED_CATALOG_PATH,
      gradeCount: catalog.grades.length,
      topicCount: catalog.topics.length,
      knowledgePointCount: catalog.knowledgePoints.length,
      freeTopicCount: catalog.topics.filter((topic) => topic.isFree).length,
      quizQuestionCount: catalog.quizQuestions?.length ?? 0,
      seedSqlPath: GENERATED_SQL_PATH,
      sourceType: "generated",
      generatedAt: new Date().toISOString()
    } as T;
  }

  if (path === "system/health") {
    return {
      status: "ok",
      service: "api",
      timestamp: new Date().toISOString(),
      apiVersion: "0.1.0",
      dataAccessMode: "generated_json",
      sourceType: "generated",
      checks: [
        {
          name: "catalog_source",
          status: "ok",
          detail: "前端直接读取本地生成的 JSON 内容。"
        },
        {
          name: "catalog_counts",
          status: "ok",
          detail: `grades=${catalog.grades.length}, topics=${catalog.topics.length}, knowledgePoints=${catalog.knowledgePoints.length}`
        }
      ]
    } as T;
  }

  const searchMatch = path.match(/^search\?q=(.*)$/);
  if (searchMatch) {
    const query = decodeURIComponent(searchMatch[1] ?? "").trim();
    const normalized = normalizeText(query);

    if (!normalized) {
      return {
        query: "",
        total: 0,
        grades: [],
        topics: [],
        knowledgePoints: []
      } as T;
    }

    const grades = catalog.grades
      .filter((grade) => [grade.name, grade.intro].some((value) => normalizeText(value).includes(normalized)))
      .slice(0, 6)
      .map((grade) =>
        makeSearchItem({
          entityType: "grade",
          id: grade.id,
          title: grade.name,
          subtitle: `${grade.id} 年级`,
          description: grade.intro,
          href: `/grades/${grade.id}`,
          gradeId: grade.id,
          gradeName: grade.name
        })
      );

    const topics = catalog.topics
      .filter((topic) => {
        const grade = findGrade(topic.gradeId);
        return [topic.name, topic.intro, topic.moduleName, grade?.name].some((value) => normalizeText(value).includes(normalized));
      })
      .slice(0, 10)
      .map((topic) => {
        const grade = findGrade(topic.gradeId);
        return makeSearchItem({
          entityType: "topic",
          id: topic.id,
          title: topic.name,
          subtitle: topic.moduleName ? `${topic.moduleName} · ${grade?.name ?? "未知年级"}` : grade ? `${grade.name} 专题` : "专题",
          description: topic.intro,
          href: `/topics/${topic.id}`,
          gradeId: topic.gradeId,
          gradeName: grade?.name,
          topicId: topic.id,
          topicName: topic.name,
          isFree: topic.isFree
        });
      });

    const knowledgePoints = catalog.knowledgePoints
      .filter((knowledgePoint) => {
        const topic = findTopic(knowledgePoint.topicId);
        const grade = topic ? findGrade(topic.gradeId) : undefined;
        return [
          knowledgePoint.name,
          knowledgePoint.intro,
          knowledgePoint.knowledgePointNote,
          knowledgePoint.topicName,
          knowledgePoint.moduleName,
          topic?.name,
          grade?.name
        ].some((value) => normalizeText(value).includes(normalized));
      })
      .slice(0, 12)
      .map((knowledgePoint) => {
        const topic = findTopic(knowledgePoint.topicId);
        const grade = topic ? findGrade(topic.gradeId) : undefined;

        return makeSearchItem({
          entityType: "knowledge_point",
          id: knowledgePoint.id,
          title: knowledgePoint.name,
          subtitle: knowledgePoint.moduleName
            ? `${knowledgePoint.moduleName} · ${topic?.name ?? knowledgePoint.topicName}`
            : topic
              ? `${topic.name} · ${grade?.name ?? "未知年级"}`
              : "知识点",
          description: knowledgePoint.intro,
          href: `/knowledge-points/${knowledgePoint.id}`,
          gradeId: grade?.id,
          gradeName: grade?.name,
          topicId: knowledgePoint.topicId,
          topicName: topic?.name ?? knowledgePoint.topicName,
          isLocked: topic?.isFree ? false : knowledgePoint.isLocked
        });
      });

    return {
      query,
      total: grades.length + topics.length + knowledgePoints.length,
      grades,
      topics,
      knowledgePoints
    } as T;
  }

  const gradeTopicsMatch = path.match(/^grades\/(\d+)\/topics$/);
  if (gradeTopicsMatch) {
    const gradeId = Number(gradeTopicsMatch[1]);
    return catalog.topics.filter((topic) => topic.gradeId === gradeId) as T;
  }

  const gradeMatch = path.match(/^grades\/(\d+)$/);
  if (gradeMatch) {
    const gradeId = Number(gradeMatch[1]);
    const grade = findGrade(gradeId);

    if (!grade) {
      throw new Error(`Unknown catalog path: ${path}`);
    }

    return grade as T;
  }

  const topicMatch = path.match(/^topics\/(\d+)$/);
  if (topicMatch) {
    const topicId = Number(topicMatch[1]);
    const topic = findTopic(topicId);

    if (!topic) {
      throw new Error(`Unknown catalog path: ${path}`);
    }

    return withTopicGrade(topic) as T;
  }

  const topicKnowledgePointsMatch = path.match(/^topics\/(\d+)\/knowledge-points$/);
  if (topicKnowledgePointsMatch) {
    const topicId = Number(topicKnowledgePointsMatch[1]);
    const topic = findTopic(topicId);

    return catalog.knowledgePoints
      .filter((knowledgePoint) => knowledgePoint.topicId === topicId)
      .map((knowledgePoint) => ({
        ...knowledgePoint,
        isLocked: topic?.isFree ? false : knowledgePoint.isLocked
      })) as T;
  }

  const knowledgePointMatch = path.match(/^knowledge-points\/(\d+)$/);
  if (knowledgePointMatch) {
    const knowledgePointId = Number(knowledgePointMatch[1]);
    const knowledgePoint = catalog.knowledgePoints.find((item) => item.id === knowledgePointId);

    if (!knowledgePoint) {
      throw new Error(`Unknown catalog path: ${path}`);
    }

    return withKnowledgePointDetails(knowledgePoint) as T;
  }

  const quizQuestionsMatch = path.match(/^knowledge-points\/(\d+)\/quiz-questions$/);
  if (quizQuestionsMatch) {
    const knowledgePointId = Number(quizQuestionsMatch[1]);
    const knowledgePoint = catalog.knowledgePoints.find((item) => item.id === knowledgePointId);

    if (!knowledgePoint) {
      throw new Error(`Unknown catalog path: ${path}`);
    }

    const questions = (catalog.quizQuestions ?? []).filter((question) => question.knowledgePointId === knowledgePointId);

    if (questions.length > 0) {
      return questions as T;
    }

    return Array.from({ length: knowledgePoint.quizPreviewCount }, (_, index) => ({
      id: knowledgePoint.id * 10 + index + 1,
      knowledgePointId: knowledgePoint.id,
      type: "single_choice" as const,
      stem: `${knowledgePoint.name} 练习预览 ${index + 1}：下面哪种做法更符合本知识点的核心思路？`,
      options: ["先识别条件和规律", "直接猜答案", "跳过验证步骤", "只记结论"],
      answerText: knowledgePoint.isLocked ? undefined : "先识别条件和规律",
      analysisText: knowledgePoint.isLocked
        ? undefined
        : `这道题考查 ${knowledgePoint.name} 的核心方法。先识别条件和规律，再按步骤完成解答。`
    })) as T;
  }

  throw new Error(`Unknown fallback path: ${path}`);
}

export function getGrades(): Promise<GradeSummary[]> {
  return fetchApi<GradeSummary[]>("grades");
}

export function getGradeDetail(gradeId: number): Promise<GradeDetail> {
  return fetchApi<GradeDetail>(`grades/${gradeId}`);
}

export function getTopicsByGrade(gradeId: number): Promise<TopicSummary[]> {
  return fetchApi<TopicSummary[]>(`grades/${gradeId}/topics`);
}

export function getTopicDetail(topicId: number): Promise<TopicDetail> {
  return fetchApi<TopicDetail>(`topics/${topicId}`);
}

export function getKnowledgePointsByTopic(topicId: number): Promise<KnowledgePointSummary[]> {
  return fetchApi<KnowledgePointSummary[]>(`topics/${topicId}/knowledge-points`);
}

export function getKnowledgePointDetail(id: number): Promise<KnowledgePointDetail> {
  return fetchApi<KnowledgePointDetail>(`knowledge-points/${id}`);
}

export function getQuizQuestionsByKnowledgePoint(id: number): Promise<QuizQuestion[]> {
  return fetchApi<QuizQuestion[]>(`knowledge-points/${id}/quiz-questions`);
}

export function getCatalogOverview(): Promise<ContentCatalogOverview> {
  return fetchApi<ContentCatalogOverview>("catalog/overview");
}

export function getLatestImportSummary(): Promise<ContentImportSummary> {
  return fetchApi<ContentImportSummary>("content-imports/latest");
}

export function getSystemHealth(): Promise<SystemHealth> {
  return fetchApi<SystemHealth>("system/health");
}

export function searchCatalog(query: string): Promise<SearchResultGroup> {
  return fetchApi<SearchResultGroup>(`search?q=${encodeURIComponent(query)}`);
}
