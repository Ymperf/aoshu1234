import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type {
  KnowledgePointLessonPackage,
  KnowledgePointLessonTimingPayload,
  KnowledgePointLessonVideoPlan,
  KnowledgePointLessonVideoPlanBeat,
  KnowledgePointLessonVideoPlanMark
} from "../../lib/knowledge-point-lesson";

export interface LogicTableRemotionProps {
  lesson: KnowledgePointLessonPackage | null;
  timing: KnowledgePointLessonTimingPayload | null;
  audioFileRelativePath: string;
}

const BLUE = "#165DFF";
const BLUE_BG = "#F4F8FF";
const RED = "#D92D20";
const RED_BG = "#FFF3F2";
const TEXT = "#333333";
const MUTED = "#666666";
const BORDER = "#D9E7FF";
const DARK = "#111827";

function getSceneBounds(lesson: KnowledgePointLessonPackage, timing: KnowledgePointLessonTimingPayload | null) {
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

function getBeatIndex(sceneFrame: number, durationInFrames: number, total: number) {
  if (total <= 1) {
    return 0;
  }

  return Math.min(
    total - 1,
    Math.floor(
      interpolate(sceneFrame, [0, Math.max(1, durationInFrames - 1)], [0, total], {
        extrapolateRight: "clamp"
      })
    )
  );
}

function mergeMarks(marks: KnowledgePointLessonVideoPlanMark[]) {
  const map = new Map<string, KnowledgePointLessonVideoPlanMark>();
  for (const mark of marks) {
    map.set(`${mark.row}::${mark.column}`, mark);
  }
  return [...map.values()];
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius: 28,
        background: "#FFFFFF",
        padding: 28,
        boxShadow: "0 10px 30px rgba(22, 93, 255, 0.08)",
        ...style
      }}
    >
      {children}
    </div>
  );
}

function MethodPill({ label, index, active }: { label: string; index: number; active?: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "48px 1fr",
        gap: 12,
        alignItems: "center",
        border: `1px solid ${active ? BLUE : BORDER}`,
        borderRadius: 999,
        background: active ? BLUE_BG : "#FFFFFF",
        padding: "12px 18px"
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: active ? BLUE : "#EAF2FF",
          color: active ? "#FFFFFF" : BLUE,
          display: "grid",
          placeItems: "center",
          fontSize: 24,
          fontWeight: 800
        }}
      >
        {index + 1}
      </div>
      <div style={{ fontSize: 26, color: TEXT, fontWeight: 700 }}>{label}</div>
    </div>
  );
}

function ConditionList({
  plan,
  activeIndex,
  revealedCount
}: {
  plan: KnowledgePointLessonVideoPlan;
  activeIndex?: number;
  revealedCount?: number;
}) {
  const conditions = plan.conditions ?? [];
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {conditions.map((condition, index) => {
        const visible = revealedCount === undefined ? true : index < revealedCount;
        return (
          <div
            key={`${condition.text}-${index}`}
            style={{
              border: `1px solid ${activeIndex === index ? BLUE : BORDER}`,
              borderRadius: 18,
              background: activeIndex === index ? BLUE_BG : "#FFFFFF",
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              alignItems: "center",
              opacity: visible ? 1 : 0.28,
              transform: visible ? "translateX(0)" : "translateX(10px)",
              transition: "opacity 200ms ease, transform 200ms ease"
            }}
          >
            <div style={{ fontSize: 24, color: TEXT, fontWeight: 700, lineHeight: 1.5 }}>{condition.text}</div>
            <div
              style={{
                fontSize: 22,
                color: condition.mark === "yes" ? RED : BLUE,
                fontWeight: 800
              }}
            >
              {condition.mark === "yes" ? "填 ✓" : "填 ×"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BeatPanel({
  title,
  description,
  stepLabel,
  accent = BLUE
}: {
  title: string;
  description: string;
  stepLabel: string;
  accent?: string;
}) {
  return (
    <Card
      style={{
        borderColor: accent === RED ? "#F5C2BD" : BORDER,
        background: accent === RED ? "#FFF9F8" : "#FFFFFF"
      }}
    >
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              background: accent === RED ? RED_BG : BLUE_BG,
              color: accent,
              fontSize: 18,
              fontWeight: 800
            }}
          >
            {stepLabel}
          </div>
          <div style={{ fontSize: 30, color: TEXT, fontWeight: 900 }}>{title}</div>
        </div>
        <div style={{ fontSize: 26, lineHeight: 1.75, color: TEXT }}>{description}</div>
      </div>
    </Card>
  );
}

function ReasoningTrail({ beats, activeIndex }: { beats: KnowledgePointLessonVideoPlanBeat[]; activeIndex: number }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {beats.map((beat, index) => {
        const active = index === activeIndex;
        const done = index < activeIndex;
        return (
          <div
            key={`${beat.title}-${index}`}
            style={{
              border: `1px solid ${active ? BLUE : BORDER}`,
              borderRadius: 18,
              background: active ? BLUE_BG : "#FFFFFF",
              padding: "14px 16px",
              display: "grid",
              gap: 8,
              opacity: done || active ? 1 : 0.42
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: active ? BLUE : done ? "#DCE9FF" : "#EEF3FB",
                  color: active ? "#FFFFFF" : BLUE,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 16,
                  fontWeight: 800
                }}
              >
                {index + 1}
              </div>
              <div style={{ fontSize: 22, color: TEXT, fontWeight: 800 }}>{beat.title}</div>
            </div>
            <div style={{ fontSize: 18, lineHeight: 1.6, color: MUTED }}>{beat.description}</div>
          </div>
        );
      })}
    </div>
  );
}

function LogicTable({
  plan,
  marks,
  sceneFrame,
  focus,
  highlightRow,
  highlightColumn
}: {
  plan: KnowledgePointLessonVideoPlan;
  marks: KnowledgePointLessonVideoPlanMark[];
  sceneFrame: number;
  focus?: { row: string; column: string };
  highlightRow?: string;
  highlightColumn?: string;
}) {
  const rows = plan.rows ?? [];
  const columns = plan.columns ?? [];
  const mergedMarks = mergeMarks(marks);
  const pulse = interpolate(Math.sin(sceneFrame / 6), [-1, 1], [0.92, 1.06]);

  const getMark = (row: string, column: string) =>
    mergedMarks.find((item) => item.row === row && item.column === column) ?? null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: `72px repeat(${rows.length}, 72px)`,
        border: `2px solid ${DARK}`,
        background: "#FFFFFF",
        overflow: "hidden"
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: `130px repeat(${columns.length}, 1fr)` }}>
        <Cell header>人物</Cell>
        {columns.map((column) => (
          <Cell key={column} header highlighted={highlightColumn === column}>
            {column}
          </Cell>
        ))}
      </div>
      {rows.map((row) => (
        <div key={row} style={{ display: "grid", gridTemplateColumns: `130px repeat(${columns.length}, 1fr)` }}>
          <Cell header highlighted={highlightRow === row}>
            {row}
          </Cell>
          {columns.map((column) => {
            const mark = getMark(row, column);
            const isFocused = focus?.row === row && focus?.column === column;
            return (
              <Cell
                key={`${row}-${column}`}
                highlighted={isFocused || highlightRow === row || highlightColumn === column}
                focused={isFocused}
              >
                {mark ? (
                  <span
                    style={{
                      color: mark.mark === "yes" ? RED : BLUE,
                      fontSize: 34,
                      fontWeight: 900,
                      transform: `scale(${isFocused ? pulse : 1})`,
                      display: "inline-block"
                    }}
                  >
                    {mark.mark === "yes" ? "✓" : "×"}
                  </span>
                ) : null}
              </Cell>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Cell({
  children,
  header,
  highlighted,
  focused
}: {
  children?: React.ReactNode;
  header?: boolean;
  highlighted?: boolean;
  focused?: boolean;
}) {
  return (
    <div
      style={{
        borderRight: `2px solid ${DARK}`,
        borderBottom: `2px solid ${DARK}`,
        display: "grid",
        placeItems: "center",
        fontSize: header ? 24 : 28,
        fontWeight: header ? 800 : 700,
        color: DARK,
        background: focused ? "#FFF7ED" : highlighted ? "#F8FBFF" : "#FFFFFF",
        boxShadow: focused ? `inset 0 0 0 3px ${BLUE}` : "none"
      }}
    >
      {children}
    </div>
  );
}

function SceneBody({
  lesson,
  sceneIndex,
  sceneFrame,
  durationInFrames
}: {
  lesson: KnowledgePointLessonPackage;
  sceneIndex: number;
  sceneFrame: number;
  durationInFrames: number;
}) {
  const plan = lesson.videoPlan;
  if (!plan) {
    return null;
  }

  const conditionBeats = plan.conditionBeats ?? [];
  const reasoningBeats = plan.reasoningBeats ?? [];

  if (sceneIndex === 0) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "0.95fr 1.05fr", gap: 28, alignItems: "center" }}>
        <Card>
          <div style={{ fontSize: 34, lineHeight: 1.7, color: TEXT }}>
            列表排除推理，就是把所有可能先放进表格，再把不符合条件的选项一个个排除，最后找到唯一答案。
          </div>
        </Card>
        <div style={{ display: "grid", gap: 16 }}>
          {(plan.methodSteps ?? []).map((step, index) => (
            <MethodPill key={step} label={step} index={index} active={index === 0} />
          ))}
        </div>
      </div>
    );
  }

  if (sceneIndex === 1) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 0.82fr", gap: 28, alignItems: "center" }}>
        <Card>
          <div style={{ fontSize: 26, color: BLUE, fontWeight: 800, marginBottom: 14 }}>例题题目</div>
          <div style={{ fontSize: 31, lineHeight: 1.75, color: TEXT, whiteSpace: "pre-wrap" }}>{plan.problem}</div>
        </Card>
        <ConditionList plan={plan} />
      </div>
    );
  }

  if (sceneIndex === 2) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "0.72fr 1.28fr", gap: 28, alignItems: "center" }}>
        <BeatPanel
          stepLabel="第一步"
          title="先画空表"
          description="横着写水果，竖着写人物。先把所有可能都摆出来，不急着猜答案。"
        />
        <Card>
          <LogicTable plan={plan} marks={[]} sceneFrame={sceneFrame} />
        </Card>
      </div>
    );
  }

  if (sceneIndex === 3) {
    const beatIndex = getBeatIndex(sceneFrame, durationInFrames, conditionBeats.length || 1);
    const activeBeat = conditionBeats[beatIndex] ?? null;
    const visibleMarks = mergeMarks(activeBeat?.marks ?? []);

    return (
      <div style={{ display: "grid", gridTemplateColumns: "0.78fr 1.22fr", gap: 28, alignItems: "center" }}>
        <div style={{ display: "grid", gap: 18 }}>
          <ConditionList
            plan={plan}
            activeIndex={activeBeat?.highlightConditionIndex}
            revealedCount={Math.min((activeBeat?.highlightConditionIndex ?? 0) + 1, (plan.conditions ?? []).length)}
          />
          {activeBeat ? (
            <BeatPanel
              stepLabel={`条件 ${beatIndex + 1}`}
              title={activeBeat.title}
              description={activeBeat.description}
            />
          ) : null}
        </div>
        <Card>
          <LogicTable
            plan={plan}
            marks={visibleMarks}
            sceneFrame={sceneFrame}
            focus={activeBeat?.focus}
            highlightRow={activeBeat?.focus?.row}
            highlightColumn={activeBeat?.focus?.column}
          />
        </Card>
      </div>
    );
  }

  if (sceneIndex === 4) {
    const beatIndex = getBeatIndex(sceneFrame, durationInFrames, reasoningBeats.length || 1);
    const activeBeat = reasoningBeats[beatIndex] ?? null;
    const visibleMarks = mergeMarks(activeBeat?.marks ?? []);

    return (
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 28, alignItems: "center" }}>
        <Card>
          <LogicTable
            plan={plan}
            marks={visibleMarks}
            sceneFrame={sceneFrame}
            focus={activeBeat?.focus}
            highlightRow={activeBeat?.focus?.row}
            highlightColumn={activeBeat?.focus?.column}
          />
        </Card>
        <div style={{ display: "grid", gap: 18 }}>
          {activeBeat ? (
            <BeatPanel
              stepLabel={`推理 ${beatIndex + 1}`}
              title={activeBeat.title}
              description={activeBeat.description}
            />
          ) : null}
          <ReasoningTrail beats={reasoningBeats} activeIndex={beatIndex} />
        </div>
      </div>
    );
  }

  if (sceneIndex === 5) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1.08fr 0.92fr", gap: 28, alignItems: "center" }}>
        <Card>
          <LogicTable plan={plan} marks={plan.finalMarks ?? []} sceneFrame={sceneFrame} />
        </Card>
        <div style={{ display: "grid", gap: 18 }}>
          <BeatPanel
            stepLabel="答案"
            title="最终结论"
            description="每一行只有一个勾，每一列也只有一个勾，所以答案已经完全确定。"
            accent={RED}
          />
          <Card>
            <div style={{ fontSize: 28, color: RED, fontWeight: 800, marginBottom: 18 }}>最终答案</div>
            <div style={{ display: "grid", gap: 16 }}>
              {(plan.answers ?? []).map((answer) => (
                <div
                  key={answer.label}
                  style={{ display: "flex", justifyContent: "space-between", fontSize: 32, color: TEXT, fontWeight: 800 }}
                >
                  <span>{answer.label}</span>
                  <span style={{ color: RED }}>{answer.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (sceneIndex === 6 || sceneIndex === 7) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "0.92fr 1.08fr", gap: 28, alignItems: "center" }}>
        <BeatPanel
          stepLabel="练习"
          title="自己试一试"
          description="先照着今天的方法画表，再把明确条件填进去，最后按行按列排除。"
        />
        <Card>
          <div style={{ fontSize: 28, color: BLUE, fontWeight: 800, marginBottom: 16 }}>练习题</div>
          <div style={{ fontSize: 30, lineHeight: 1.8, color: TEXT }}>{plan.practicePrompt}</div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "0.92fr 1.08fr", gap: 28, alignItems: "center" }}>
      <Card>
        <div style={{ fontSize: 32, color: TEXT, lineHeight: 1.8 }}>
          记住这类题目的四步法：先画表，再填条件，然后打叉排除，最后找到唯一打勾的位置。
        </div>
      </Card>
      <div style={{ display: "grid", gap: 16 }}>
        {(plan.methodSteps ?? []).map((step, index) => (
          <MethodPill key={step} label={step} index={index} active />
        ))}
      </div>
    </div>
  );
}

export const LogicTableRemotionVideo: React.FC<LogicTableRemotionProps> = ({ lesson, timing, audioFileRelativePath }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!lesson) {
    return <AbsoluteFill style={{ background: "#FFFFFF", justifyContent: "center", alignItems: "center" }}>Missing lesson props</AbsoluteFill>;
  }

  const sceneBounds = getSceneBounds(lesson, timing);

  return (
    <AbsoluteFill style={{ background: "#FFFFFF", color: TEXT, fontFamily: "\"Segoe UI\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif" }}>
      <Audio src={staticFile(audioFileRelativePath)} />
      {sceneBounds.map((bound, index) => {
        const from = Math.floor(bound.startSec * fps);
        const durationInFrames = Math.max(1, Math.ceil(bound.durationSec * fps));
        return (
          <Sequence key={bound.scene.id} from={from} durationInFrames={durationInFrames}>
            <SceneFrame
              lesson={lesson}
              sceneTitle={bound.scene.title}
              sceneIndex={index}
              totalScenes={sceneBounds.length}
              sceneFrame={frame - from}
              durationInFrames={durationInFrames}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

function SceneFrame({
  lesson,
  sceneTitle,
  sceneIndex,
  totalScenes,
  sceneFrame,
  durationInFrames
}: {
  lesson: KnowledgePointLessonPackage;
  sceneTitle: string;
  sceneIndex: number;
  totalScenes: number;
  sceneFrame: number;
  durationInFrames: number;
}) {
  const { fps } = useVideoConfig();
  const reveal = spring({ fps, frame: sceneFrame, config: { damping: 220, stiffness: 120 } });
  const opacity = interpolate(sceneFrame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(reveal, [0, 1], [0.975, 1]);

  return (
    <AbsoluteFill style={{ padding: 48, justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontSize: 20, color: BLUE, fontWeight: 800 }}>
            {lesson.meta?.gradeName ?? ""} · {lesson.meta?.moduleName ?? ""}
          </div>
          <div style={{ fontSize: 54, color: TEXT, fontWeight: 900, lineHeight: 1.05 }}>{lesson.title}</div>
          <div style={{ fontSize: 30, color: MUTED }}>{sceneTitle}</div>
        </div>
        <div
          style={{
            border: `1px solid ${BORDER}`,
            borderRadius: 999,
            color: BLUE,
            background: "#F5F9FF",
            padding: "12px 20px",
            fontSize: 24,
            fontWeight: 800
          }}
        >
          {lesson.difficultyLabel ?? "进阶"}
        </div>
      </div>

      <div style={{ opacity, transform: `scale(${scale})` }}>
        <SceneBody lesson={lesson} sceneIndex={sceneIndex} sceneFrame={sceneFrame} durationInFrames={durationInFrames} />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {Array.from({ length: totalScenes }).map((_, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              height: 10,
              borderRadius: 999,
              background: index === sceneIndex ? BLUE : "#D9E7FF"
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
}
