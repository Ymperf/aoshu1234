"use client";

import { useEffect, useMemo, useState } from "react";
import type { AuthSession, KnowledgePointDetail, QuizQuestion, QuizSubmissionResult, LearningOverview, LearningStatus } from "@shared-types/content";
import { readStoredSession, subscribeSessionChange } from "@/lib/auth-session";
import { loadLearningOverview, loadLearningRecord, markLearningCompleted, markLearningStarted, submitQuizAttempt } from "@/lib/learning-progress";

interface LearningConsoleProps {
  knowledgePoint: KnowledgePointDetail;
  quizQuestions: QuizQuestion[];
}

function getDisplayStem(stem: string): string {
  const separatorIndex = stem.indexOf("：");
  if (separatorIndex === -1) {
    return stem;
  }

  const simplified = stem.slice(separatorIndex + 1).trim();
  return simplified.length > 0 ? simplified : stem;
}

function ActionButton({
  children,
  onClick,
  disabled,
  variant = "primary"
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "success";
}) {
  const className =
    variant === "primary"
      ? "bg-primary text-white hover:bg-primary-deep"
      : variant === "success"
        ? "bg-emerald-600 text-white hover:bg-emerald-700"
        : "border border-line bg-white text-slate-700 hover:border-primary hover:text-primary";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {children}
    </button>
  );
}

export function LearningConsole({ knowledgePoint, quizQuestions }: LearningConsoleProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<LearningStatus | null>(null);
  const [overview, setOverview] = useState<LearningOverview | null>(null);
  const [submissionResult, setSubmissionResult] = useState<QuizSubmissionResult | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const answeredCount = useMemo(
    () => Object.values(selectedAnswers).filter((value) => value.trim().length > 0).length,
    [selectedAnswers]
  );

  useEffect(() => {
    const syncSession = () => setSession(readStoredSession());
    syncSession();
    return subscribeSessionChange(syncSession);
  }, []);

  useEffect(() => {
    setSelectedAnswers({});
    setSubmissionResult(null);
    setNotice(null);
    setError(null);
  }, [knowledgePoint.id]);

  useEffect(() => {
    if (!session) {
      setStatus(null);
      setOverview(null);
      return;
    }

    void refreshLearningState(session);
  }, [session, knowledgePoint.id]);

  async function refreshLearningState(currentSession: AuthSession) {
    try {
      const [nextStatus, nextOverview] = await Promise.all([
        loadLearningRecord(currentSession.user.id, knowledgePoint.id),
        loadLearningOverview(currentSession.user.id)
      ]);

      setStatus(nextStatus);
      setOverview(nextOverview);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "学习状态加载失败，请稍后重试。");
    }
  }

  async function handleStatusAction(action: "start" | "complete") {
    if (!session) {
      setError("请先登录。");
      return;
    }

    setIsBusy(true);
    setError(null);

    try {
      if (action === "start") {
        await markLearningStarted(session.user.id, knowledgePoint);
      } else {
        await markLearningCompleted(session.user.id, knowledgePoint);
      }

      await refreshLearningState(session);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "学习状态更新失败。");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSubmitQuiz() {
    if (answeredCount === 0) {
      setError("请先选择至少一个答案。");
      return;
    }

    setIsBusy(true);
    setError(null);

    try {
      if (session) {
        const result = await submitQuizAttempt(session.user.id, knowledgePoint, quizQuestions, selectedAnswers);
        setSubmissionResult(result);
        setNotice("练习结果已保存。");
        await refreshLearningState(session);
      } else {
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
        setSubmissionResult({
          knowledgePointId: knowledgePoint.id,
          submittedAt: new Date().toISOString(),
          score: quizQuestions.length === 0 ? 0 : Math.round((correctCount / quizQuestions.length) * 100),
          totalQuestions: quizQuestions.length,
          correctCount,
          results
        });
        setNotice("当前为离线预览模式，登录后可保存到学习进度。");
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "提交练习失败。");
    } finally {
      setIsBusy(false);
    }
  }

  const canSubmitToServer = Boolean(session);

  return (
    <section className="mt-8 grid gap-6">
      {notice ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div> : null}

      {!session ? (
        <div className="rounded-[28px] border border-sky-200 bg-sky-50 px-5 py-4 text-sm leading-7 text-sky-800">
          当前未登录。你可以先浏览和练习，登录后会把学习进度、作答结果和最近记录保存到账号里。
        </div>
      ) : null}

      {session ? (
        <div className="grid gap-6">
          {overview ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "已开始", value: overview.totalStarted },
                { label: "已完成", value: overview.totalCompleted },
                { label: "练习次数", value: overview.totalQuizAttempts },
                { label: "平均得分", value: `${overview.averageScore}%` }
              ].map((item) => (
                <div key={item.label} className="rounded-[24px] border border-line/80 bg-white p-5 shadow-card">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <strong className="mt-3 block text-3xl font-semibold text-slate-950">{item.value}</strong>
                </div>
              ))}
            </div>
          ) : null}

          {overview?.continueLearning ? (
            <div className="rounded-[28px] border border-sky-200 bg-sky-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">继续学习</p>
              <strong className="mt-2 block text-2xl font-semibold text-slate-950">
                {overview.continueLearning.knowledgePointName ?? knowledgePoint.name}
              </strong>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                {overview.continueLearning.topicName ?? "当前专题"} · 最近活动时间{" "}
                {overview.continueLearning.lastActiveAt ? new Date(overview.continueLearning.lastActiveAt).toLocaleString() : "刚刚"}
              </p>
            </div>
          ) : null}

          <div className="rounded-[28px] border border-line/80 bg-white p-6 shadow-card">
            <strong className="block text-xl font-semibold text-slate-950">课程状态与进度</strong>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {status
                ? `状态：${status.state}｜已开始：${status.isStarted ? "是" : "否"}｜已完成：${status.isCompleted ? "是" : "否"}｜作答次数：${status.attemptsCount}`
                : "登录后可查看当前知识点的学习状态。"}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <ActionButton variant="secondary" onClick={() => handleStatusAction("start")} disabled={isBusy}>
                标记开始学习
              </ActionButton>
              <ActionButton variant="secondary" onClick={() => handleStatusAction("complete")} disabled={isBusy}>
                标记完成
              </ActionButton>
            </div>

            {status ? (
              <div className="mt-5 rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm text-slate-700">
                最近得分：{status.latestScore ?? "-"} · 最近提交：{status.lastSubmittedAt ? new Date(status.lastSubmittedAt).toLocaleString() : "-"}
              </div>
            ) : null}
          </div>

          {overview?.topicProgress.length ? (
            <div className="rounded-[28px] border border-line/80 bg-white p-6 shadow-card">
              <strong className="text-xl font-semibold text-slate-950">专题进度</strong>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {overview.topicProgress.slice(0, 6).map((item) => (
                  <div key={item.topicId} className="rounded-2xl border border-line bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">{item.topicName ?? `专题 ${item.topicId}`}</p>
                    <strong className="mt-2 block text-2xl font-semibold text-slate-950">{item.completionRate}%</strong>
                    <p className="mt-2 text-sm text-slate-600">
                      已完成 {item.completedCount}/{item.totalKnowledgePoints}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-[32px] border border-line/80 bg-white p-6 shadow-panel">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Practice</p>
            <strong className="mt-2 block text-3xl font-semibold text-slate-950">当前知识点练习</strong>
            <span className="mt-2 block text-sm text-slate-500">
              已作答 {answeredCount}/{quizQuestions.length}
            </span>
          </div>
          <ActionButton variant="success" onClick={handleSubmitQuiz} disabled={isBusy}>
            {canSubmitToServer ? "提交并保存答案" : "提交答案"}
          </ActionButton>
        </div>

        <div className="mt-6 grid gap-5">
          {quizQuestions.map((question, index) => (
            <article key={question.id} className="rounded-[28px] border border-line/80 bg-slate-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">第 {index + 1} 题</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">{getDisplayStem(question.stem)}</h3>
              <div className="mt-4 grid gap-3">
                {question.options.map((option) => {
                  const isSelected = selectedAnswers[question.id] === option;

                  return (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                        isSelected ? "border-primary bg-primary-soft/60" : "border-line bg-white hover:border-primary/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={isSelected}
                        onChange={() =>
                          setSelectedAnswers((current) => ({
                            ...current,
                            [question.id]: option
                          }))
                        }
                        disabled={isBusy}
                      />
                      <span className="text-slate-700">{option}</span>
                    </label>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </div>

      {submissionResult ? (
        <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-6">
          <strong className="block text-xl font-semibold text-emerald-800">
            最近一次结果：{submissionResult.score}%（{submissionResult.correctCount}/{submissionResult.totalQuestions}）
          </strong>
          <div className="mt-4 grid gap-3">
            {submissionResult.results.map((item) => (
              <div
                key={item.questionId}
                className={`rounded-2xl border px-4 py-4 text-sm ${
                  item.isCorrect ? "border-emerald-200 bg-white text-slate-700" : "border-amber-200 bg-amber-50 text-slate-700"
                }`}
              >
                <strong className={item.isCorrect ? "text-emerald-700" : "text-amber-700"}>{item.isCorrect ? "回答正确" : "继续练习"}</strong>
                <p className="mt-2">你的答案：{item.selectedOption || "未作答"}</p>
                <p className="mt-1">正确答案：{item.correctAnswer ?? "当前未开放答案"}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {overview?.recentQuizResults.length ? (
        <div className="rounded-[28px] border border-line/80 bg-white p-6 shadow-card">
          <strong className="text-xl font-semibold text-slate-950">最近练习记录</strong>
          <div className="mt-4 grid gap-3">
            {overview.recentQuizResults.map((item) => (
              <div
                key={`${item.knowledgePointId}-${item.submittedAt}`}
                className={`rounded-2xl border px-4 py-4 text-sm ${
                  item.score >= 60 ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
                }`}
              >
                <strong className="text-slate-900">{item.knowledgePointName ?? `知识点 ${item.knowledgePointId}`}</strong>
                <p className="mt-2 text-slate-600">
                  {item.topicName ?? `专题 ${item.topicId}`} · 得分 {item.score}% · 提交时间 {new Date(item.submittedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
    </section>
  );
}
