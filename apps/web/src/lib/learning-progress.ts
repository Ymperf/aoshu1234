import type {
  KnowledgePointDetail,
  LearningOverview,
  LearningProgressState,
  LearningRecord,
  LearningStatus,
  QuizAttemptSummary,
  QuizQuestion,
  QuizSubmissionResult,
  TopicLearningProgress
} from "@shared-types/content";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

interface LearningRecordRow {
  user_id: string;
  knowledge_point_id: number;
  topic_id: number | null;
  grade_id: number | null;
  grade_name: string | null;
  module_name: string | null;
  topic_name: string | null;
  knowledge_point_name: string | null;
  state: LearningProgressState | null;
  started_at: string | null;
  completed_at: string | null;
  attempts_count: number | null;
  latest_score: number | null;
  last_submitted_at: string | null;
  last_active_at: string | null;
}

interface QuizAttemptRow {
  user_id: string;
  knowledge_point_id: number;
  topic_id: number | null;
  grade_id: number | null;
  grade_name: string | null;
  module_name: string | null;
  topic_name: string | null;
  knowledge_point_name: string | null;
  score: number;
  total_questions: number;
  correct_count: number;
  submitted_at: string;
  results: Array<{
    questionId: number;
    selectedOption: string;
    correctAnswer?: string;
    isCorrect: boolean;
  }>;
}

function createEmptyOverview(): LearningOverview {
  return {
    totalStarted: 0,
    totalCompleted: 0,
    totalQuizAttempts: 0,
    averageScore: 0,
    continueLearning: null,
    recentRecords: [],
    topicProgress: [],
    recentQuizResults: []
  };
}

function toLearningRecord(row: LearningRecordRow): LearningRecord {
  return {
    knowledgePointId: row.knowledge_point_id,
    topicId: row.topic_id ?? undefined,
    gradeId: row.grade_id ?? undefined,
    gradeName: row.grade_name ?? undefined,
    moduleName: row.module_name ?? undefined,
    topicName: row.topic_name ?? undefined,
    knowledgePointName: row.knowledge_point_name ?? undefined,
    state: row.state ?? undefined,
    startedAt: row.started_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    attemptsCount: row.attempts_count ?? 0,
    latestScore: row.latest_score ?? undefined,
    lastSubmittedAt: row.last_submitted_at ?? undefined,
    lastActiveAt: row.last_active_at ?? undefined
  };
}

function groupTopicProgress(records: LearningRecord[]): TopicLearningProgress[] {
  const grouped = new Map<number, TopicLearningProgress>();

  for (const record of records) {
    const topicId = record.topicId;
    if (!topicId) {
      continue;
    }

    const current = grouped.get(topicId) ?? {
      topicId,
      gradeId: record.gradeId,
      gradeName: record.gradeName,
      moduleName: record.moduleName,
      topicName: record.topicName,
      startedCount: 0,
      completedCount: 0,
      totalKnowledgePoints: 0,
      completionRate: 0
    };

    current.totalKnowledgePoints += 1;
    if (record.state && record.state !== "not_started") {
      current.startedCount += 1;
    }
    if (record.state === "completed") {
      current.completedCount += 1;
    }
    current.completionRate = current.totalKnowledgePoints === 0 ? 0 : Math.round((current.completedCount / current.totalKnowledgePoints) * 100);
    grouped.set(topicId, current);
  }

  return Array.from(grouped.values()).sort((left, right) => right.completionRate - left.completionRate || right.totalKnowledgePoints - left.totalKnowledgePoints);
}

export async function loadLearningRecord(userId: string, knowledgePointId: number): Promise<LearningStatus | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("learning_records")
    .select("*")
    .eq("user_id", userId)
    .eq("knowledge_point_id", knowledgePointId)
    .maybeSingle<LearningRecordRow>();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const record = toLearningRecord(data);

  return {
    ...record,
    topicId: record.topicId ?? 0,
    isStarted: Boolean(record.startedAt),
    isCompleted: Boolean(record.completedAt),
    state: record.state ?? "not_started",
    canAccess: true,
    accessType: "free"
  };
}

export async function markLearningStarted(userId: string, knowledgePoint: KnowledgePointDetail): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const now = new Date().toISOString();

  const payload = {
    user_id: userId,
    knowledge_point_id: knowledgePoint.id,
    topic_id: knowledgePoint.topicId,
    grade_id: null,
    grade_name: null,
    module_name: knowledgePoint.moduleName ?? null,
    topic_name: knowledgePoint.topicName,
    knowledge_point_name: knowledgePoint.name,
    state: "in_progress" as const,
    started_at: now,
    completed_at: null,
    attempts_count: 0,
    latest_score: null,
    last_submitted_at: null,
    last_active_at: now
  };

  const { error } = await supabase.from("learning_records").upsert(payload, {
    onConflict: "user_id,knowledge_point_id"
  });

  if (error) {
    throw error;
  }
}

export async function markLearningCompleted(userId: string, knowledgePoint: KnowledgePointDetail): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const now = new Date().toISOString();

  const payload = {
    user_id: userId,
    knowledge_point_id: knowledgePoint.id,
    topic_id: knowledgePoint.topicId,
    grade_id: null,
    grade_name: null,
    module_name: knowledgePoint.moduleName ?? null,
    topic_name: knowledgePoint.topicName,
    knowledge_point_name: knowledgePoint.name,
    state: "completed" as const,
    started_at: now,
    completed_at: now,
    attempts_count: 0,
    latest_score: null,
    last_submitted_at: now,
    last_active_at: now
  };

  const { error } = await supabase.from("learning_records").upsert(payload, {
    onConflict: "user_id,knowledge_point_id"
  });

  if (error) {
    throw error;
  }
}

export async function submitQuizAttempt(
  userId: string,
  knowledgePoint: KnowledgePointDetail,
  quizQuestions: QuizQuestion[],
  selectedAnswers: Record<number, string>
): Promise<QuizSubmissionResult> {
  const supabase = getSupabaseBrowserClient();
  const now = new Date().toISOString();
  const results = quizQuestions.map((question) => {
    const selectedOption = selectedAnswers[question.id] ?? "";
    const correctAnswer = question.answerText;

    return {
      questionId: question.id,
      selectedOption,
      correctAnswer,
      isCorrect: Boolean(correctAnswer) && selectedOption === correctAnswer
    };
  });

  const correctCount = results.filter((item) => item.isCorrect).length;
  const score = quizQuestions.length === 0 ? 0 : Math.round((correctCount / quizQuestions.length) * 100);
  const result: QuizSubmissionResult = {
    knowledgePointId: knowledgePoint.id,
    submittedAt: now,
    score,
    totalQuestions: quizQuestions.length,
    correctCount,
    results
  };

  const { error: insertError } = await supabase.from("quiz_attempts").insert({
    user_id: userId,
    knowledge_point_id: knowledgePoint.id,
    topic_id: knowledgePoint.topicId,
    grade_id: null,
    grade_name: null,
    module_name: knowledgePoint.moduleName ?? null,
    topic_name: knowledgePoint.topicName,
    knowledge_point_name: knowledgePoint.name,
    score,
    total_questions: quizQuestions.length,
    correct_count: correctCount,
    submitted_at: now,
    results
  });

  if (insertError) {
    throw insertError;
  }

  const { error: updateError } = await supabase.from("learning_records").upsert(
    {
      user_id: userId,
      knowledge_point_id: knowledgePoint.id,
      topic_id: knowledgePoint.topicId,
      grade_id: null,
      grade_name: null,
      module_name: knowledgePoint.moduleName ?? null,
      topic_name: knowledgePoint.topicName,
      knowledge_point_name: knowledgePoint.name,
      state: "completed" as const,
      started_at: now,
      completed_at: now,
      attempts_count: 1,
      latest_score: score,
      last_submitted_at: now,
      last_active_at: now
    },
    {
      onConflict: "user_id,knowledge_point_id"
    }
  );

  if (updateError) {
    throw updateError;
  }

  return result;
}

export async function loadLearningOverview(userId: string): Promise<LearningOverview> {
  const supabase = getSupabaseBrowserClient();
  const [recordsResult, attemptsResult] = await Promise.all([
    supabase.from("learning_records").select("*").eq("user_id", userId).order("last_active_at", { ascending: false }),
    supabase.from("quiz_attempts").select("*").eq("user_id", userId).order("submitted_at", { ascending: false })
  ]);

  if (recordsResult.error) {
    throw recordsResult.error;
  }

  if (attemptsResult.error) {
    throw attemptsResult.error;
  }

  const records = (recordsResult.data ?? []).map(toLearningRecord);
  const attempts = (attemptsResult.data ?? []) as QuizAttemptRow[];

  const totalStarted = records.filter((record) => record.state && record.state !== "not_started").length;
  const totalCompleted = records.filter((record) => record.state === "completed").length;
  const totalQuizAttempts = attempts.length;
  const averageScore =
    attempts.length === 0 ? 0 : Math.round(attempts.reduce((sum, item) => sum + item.score, 0) / attempts.length);

  const recentQuizResults: QuizAttemptSummary[] = attempts.slice(0, 8).map((item) => ({
    knowledgePointId: item.knowledge_point_id,
    topicId: item.topic_id ?? 0,
    gradeId: item.grade_id ?? undefined,
    gradeName: item.grade_name ?? undefined,
    moduleName: item.module_name ?? undefined,
    topicName: item.topic_name ?? undefined,
    knowledgePointName: item.knowledge_point_name ?? undefined,
    score: item.score,
    submittedAt: item.submitted_at
  }));

  return {
    totalStarted,
    totalCompleted,
    totalQuizAttempts,
    averageScore,
    continueLearning: records.find((record) => record.state !== "completed") ?? records[0] ?? null,
    recentRecords: records.slice(0, 12),
    topicProgress: groupTopicProgress(records),
    recentQuizResults
  };
}
