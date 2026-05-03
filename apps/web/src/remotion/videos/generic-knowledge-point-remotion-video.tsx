import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig
} from "remotion";
import type { KnowledgePointLessonPackage, KnowledgePointLessonScene, KnowledgePointLessonTimingPayload } from "../../lib/knowledge-point-lesson";

export interface GenericKnowledgePointRemotionProps {
  lesson: KnowledgePointLessonPackage | null;
  timing: KnowledgePointLessonTimingPayload | null;
  audioFileRelativePath: string;
}

function getSceneBounds(
  lesson: KnowledgePointLessonPackage,
  timing: KnowledgePointLessonTimingPayload | null
): Array<{ scene: KnowledgePointLessonScene; startSec: number; durationSec: number }> {
  if (timing?.scenes?.length) {
    return lesson.scenes.map((scene) => {
      const found = timing.scenes.find((item) => item.sceneId === scene.id);
      return {
        scene,
        startSec: found?.startSec ?? 0,
        durationSec: found?.durationSec ?? scene.durationSec
      };
    });
  }

  let elapsed = 0;
  return lesson.scenes.map((scene) => {
    const startSec = elapsed;
    elapsed += scene.durationSec;
    return { scene, startSec, durationSec: scene.durationSec };
  });
}

function getSceneKind(scene: KnowledgePointLessonScene, sceneIndex: number) {
  const text = `${scene.id} ${scene.title} ${scene.caption}`.toLowerCase();

  if (sceneIndex === 0 || text.includes("intro")) {
    return "intro";
  }
  if (text.includes("rule") || text.includes("核心") || text.includes("规则")) {
    return "rule";
  }
  if (text.includes("problem") || text.includes("例题")) {
    return "problem";
  }
  if (text.includes("analysis") || text.includes("单位") || text.includes("判断")) {
    return "analysis";
  }
  if (text.includes("solution") || text.includes("算出") || text.includes("一步一步")) {
    return "solution";
  }
  if (text.includes("variant") || text.includes("变式")) {
    return "variant";
  }
  return "summary";
}

function splitLines(value?: string) {
  return (value ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function lineClamp(text?: string, max = 3) {
  return splitLines(text).slice(0, max);
}

function BlackboardPanel({
  title,
  accent,
  children
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        borderRadius: 28,
        border: "2px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(16,24,39,0.96), rgba(7,12,22,0.98))",
        boxShadow: "0 22px 50px rgba(0,0,0,0.28)",
        padding: 30,
        display: "grid",
        gap: 18
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          width: "fit-content",
          padding: "10px 16px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.06)",
          color: accent,
          fontSize: 22,
          fontWeight: 800
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: accent
          }}
        />
        {title}
      </div>
      {children}
    </div>
  );
}

function ChalkText({
  children,
  color = "#F8FAFC",
  size = 28,
  weight = 500,
  lineHeight = 1.7
}: {
  children: React.ReactNode;
  color?: string;
  size?: number;
  weight?: number;
  lineHeight?: number;
}) {
  return (
    <div
      style={{
        color,
        fontSize: size,
        lineHeight,
        fontWeight: weight,
        whiteSpace: "pre-wrap",
        textShadow: "0 1px 0 rgba(255,255,255,0.05)"
      }}
    >
      {children}
    </div>
  );
}

function FormulaBoard({ lines }: { lines: string[] }) {
  return (
    <div
      style={{
        display: "grid",
        gap: 14
      }}
    >
      {lines.map((line) => (
        <div
          key={line}
          style={{
            borderRadius: 22,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.05)",
            padding: "18px 22px"
          }}
        >
          <ChalkText color="#E2E8F0" size={26} weight={600}>
            {line}
          </ChalkText>
        </div>
      ))}
    </div>
  );
}

function StepList({ items }: { items: string[] }) {
  return (
    <div
      style={{
        display: "grid",
        gap: 14
      }}
    >
      {items.map((item, index) => (
        <div
          key={item}
          style={{
            display: "grid",
            gridTemplateColumns: "54px 1fr",
            gap: 16,
            alignItems: "start",
            borderRadius: 22,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.05)",
            padding: "18px 20px"
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              background: "#FACC15",
              color: "#0F172A",
              display: "grid",
              placeItems: "center",
              fontSize: 22,
              fontWeight: 800
            }}
          >
            {index + 1}
          </div>
          <ChalkText color="#F8FAFC" size={25} weight={500}>
            {item}
          </ChalkText>
        </div>
      ))}
    </div>
  );
}

function renderSceneBody(lesson: KnowledgePointLessonPackage, scene: KnowledgePointLessonScene, sceneIndex: number) {
  const kind = getSceneKind(scene, sceneIndex);
  const knowledge = lesson.sourceSections?.knowledge;
  const example = lesson.sourceSections?.example;
  const exampleSvg = lesson.illustrations?.find((item) => item.placement === "example" && item.svgContent)?.svgContent;
  const stepItems = splitLines(example?.steps);

  if (kind === "intro") {
    return (
      <BlackboardPanel title="先知道学什么" accent="#38BDF8">
        <ChalkText size={44} weight={800}>
          {lesson.title}
        </ChalkText>
        <ChalkText color="#E2E8F0" size={28}>
          {knowledge?.definition ?? lesson.intro}
        </ChalkText>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {(lesson.keyTakeaways ?? []).slice(0, 3).map((item) => (
            <div
              key={item}
              style={{
                borderRadius: 999,
                border: "1px solid rgba(56,189,248,0.35)",
                background: "rgba(56,189,248,0.10)",
                color: "#BAE6FD",
                padding: "10px 16px",
                fontSize: 22,
                fontWeight: 700
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </BlackboardPanel>
    );
  }

  if (kind === "rule") {
    return (
      <BlackboardPanel title="老师先告诉你规律" accent="#34D399">
        <ChalkText size={30} color="#E2E8F0">
          {knowledge?.thinking ?? lesson.corePrinciples?.join("；")}
        </ChalkText>
        <FormulaBoard lines={(knowledge?.formula ? splitLines(knowledge.formula) : lesson.coreFormulas ?? []).slice(0, 3)} />
      </BlackboardPanel>
    );
  }

  if (kind === "problem") {
    return (
      <BlackboardPanel title="把题目读清楚" accent="#FBBF24">
        <ChalkText size={32} weight={700}>
          {example?.title ?? lesson.exampleContent?.problemStatement ?? lesson.problemStatement}
        </ChalkText>
      </BlackboardPanel>
    );
  }

  if (kind === "analysis") {
    return (
      <BlackboardPanel title="先判断，再列关系" accent="#F97316">
        <StepList
          items={[
            "先判断这是迎面相遇还是背后追及。",
            "再统一单位，分钟全部换成秒。",
            "最后想清楚：相邻两车之间的车距是固定不变的。"
          ]}
        />
      </BlackboardPanel>
    );
  }

  if (kind === "solution") {
    return (
      <BlackboardPanel title="例题分步讲解" accent="#A78BFA">
        <div style={{ display: "grid", gridTemplateColumns: exampleSvg ? "1.05fr 0.95fr" : "1fr", gap: 18, alignItems: "start" }}>
          <StepList items={(stepItems.length ? stepItems : lineClamp(example?.steps, 5)).slice(0, 5)} />
          {exampleSvg ? (
            <div
              style={{
                borderRadius: 24,
                background: "#FFFFFF",
                padding: 12,
                overflow: "hidden",
                minHeight: 340
              }}
              dangerouslySetInnerHTML={{ __html: exampleSvg }}
            />
          ) : null}
        </div>
      </BlackboardPanel>
    );
  }

  if (kind === "variant") {
    return (
      <BlackboardPanel title="再看一个变式" accent="#F472B6">
        <ChalkText size={30} color="#FCE7F3">
          {scene.narration.join("\n")}
        </ChalkText>
        <div
          style={{
            borderRadius: 22,
            border: "1px solid rgba(244,114,182,0.25)",
            background: "rgba(244,114,182,0.08)",
            padding: "18px 22px"
          }}
        >
          <ChalkText color="#F8FAFC" size={26} weight={700}>
            只改一处：迎面用和，追及用差。
          </ChalkText>
        </div>
      </BlackboardPanel>
    );
  }

  return (
    <BlackboardPanel title="老师最后帮你顺一遍" accent="#FACC15">
      <StepList
        items={[
          "第一步，判断迎面还是追及。",
          "第二步，找出固定不变的车距。",
          "第三步，统一单位后列式。",
          "第四步，根据题目要求反推发车间隔或车速。"
        ]}
      />
      <div
        style={{
          borderRadius: 22,
          border: "1px solid rgba(250,204,21,0.22)",
          background: "rgba(250,204,21,0.08)",
          padding: "18px 22px"
        }}
      >
        <ChalkText color="#FEF3C7" size={28} weight={700}>
          {example?.summary ?? lesson.keyTakeaways?.[0] ?? "先判断，再列式，最后检查。"}
        </ChalkText>
      </div>
    </BlackboardPanel>
  );
}

export const GenericKnowledgePointRemotionVideo: React.FC<GenericKnowledgePointRemotionProps> = ({
  lesson,
  timing,
  audioFileRelativePath
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!lesson) {
    return <AbsoluteFill style={{ background: "#FFFFFF", justifyContent: "center", alignItems: "center" }}>Missing lesson props</AbsoluteFill>;
  }

  const sceneBounds = getSceneBounds(lesson, timing);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #F6F8FB 0%, #EEF3F8 100%)",
        color: "#0F172A",
        fontFamily: "\"Microsoft YaHei\", \"PingFang SC\", \"Segoe UI\", sans-serif"
      }}
    >
      <Audio src={staticFile(audioFileRelativePath)} />
      {sceneBounds.map((bound, index) => {
        const from = Math.floor(bound.startSec * fps);
        const durationInFrames = Math.max(1, Math.ceil(bound.durationSec * fps));

        return (
          <Sequence key={bound.scene.id} from={from} durationInFrames={durationInFrames}>
            <SceneFrame
              lesson={lesson}
              scene={bound.scene}
              sceneIndex={index}
              totalScenes={sceneBounds.length}
              sceneFrame={frame - from}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

function SceneFrame({
  lesson,
  scene,
  sceneIndex,
  totalScenes,
  sceneFrame
}: {
  lesson: KnowledgePointLessonPackage;
  scene: KnowledgePointLessonScene;
  sceneIndex: number;
  totalScenes: number;
  sceneFrame: number;
}) {
  const { fps } = useVideoConfig();
  const reveal = spring({
    fps,
    frame: sceneFrame,
    config: { damping: 200, stiffness: 120 }
  });
  const opacity = interpolate(sceneFrame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(reveal, [0, 1], [0.965, 1]);
  const activeLines = scene.narration.length > 0 ? scene.narration : [scene.caption];

  return (
    <AbsoluteFill style={{ padding: 42, justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ fontSize: 18, color: "#2563EB", fontWeight: 800 }}>
            {lesson.meta?.gradeName ?? ""} · {lesson.meta?.moduleName ?? ""}
          </div>
          <div style={{ fontSize: 54, lineHeight: 1.1, fontWeight: 900, color: "#0F172A" }}>{lesson.title}</div>
          <div style={{ fontSize: 26, color: "#475569", lineHeight: 1.5 }}>{lesson.subtitle}</div>
        </div>
        {lesson.difficultyLabel ? (
          <div
            style={{
              borderRadius: 999,
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              padding: "12px 18px",
              fontSize: 22,
              fontWeight: 800,
              color: "#334155"
            }}
          >
            {lesson.difficultyLabel}
          </div>
        ) : null}
      </div>

      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: 22,
          alignItems: "stretch"
        }}
      >
        {renderSceneBody(lesson, scene, sceneIndex)}
        <div
          style={{
            borderRadius: 28,
            border: "1px solid rgba(15,23,42,0.08)",
            background: "#FFFFFF",
            boxShadow: "0 18px 36px rgba(15,23,42,0.08)",
            padding: 24,
            display: "grid",
            gap: 14
          }}
        >
          <div style={{ fontSize: 18, color: "#2563EB", fontWeight: 800 }}>老师正在讲</div>
          {activeLines.map((line, index) => (
            <div
              key={`${scene.id}-${index}`}
              style={{
                borderRadius: 18,
                background: index === 0 ? "#EFF6FF" : "#F8FAFC",
                padding: "14px 16px",
                color: "#0F172A",
                fontSize: 22,
                lineHeight: 1.7,
                fontWeight: index === 0 ? 700 : 500
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", gap: 10 }}>
          {Array.from({ length: totalScenes }).map((_, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                height: 8,
                borderRadius: 999,
                background: index === sceneIndex ? "#2563EB" : "#CBD5E1"
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 24,
            background: "#FFFFFF",
            border: "1px solid rgba(15,23,42,0.08)",
            padding: "14px 18px",
            boxShadow: "0 10px 24px rgba(15,23,42,0.05)"
          }}
        >
          <div style={{ fontSize: 22, color: "#0F172A", fontWeight: 700 }}>{scene.title}</div>
          <div style={{ fontSize: 18, color: "#64748B" }}>
            第 {sceneIndex + 1} 步 / 共 {totalScenes} 步
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
