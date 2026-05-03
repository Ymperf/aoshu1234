"use client";

import { useMemo, useState } from "react";
import type { ChickenRabbitLessonPackage } from "@/lib/chicken-rabbit-demo";

interface ChickenRabbitDemoQuizProps {
  lesson: ChickenRabbitLessonPackage;
}

export function ChickenRabbitDemoQuiz({ lesson }: ChickenRabbitDemoQuizProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    if (!submitted) {
      return null;
    }

    let correct = 0;

    for (const question of lesson.quizQuestions) {
      const userAnswer = (answers[question.id] ?? "").replace(/\s+/g, "");
      const normalizedAnswer = question.answer.replace(/\s+/g, "");

      if (userAnswer === normalizedAnswer) {
        correct += 1;
      }
    }

    return {
      correct,
      total: lesson.quizQuestions.length,
      percent: Math.round((correct / lesson.quizQuestions.length) * 100)
    };
  }, [answers, lesson.quizQuestions, submitted]);

  return (
    <section
      style={{
        display: "grid",
        gap: 20,
        padding: 24,
        borderRadius: 28,
        background: "#fff",
        border: "1px solid rgba(143, 122, 92, 0.16)"
      }}
    >
      {lesson.quizQuestions.map((question, index) => {
        const isCorrect =
          submitted &&
          (answers[question.id] ?? "").replace(/\s+/g, "") === question.answer.replace(/\s+/g, "");

        return (
          <article
            key={question.id}
            style={{
              padding: 20,
              borderRadius: 22,
              background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,250,244,1) 100%)",
              border: "1px solid rgba(143, 122, 92, 0.14)",
              display: "grid",
              gap: 14
            }}
          >
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <strong style={{ fontSize: 19 }}>第 {index + 1} 题</strong>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: 999,
                    background:
                      question.type === "single_choice"
                        ? "rgba(217,107,39,0.12)"
                        : question.type === "fill_blank"
                          ? "rgba(58,138,104,0.12)"
                          : "rgba(99,106,255,0.10)",
                    color:
                      question.type === "single_choice"
                        ? "#a24f17"
                        : question.type === "fill_blank"
                          ? "#2e7256"
                          : "#5057b8",
                    fontWeight: 700
                  }}
                >
                  {question.type === "single_choice" ? "单选题" : question.type === "fill_blank" ? "填空题" : "应用题"}
                </span>
              </div>
              <div style={{ fontSize: 18, lineHeight: 1.8 }}>{question.stem}</div>
            </div>

            {question.options?.length ? (
              <div style={{ display: "grid", gap: 10 }}>
                {question.options.map((option) => {
                  const checked = answers[question.id] === option;

                  return (
                    <label
                      key={option}
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "start",
                        padding: "12px 14px",
                        borderRadius: 16,
                        border: `1px solid ${checked ? "rgba(217,107,39,0.36)" : "rgba(143,122,92,0.14)"}`,
                        background: checked ? "rgba(255,241,229,0.9)" : "#fff",
                        cursor: "pointer"
                      }}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        checked={checked}
                        onChange={() => setAnswers((previous) => ({ ...previous, [question.id]: option }))}
                      />
                      <span style={{ lineHeight: 1.7 }}>{option}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={answers[question.id] ?? ""}
                onChange={(event) => setAnswers((previous) => ({ ...previous, [question.id]: event.target.value }))}
                placeholder={question.type === "fill_blank" ? "按“6,8”这样的格式填写" : "写出你的答案"}
                style={{
                  minHeight: 96,
                  resize: "vertical",
                  borderRadius: 18,
                  border: "1px solid rgba(143,122,92,0.16)",
                  padding: 14,
                  font: "inherit",
                  lineHeight: 1.7
                }}
              />
            )}

            {submitted ? (
              <div
                style={{
                  padding: 16,
                  borderRadius: 18,
                  background: isCorrect ? "rgba(241,249,244,1)" : "rgba(255,243,233,1)",
                  border: `1px solid ${isCorrect ? "rgba(64,129,88,0.18)" : "rgba(217,107,39,0.18)"}`,
                  display: "grid",
                  gap: 10
                }}
              >
                <div style={{ fontWeight: 800, color: isCorrect ? "#2f7356" : "#a14e17" }}>
                  {isCorrect ? "回答正确" : `标准答案：${question.answer}`}
                </div>
                <div style={{ lineHeight: 1.8, color: "#4f4439" }}>{question.analysis}</div>
                <div style={{ color: "#7f7367" }}>常见错误：{question.commonMistake}</div>
              </div>
            ) : null}
          </article>
        );
      })}

      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ color: "#62574b", lineHeight: 1.8 }}>
          {score ? `已完成 ${score.correct} / ${score.total} 题，得分 ${score.percent}%` : "完成作答后即可查看答案和解析。"}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            style={{
              border: 0,
              borderRadius: 999,
              padding: "12px 18px",
              background: "var(--accent)",
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            提交答案
          </button>
          <button
            type="button"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
            style={{
              borderRadius: 999,
              padding: "12px 18px",
              border: "1px solid rgba(143,122,92,0.18)",
              background: "#fff",
              color: "#2f2a24",
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            重新作答
          </button>
        </div>
      </div>
    </section>
  );
}
