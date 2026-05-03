"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChickenRabbitLessonPackage, ChickenRabbitScene, ChickenRabbitTimingPayload } from "@/lib/chicken-rabbit-demo";

interface ChickenRabbitDemoPlayerProps {
  lesson: ChickenRabbitLessonPackage;
  timing?: ChickenRabbitTimingPayload | null;
}

interface ActiveSceneState {
  scene: ChickenRabbitScene;
  sceneIndex: number;
  sceneStart: number;
  sceneEnd: number;
  sceneProgress: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatTime(value: number): string {
  const safeValue = Math.max(0, Math.floor(value));
  const minutes = Math.floor(safeValue / 60);
  const seconds = safeValue % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function getSceneRanges(lesson: ChickenRabbitLessonPackage, timing?: ChickenRabbitTimingPayload | null) {
  if (timing?.scenes?.length) {
    return lesson.scenes.map((scene, index) => {
      const found = timing.scenes.find((item) => item.sceneId === scene.id);
      const startSec = found?.startSec ?? 0;
      const endSec = found?.endSec ?? startSec + scene.durationSec;
      return {
        scene,
        sceneIndex: index,
        sceneStart: startSec,
        sceneEnd: endSec
      };
    });
  }

  let elapsed = 0;

  return lesson.scenes.map((scene, index) => {
    const sceneStart = elapsed;
    const sceneEnd = elapsed + scene.durationSec;
    elapsed = sceneEnd;

    return {
      scene,
      sceneIndex: index,
      sceneStart,
      sceneEnd
    };
  });
}

function getActiveSceneState(
  lesson: ChickenRabbitLessonPackage,
  currentTimeSec: number,
  timing?: ChickenRabbitTimingPayload | null
): ActiveSceneState {
  const sceneRanges = getSceneRanges(lesson, timing);

  for (const range of sceneRanges) {
    const { scene, sceneIndex, sceneStart, sceneEnd } = range;
    const duration = Math.max(0.001, sceneEnd - sceneStart);

    if (currentTimeSec <= sceneEnd || sceneIndex === sceneRanges.length - 1) {
      const sceneProgress = clamp((currentTimeSec - sceneStart) / duration, 0, 1);

      return {
        scene,
        sceneIndex,
        sceneStart,
        sceneEnd,
        sceneProgress
      };
    }
  }

  const lastScene = lesson.scenes[lesson.scenes.length - 1];
  return {
    scene: lastScene,
    sceneIndex: lesson.scenes.length - 1,
    sceneStart: lesson.targetDurationSec - lastScene.durationSec,
    sceneEnd: lesson.targetDurationSec,
    sceneProgress: 1
  };
}

function renderAnimalDots(label: string, count: number, color: string) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline" }}>
        <strong style={{ fontSize: 18 }}>{label}</strong>
        <span style={{ color, fontWeight: 800, fontSize: 24 }}>{count}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 6 }}>
        {Array.from({ length: Math.min(count, 12) }, (_, index) => (
          <div
            key={`${label}-${index}`}
            style={{
              borderRadius: 999,
              height: 14,
              background: color,
              opacity: 0.2 + (index + 1) / 15
            }}
          />
        ))}
      </div>
      {count > 12 ? <span style={{ color: "#7f7367", fontSize: 13 }}>示意显示 12 个图标，实际共 {count} 个</span> : null}
    </div>
  );
}

function stageCard(title: string, body: React.ReactNode, tone: "warm" | "mint" | "paper" = "paper") {
  const palette =
    tone === "warm"
      ? { background: "rgba(255, 241, 229, 0.98)", border: "rgba(217, 107, 39, 0.18)" }
      : tone === "mint"
        ? { background: "rgba(241, 249, 244, 0.98)", border: "rgba(64, 129, 88, 0.18)" }
        : { background: "rgba(255, 255, 255, 0.94)", border: "rgba(143, 122, 92, 0.16)" };

  return (
    <div
      style={{
        padding: 18,
        borderRadius: 20,
        background: palette.background,
        border: `1px solid ${palette.border}`,
        display: "grid",
        gap: 14
      }}
    >
      <strong style={{ fontSize: 17 }}>{title}</strong>
      {body}
    </div>
  );
}

function VisualStage({
  lesson,
  activeScene
}: {
  lesson: ChickenRabbitLessonPackage;
  activeScene: ActiveSceneState;
}) {
  const progress = activeScene.sceneProgress;
  const extraLegs = lesson.totalLegs - lesson.totalHeads * 2;
  const replacementCount = Math.max(1, Math.min(6, Math.round(progress * 6)));

  switch (activeScene.scene.sceneType) {
    case "intro_problem":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 18, alignItems: "stretch" }}>
          {stageCard(
            "题目条件",
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                <div style={{ padding: 16, borderRadius: 18, background: "#fff", border: "1px solid rgba(143,122,92,0.14)" }}>
                  <div style={{ color: "#7e6a58", marginBottom: 6 }}>总头数</div>
                  <div style={{ fontSize: 34, fontWeight: 900 }}>{lesson.totalHeads}</div>
                </div>
                <div style={{ padding: 16, borderRadius: 18, background: "#fff", border: "1px solid rgba(143,122,92,0.14)" }}>
                  <div style={{ color: "#7e6a58", marginBottom: 6 }}>总腿数</div>
                  <div style={{ fontSize: 34, fontWeight: 900 }}>{lesson.totalLegs}</div>
                </div>
              </div>
              <div style={{ padding: 14, borderRadius: 18, background: "rgba(255,255,255,0.8)", lineHeight: 1.8 }}>
                一个头只说明有一只动物，真正能分出鸡和兔的是腿数。
              </div>
            </div>,
            "warm"
          )}
          {stageCard(
            "动物特征",
            <div style={{ display: "grid", gap: 14 }}>
              {renderAnimalDots("鸡", 23, "#d96b27")}
              {renderAnimalDots("兔", 12, "#3a8a68")}
            </div>
          )}
        </div>
      );
    case "guessing_problem":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 18 }}>
          {stageCard(
            "试错很乱",
            <div style={{ display: "grid", gap: 10 }}>
              {[8, 10, 12, 14].map((guess, index) => (
                <div
                  key={guess}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 14px",
                    borderRadius: 16,
                    background: index % 2 === 0 ? "rgba(255,255,255,0.95)" : "rgba(255,246,240,0.95)",
                    border: "1px solid rgba(143,122,92,0.14)",
                    opacity: 0.55 + (index + 1) * 0.1
                  }}
                >
                  <span>猜兔 {guess} 只</span>
                  <span style={{ color: "#b24d18", fontWeight: 800 }}>还要继续试</span>
                </div>
              ))}
            </div>,
            "warm"
          )}
          {stageCard(
            "更稳的思路",
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ fontSize: 18, lineHeight: 1.8 }}>
                这类题不靠猜，靠的是
                <span style={{ color: "#d96b27", fontWeight: 800 }}> 固定步骤 </span>
                和
                <span style={{ color: "#3a8a68", fontWeight: 800 }}> 数量差 </span>。
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
                {["看条件", "先假设", "找差值"].map((item) => (
                  <div key={item} style={{ padding: 12, borderRadius: 16, background: "#fff", border: "1px solid rgba(143,122,92,0.14)", textAlign: "center", fontWeight: 700 }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>,
            "paper"
          )}
        </div>
      );
    case "compare_traits":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18 }}>
          {stageCard(
            "头数条件",
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: 14, borderRadius: 18, background: "#fff" }}>
                <span>鸡</span>
                <strong>1 个头</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: 14, borderRadius: 18, background: "#fff" }}>
                <span>兔</span>
                <strong>1 个头</strong>
              </div>
              <div style={{ color: "#7f7367", lineHeight: 1.7 }}>头数只能告诉我们总共有 35 只动物，不能直接分出鸡和兔。</div>
            </div>,
            "paper"
          )}
          {stageCard(
            "腿数差才关键",
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                <div style={{ padding: 16, borderRadius: 18, background: "rgba(255,255,255,0.98)", textAlign: "center" }}>
                  <div style={{ color: "#7e6a58" }}>鸡</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: "#d96b27" }}>2</div>
                  <div>条腿</div>
                </div>
                <div style={{ padding: 16, borderRadius: 18, background: "rgba(255,255,255,0.98)", textAlign: "center" }}>
                  <div style={{ color: "#7e6a58" }}>兔</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: "#3a8a68" }}>4</div>
                  <div>条腿</div>
                </div>
              </div>
              <div style={{ padding: 14, borderRadius: 18, background: "rgba(241,249,244,1)", border: "1px solid rgba(64,129,88,0.16)" }}>
                每换一只，腿数会多 <strong>2</strong> 条。
              </div>
            </div>,
            "mint"
          )}
        </div>
      );
    case "assume_all_chicken":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {stageCard(
            "先统一成一种动物",
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ padding: 18, borderRadius: 18, background: "#fff", textAlign: "center" }}>
                <div style={{ color: "#7e6a58" }}>假设</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: "#d96b27" }}>35 只全是鸡</div>
              </div>
              {renderAnimalDots("假设中的鸡", 35, "#d96b27")}
            </div>,
            "warm"
          )}
          {stageCard(
            "基准腿数",
            <div style={{ display: "grid", gap: 16, alignContent: "center", minHeight: 250 }}>
              <div style={{ fontSize: 22, color: "#7e6a58" }}>35 × 2</div>
              <div style={{ fontSize: 58, fontWeight: 900, color: "#d96b27" }}>{Math.round(70 * (0.5 + progress * 0.5))}</div>
              <div style={{ fontSize: 18 }}>条腿</div>
            </div>
          )}
        </div>
      );
    case "delta_legs":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 0.8fr", gap: 18 }}>
          {stageCard(
            "把两种情况摆在一起",
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: 14, borderRadius: 16, background: "#fff" }}>
                <span>假设全是鸡</span>
                <strong>70 条腿</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: 14, borderRadius: 16, background: "#fff" }}>
                <span>题目实际腿数</span>
                <strong>94 条腿</strong>
              </div>
              <div style={{ padding: 14, borderRadius: 16, background: "rgba(255,241,229,1)", border: "1px solid rgba(217,107,39,0.16)" }}>
                94 - 70 = <span style={{ fontWeight: 900, fontSize: 28, color: "#d96b27" }}>{extraLegs}</span>
              </div>
            </div>,
            "warm"
          )}
          {stageCard(
            "这 24 代表什么",
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ lineHeight: 1.8 }}>它不是兔子的只数，而是把兔暂时当成鸡以后，被少算掉的腿数总和。</div>
              <div style={{ height: 18, borderRadius: 999, background: "rgba(217,107,39,0.12)", overflow: "hidden" }}>
                <div style={{ width: `${Math.round(progress * 100)}%`, height: "100%", background: "linear-gradient(90deg, #d96b27, #ef9c63)" }} />
              </div>
            </div>
          )}
        </div>
      );
    case "replace_pattern":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {stageCard(
            "替换规律",
            <div style={{ display: "grid", gap: 12 }}>
              {Array.from({ length: 6 }, (_, index) => {
                const isRabbit = index < replacementCount;
                return (
                  <div
                    key={`replace-${index}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "80px 1fr 120px",
                      gap: 12,
                      alignItems: "center",
                      padding: 12,
                      borderRadius: 16,
                      background: "#fff"
                    }}
                  >
                    <strong>{index + 1} 次</strong>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ padding: "6px 10px", borderRadius: 999, background: isRabbit ? "rgba(58,138,104,0.16)" : "rgba(217,107,39,0.12)" }}>
                        {isRabbit ? "兔" : "鸡"}
                      </span>
                      <span style={{ color: "#7f7367" }}>{isRabbit ? "4 条腿" : "2 条腿"}</span>
                    </div>
                    <span style={{ color: isRabbit ? "#3a8a68" : "#7f7367", fontWeight: 800 }}>{isRabbit ? "+2 条" : "基准"}</span>
                  </div>
                );
              })}
            </div>,
            "mint"
          )}
          {stageCard(
            "为什么要除以 2",
            <div style={{ display: "grid", gap: 16, alignContent: "center", minHeight: 280 }}>
              <div style={{ fontSize: 26, color: "#7e6a58" }}>24 ÷ 2</div>
              <div style={{ fontSize: 54, fontWeight: 900, color: "#3a8a68" }}>{lesson.solvedRabbitCount}</div>
              <div style={{ fontSize: 18 }}>只兔</div>
              <div style={{ lineHeight: 1.8 }}>总共多了 24 条腿，每替换一只只会多 2 条腿，所以兔子一共有 12 只。</div>
            </div>
          )}
        </div>
      );
    case "solve_verify":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 18 }}>
          {stageCard(
            "答案",
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ padding: 16, borderRadius: 18, background: "#fff" }}>
                <div style={{ color: "#7e6a58", marginBottom: 6 }}>兔</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#3a8a68" }}>{lesson.solvedRabbitCount} 只</div>
              </div>
              <div style={{ padding: 16, borderRadius: 18, background: "#fff" }}>
                <div style={{ color: "#7e6a58", marginBottom: 6 }}>鸡</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#d96b27" }}>{lesson.solvedChickenCount} 只</div>
              </div>
            </div>,
            "paper"
          )}
          {stageCard(
            "验算",
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ padding: 12, borderRadius: 14, background: "#fff" }}>23 × 2 = 46</div>
              <div style={{ padding: 12, borderRadius: 14, background: "#fff" }}>12 × 4 = 48</div>
              <div style={{ padding: 12, borderRadius: 14, background: "rgba(241,249,244,1)", border: "1px solid rgba(64,129,88,0.16)" }}>
                46 + 48 = <strong>94</strong>
              </div>
            </div>,
            "mint"
          )}
        </div>
      );
    case "summary":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 18 }}>
          {stageCard(
            "四步法",
            <div style={{ display: "grid", gap: 10 }}>
              {["看头和腿", "先假设全是鸡", "求实际和假设的差", "用差值除以 2 再反推鸡数"].map((step, index) => (
                <div key={step} style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 10, padding: 12, borderRadius: 14, background: "#fff" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: index <= activeScene.sceneProgress * 4 ? "var(--accent)" : "rgba(217,107,39,0.12)", color: index <= activeScene.sceneProgress * 4 ? "#fff" : "#7f7367", display: "grid", placeItems: "center", fontWeight: 900 }}>
                    {index + 1}
                  </div>
                  <div style={{ display: "grid", alignItems: "center" }}>{step}</div>
                </div>
              ))}
            </div>,
            "warm"
          )}
          {stageCard(
            "易错点",
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ padding: 12, borderRadius: 14, background: "#fff" }}>不要把多出的 24 直接当成兔子的只数。</div>
              <div style={{ padding: 12, borderRadius: 14, background: "#fff" }}>求出兔以后，别忘了用总只数再减一次。</div>
            </div>
          )}
        </div>
      );
  }
}

export function ChickenRabbitDemoPlayer({ lesson, timing }: ChickenRabbitDemoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);

  const activeScene = useMemo(() => getActiveSceneState(lesson, currentTimeSec, timing), [lesson, currentTimeSec, timing]);
  const totalDurationSec = timing?.audioDurationSec ?? lesson.targetDurationSec;

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

        const timer = window.setInterval(() => {
      setCurrentTimeSec((previous) => {
        const next = previous + 0.2;
        if (next >= totalDurationSec) {
          window.clearInterval(timer);
          setIsPlaying(false);
          return totalDurationSec;
        }

        return next;
      });
    }, 200);

    return () => {
      window.clearInterval(timer);
    };
  }, [isPlaying, totalDurationSec]);

  const currentSceneNarration = activeScene.scene.narration;

  return (
    <section
      style={{
        borderRadius: 30,
        overflow: "hidden",
        border: "1px solid rgba(143, 122, 92, 0.14)",
        background: "#120d09",
        boxShadow: "0 28px 60px rgba(35, 23, 14, 0.26)"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "center",
          padding: "16px 20px",
          background: "linear-gradient(180deg, rgba(23,15,9,0.98), rgba(23,15,9,0.92))",
          borderBottom: "1px solid rgba(255,255,255,0.08)"
        }}
      >
        <div style={{ display: "grid", gap: 4 }}>
          <strong style={{ color: "#fff", fontSize: 17 }}>{lesson.title} Demo</strong>
          <span style={{ color: "rgba(255,255,255,0.68)", fontSize: 13 }}>{activeScene.scene.title}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff" }}>
          <button
            type="button"
            onClick={() => setIsPlaying((previous) => !previous)}
            style={{
              border: 0,
              borderRadius: 999,
              padding: "10px 16px",
              background: "#fff",
              color: "#221911",
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            {isPlaying ? "暂停" : "播放"}
          </button>
          <span style={{ minWidth: 92, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
            {formatTime(currentTimeSec)} / {formatTime(totalDurationSec)}
          </span>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          aspectRatio: "16 / 9",
          background:
            "radial-gradient(circle at top left, rgba(255,198,161,0.18), transparent 26%), radial-gradient(circle at bottom right, rgba(77,142,111,0.18), transparent 32%), linear-gradient(180deg, #201610 0%, #1a120d 100%)",
          padding: 24,
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          gap: 18
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
            <span
              style={{
                width: "fit-content",
                display: "inline-flex",
                alignItems: "center",
                padding: "8px 12px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.12)",
                color: "#f6e6d5",
                fontWeight: 700,
                fontSize: 13
              }}
            >
              口语化讲解 · 分镜同步
            </span>
            <h2 style={{ margin: 0, color: "#fff", fontSize: 34, lineHeight: 1.08 }}>{activeScene.scene.title}</h2>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.74)", lineHeight: 1.8 }}>{activeScene.scene.objective}</p>
          </div>
          <div style={{ display: "grid", gap: 10, minWidth: 230 }}>
            {[
              { label: "总头数", value: lesson.totalHeads },
              { label: "总腿数", value: lesson.totalLegs },
              { label: "目标时长", value: `${Math.round(lesson.targetDurationSec / 60)} 分钟内` }
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: 12,
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 14
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.7)" }}>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <VisualStage lesson={lesson} activeScene={activeScene} />

        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {lesson.scenes.map((scene, index) => {
              const isActive = index === activeScene.sceneIndex;
              return (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() =>
                    setCurrentTimeSec(
                      getSceneRanges(lesson, timing)[index]?.sceneStart ?? 0
                    )
                  }
                  style={{
                    flex: 1,
                    height: 8,
                    border: 0,
                    borderRadius: 999,
                    cursor: "pointer",
                    background: isActive ? "linear-gradient(90deg, #ef9c63, #3a8a68)" : "rgba(255,255,255,0.16)"
                  }}
                  aria-label={`跳转到 ${scene.title}`}
                />
              );
            })}
          </div>

          <div
            style={{
              padding: 16,
              borderRadius: 18,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
              display: "grid",
              gap: 10
            }}
          >
            <strong style={{ color: "#ffd8bb" }}>当前字幕</strong>
            <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.6 }}>{activeScene.scene.caption}</div>
            <div style={{ display: "grid", gap: 8, color: "rgba(255,255,255,0.82)", lineHeight: 1.8 }}>
              {currentSceneNarration.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
