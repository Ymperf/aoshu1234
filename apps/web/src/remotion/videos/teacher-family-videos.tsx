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

export type TeacherBlackboardSceneType =
  | "hook"
  | "concept"
  | "model"
  | "formula_explain"
  | "problem"
  | "analysis"
  | "solution"
  | "worked_example"
  | "variant"
  | "variant_compare"
  | "summary";

export type TeacherBlackboardVisualMode =
  | "contrast"
  | "diagram"
  | "equation"
  | "focus"
  | "steps"
  | "worked_example"
  | "compare"
  | "checklist";

export interface TeacherBlackboardScene {
  id: string;
  type: TeacherBlackboardSceneType;
  title: string;
  boardTitle: string;
  narration: string[];
  durationSec: number;
  visualMode?: TeacherBlackboardVisualMode;
  keyPoints?: string[];
  equations?: string[];
  formulaLines?: string[];
  meaningNotes?: string[];
  stepLines?: string[];
  solveSteps?: string[];
  methodChecklist?: string[];
  mistakeChecklist?: string[];
  compareRows?: Array<{ left: string; right: string }>;
  problemText?: string;
  givenItems?: string[];
  highlightPoints?: string[];
  wrongClaim?: string;
  correctClaim?: string;
  invariantLabel?: string;
  relationshipMap?: string[];
  checkLine?: string;
  switchPoint?: string;
  supportingNote?: string;
  requiredElements?: string[];
  boardActions?: string[];
  qaFocus?: string[];
}

export interface TeacherBlackboardLesson {
  knowledgePointId: number;
  title: string;
  subtitle?: string;
  teacherName?: string;
  targetDurationSec?: number;
  themeColor?: string;
  templateFamily?: string;
  scenes: TeacherBlackboardScene[];
}

export interface TeacherBlackboardTimingPayload {
  audioDurationSec: number;
  scenes?: Array<{
    sceneId: string;
    startSec: number;
    endSec: number;
    durationSec: number;
  }>;
}

export interface TeacherBlackboardRemotionProps {
  lesson: TeacherBlackboardLesson | null;
  timing: TeacherBlackboardTimingPayload | null;
  audioFileRelativePath: string;
}

type TeacherFamilyId =
  | "travel_blackboard_v2"
  | "relation_word_problem_v1"
  | "calculation_blackboard_v1"
  | "pattern_sequence_v1"
  | "geometry_measure_v1"
  | "geometry_construction_v1"
  | "number_theory_v1"
  | "logic_counting_v1";

const BOARD_GREEN_DARK = "#153127";
const BOARD_GREEN_LIGHT = "#1A3A30";
const CHALK_WHITE = "#F3F1E7";
const CHALK_BLUE = "#8FB7FF";
const CHALK_YELLOW = "#EFD67A";
const CHALK_GREEN = "#98D8A8";
const CHALK_RED = "#E8A0A0";
const CHALK_PINK = "#F0B2C8";

interface FamilyPalette {
  title: string;
  accentA: string;
  accentB: string;
  accentC: string;
}

const FAMILY_PALETTES: Record<TeacherFamilyId, FamilyPalette> = {
  travel_blackboard_v2: { title: CHALK_BLUE, accentA: CHALK_YELLOW, accentB: CHALK_GREEN, accentC: CHALK_RED },
  relation_word_problem_v1: { title: CHALK_PINK, accentA: CHALK_BLUE, accentB: CHALK_YELLOW, accentC: CHALK_GREEN },
  calculation_blackboard_v1: { title: CHALK_YELLOW, accentA: CHALK_BLUE, accentB: CHALK_GREEN, accentC: CHALK_RED },
  pattern_sequence_v1: { title: CHALK_BLUE, accentA: CHALK_PINK, accentB: CHALK_YELLOW, accentC: CHALK_GREEN },
  geometry_measure_v1: { title: CHALK_PINK, accentA: CHALK_BLUE, accentB: CHALK_YELLOW, accentC: CHALK_GREEN },
  geometry_construction_v1: { title: CHALK_GREEN, accentA: CHALK_BLUE, accentB: CHALK_YELLOW, accentC: CHALK_RED },
  number_theory_v1: { title: CHALK_YELLOW, accentA: CHALK_GREEN, accentB: CHALK_BLUE, accentC: CHALK_RED },
  logic_counting_v1: { title: CHALK_PINK, accentA: CHALK_GREEN, accentB: CHALK_BLUE, accentC: CHALK_YELLOW }
};

function getSceneBounds(
  lesson: TeacherBlackboardLesson,
  timing: TeacherBlackboardTimingPayload | null
): Array<{ scene: TeacherBlackboardScene; startSec: number; durationSec: number }> {
  if (timing?.scenes?.length) {
    return lesson.scenes.map((scene) => {
      const found = timing.scenes?.find((item) => item.sceneId === scene.id);
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

function ChalkReveal({
  delay,
  sceneFrame,
  children,
  fromY = 10,
  clip = true
}: {
  delay: number;
  sceneFrame: number;
  children: React.ReactNode;
  fromY?: number;
  clip?: boolean;
}) {
  const { fps } = useVideoConfig();
  const progress = spring({
    fps,
    frame: Math.max(0, sceneFrame - delay),
    config: { damping: 200, stiffness: 110 }
  });

  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [fromY, 0])}px)`,
        clipPath: clip ? `inset(0 ${interpolate(progress, [0, 1], [100, 0])}% 0 0)` : undefined
      }}
    >
      {children}
    </div>
  );
}

function ChalkText({
  children,
  size = 28,
  color = CHALK_WHITE,
  weight = 700,
  align = "left"
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: number;
  align?: "left" | "center" | "right";
}) {
  return (
    <div
      style={{
        color,
        fontSize: size,
        fontWeight: weight,
        textAlign: align,
        whiteSpace: "pre-wrap",
        lineHeight: 1.6,
        textShadow: "0 0 1px rgba(255,255,255,0.2), 0 0 6px rgba(255,255,255,0.03)",
        fontFamily: '"Kaiti SC", "STKaiti", "KaiTi", "FangSong", "Microsoft YaHei", sans-serif',
        letterSpacing: "0.01em"
      }}
    >
      {children}
    </div>
  );
}

function ChalkRule({
  width,
  color,
  rotate = 0
}: {
  width: number | string;
  color: string;
  rotate?: number;
}) {
  return (
    <div
      style={{
        width,
        height: 4,
        borderRadius: 999,
        background: color,
        transform: `rotate(${rotate}deg)`,
        boxShadow: `0 0 8px ${color}22`
      }}
    />
  );
}

function HighlightChip({
  text,
  color
}: {
  text: string;
  color: string;
}) {
  return (
    <div style={{ position: "relative", padding: "4px 6px 6px", display: "inline-flex", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          inset: "auto 0 2px 0",
          height: 16,
          background: `${color}2A`,
          transform: "rotate(-1deg)",
          borderRadius: 6
        }}
      />
      <div style={{ position: "relative" }}>
        <ChalkText size={23} color={color} weight={800}>
          {text}
        </ChalkText>
      </div>
    </div>
  );
}

function AnswerBox({
  text,
  color = CHALK_GREEN
}: {
  text?: string;
  color?: string;
}) {
  if (!text?.trim()) {
    return null;
  }

  return (
    <div
      style={{
        position: "relative",
        borderRadius: 20,
        border: `4px solid ${color}`,
        padding: "18px 18px 16px",
        minHeight: 112,
        background: `${color}30`,
        boxShadow: `0 0 0 2px ${color}12 inset, 0 10px 20px rgba(0,0,0,0.12)`
      }}
    >
      <div
        style={{
          position: "absolute",
          right: 14,
          top: 12,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: `${color}CC`,
          boxShadow: `0 0 10px ${color}55`
        }}
      />
      <ChalkText size={24} color={color} weight={800}>
        答案 / 检查
      </ChalkText>
      <ChalkText size={23}>{text}</ChalkText>
    </div>
  );
}

function BlackboardShell({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 15% 10%, rgba(255,255,255,0.04), transparent 25%), #0E211A", padding: 32 }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 24,
          padding: 16,
          background: "linear-gradient(180deg, #6B4A2D 0%, #53361F 100%)",
          boxShadow: "0 18px 48px rgba(0,0,0,0.36)"
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: 18,
            overflow: "hidden",
            background: `linear-gradient(180deg, ${BOARD_GREEN_LIGHT} 0%, ${BOARD_GREEN_DARK} 100%)`,
            border: "1px solid rgba(255,255,255,0.05)"
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.06,
              backgroundImage:
                "repeating-linear-gradient(180deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 42px), repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 56px)"
            }}
          />
          <div style={{ position: "absolute", right: 34, bottom: 22, width: 210, height: 18, borderRadius: 999, background: "rgba(67,45,25,0.8)" }} />
          <div style={{ position: "absolute", right: 160, bottom: 26, width: 44, height: 10, borderRadius: 999, background: CHALK_WHITE }} />
          <div style={{ position: "absolute", right: 108, bottom: 25, width: 36, height: 12, borderRadius: 999, background: CHALK_YELLOW }} />
          <div style={{ position: "absolute", right: 54, bottom: 23, width: 34, height: 14, borderRadius: 4, background: "rgba(224,228,226,0.85)" }} />
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function BoardHeading({
  title,
  sceneFrame,
  accent
}: {
  title: string;
  sceneFrame: number;
  accent: string;
}) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <ChalkReveal delay={2} sceneFrame={sceneFrame} clip={false} fromY={6}>
        <ChalkText size={46} color={accent} weight={800}>
          {title}
        </ChalkText>
      </ChalkReveal>
      <ChalkReveal delay={12} sceneFrame={sceneFrame} clip={false}>
        <ChalkRule width={260} color={accent} rotate={-0.4} />
      </ChalkReveal>
    </div>
  );
}

function TravelDiagram({ scene, palette }: { scene: TeacherBlackboardScene; palette: FamilyPalette }) {
  return (
    <svg width="100%" height="300" viewBox="0 0 980 300">
      <line x1="92" y1="188" x2="888" y2="188" stroke={CHALK_WHITE} strokeWidth="5" strokeLinecap="round" />
      <polygon points="92,188 114,176 114,200" fill={CHALK_WHITE} />
      <polygon points="888,188 866,176 866,200" fill={CHALK_WHITE} />
      <rect x="118" y="128" width="148" height="60" rx="18" fill="none" stroke={CHALK_BLUE} strokeWidth="4" />
      <text x="192" y="166" textAnchor="middle" fontSize="34" fill={CHALK_BLUE} fontFamily="KaiTi, Microsoft YaHei">车 A</text>
      <rect x="714" y="128" width="148" height="60" rx="18" fill="none" stroke={CHALK_BLUE} strokeWidth="4" />
      <text x="788" y="166" textAnchor="middle" fontSize="34" fill={CHALK_BLUE} fontFamily="KaiTi, Microsoft YaHei">车 B</text>
      <circle cx="490" cy="182" r="28" fill="none" stroke={CHALK_YELLOW} strokeWidth="4" />
      <text x="490" y="238" textAnchor="middle" fontSize="30" fill={CHALK_YELLOW} fontFamily="KaiTi, Microsoft YaHei">人</text>
      <line x1="276" y1="72" x2="704" y2="72" stroke={CHALK_RED} strokeWidth="4" />
      <polygon points="276,72 294,64 294,80" fill={CHALK_RED} />
      <polygon points="704,72 686,64 686,80" fill={CHALK_RED} />
      <text x="490" y="48" textAnchor="middle" fontSize="35" fill={CHALK_RED} fontFamily="KaiTi, Microsoft YaHei">
        {scene.invariantLabel ?? "固定车距"}
      </text>
      <line x1="420" y1="182" x2="358" y2="182" stroke={CHALK_YELLOW} strokeWidth="4" />
      <polygon points="358,182 372,174 372,190" fill={CHALK_YELLOW} />
      <line x1="714" y1="120" x2="654" y2="120" stroke={palette.title} strokeWidth="4" />
      <polygon points="654,120 668,112 668,128" fill={palette.title} />
    </svg>
  );
}

function RelationDiagram({ palette }: { palette: FamilyPalette }) {
  return (
    <svg width="100%" height="280" viewBox="0 0 980 280">
      <rect x="120" y="88" width="520" height="34" rx="17" fill="none" stroke={palette.accentA} strokeWidth="4" />
      <rect x="120" y="148" width="360" height="34" rx="17" fill="none" stroke={palette.accentB} strokeWidth="4" />
      <text x="90" y="110" textAnchor="end" fontSize="28" fill={CHALK_WHITE} fontFamily="KaiTi, Microsoft YaHei">总量</text>
      <text x="90" y="170" textAnchor="end" fontSize="28" fill={CHALK_WHITE} fontFamily="KaiTi, Microsoft YaHei">部分量</text>
      <line x1="510" y1="165" x2="640" y2="165" stroke={palette.accentC} strokeWidth="4" />
      <polygon points="640,165 625,157 625,173" fill={palette.accentC} />
      <text x="748" y="173" textAnchor="middle" fontSize="30" fill={palette.accentC} fontFamily="KaiTi, Microsoft YaHei">先看关系</text>
    </svg>
  );
}

function CalculationDiagram({ palette }: { palette: FamilyPalette }) {
  return (
    <svg width="100%" height="260" viewBox="0 0 980 260">
      <text x="120" y="90" fontSize="40" fill={CHALK_WHITE} fontFamily="KaiTi, Microsoft YaHei">看结构 → 选技巧 → 连续推导</text>
      <text x="120" y="148" fontSize="34" fill={palette.accentA} fontFamily="KaiTi, Microsoft YaHei">重复部分</text>
      <text x="360" y="148" fontSize="34" fill={palette.accentB} fontFamily="KaiTi, Microsoft YaHei">整十整百</text>
      <text x="610" y="148" fontSize="34" fill={palette.accentC} fontFamily="KaiTi, Microsoft YaHei">连续等差</text>
      <line x1="120" y1="166" x2="250" y2="166" stroke={palette.accentA} strokeWidth="4" />
      <line x1="360" y1="166" x2="490" y2="166" stroke={palette.accentB} strokeWidth="4" />
      <line x1="610" y1="166" x2="770" y2="166" stroke={palette.accentC} strokeWidth="4" />
      <text x="120" y="220" fontSize="30" fill={CHALK_WHITE} fontFamily="KaiTi, Microsoft YaHei">先找能变形的地方，不要上来就硬算。</text>
    </svg>
  );
}

function PatternDiagram({ palette }: { palette: FamilyPalette }) {
  const boxes = Array.from({ length: 8 }).map((_, index) => ({
    x: 120 + index * 88,
    color: index % 3 === 0 ? palette.accentA : index % 3 === 1 ? palette.accentB : palette.accentC
  }));

  return (
    <svg width="100%" height="260" viewBox="0 0 980 260">
      {boxes.map((box, index) => (
        <g key={index}>
          <rect x={box.x} y="88" width="64" height="64" rx="14" fill="none" stroke={box.color} strokeWidth="4" />
          <text x={box.x + 32} y="130" textAnchor="middle" fontSize="28" fill={box.color} fontFamily="KaiTi, Microsoft YaHei">
            {index + 1}
          </text>
        </g>
      ))}
      <path d="M120 190 C260 210, 420 210, 560 190" fill="none" stroke={palette.accentA} strokeWidth="4" />
      <path d="M384 190 C524 210, 684 210, 824 190" fill="none" stroke={palette.accentB} strokeWidth="4" />
      <text x="490" y="238" textAnchor="middle" fontSize="30" fill={CHALK_WHITE} fontFamily="KaiTi, Microsoft YaHei">先看周期，再看增量或分组。</text>
    </svg>
  );
}

function GeometryMeasureDiagram({ palette }: { palette: FamilyPalette }) {
  return (
    <svg width="100%" height="280" viewBox="0 0 980 280">
      <rect x="140" y="70" width="220" height="140" fill="none" stroke={palette.accentA} strokeWidth="4" />
      <circle cx="610" cy="140" r="78" fill="none" stroke={palette.accentB} strokeWidth="4" />
      <line x1="610" y1="140" x2="688" y2="140" stroke={palette.accentB} strokeWidth="4" />
      <line x1="610" y1="140" x2="664" y2="82" stroke={palette.accentB} strokeWidth="4" />
      <text x="250" y="232" textAnchor="middle" fontSize="30" fill={CHALK_WHITE} fontFamily="KaiTi, Microsoft YaHei">先看边和块</text>
      <text x="610" y="232" textAnchor="middle" fontSize="30" fill={CHALK_WHITE} fontFamily="KaiTi, Microsoft YaHei">先标半径和角</text>
    </svg>
  );
}

function GeometryConstructionDiagram({ palette }: { palette: FamilyPalette }) {
  return (
    <svg width="100%" height="280" viewBox="0 0 980 280">
      <polygon points="170,190 280,70 380,190" fill="none" stroke={CHALK_WHITE} strokeWidth="4" />
      <line x1="280" y1="70" x2="280" y2="190" stroke={palette.accentA} strokeWidth="4" />
      <text x="280" y="232" textAnchor="middle" fontSize="30" fill={palette.accentA} fontFamily="KaiTi, Microsoft YaHei">作辅助线</text>
      <rect x="520" y="90" width="220" height="120" fill="none" stroke={CHALK_WHITE} strokeWidth="4" />
      <line x1="520" y1="150" x2="740" y2="150" stroke={palette.accentB} strokeWidth="4" />
      <text x="630" y="232" textAnchor="middle" fontSize="30" fill={palette.accentB} fontFamily="KaiTi, Microsoft YaHei">对称 / 平移 / 旋转</text>
    </svg>
  );
}

function NumberTheoryDiagram({ palette }: { palette: FamilyPalette }) {
  return (
    <svg width="100%" height="260" viewBox="0 0 980 260">
      <rect x="120" y="70" width="120" height="54" fill="none" stroke={palette.accentA} strokeWidth="4" />
      <rect x="300" y="70" width="120" height="54" fill="none" stroke={palette.accentA} strokeWidth="4" />
      <rect x="480" y="70" width="120" height="54" fill="none" stroke={palette.accentA} strokeWidth="4" />
      <line x1="240" y1="97" x2="300" y2="97" stroke={palette.accentA} strokeWidth="4" />
      <line x1="420" y1="97" x2="480" y2="97" stroke={palette.accentA} strokeWidth="4" />
      <text x="180" y="104" textAnchor="middle" fontSize="28" fill={CHALK_WHITE} fontFamily="KaiTi, Microsoft YaHei">整除</text>
      <text x="360" y="104" textAnchor="middle" fontSize="28" fill={CHALK_WHITE} fontFamily="KaiTi, Microsoft YaHei">余数</text>
      <text x="540" y="104" textAnchor="middle" fontSize="28" fill={CHALK_WHITE} fontFamily="KaiTi, Microsoft YaHei">奇偶</text>
      <text x="490" y="202" textAnchor="middle" fontSize="30" fill={palette.accentB} fontFamily="KaiTi, Microsoft YaHei">先抓性质，再分类筛选。</text>
    </svg>
  );
}

function LogicCountingDiagram({ palette }: { palette: FamilyPalette }) {
  return (
    <svg width="100%" height="280" viewBox="0 0 980 280">
      <rect x="120" y="70" width="240" height="140" fill="none" stroke={palette.accentA} strokeWidth="4" />
      <line x1="200" y1="70" x2="200" y2="210" stroke={palette.accentA} strokeWidth="3" />
      <line x1="280" y1="70" x2="280" y2="210" stroke={palette.accentA} strokeWidth="3" />
      <line x1="120" y1="116" x2="360" y2="116" stroke={palette.accentA} strokeWidth="3" />
      <line x1="120" y1="162" x2="360" y2="162" stroke={palette.accentA} strokeWidth="3" />
      <text x="240" y="240" textAnchor="middle" fontSize="30" fill={CHALK_WHITE} fontFamily="KaiTi, Microsoft YaHei">排除表</text>
      <line x1="560" y1="90" x2="500" y2="140" stroke={palette.accentB} strokeWidth="4" />
      <line x1="560" y1="90" x2="620" y2="140" stroke={palette.accentB} strokeWidth="4" />
      <line x1="500" y1="140" x2="470" y2="190" stroke={palette.accentB} strokeWidth="4" />
      <line x1="500" y1="140" x2="530" y2="190" stroke={palette.accentB} strokeWidth="4" />
      <line x1="620" y1="140" x2="590" y2="190" stroke={palette.accentB} strokeWidth="4" />
      <line x1="620" y1="140" x2="650" y2="190" stroke={palette.accentB} strokeWidth="4" />
      <text x="560" y="240" textAnchor="middle" fontSize="30" fill={CHALK_WHITE} fontFamily="KaiTi, Microsoft YaHei">树状图 / 分类框</text>
    </svg>
  );
}

function GenericHookScene({
  scene,
  sceneFrame,
  palette
}: {
  scene: TeacherBlackboardScene;
  sceneFrame: number;
  palette: FamilyPalette;
}) {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 18px 1fr", gap: 20 }}>
        <div style={{ display: "grid", gap: 12 }}>
          <ChalkReveal delay={18} sceneFrame={sceneFrame} clip={false}>
            <ChalkText size={26} color={CHALK_RED} weight={800}>
              错误直觉
            </ChalkText>
          </ChalkReveal>
          <ChalkReveal delay={28} sceneFrame={sceneFrame}>
            <ChalkText size={34}>{scene.wrongClaim}</ChalkText>
          </ChalkReveal>
        </div>
        <ChalkReveal delay={22} sceneFrame={sceneFrame} clip={false}>
          <div style={{ justifySelf: "center", width: 3, height: 220, background: "rgba(243,241,231,0.45)" }} />
        </ChalkReveal>
        <div style={{ display: "grid", gap: 12 }}>
          <ChalkReveal delay={24} sceneFrame={sceneFrame} clip={false}>
            <ChalkText size={26} color={CHALK_GREEN} weight={800}>
              正确思路
            </ChalkText>
          </ChalkReveal>
          <ChalkReveal delay={34} sceneFrame={sceneFrame}>
            <ChalkText size={34}>{scene.correctClaim}</ChalkText>
          </ChalkReveal>
        </div>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {(scene.keyPoints ?? []).map((item, index) => (
          <ChalkReveal key={item} delay={50 + index * 6} sceneFrame={sceneFrame}>
            <div style={{ display: "grid", gridTemplateColumns: "18px 1fr", gap: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: palette.accentA, marginTop: 14 }} />
              <ChalkText size={24}>{item}</ChalkText>
            </div>
          </ChalkReveal>
        ))}
      </div>
    </div>
  );
}

function GenericEquationScene({
  scene,
  sceneFrame,
  palette
}: {
  scene: TeacherBlackboardScene;
  sceneFrame: number;
  palette: FamilyPalette;
}) {
  const lines = scene.formulaLines ?? scene.equations ?? [];
  const notes = scene.meaningNotes ?? [];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {lines.map((line, index) => (
        <ChalkReveal key={line} delay={18 + index * 10} sceneFrame={sceneFrame}>
          <div style={{ display: "grid", gap: 6 }}>
            <ChalkText size={31} weight={800}>
              {line}
            </ChalkText>
            <ChalkRule width={`${72 - index * 8}%`} color={[palette.title, palette.accentA, palette.accentB][index] ?? palette.title} rotate={index % 2 === 0 ? 0.4 : -0.4} />
          </div>
        </ChalkReveal>
      ))}
      {notes.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
          {notes.map((note, index) => (
            <ChalkReveal key={note} delay={48 + index * 8} sceneFrame={sceneFrame}>
              <div style={{ display: "grid", gap: 8 }}>
                <HighlightChip text={`要点 ${index + 1}`} color={[palette.accentA, palette.accentB, palette.accentC][index] ?? palette.accentA} />
                <ChalkText size={24}>{note}</ChalkText>
              </div>
            </ChalkReveal>
          ))}
        </div>
      ) : null}
      {scene.supportingNote ? (
        <ChalkReveal delay={76} sceneFrame={sceneFrame}>
          <ChalkText size={24} color={CHALK_RED}>
            提醒：{scene.supportingNote}
          </ChalkText>
        </ChalkReveal>
      ) : null}
    </div>
  );
}

function GenericFocusScene({
  scene,
  sceneFrame,
  palette
}: {
  scene: TeacherBlackboardScene;
  sceneFrame: number;
  palette: FamilyPalette;
}) {
  const focusItems = scene.givenItems ?? scene.highlightPoints ?? [];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.25fr 0.75fr", gap: 24 }}>
      <div style={{ display: "grid", gap: 16 }}>
        <ChalkReveal delay={18} sceneFrame={sceneFrame} clip={false}>
          <ChalkText size={31}>{scene.problemText}</ChalkText>
        </ChalkReveal>
        <ChalkReveal delay={34} sceneFrame={sceneFrame} clip={false}>
          <ChalkRule width="100%" color="rgba(243,241,231,0.35)" />
        </ChalkReveal>
        {scene.supportingNote ? (
          <ChalkReveal delay={44} sceneFrame={sceneFrame}>
            <ChalkText size={24} color={CHALK_GREEN}>
              {scene.supportingNote}
            </ChalkText>
          </ChalkReveal>
        ) : null}
      </div>
      <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
        {focusItems.map((item, index) => (
          <ChalkReveal key={item} delay={28 + index * 6} sceneFrame={sceneFrame}>
            <HighlightChip text={item} color={[palette.accentA, palette.accentB, palette.accentC][index % 3]} />
          </ChalkReveal>
        ))}
      </div>
    </div>
  );
}

function WorkedStepColumn({
  steps,
  sceneFrame,
  palette,
  size = 25
}: {
  steps: string[];
  sceneFrame: number;
  palette: FamilyPalette;
  size?: number;
}) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {steps.map((step, index) => (
        <ChalkReveal key={`${step}-${index}`} delay={18 + index * 8} sceneFrame={sceneFrame}>
          <div style={{ display: "grid", gridTemplateColumns: "46px 1fr", gap: 12 }}>
            <ChalkText size={24} color={index < 2 ? palette.accentA : palette.title} weight={800}>
              {index + 1}.
            </ChalkText>
            <div style={{ display: "grid", gap: 4 }}>
              <ChalkText size={size}>{step}</ChalkText>
              <ChalkRule
                width={`${82 - index * 8}%`}
                color={index < 2 ? palette.accentA : index < 4 ? palette.title : palette.accentB}
                rotate={index % 2 === 0 ? 0.4 : -0.4}
              />
            </div>
          </div>
        </ChalkReveal>
      ))}
    </div>
  );
}

function RelationWorkedExampleScene({
  scene,
  sceneFrame,
  palette
}: {
  scene: TeacherBlackboardScene;
  sceneFrame: number;
  palette: FamilyPalette;
}) {
  const steps = (scene.solveSteps ?? scene.stepLines ?? []).slice(0, 4);
  const notes = (scene.givenItems ?? []).slice(0, 2);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24 }}>
      <WorkedStepColumn steps={steps} sceneFrame={sceneFrame} palette={palette} size={24} />
      <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
        <ChalkReveal delay={22} sceneFrame={sceneFrame} clip={false}>
          <RelationDiagram palette={palette} />
        </ChalkReveal>
        <ChalkReveal delay={34} sceneFrame={sceneFrame}>
          <AnswerBox text={scene.checkLine} color={CHALK_GREEN} />
        </ChalkReveal>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {notes.map((item, index) => (
            <ChalkReveal key={item} delay={30 + index * 6} sceneFrame={sceneFrame}>
              <HighlightChip text={item} color={[palette.accentA, palette.accentB][index % 2]} />
            </ChalkReveal>
          ))}
        </div>
        {scene.supportingNote ? (
          <ChalkReveal delay={46} sceneFrame={sceneFrame}>
            <ChalkText size={22} color={CHALK_RED}>
              提醒：{scene.supportingNote}
            </ChalkText>
          </ChalkReveal>
        ) : null}
      </div>
    </div>
  );
}

function CalculationWorkedExampleScene({
  scene,
  sceneFrame,
  palette
}: {
  scene: TeacherBlackboardScene;
  sceneFrame: number;
  palette: FamilyPalette;
}) {
  const steps = (scene.solveSteps ?? scene.stepLines ?? []).slice(0, 4);
  const notes = (scene.givenItems ?? []).slice(0, 2);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18 }}>
        {steps.map((step, index) => (
          <ChalkReveal key={`${step}-${index}`} delay={18 + index * 8} sceneFrame={sceneFrame}>
            <div
              style={{
                minHeight: 104,
                borderRadius: 18,
                border: `3px solid ${index < 2 ? palette.accentA : palette.accentB}`,
                padding: "14px 16px",
                background: `${index < 2 ? palette.accentA : palette.accentB}12`
              }}
            >
              <ChalkText size={22} color={index < 2 ? palette.accentA : palette.accentB} weight={800}>
                第 {index + 1} 步
              </ChalkText>
              <ChalkText size={24}>{step}</ChalkText>
            </div>
          </ChalkReveal>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 20 }}>
        <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
          <ChalkReveal delay={28} sceneFrame={sceneFrame} clip={false}>
            <CalculationDiagram palette={palette} />
          </ChalkReveal>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {notes.map((item, index) => (
              <ChalkReveal key={item} delay={34 + index * 6} sceneFrame={sceneFrame}>
                <HighlightChip text={item} color={[palette.accentA, palette.accentC][index % 2]} />
              </ChalkReveal>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
          {scene.supportingNote ? (
            <ChalkReveal delay={44} sceneFrame={sceneFrame}>
              <ChalkText size={23} color={CHALK_RED}>
                提醒：{scene.supportingNote}
              </ChalkText>
            </ChalkReveal>
          ) : null}
          <ChalkReveal delay={54} sceneFrame={sceneFrame}>
            <AnswerBox text={scene.checkLine} color={CHALK_GREEN} />
          </ChalkReveal>
        </div>
      </div>
    </div>
  );
}

function GeometryMeasureWorkedExampleScene({
  scene,
  sceneFrame,
  palette
}: {
  scene: TeacherBlackboardScene;
  sceneFrame: number;
  palette: FamilyPalette;
}) {
  const steps = (scene.solveSteps ?? scene.stepLines ?? []).slice(0, 4);
  const notes = (scene.givenItems ?? []).slice(0, 2);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "0.95fr 1.05fr", gap: 24 }}>
      <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
        <ChalkReveal delay={20} sceneFrame={sceneFrame} clip={false}>
          <GeometryMeasureDiagram palette={palette} />
        </ChalkReveal>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {notes.map((item, index) => (
            <ChalkReveal key={item} delay={30 + index * 6} sceneFrame={sceneFrame}>
              <HighlightChip text={item} color={[palette.accentA, palette.accentB][index % 2]} />
            </ChalkReveal>
          ))}
        </div>
        {scene.supportingNote ? (
          <ChalkReveal delay={42} sceneFrame={sceneFrame}>
            <ChalkText size={22} color={CHALK_RED}>
              提醒：{scene.supportingNote}
            </ChalkText>
          </ChalkReveal>
        ) : null}
      </div>
      <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
        <WorkedStepColumn steps={steps} sceneFrame={sceneFrame} palette={palette} size={23} />
        <ChalkReveal delay={58} sceneFrame={sceneFrame}>
          <AnswerBox text={scene.checkLine} color={CHALK_GREEN} />
        </ChalkReveal>
      </div>
    </div>
  );
}

function GenericWorkedExampleScene({
  scene,
  sceneFrame,
  palette
}: {
  scene: TeacherBlackboardScene;
  sceneFrame: number;
  palette: FamilyPalette;
}) {
  const steps = (scene.solveSteps ?? scene.stepLines ?? []).slice(0, 4);
  const notes = (scene.givenItems ?? []).slice(0, 2);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.28fr 0.72fr", gap: 24 }}>
      <WorkedStepColumn steps={steps} sceneFrame={sceneFrame} palette={palette} />
      <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {notes.map((item, index) => (
            <ChalkReveal key={item} delay={28 + index * 6} sceneFrame={sceneFrame}>
              <HighlightChip text={item} color={[palette.accentA, palette.accentB][index % 2]} />
            </ChalkReveal>
          ))}
        </div>
        {scene.supportingNote ? (
          <ChalkReveal delay={44} sceneFrame={sceneFrame}>
            <ChalkText size={23} color={CHALK_RED}>
              提醒：{scene.supportingNote}
            </ChalkText>
          </ChalkReveal>
        ) : null}
        <ChalkReveal delay={56} sceneFrame={sceneFrame}>
          <AnswerBox text={scene.checkLine} color={CHALK_GREEN} />
        </ChalkReveal>
      </div>
    </div>
  );
}

function FamilyWorkedExampleScene({
  family,
  scene,
  sceneFrame,
  palette
}: {
  family: TeacherFamilyId;
  scene: TeacherBlackboardScene;
  sceneFrame: number;
  palette: FamilyPalette;
}) {
  if (family === "relation_word_problem_v1") {
    return <RelationWorkedExampleScene scene={scene} sceneFrame={sceneFrame} palette={palette} />;
  }
  if (family === "calculation_blackboard_v1") {
    return <CalculationWorkedExampleScene scene={scene} sceneFrame={sceneFrame} palette={palette} />;
  }
  if (family === "geometry_measure_v1") {
    return <GeometryMeasureWorkedExampleScene scene={scene} sceneFrame={sceneFrame} palette={palette} />;
  }
  return <GenericWorkedExampleScene scene={scene} sceneFrame={sceneFrame} palette={palette} />;
}

function getCompareHeaders(family: TeacherFamilyId) {
  if (family === "relation_word_problem_v1") {
    return { left: "看到什么", right: "先做什么" };
  }
  if (family === "calculation_blackboard_v1") {
    return { left: "结构信号", right: "优先策略" };
  }
  if (family === "geometry_measure_v1") {
    return { left: "图形变化", right: "第一反应" };
  }
  return { left: "情境", right: "该用什么" };
}

function GenericCompareScene({
  family,
  scene,
  sceneFrame,
  palette
}: {
  family: TeacherFamilyId;
  scene: TeacherBlackboardScene;
  sceneFrame: number;
  palette: FamilyPalette;
}) {
  const rows = (scene.compareRows ?? []).slice(0, 3);
  const headers = getCompareHeaders(family);
  const notes = (scene.mistakeChecklist ?? []).slice(0, 2);

  if (family === "logic_counting_v1") {
    return (
      <div style={{ display: "grid", gap: 18 }}>
        {scene.problemText ? (
          <ChalkReveal delay={14} sceneFrame={sceneFrame}>
            <ChalkText size={23} color={palette.title}>
              变式题型：{scene.problemText}
            </ChalkText>
          </ChalkReveal>
        ) : null}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div
            style={{
              display: "grid",
              gap: 12,
              padding: "18px 18px 16px",
              borderRadius: 20,
              border: `3px solid ${palette.title}`,
              background: `${palette.title}12`
            }}
          >
            <ChalkReveal delay={18} sceneFrame={sceneFrame}>
              <ChalkText size={25} color={palette.title} weight={800}>
                {headers.left}
              </ChalkText>
            </ChalkReveal>
            {rows.map((row, index) => (
              <ChalkReveal key={`${row.left}-${index}`} delay={26 + index * 7} sceneFrame={sceneFrame}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "34px 1fr",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 16,
                    background: "rgba(243,241,231,0.06)"
                  }}
                >
                  <ChalkText size={23} color={palette.title} weight={800} align="center">
                    {index + 1}
                  </ChalkText>
                  <ChalkText size={23}>{row.left}</ChalkText>
                </div>
              </ChalkReveal>
            ))}
          </div>
          <div
            style={{
              display: "grid",
              gap: 12,
              padding: "18px 18px 16px",
              borderRadius: 20,
              border: `3px solid ${palette.accentA}`,
              background: `${palette.accentA}16`
            }}
          >
            <ChalkReveal delay={22} sceneFrame={sceneFrame}>
              <ChalkText size={25} color={palette.accentA} weight={800}>
                {headers.right}
              </ChalkText>
            </ChalkReveal>
            {rows.map((row, index) => (
              <ChalkReveal key={`${row.right}-${index}`} delay={32 + index * 7} sceneFrame={sceneFrame}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "32px 1fr",
                    gap: 12,
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: 16,
                    background: `${palette.accentA}26`,
                    boxShadow: `0 0 0 1px ${palette.accentA}26 inset`
                  }}
                >
                  <ChalkText size={22} color={palette.accentA} weight={800} align="center">
                    →
                  </ChalkText>
                  <ChalkText size={24} color={palette.accentA} weight={800}>
                    {row.right}
                  </ChalkText>
                </div>
              </ChalkReveal>
            ))}
          </div>
        </div>
        {scene.switchPoint ? (
          <ChalkReveal delay={58} sceneFrame={sceneFrame}>
            <HighlightChip text={scene.switchPoint} color={palette.accentB} />
          </ChalkReveal>
        ) : null}
        {notes.length ? (
          <div style={{ display: "grid", gap: 6 }}>
            {notes.map((item, index) => (
              <ChalkReveal key={item} delay={68 + index * 6} sceneFrame={sceneFrame}>
                <ChalkText size={21} color={CHALK_RED}>
                  注意：{item}
                </ChalkText>
              </ChalkReveal>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {scene.problemText ? (
        <ChalkReveal delay={16} sceneFrame={sceneFrame}>
          <ChalkText size={24} color={palette.title}>
            变式题：{scene.problemText}
          </ChalkText>
        </ChalkReveal>
      ) : null}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 20px 0.86fr", gap: 18 }}>
        <div style={{ display: "grid", gap: 12 }}>
          <ChalkReveal delay={18} sceneFrame={sceneFrame}>
            <ChalkText size={24} color={palette.title} weight={800}>
              {headers.left}
            </ChalkText>
          </ChalkReveal>
          {rows.map((row, index) => (
            <ChalkReveal key={`${row.left}-${index}`} delay={28 + index * 7} sceneFrame={sceneFrame}>
              <div style={{ padding: "8px 0" }}>
                <ChalkText size={23}>{row.left}</ChalkText>
              </div>
            </ChalkReveal>
          ))}
        </div>
        <ChalkReveal delay={22} sceneFrame={sceneFrame} clip={false}>
          <div style={{ justifySelf: "center", width: 3, height: 240, background: "rgba(243,241,231,0.45)" }} />
        </ChalkReveal>
        <div style={{ display: "grid", gap: 12 }}>
          <ChalkReveal delay={24} sceneFrame={sceneFrame}>
            <ChalkText size={24} color={palette.accentA} weight={800}>
              {headers.right}
            </ChalkText>
          </ChalkReveal>
          {rows.map((row, index) => (
            <ChalkReveal key={`${row.right}-${index}`} delay={34 + index * 7} sceneFrame={sceneFrame}>
              <div style={{ padding: "8px 0" }}>
                <ChalkText size={24} color={palette.accentA} weight={800}>
                  {row.right}
                </ChalkText>
              </div>
            </ChalkReveal>
          ))}
        </div>
      </div>
      {scene.switchPoint ? (
        <ChalkReveal delay={58} sceneFrame={sceneFrame}>
          <HighlightChip text={scene.switchPoint} color={CHALK_GREEN} />
        </ChalkReveal>
      ) : null}
      {scene.checkLine ? (
        <ChalkReveal delay={66} sceneFrame={sceneFrame}>
          <AnswerBox text={scene.checkLine} color={palette.accentA} />
        </ChalkReveal>
      ) : null}
      {notes.length ? (
        <div style={{ display: "grid", gap: 6 }}>
          {notes.map((item, index) => (
            <ChalkReveal key={item} delay={74 + index * 6} sceneFrame={sceneFrame}>
              <ChalkText size={22} color={CHALK_RED}>
                × {item}
              </ChalkText>
            </ChalkReveal>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function GenericChecklistScene({
  scene,
  sceneFrame,
  palette
}: {
  scene: TeacherBlackboardScene;
  sceneFrame: number;
  palette: FamilyPalette;
}) {
  const methods = scene.methodChecklist ?? scene.stepLines ?? [];
  const mistakes = (scene.mistakeChecklist ?? []).slice(0, 2);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24 }}>
      <div style={{ display: "grid", gap: 10 }}>
        {methods.map((item, index) => (
          <ChalkReveal key={item} delay={18 + index * 7} sceneFrame={sceneFrame}>
            <div style={{ display: "grid", gridTemplateColumns: "52px 1fr", gap: 14 }}>
              <ChalkText size={25} color={CHALK_GREEN} weight={800}>
                {index + 1}.
              </ChalkText>
              <ChalkText size={25}>{item}</ChalkText>
            </div>
          </ChalkReveal>
        ))}
        {scene.supportingNote ? (
          <ChalkReveal delay={56} sceneFrame={sceneFrame}>
            <ChalkText size={23} color={palette.accentA}>
              {scene.supportingNote}
            </ChalkText>
          </ChalkReveal>
        ) : null}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <ChalkReveal delay={24} sceneFrame={sceneFrame}>
          <ChalkText size={24} color={CHALK_RED} weight={800}>
            常见坑
          </ChalkText>
        </ChalkReveal>
        {mistakes.map((item, index) => (
          <ChalkReveal key={item} delay={32 + index * 6} sceneFrame={sceneFrame}>
            <ChalkText size={23} color={CHALK_RED}>
              × {item}
            </ChalkText>
          </ChalkReveal>
        ))}
      </div>
    </div>
  );
}

function renderDiagramForFamily(family: TeacherFamilyId, scene: TeacherBlackboardScene, palette: FamilyPalette) {
  if (family === "travel_blackboard_v2") {
    return <TravelDiagram scene={scene} palette={palette} />;
  }
  if (family === "relation_word_problem_v1") {
    return <RelationDiagram palette={palette} />;
  }
  if (family === "calculation_blackboard_v1") {
    return <CalculationDiagram palette={palette} />;
  }
  if (family === "pattern_sequence_v1") {
    return <PatternDiagram palette={palette} />;
  }
  if (family === "geometry_measure_v1") {
    return <GeometryMeasureDiagram palette={palette} />;
  }
  if (family === "geometry_construction_v1") {
    return <GeometryConstructionDiagram palette={palette} />;
  }
  if (family === "number_theory_v1") {
    return <NumberTheoryDiagram palette={palette} />;
  }
  return <LogicCountingDiagram palette={palette} />;
}

function FamilySceneBody({
  family,
  scene,
  sceneFrame
}: {
  family: TeacherFamilyId;
  scene: TeacherBlackboardScene;
  sceneFrame: number;
}) {
  const palette = FAMILY_PALETTES[family] ?? FAMILY_PALETTES.travel_blackboard_v2;
  const visualMode = scene.visualMode ?? scene.type ?? "steps";

  if (visualMode === "contrast") {
    return <GenericHookScene scene={scene} sceneFrame={sceneFrame} palette={palette} />;
  }
  if (visualMode === "diagram") {
    return (
      <div style={{ display: "grid", gap: 18 }}>
        <ChalkReveal delay={18} sceneFrame={sceneFrame} clip={false}>
          {renderDiagramForFamily(family, scene, palette)}
        </ChalkReveal>
        {(scene.relationshipMap ?? []).length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {scene.relationshipMap?.map((item, index) => (
              <ChalkReveal key={item} delay={40 + index * 6} sceneFrame={sceneFrame}>
                <HighlightChip text={item} color={[palette.title, palette.accentA, palette.accentB][index % 3]} />
              </ChalkReveal>
            ))}
          </div>
        ) : null}
        {scene.supportingNote ? (
          <ChalkReveal delay={62} sceneFrame={sceneFrame}>
            <ChalkText size={23} color={CHALK_GREEN}>
              {scene.supportingNote}
            </ChalkText>
          </ChalkReveal>
        ) : null}
      </div>
    );
  }
  if (visualMode === "equation") {
    return <GenericEquationScene scene={scene} sceneFrame={sceneFrame} palette={palette} />;
  }
  if (visualMode === "focus") {
    return <GenericFocusScene scene={scene} sceneFrame={sceneFrame} palette={palette} />;
  }
  if (visualMode === "worked_example") {
    return <FamilyWorkedExampleScene family={family} scene={scene} sceneFrame={sceneFrame} palette={palette} />;
  }
  if (visualMode === "compare") {
    return <GenericCompareScene family={family} scene={scene} sceneFrame={sceneFrame} palette={palette} />;
  }
  return <GenericChecklistScene scene={scene} sceneFrame={sceneFrame} palette={palette} />;
}

function createTeacherFamilyVideoRenderer(family: TeacherFamilyId) {
  const Component: React.FC<TeacherBlackboardRemotionProps> = ({ lesson, timing, audioFileRelativePath }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    if (!lesson) {
      return <AbsoluteFill style={{ background: BOARD_GREEN_DARK }} />;
    }

    const sceneBounds = getSceneBounds(lesson, timing);
    const palette = FAMILY_PALETTES[family] ?? FAMILY_PALETTES.travel_blackboard_v2;

    return (
      <AbsoluteFill style={{ background: BOARD_GREEN_DARK }}>
        <Audio src={staticFile(audioFileRelativePath)} />
        {sceneBounds.map((bound) => {
          const from = Math.floor(bound.startSec * fps);
          const durationInFrames = Math.max(1, Math.ceil(bound.durationSec * fps));

          return (
            <Sequence key={bound.scene.id} from={from} durationInFrames={durationInFrames}>
              <BlackboardShell>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    padding: "42px 50px 56px",
                    display: "grid",
                    gridTemplateRows: "auto 1fr",
                    gap: 24
                  }}
                >
                  <BoardHeading title={bound.scene.boardTitle} sceneFrame={frame - from} accent={palette.title} />
                  <div>
                    <FamilySceneBody family={family} scene={bound.scene} sceneFrame={frame - from} />
                  </div>
                </div>
              </BlackboardShell>
            </Sequence>
          );
        })}
      </AbsoluteFill>
    );
  };

  return Component;
}

export const TravelBlackboardVideo = createTeacherFamilyVideoRenderer("travel_blackboard_v2");
export const RelationWordProblemVideo = createTeacherFamilyVideoRenderer("relation_word_problem_v1");
export const CalculationBlackboardVideo = createTeacherFamilyVideoRenderer("calculation_blackboard_v1");
export const PatternSequenceVideo = createTeacherFamilyVideoRenderer("pattern_sequence_v1");
export const GeometryMeasureVideo = createTeacherFamilyVideoRenderer("geometry_measure_v1");
export const GeometryConstructionVideo = createTeacherFamilyVideoRenderer("geometry_construction_v1");
export const NumberTheoryVideo = createTeacherFamilyVideoRenderer("number_theory_v1");
export const LogicCountingVideo = createTeacherFamilyVideoRenderer("logic_counting_v1");
