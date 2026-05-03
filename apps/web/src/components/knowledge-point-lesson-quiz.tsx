"use client";

import { useMemo, useState } from "react";
import { MathRichText } from "@/components/math-rich-text";
import type { KnowledgePointLessonPackage } from "@/lib/knowledge-point-lesson";

interface KnowledgePointLessonQuizProps {
  lesson: KnowledgePointLessonPackage;
}

export function KnowledgePointLessonQuiz({ lesson }: KnowledgePointLessonQuizProps) {
  const questions = lesson.practiceContent?.questions ?? lesson.quizQuestions;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    if (!submitted) {
      return null;
    }

    let correct = 0;

    for (const question of questions) {
      const userAnswer = (answers[question.id] ?? "").replace(/\s+/g, "");
      const normalizedAnswer = question.answer.replace(/\s+/g, "");

      if (userAnswer === normalizedAnswer) {
        correct += 1;
      }
    }

    return {
      correct,
      total: questions.length,
      percent: Math.round((correct / questions.length) * 100)
    };
  }, [answers, questions, submitted]);

  return (
    <section className="grid gap-5">
      {questions.map((question, index) => {
        const isCorrect =
          submitted &&
          (answers[question.id] ?? "").replace(/\s+/g, "") === question.answer.replace(/\s+/g, "");

        return (
          <article key={question.id} className="rounded-[28px] border border-line/80 bg-white p-6 shadow-card">
            <div className="grid gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <strong className="text-xl font-semibold text-slate-950">第 {index + 1} 题</strong>
                <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary">
                  {question.type === "single_choice" ? "单选题" : question.type === "fill_blank" ? "填空题" : "应用题"}
                </span>
              </div>

              <MathRichText content={question.stem} className="whitespace-pre-wrap text-base leading-8 text-slate-800" />

              {question.options?.length ? (
                <div className="grid gap-3">
                  {question.options.map((option) => {
                    const checked = answers[question.id] === option;

                    return (
                      <label
                        key={option}
                        className={`flex cursor-pointer gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                          checked ? "border-primary bg-primary-soft/60" : "border-line bg-slate-50 hover:border-primary/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          checked={checked}
                          onChange={() => setAnswers((previous) => ({ ...previous, [question.id]: option }))}
                          className="mt-1"
                        />
                        <MathRichText content={option} as="span" className="whitespace-pre-wrap leading-7 text-slate-700" />
                      </label>
                    );
                  })}
                </div>
              ) : (
                <textarea
                  value={answers[question.id] ?? ""}
                  onChange={(event) => setAnswers((previous) => ({ ...previous, [question.id]: event.target.value }))}
                  placeholder={question.type === "fill_blank" ? "按“2,8”这样的格式填写" : "写出你的答案"}
                  className="min-h-28 resize-y rounded-2xl border border-line px-4 py-3 text-sm leading-7 text-slate-700 outline-none transition focus:border-primary"
                />
              )}

              {submitted ? (
                <div
                  className={`grid gap-2 rounded-2xl border px-4 py-4 ${
                    isCorrect ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <div className={`font-semibold ${isCorrect ? "text-emerald-700" : "text-amber-700"}`}>
                    {isCorrect ? "回答正确" : "标准答案："}
                  </div>
                  {!isCorrect ? <MathRichText content={question.answer} className="whitespace-pre-wrap text-sm leading-7 text-slate-700" /> : null}
                  <MathRichText content={question.analysis} className="whitespace-pre-wrap text-sm leading-7 text-slate-700" />
                  <MathRichText content={`常见错误：${question.commonMistake}`} className="whitespace-pre-wrap text-sm leading-7 text-slate-500" />
                </div>
              ) : null}
            </div>
          </article>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-line/80 bg-white p-6 shadow-card">
        <div className="text-sm leading-7 text-slate-600">
          {score ? `已完成 ${score.correct} / ${score.total} 题，得分 ${score.percent}%` : "完成作答后即可查看答案和解析。"}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-deep"
          >
            提交答案
          </button>
          <button
            type="button"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
            className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
          >
            重新作答
          </button>
        </div>
      </div>
    </section>
  );
}
