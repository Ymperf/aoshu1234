import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig
} from "remotion";
import type { ChickenRabbitLessonPackage, ChickenRabbitScene, ChickenRabbitTimingPayload } from "../../lib/chicken-rabbit-demo";

export interface ChickenRabbitRemotionProps {
  lesson: ChickenRabbitLessonPackage | null;
  timing: ChickenRabbitTimingPayload | null;
  audioFileRelativePath: string;
}

const backgroundStyle: React.CSSProperties = {
  background:
    "radial-gradient(circle at top left, rgba(255,198,161,0.16), transparent 28%), radial-gradient(circle at bottom right, rgba(77,142,111,0.18), transparent 30%), linear-gradient(180deg, #1a120d 0%, #100b08 100%)"
};

const cardStyle: React.CSSProperties = {
  padding: 22,
  borderRadius: 22,
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(143, 122, 92, 0.18)",
  boxShadow: "0 16px 36px rgba(0,0,0,0.18)"
};

function getSceneBounds(
  lesson: ChickenRabbitLessonPackage,
  timing: ChickenRabbitTimingPayload | null
): Array<{ scene: ChickenRabbitScene; startSec: number; endSec: number; durationSec: number }> {
  if (timing?.scenes?.length) {
    return lesson.scenes.map((scene) => {
      const found = timing.scenes.find((item) => item.sceneId === scene.id);
      return {
        scene,
        startSec: found?.startSec ?? 0,
        endSec: found?.endSec ?? scene.durationSec,
        durationSec: found?.durationSec ?? scene.durationSec
      };
    });
  }

  let elapsed = 0;
  return lesson.scenes.map((scene) => {
    const startSec = elapsed;
    const endSec = elapsed + scene.durationSec;
    elapsed = endSec;
    return { scene, startSec, endSec, durationSec: scene.durationSec };
  });
}

function getSentenceForScene(sceneId: string, timing: ChickenRabbitTimingPayload | null, fallback: string[]) {
  const matches = timing?.sentences.filter((sentence) => sentence.sceneId === sceneId) ?? [];
  return matches.length ? matches.map((item) => item.text) : fallback;
}

function AnimalStrip({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <strong style={{ fontSize: 24 }}>{label}</strong>
        <span style={{ fontSize: 36, color, fontWeight: 900 }}>{count}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 10 }}>
        {Array.from({ length: Math.min(count, 12) }, (_, index) => (
          <div
            key={`${label}-${index}`}
            style={{
              height: 18,
              borderRadius: 999,
              background: color,
              opacity: 0.22 + index / 16
            }}
          />
        ))}
      </div>
      {count > 12 ? <div style={{ fontSize: 18, color: "#776a5e" }}>示意显示 12 个，实际共 {count} 个</div> : null}
    </div>
  );
}

function SceneVisual({
  scene,
  lesson,
  sceneFrame,
  durationInFrames
}: {
  scene: ChickenRabbitScene;
  lesson: ChickenRabbitLessonPackage;
  sceneFrame: number;
  durationInFrames: number;
}) {
  const { fps } = useVideoConfig();
  const reveal = spring({
    fps,
    frame: sceneFrame,
    config: { damping: 200, stiffness: 120 }
  });
  const fadeIn = interpolate(sceneFrame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(reveal, [0, 1], [0.94, 1], { easing: Easing.out(Easing.ease) });
  const extraLegs = lesson.totalLegs - lesson.totalHeads * 2;
  const replacementCount = Math.max(1, Math.min(8, Math.floor((sceneFrame / Math.max(1, durationInFrames)) * 8) + 1));

  const wrapper: React.CSSProperties = {
    ...cardStyle,
    opacity: fadeIn,
    transform: `scale(${scale})`,
    display: "grid",
    gap: 18
  };

  switch (scene.sceneType) {
    case "intro_problem":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20, width: "100%" }}>
          <div style={wrapper}>
            <strong style={{ fontSize: 28 }}>题目条件</strong>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
              <div style={{ padding: 18, borderRadius: 20, background: "#fff4ec" }}>
                <div style={{ color: "#7b6a58", marginBottom: 8 }}>总头数</div>
                <div style={{ fontSize: 58, fontWeight: 900, color: "#d96b27" }}>{lesson.totalHeads}</div>
              </div>
              <div style={{ padding: 18, borderRadius: 20, background: "#eef8f1" }}>
                <div style={{ color: "#7b6a58", marginBottom: 8 }}>总腿数</div>
                <div style={{ fontSize: 58, fontWeight: 900, color: "#3a8a68" }}>{lesson.totalLegs}</div>
              </div>
            </div>
          </div>
          <div style={wrapper}>
            <strong style={{ fontSize: 28 }}>动物差异</strong>
            <AnimalStrip label="鸡" count={lesson.solvedChickenCount} color="#d96b27" />
            <AnimalStrip label="兔" count={lesson.solvedRabbitCount} color="#3a8a68" />
          </div>
        </div>
      );
    case "guessing_problem":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 20, width: "100%" }}>
          <div style={wrapper}>
            <strong style={{ fontSize: 28 }}>试错太慢</strong>
            {[8, 10, 12, 14].map((guess, index) => (
              <div
                key={guess}
                style={{
                  padding: "14px 16px",
                  borderRadius: 18,
                  background: index % 2 === 0 ? "#fff" : "#fff6ef",
                  border: "1px solid rgba(143,122,92,0.14)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span style={{ fontSize: 24 }}>猜兔 {guess} 只</span>
                <strong style={{ color: "#b1541f" }}>还得继续试</strong>
              </div>
            ))}
          </div>
          <div style={wrapper}>
            <strong style={{ fontSize: 28 }}>更稳的思路</strong>
            <div style={{ fontSize: 30, lineHeight: 1.8 }}>
              看条件 <span style={{ color: "#d96b27", fontWeight: 900 }}>→</span> 先假设 <span style={{ color: "#d96b27", fontWeight: 900 }}>→</span> 找差值
            </div>
            <div style={{ fontSize: 22, lineHeight: 1.8, color: "#5f5348" }}>鸡兔同笼不是靠猜，而是靠固定步骤和数量差。</div>
          </div>
        </div>
      );
    case "compare_traits":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 20, width: "100%" }}>
          <div style={wrapper}>
            <strong style={{ fontSize: 28 }}>头数条件</strong>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ padding: 16, borderRadius: 18, background: "#fff", display: "flex", justifyContent: "space-between" }}>
                <span>鸡</span>
                <strong>1 个头</strong>
              </div>
              <div style={{ padding: 16, borderRadius: 18, background: "#fff", display: "flex", justifyContent: "space-between" }}>
                <span>兔</span>
                <strong>1 个头</strong>
              </div>
            </div>
          </div>
          <div style={wrapper}>
            <strong style={{ fontSize: 28 }}>腿数差才关键</strong>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
              <div style={{ padding: 20, borderRadius: 20, background: "#fff4ec", textAlign: "center" }}>
                <div style={{ marginBottom: 10 }}>鸡</div>
                <div style={{ fontSize: 60, color: "#d96b27", fontWeight: 900 }}>2</div>
                <div>条腿</div>
              </div>
              <div style={{ padding: 20, borderRadius: 20, background: "#eef8f1", textAlign: "center" }}>
                <div style={{ marginBottom: 10 }}>兔</div>
                <div style={{ fontSize: 60, color: "#3a8a68", fontWeight: 900 }}>4</div>
                <div>条腿</div>
              </div>
            </div>
          </div>
        </div>
      );
    case "assume_all_chicken": {
      const countedLegs = Math.round(interpolate(sceneFrame, [0, durationInFrames], [0, 70], { extrapolateRight: "clamp" }));
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, width: "100%" }}>
          <div style={wrapper}>
            <strong style={{ fontSize: 28 }}>先统一成鸡</strong>
            <div style={{ padding: 18, borderRadius: 18, background: "#fff4ec", fontSize: 38, fontWeight: 900, color: "#d96b27", textAlign: "center" }}>
              35 只全都是鸡
            </div>
            <AnimalStrip label="假设中的鸡" count={lesson.totalHeads} color="#d96b27" />
          </div>
          <div style={wrapper}>
            <strong style={{ fontSize: 28 }}>基准腿数</strong>
            <div style={{ fontSize: 42, color: "#7b6a58" }}>35 × 2</div>
            <div style={{ fontSize: 84, fontWeight: 900, color: "#d96b27" }}>{countedLegs}</div>
            <div style={{ fontSize: 24 }}>条腿</div>
          </div>
        </div>
      );
    }
    case "delta_legs":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 0.9fr", gap: 20, width: "100%" }}>
          <div style={wrapper}>
            <strong style={{ fontSize: 28 }}>比较两种腿数</strong>
            <div style={{ padding: 14, borderRadius: 16, background: "#fff", display: "flex", justifyContent: "space-between" }}>
              <span>假设全是鸡</span>
              <strong>70</strong>
            </div>
            <div style={{ padding: 14, borderRadius: 16, background: "#fff", display: "flex", justifyContent: "space-between" }}>
              <span>实际腿数</span>
              <strong>94</strong>
            </div>
            <div style={{ padding: 16, borderRadius: 18, background: "#fff4ec", fontSize: 30 }}>
              94 - 70 = <span style={{ color: "#d96b27", fontWeight: 900, fontSize: 52 }}>{extraLegs}</span>
            </div>
          </div>
          <div style={wrapper}>
            <strong style={{ fontSize: 28 }}>这 24 代表什么</strong>
            <div style={{ fontSize: 24, lineHeight: 1.8 }}>它不是兔子的只数，而是把兔暂时当成鸡以后，被少算掉的腿数总和。</div>
          </div>
        </div>
      );
    case "replace_pattern":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20, width: "100%" }}>
          <div style={wrapper}>
            <strong style={{ fontSize: 28 }}>替换规律</strong>
            {Array.from({ length: 8 }, (_, index) => {
              const active = index < replacementCount;
              return (
                <div
                  key={`replace-${index}`}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 16,
                    background: "#fff",
                    display: "grid",
                    gridTemplateColumns: "80px 1fr 120px",
                    gap: 14,
                    alignItems: "center"
                  }}
                >
                  <strong>{index + 1} 次</strong>
                  <span>{active ? "鸡 → 兔" : "保持鸡"}</span>
                  <span style={{ color: active ? "#3a8a68" : "#7b6a58", fontWeight: 900 }}>{active ? "+2 条腿" : "基准"}</span>
                </div>
              );
            })}
          </div>
          <div style={wrapper}>
            <strong style={{ fontSize: 28 }}>为什么除以 2</strong>
            <div style={{ fontSize: 42, color: "#7b6a58" }}>24 ÷ 2</div>
            <div style={{ fontSize: 86, color: "#3a8a68", fontWeight: 900 }}>{lesson.solvedRabbitCount}</div>
            <div style={{ fontSize: 24 }}>只兔</div>
          </div>
        </div>
      );
    case "solve_verify":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 20, width: "100%" }}>
          <div style={wrapper}>
            <strong style={{ fontSize: 28 }}>答案</strong>
            <div style={{ padding: 18, borderRadius: 18, background: "#eef8f1" }}>
              <div style={{ color: "#6b7a71" }}>兔</div>
              <div style={{ fontSize: 56, fontWeight: 900, color: "#3a8a68" }}>{lesson.solvedRabbitCount} 只</div>
            </div>
            <div style={{ padding: 18, borderRadius: 18, background: "#fff4ec" }}>
              <div style={{ color: "#6b7a71" }}>鸡</div>
              <div style={{ fontSize: 56, fontWeight: 900, color: "#d96b27" }}>{lesson.solvedChickenCount} 只</div>
            </div>
          </div>
          <div style={wrapper}>
            <strong style={{ fontSize: 28 }}>验算</strong>
            <div style={{ padding: 14, borderRadius: 16, background: "#fff" }}>23 × 2 = 46</div>
            <div style={{ padding: 14, borderRadius: 16, background: "#fff" }}>12 × 4 = 48</div>
            <div style={{ padding: 16, borderRadius: 18, background: "#eef8f1", fontSize: 30 }}>46 + 48 = <strong>94</strong></div>
          </div>
        </div>
      );
    case "summary":
    default:
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20, width: "100%" }}>
          <div style={wrapper}>
            <strong style={{ fontSize: 28 }}>四步法</strong>
            {["看头和腿", "先假设全是鸡", "求差值", "差值除以 2 再反推"].map((step, index) => (
              <div key={step} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 14, alignItems: "center", padding: 12, borderRadius: 16, background: "#fff" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    background: index <= interpolate(sceneFrame, [0, durationInFrames], [0, 4], { extrapolateRight: "clamp" }) ? "#d96b27" : "#f0d6c4",
                    color: index <= interpolate(sceneFrame, [0, durationInFrames], [0, 4], { extrapolateRight: "clamp" }) ? "#fff" : "#7b6a58",
                    fontWeight: 900
                  }}
                >
                  {index + 1}
                </div>
                <div style={{ fontSize: 22 }}>{step}</div>
              </div>
            ))}
          </div>
          <div style={wrapper}>
            <strong style={{ fontSize: 28 }}>易错点</strong>
            <div style={{ padding: 14, borderRadius: 16, background: "#fff" }}>多出来的 24 不是兔子的只数。</div>
            <div style={{ padding: 14, borderRadius: 16, background: "#fff" }}>求出兔以后，还要再用总只数减一次。</div>
          </div>
        </div>
      );
  }
}

export const ChickenRabbitRemotionVideo: React.FC<ChickenRabbitRemotionProps> = ({
  lesson,
  timing,
  audioFileRelativePath
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!lesson) {
    return <AbsoluteFill style={{ ...backgroundStyle, justifyContent: "center", alignItems: "center", color: "#fff" }}>Missing lesson props</AbsoluteFill>;
  }

  const sceneBounds = getSceneBounds(lesson, timing);

  return (
    <AbsoluteFill style={{ ...backgroundStyle, fontFamily: "\"Segoe UI\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif" }}>
      <Audio src={staticFile(audioFileRelativePath)} />
      {sceneBounds.map((bound, index) => {
        const from = Math.floor(bound.startSec * fps);
        const durationInFrames = Math.max(1, Math.ceil(bound.durationSec * fps));
        const sceneLines = getSentenceForScene(bound.scene.id, timing, bound.scene.narration);

        return (
          <Sequence key={bound.scene.id} from={from} durationInFrames={durationInFrames}>
            <AbsoluteFill style={{ padding: 34, justifyContent: "space-between" }}>
              <div style={{ display: "grid", gap: 12, maxWidth: 760 }}>
                <div style={{ fontSize: 52, color: "#fff", fontWeight: 900, lineHeight: 1.04 }}>{bound.scene.title}</div>
                <div style={{ fontSize: 26, color: "rgba(255,255,255,0.78)", lineHeight: 1.8 }}>{bound.scene.objective}</div>
              </div>

              <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
                <SceneVisual scene={bound.scene} lesson={lesson} sceneFrame={frame - from} durationInFrames={durationInFrames} />
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  {sceneBounds.map((item, itemIndex) => (
                    <div
                      key={item.scene.id}
                      style={{
                        flex: 1,
                        height: 10,
                        borderRadius: 999,
                        background: itemIndex === index ? "linear-gradient(90deg, #ef9c63, #3a8a68)" : "rgba(255,255,255,0.12)"
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    padding: "18px 20px",
                    borderRadius: 22,
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "grid",
                    gap: 10
                  }}
                >
                  <div style={{ fontSize: 22, color: "#ffd7ba", fontWeight: 800 }}>{bound.scene.caption}</div>
                  <div style={{ display: "grid", gap: 8, fontSize: 24, lineHeight: 1.75, color: "rgba(255,255,255,0.9)" }}>
                    {sceneLines.map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                  </div>
                </div>
              </div>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
