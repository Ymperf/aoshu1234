"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AuthSession, LearningOverview, LearningRecord } from "@shared-types/content";
import { readStoredSession, subscribeSessionChange } from "@/lib/auth-session";
import { loadLearningOverview } from "@/lib/learning-progress";

function buildKnowledgePointHref(record: LearningRecord) {
  if (record.gradeId && record.topicId && record.moduleName) {
    return `/knowledge-points/${record.knowledgePointId}`;
  }

  return `/knowledge-points/${record.knowledgePointId}`;
}

function formatLastActiveAt(value?: string) {
  if (!value) {
    return "刚刚";
  }

  return new Date(value).toLocaleString();
}

export function UserLearningSummary() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [overview, setOverview] = useState<LearningOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncSession = () => setSession(readStoredSession());
    syncSession();
    return subscribeSessionChange(syncSession);
  }, []);

  useEffect(() => {
    if (!session) {
      setOverview(null);
      setError(null);
      return;
    }

    void loadLearningOverview(session.user.id)
      .then((data) => {
        setOverview(data);
        setError(null);
      })
      .catch((requestError) => {
        setOverview(null);
        setError(requestError instanceof Error ? requestError.message : "学习概览加载失败，请稍后重试。");
      });
  }, [session]);

  if (!session) {
    return (
      <section className="rounded-[28px] border border-sky-200 bg-sky-50 px-5 py-4 text-sm leading-7 text-sky-800">
        登录后可以查看继续学习、最近学习和专题进度。
      </section>
    );
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-[28px] border border-line/80 bg-white p-6 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Learning Center</p>
        <strong className="mt-2 block text-3xl font-semibold text-slate-950">{session.user.displayName}</strong>
        <p className="mt-3 text-sm leading-7 text-slate-600">{session.user.email}</p>
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {overview ? (
        <>
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

          {overview.continueLearning ? (
            <Link
              href={buildKnowledgePointHref(overview.continueLearning)}
              className="rounded-[28px] border border-sky-200 bg-sky-50 p-6 transition hover:border-sky-300 hover:bg-sky-100/80"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">继续学习</p>
              <strong className="mt-2 block text-2xl font-semibold text-slate-950">
                {overview.continueLearning.knowledgePointName ?? `知识点 ${overview.continueLearning.knowledgePointId}`}
              </strong>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                {overview.continueLearning.topicName ?? "当前专题"} · 最近活动时间 {formatLastActiveAt(overview.continueLearning.lastActiveAt)}
              </p>
            </Link>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-[28px] border border-line/80 bg-white p-6 shadow-card">
              <strong className="text-xl font-semibold text-slate-950">最近学习</strong>
              <div className="mt-4 grid gap-3">
                {overview.recentRecords.length ? (
                  overview.recentRecords.map((record) => (
                    <Link
                      key={`${record.knowledgePointId}-${record.lastActiveAt ?? record.startedAt ?? "recent"}`}
                      href={buildKnowledgePointHref(record)}
                      className="rounded-2xl border border-line bg-slate-50 px-4 py-4 transition hover:border-primary/30 hover:bg-white"
                    >
                      <strong className="text-slate-900">{record.knowledgePointName ?? `知识点 ${record.knowledgePointId}`}</strong>
                      <p className="mt-2 text-sm text-slate-600">
                        {record.topicName ?? "当前专题"} · 状态 {record.state ?? "not_started"} · 最近活动 {formatLastActiveAt(record.lastActiveAt)}
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">还没有学习记录，先打开一个知识点开始学习吧。</p>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-line/80 bg-white p-6 shadow-card">
              <strong className="text-xl font-semibold text-slate-950">专题进度</strong>
              <div className="mt-4 grid gap-3">
                {overview.topicProgress.length ? (
                  overview.topicProgress.slice(0, 8).map((item) => (
                    <div key={item.topicId} className="rounded-2xl border border-line bg-slate-50 px-4 py-4">
                      <strong className="text-slate-900">{item.topicName ?? `专题 ${item.topicId}`}</strong>
                      <p className="mt-2 text-sm text-slate-600">
                        完成率 {item.completionRate}% · 已完成 {item.completedCount}/{item.totalKnowledgePoints}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">开始学习后，这里会显示你的专题进度。</p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-[28px] border border-line/80 bg-white p-6 shadow-card">
          <p className="text-sm text-slate-500">正在加载学习概览...</p>
        </div>
      )}
    </section>
  );
}
