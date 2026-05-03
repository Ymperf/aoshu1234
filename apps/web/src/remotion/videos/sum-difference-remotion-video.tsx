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
import type {
  KnowledgePointLessonPackage,
  KnowledgePointLessonScene,
  KnowledgePointLessonTimingPayload
} from "../../lib/knowledge-point-lesson";

export interface SumDifferenceRemotionProps {
  lesson: KnowledgePointLessonPackage | null;
  timing: KnowledgePointLessonTimingPayload | null;
  audioFileRelativePath: string;
}

const backgroundStyle: React.CSSProperties = {
  background:
    "radial-gradient(circle at top left, rgba(255,214,173,0.16), transparent 30%), radial-gradient(circle at bottom right, rgba(92,132,255,0.16), transparent 32%), linear-gradient(180deg, #161215 0%, #110d10 100%)"
};

const cardStyle: React.CSSProperties = {
  padding: 22,
  borderRadius: 22,
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(143,122,92,0.18)",
  boxShadow: "0 16px 36px rgba(0,0,0,0.18)"
};

function getSceneBounds(
  lesson: KnowledgePointLessonPackage,
  timing: KnowledgePointLessonTimingPayload | null
): Array<{ scene: KnowledgePointLessonScene; startSec: number; endSec: number; durationSec: number }> {
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

function getSentenceForScene(sceneId: string, timing: KnowledgePointLessonTimingPayload | null, fallback: string[]) {
  const matches = timing?.sentences.filter((sentence) => sentence.sceneId === sceneId) ?? [];
  return matches.length ? matches.map((item) => item.text) : fallback;
}

function FormulaCard({
  title,
  formula,
  note,
  color
}: {
  title: string;
  formula: string;
  note: string;
  color: string;
}) {
  return (
    <div
      style={{
        ...cardStyle,
        display: "grid",
        gap: 12,
        minHeight: 220
      }}
    >
      <strong style={{ fontSize: 24 }}>{title}</strong>
      <div style={{ fontSize: 48, fontWeight: 900, color }}>{formula}</div>
      <div style={{ lineHeight: 1.8, color: "#5f5348" }}>{note}</div>
    </div>
  );
}

function SceneVisual({
  scene,
  sceneIndex,
  sceneFrame,
  durationInFrames
}: {
  scene: KnowledgePointLessonScene;
  sceneIndex: number;
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

  const wrapper: React.CSSProperties = {
    opacity: fadeIn,
    transform: `scale(${scale})`,
    width: "100%"
  };

  switch (sceneIndex) {
    case 0:
      return (
        <div style={{ ...wrapper, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <FormulaCard title="先找和" formula="和" note="总和表示把两个数合在一起后的结果。" color="#d96b27" />
          <FormulaCard title="再找差" formula="差" note="差表示大数比小数多出来的部分。" color="#3a8a68" />
        </div>
      );
    case 1:
      return (
        <div style={{ ...wrapper, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <FormulaCard title="大数" formula="较大" note="大数比小数多出一个差。" color="#d96b27" />
          <FormulaCard title="小数" formula="较小" note="小数是比较的基准，少掉那一段差。" color="#3a8a68" />
        </div>
      );
    case 2:
      return (
        <div style={{ ...wrapper, display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 20 }}>
          <FormulaCard
            title="为什么和加差"
            formula="和 + 差"
            note="把差补到小数身上，就把小数补成和大数一样大，所以得到两个大数。"
            color="#d96b27"
          />
          <FormulaCard title="结果" formula="2 × 大数" note="这一步得到的不是一个大数，而是两个大数。" color="#8b5cf6" />
        </div>
      );
    case 3:
      return (
        <div style={{ ...wrapper, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <FormulaCard title="大数公式" formula="(和 + 差) ÷ 2" note="先加差，再除以 2，才能得到一个大数。" color="#d96b27" />
          <FormulaCard title="提醒" formula="别忘 ÷ 2" note="因为前一步得到的是两个大数，所以必须再除以 2。" color="#3a8a68" />
        </div>
      );
    case 4:
      return (
        <div style={{ ...wrapper, display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 20 }}>
          <FormulaCard
            title="为什么和减差"
            formula="和 - 差"
            note="把大数多出来的那一段去掉，就把大数变成和小数一样大，所以得到两个小数。"
            color="#3a8a68"
          />
          <FormulaCard title="结果" formula="2 × 小数" note="这一步得到的是两个小数。" color="#0f766e" />
        </div>
      );
    case 5:
      return (
        <div style={{ ...wrapper, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <FormulaCard title="小数公式" formula="(和 - 差) ÷ 2" note="先减差，再除以 2，才能得到一个小数。" color="#3a8a68" />
          <FormulaCard title="提醒" formula="同样要 ÷ 2" note="因为前一步得到的是两个小数，所以还是要再除以 2。" color="#d96b27" />
        </div>
      );
    case 6:
      return (
        <div style={{ ...wrapper, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <FormulaCard title="验算 1" formula="大数 + 小数 = 和" note="先检查加起来是不是原来的和。" color="#d96b27" />
          <FormulaCard title="验算 2" formula="大数 - 小数 = 差" note="再检查相差是不是原来的差。" color="#3a8a68" />
        </div>
      );
    default:
      return (
        <div style={{ ...wrapper, display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
          <FormulaCard
            title="和差问题总结"
            formula="和加差求大数\n和减差求小数"
            note="关键不是死记公式，而是理解为什么加差和减差以后都要再除以 2。"
            color="#d96b27"
          />
        </div>
      );
  }
}

export const SumDifferenceRemotionVideo: React.FC<SumDifferenceRemotionProps> = ({
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
                <SceneVisual scene={bound.scene} sceneIndex={index} sceneFrame={frame - from} durationInFrames={durationInFrames} />
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
