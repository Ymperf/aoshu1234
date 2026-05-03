import type { CourseCatalog } from "@shared-types/content";

export const courseCatalog: CourseCatalog = {
  grades: [
    {
      id: 1,
      name: "一年级",
      intro: "从图形观察、简单推理和趣味算式切入，建立奥数兴趣。",
      topicCount: 2,
      freeTopicCount: 1
    },
    {
      id: 2,
      name: "二年级",
      intro: "开始训练找规律、枚举和基础应用题拆解能力。",
      topicCount: 2,
      freeTopicCount: 1
    },
    {
      id: 3,
      name: "三年级",
      intro: "强化数阵、和差倍与简单逻辑推理，进入系统训练阶段。",
      topicCount: 2,
      freeTopicCount: 1
    }
  ],
  topics: [
    {
      id: 101,
      gradeId: 1,
      name: "找规律入门",
      intro: "通过图形和数字序列建立初步规律感。",
      isFree: true,
      knowledgePointCount: 2
    },
    {
      id: 102,
      gradeId: 1,
      name: "火柴棒与图形",
      intro: "从拼摆、移动和观察中训练空间想象。",
      isFree: false,
      knowledgePointCount: 2
    },
    {
      id: 201,
      gradeId: 2,
      name: "简单枚举",
      intro: "学习按顺序、不重复地列举可能情况。",
      isFree: true,
      knowledgePointCount: 2
    },
    {
      id: 202,
      gradeId: 2,
      name: "间隔与植树",
      intro: "理解点、段、间隔之间的关系。",
      isFree: false,
      knowledgePointCount: 2
    },
    {
      id: 301,
      gradeId: 3,
      name: "和差问题",
      intro: "建立图示法与数量关系表达能力。",
      isFree: true,
      knowledgePointCount: 2
    },
    {
      id: 302,
      gradeId: 3,
      name: "数阵图初步",
      intro: "认识数阵结构和位置变化规律。",
      isFree: false,
      knowledgePointCount: 2
    }
  ],
  knowledgePoints: [
    {
      id: 1001,
      topicId: 101,
      topicName: "找规律入门",
      name: "图形重复规律",
      intro: "识别颜色、方向、数量的重复单元。",
      difficultyLevel: "basic",
      durationSec: 420,
      isLocked: false,
      transcriptText: "先找到最小重复单元，再判断整体是否按照固定顺序循环出现。",
      quizPreviewCount: 3
    },
    {
      id: 1002,
      topicId: 101,
      topicName: "找规律入门",
      name: "数字递增规律",
      intro: "观察每一步增加或减少的数量。",
      difficultyLevel: "basic",
      durationSec: 480,
      isLocked: false,
      transcriptText: "把相邻两项相减，先判断是否是固定差值，再看差值本身是否有规律。",
      quizPreviewCount: 3
    },
    {
      id: 1003,
      topicId: 102,
      topicName: "火柴棒与图形",
      name: "移动一根火柴",
      intro: "学会从目标图形倒推关键变化位置。",
      difficultyLevel: "intermediate",
      durationSec: 560,
      isLocked: true,
      transcriptText: "付费解锁后可查看完整讲解。",
      quizPreviewCount: 2
    },
    {
      id: 2001,
      topicId: 201,
      topicName: "简单枚举",
      name: "按顺序枚举",
      intro: "按固定顺序列举，避免遗漏和重复。",
      difficultyLevel: "basic",
      durationSec: 510,
      isLocked: false,
      transcriptText: "先固定一个条件，再逐步变化另一个条件，是最稳妥的枚举方法。",
      quizPreviewCount: 3
    },
    {
      id: 3001,
      topicId: 301,
      topicName: "和差问题",
      name: "画线段图理解和差",
      intro: "把文字关系转成线段图，快速找到未知量。",
      difficultyLevel: "intermediate",
      durationSec: 620,
      isLocked: false,
      transcriptText: "和差问题的核心是把两组数量关系放在同一张图里比较。",
      quizPreviewCount: 4
    },
    {
      id: 3002,
      topicId: 302,
      topicName: "数阵图初步",
      name: "数阵中的行列关系",
      intro: "从横向、纵向两个维度观察变化。",
      difficultyLevel: "advanced",
      durationSec: 660,
      isLocked: true,
      transcriptText: "付费解锁后可查看完整讲解。",
      quizPreviewCount: 2
    }
  ]
};
