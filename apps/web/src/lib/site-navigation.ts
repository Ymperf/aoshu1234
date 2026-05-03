export interface ModuleNavItem {
  slug: string;
  name: string;
  description: string;
}

export const GRADE_LABELS = [
  { id: 1, label: "一年级" },
  { id: 2, label: "二年级" },
  { id: 3, label: "三年级" },
  { id: 4, label: "四年级" },
  { id: 5, label: "五年级" },
  { id: 6, label: "六年级" }
] as const;

export const MODULE_NAV_ITEMS: ModuleNavItem[] = [
  { slug: "calculation", name: "计算", description: "聚焦巧算、速算与运算规律，夯实数感和计算策略。" },
  { slug: "number-theory", name: "数论", description: "围绕整除、余数、质合数等主题，训练数字规律分析。" },
  { slug: "geometry", name: "几何", description: "覆盖周长、面积、图形变化与空间想象，建立图形直觉。" },
  { slug: "word-problems", name: "应用题", description: "针对和差、倍数、工程、行程等模型，强化建模能力。" },
  { slug: "sequence", name: "数列", description: "从找规律到递推表达，系统提升序列观察和归纳能力。" },
  { slug: "logic", name: "逻辑", description: "通过推理、枚举、逆推和排除，建立清晰严密的思维路径。" },
  { slug: "combinatorics", name: "组合", description: "围绕计数、排列、搭配和最值问题，培养系统拆解能力。" }
];

export function getGradeLabel(gradeId: number): string {
  return GRADE_LABELS.find((item) => item.id === gradeId)?.label ?? `${gradeId} 年级`;
}

export function getModuleBySlug(slug: string): ModuleNavItem | undefined {
  return MODULE_NAV_ITEMS.find((item) => item.slug === slug);
}

export function getModuleByName(name?: string): ModuleNavItem | undefined {
  return MODULE_NAV_ITEMS.find((item) => item.name === name);
}
