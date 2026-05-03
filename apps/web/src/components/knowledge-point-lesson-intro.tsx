"use client";

import { KnowledgePointLessonIllustrations } from "@/components/knowledge-point-lesson-illustrations";
import { MathRichText } from "@/components/math-rich-text";
import type {
  KnowledgePointLessonIllustration,
  KnowledgePointLessonIntroCard,
  KnowledgePointLessonIntroContent,
  KnowledgePointLessonIntroGroupSection,
  KnowledgePointLessonIntroSections,
  KnowledgePointLessonSourceSections
} from "@/lib/knowledge-point-lesson";

function TagList({ items, tone = "slate" }: { items: string[]; tone?: "slate" | "amber" | "emerald" | "blue" }) {
  const toneClassMap = {
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    blue: "border-sky-200 bg-sky-50 text-sky-800"
  } as const;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={`rounded-full border px-3 py-1.5 text-sm leading-6 ${toneClassMap[tone]}`}>
          <MathRichText content={item} as="span" className="whitespace-pre-wrap" />
        </span>
      ))}
    </div>
  );
}

function pickCard(cards: KnowledgePointLessonIntroCard[] | undefined, ids: string[]) {
  return cards?.find((card) => ids.includes(card.id)) ?? null;
}

function toGroupItem(card: KnowledgePointLessonIntroCard | null, label: string) {
  if (!card) {
    return null;
  }

  return {
    label,
    value: card.content
  };
}

function buildSectionsFromCards(intro: KnowledgePointLessonIntroContent): KnowledgePointLessonIntroSections {
  const cards = intro.cards ?? [];
  const modelCard = pickCard(cards, ["problem-model"]);
  const knownCard = pickCard(cards, ["known-conditions"]);
  const goalCard = pickCard(cards, ["target-question", "goal"]);
  const principlesCard = pickCard(cards, ["core-principles", "principles"]);
  const formulasCard = pickCard(cards, ["core-formulas", "formulas"]);
  const tipsCard = pickCard(cards, ["tips"]);

  return {
    focus: {
      title: "本节重点",
      content: intro.summary
    },
    model: {
      title: "题目模型",
      items: [
        toGroupItem(modelCard, "识别信号"),
        toGroupItem(knownCard, "常见已知"),
        toGroupItem(goalCard, "常见问题")
      ].filter((item): item is NonNullable<typeof item> => item !== null),
      illustrationIds: modelCard?.illustrationIds
    },
    method: {
      title: "解题方法",
      items: [
        toGroupItem(principlesCard, "方法思路"),
        toGroupItem(formulasCard, "核心公式"),
        toGroupItem(tipsCard, "易错提醒")
      ].filter((item): item is NonNullable<typeof item> => item !== null)
    }
  };
}

function GroupSection({
  section,
  illustrations
}: {
  section: KnowledgePointLessonIntroGroupSection;
  illustrations: KnowledgePointLessonIllustration[];
}) {
  const relatedIllustrations = illustrations.filter((item) => section.illustrationIds?.includes(item.id));

  return (
    <div className="rounded-[24px] border border-line/80 bg-slate-50/80 px-5 py-5">
      <h3 className="text-lg font-semibold text-slate-950">{section.title}</h3>
      <div className="mt-4 grid gap-4">
        {section.items.map((item) => (
          <div key={item.label} className="grid gap-2 rounded-[18px] bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
            {Array.isArray(item.value) ? (
              item.label === "核心公式" || item.label === "常见已知" || item.label === "识别信号" ? (
                <TagList items={item.value} tone={item.label === "核心公式" ? "slate" : "blue"} />
              ) : (
                <ul className="grid gap-2 text-[15px] leading-8 text-slate-700">
                  {item.value.map((value) => (
                    <li key={value}>
                      <span className="mr-1">-</span>
                      <MathRichText content={value} as="span" className="inline whitespace-pre-wrap" />
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <MathRichText content={item.value} className="whitespace-pre-wrap text-[15px] leading-8 text-slate-700" />
            )}
          </div>
        ))}
      </div>
      {relatedIllustrations.length > 0 ? (
        <div className="mt-4">
          <KnowledgePointLessonIllustrations items={relatedIllustrations} />
        </div>
      ) : null}
    </div>
  );
}

interface KnowledgePointLessonIntroProps {
  intro: KnowledgePointLessonIntroContent;
  illustrations: KnowledgePointLessonIllustration[];
  sourceSections?: KnowledgePointLessonSourceSections;
}

function TextBlock({
  title,
  emoji,
  content,
  accentClass
}: {
  title: string;
  emoji: string;
  content?: string;
  accentClass: string;
}) {
  if (!content?.trim()) {
    return null;
  }

  return (
    <div className="grid gap-2 border-b border-[#E5E7EB] pb-5 last:border-b-0 last:pb-0">
      <h3 className={`flex items-center gap-2 text-base font-semibold ${accentClass}`}>
        <span aria-hidden="true">{emoji}</span>
        <span>{title}</span>
      </h3>
      <MathRichText content={content} className="whitespace-pre-wrap text-[15px] leading-8 text-[#5B6472]" />
    </div>
  );
}

export function KnowledgePointLessonIntro({ intro, illustrations, sourceSections }: KnowledgePointLessonIntroProps) {
  const knowledge = sourceSections?.knowledge;

  if (knowledge) {
    return (
      <section className="rounded-[12px] border border-[#D9E7FF] bg-white p-6">
        <h2 className="text-xl font-semibold text-[#333333]">📘 知识点简介</h2>
        <div className="mt-5 grid gap-5">
          <TextBlock title="知识点定义" emoji="🧩" content={knowledge.definition} accentClass="text-[#165DFF]" />
          <TextBlock title="核心解题思路" emoji="🧠" content={knowledge.thinking} accentClass="text-[#0F766E]" />
          <TextBlock title="方法总结/常用公式" emoji="🧮" content={knowledge.formula} accentClass="text-[#7C3AED]" />
          <TextBlock title="易错点提醒" emoji="⚠️" content={knowledge.mistakes} accentClass="text-[#D97706]" />
          <TextBlock title="本难度考察特点" emoji="🎯" content={knowledge.features} accentClass="text-[#DB2777]" />
        </div>
      </section>
    );
  }

  const sections = intro.sections ?? buildSectionsFromCards(intro);

  return (
    <section className="rounded-[28px] border border-line/80 bg-white p-6 shadow-card">
      <h2 className="text-base font-medium tracking-[0.08em] text-slate-500">知识点简介</h2>
      <div className="mt-5 grid gap-4">
        <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,#f8fbff,#eef5ff)] px-5 py-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">{sections.focus.title}</p>
          <MathRichText content={sections.focus.content} className="mt-3 whitespace-pre-wrap text-[15px] leading-8 text-slate-700" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <GroupSection section={sections.model} illustrations={illustrations} />
          <GroupSection section={sections.method} illustrations={illustrations} />
        </div>
      </div>
    </section>
  );
}
