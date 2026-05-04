import Link from "next/link";
import { GlobalSiteNav } from "@/components/global-site-nav";

type HomeExperiencePageProps = {
  previewLabel?: string;
  previewNote?: string;
  footerText?: string;
};

const HERO_STATS = [
  { value: "6", label: "覆盖年级", tone: "from-sky-50 to-sky-100 text-sky-700 border-sky-200" },
  { value: "7", label: "模块", tone: "from-teal-50 to-teal-100 text-teal-700 border-teal-200" },
  { value: "57", label: "专题", tone: "from-amber-50 to-amber-100 text-amber-700 border-amber-200" },
  { value: "191", label: "知识点", tone: "from-violet-50 to-violet-100 text-violet-700 border-violet-200" }
] as const;

const GRADE_CARDS = [
  {
    index: "1",
    label: "一年级",
    count: "18 个知识点",
    href: "/grades/1",
    cardClass: "border-sky-200 bg-[linear-gradient(135deg,#F0F9FF_0%,#FFFFFF_58%,#E0F2FE_100%)]",
    indexClass: "text-sky-700",
    labelClass: "group-hover:text-sky-700",
    hoverClass: "hover:border-sky-400 hover:shadow-[0_18px_36px_rgba(56,189,248,0.22)]"
  },
  {
    index: "2",
    label: "二年级",
    count: "26 个知识点",
    href: "/grades/2",
    cardClass: "border-teal-200 bg-[linear-gradient(135deg,#F0FDFA_0%,#FFFFFF_58%,#CCFBF1_100%)]",
    indexClass: "text-teal-700",
    labelClass: "group-hover:text-teal-700",
    hoverClass: "hover:border-teal-400 hover:shadow-[0_18px_36px_rgba(20,184,166,0.22)]"
  },
  {
    index: "3",
    label: "三年级",
    count: "31 个知识点",
    href: "/grades/3",
    cardClass: "border-emerald-200 bg-[linear-gradient(135deg,#F0FDF4_0%,#FFFFFF_58%,#DCFCE7_100%)]",
    indexClass: "text-emerald-700",
    labelClass: "group-hover:text-emerald-700",
    hoverClass: "hover:border-emerald-400 hover:shadow-[0_18px_36px_rgba(34,197,94,0.20)]"
  },
  {
    index: "4",
    label: "四年级",
    count: "34 个知识点",
    href: "/grades/4",
    cardClass: "border-amber-200 bg-[linear-gradient(135deg,#FFFBEB_0%,#FFFFFF_58%,#FEF3C7_100%)]",
    indexClass: "text-amber-700",
    labelClass: "group-hover:text-amber-700",
    hoverClass: "hover:border-amber-400 hover:shadow-[0_18px_36px_rgba(245,158,11,0.20)]"
  },
  {
    index: "5",
    label: "五年级",
    count: "29 个知识点",
    href: "/grades/5",
    cardClass: "border-violet-200 bg-[linear-gradient(135deg,#F5F3FF_0%,#FFFFFF_58%,#EDE9FE_100%)]",
    indexClass: "text-violet-700",
    labelClass: "group-hover:text-violet-700",
    hoverClass: "hover:border-violet-400 hover:shadow-[0_18px_36px_rgba(139,92,246,0.22)]"
  },
  {
    index: "6",
    label: "六年级",
    count: "22 个知识点",
    href: "/grades/6",
    cardClass: "border-rose-200 bg-[linear-gradient(135deg,#FDF2F8_0%,#FFFFFF_58%,#FCE7F3_100%)]",
    indexClass: "text-rose-700",
    labelClass: "group-hover:text-rose-700",
    hoverClass: "hover:border-rose-400 hover:shadow-[0_18px_36px_rgba(236,72,153,0.22)]"
  }
] as const;

const MODULE_CARDS = [
  {
    name: "计算",
    note: "口算、巧算、竖式",
    href: "/modules/calculation",
    cardClass: "border-sky-200 bg-[linear-gradient(135deg,#F0F9FF_0%,#FFFFFF_58%,#E0F2FE_100%)]",
    hoverClass: "hover:border-sky-400 hover:shadow-[0_18px_36px_rgba(14,165,233,0.18)]",
    textHoverClass: "group-hover:text-sky-700"
  },
  {
    name: "数论",
    note: "整除、倍数、余数",
    href: "/modules/number-theory",
    cardClass: "border-indigo-200 bg-[linear-gradient(135deg,#EEF2FF_0%,#FFFFFF_58%,#DBEAFE_100%)]",
    hoverClass: "hover:border-indigo-400 hover:shadow-[0_18px_36px_rgba(79,70,229,0.18)]",
    textHoverClass: "group-hover:text-indigo-700"
  },
  {
    name: "几何",
    note: "面积、周长、图形变换",
    href: "/modules/geometry",
    cardClass: "border-emerald-200 bg-[linear-gradient(135deg,#F0FDFA_0%,#FFFFFF_58%,#D1FAE5_100%)]",
    hoverClass: "hover:border-emerald-400 hover:shadow-[0_18px_36px_rgba(16,185,129,0.18)]",
    textHoverClass: "group-hover:text-emerald-700"
  },
  {
    name: "应用题",
    note: "行程、工程、综合应用",
    href: "/modules/word-problems",
    cardClass: "border-orange-200 bg-[linear-gradient(135deg,#FFF7ED_0%,#FFFFFF_58%,#FED7AA_100%)]",
    hoverClass: "hover:border-orange-400 hover:shadow-[0_18px_36px_rgba(249,115,22,0.18)]",
    textHoverClass: "group-hover:text-orange-700"
  },
  {
    name: "数列",
    note: "规律、递推、周期",
    href: "/modules/sequence",
    cardClass: "border-violet-200 bg-[linear-gradient(135deg,#FAF5FF_0%,#FFFFFF_58%,#E9D5FF_100%)]",
    hoverClass: "hover:border-violet-400 hover:shadow-[0_18px_36px_rgba(168,85,247,0.18)]",
    textHoverClass: "group-hover:text-violet-700"
  },
  {
    name: "逻辑",
    note: "推理、分类、条件分析",
    href: "/modules/logic",
    cardClass: "border-pink-200 bg-[linear-gradient(135deg,#FDF2F8_0%,#FFFFFF_58%,#FCE7F3_100%)]",
    hoverClass: "hover:border-pink-400 hover:shadow-[0_18px_36px_rgba(236,72,153,0.18)]",
    textHoverClass: "group-hover:text-pink-700"
  },
  {
    name: "组合",
    note: "计数、排列、搭配",
    href: "/modules/combinatorics",
    cardClass: "border-lime-200 bg-[linear-gradient(135deg,#F7FEE7_0%,#FFFFFF_58%,#D9F99D_100%)]",
    hoverClass: "hover:border-lime-400 hover:shadow-[0_18px_36px_rgba(132,204,22,0.18)]",
    textHoverClass: "group-hover:text-lime-700"
  }
] as const;

export function HomeExperiencePage({
  previewLabel,
  previewNote,
  footerText = "启智小学奥数学习平台"
}: HomeExperiencePageProps) {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <GlobalSiteNav />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-8 px-5 py-10 text-center sm:px-8 lg:px-[10%] xl:px-0">
          <div className="flex flex-col items-center justify-center">
            <h1 className="max-w-[760px] text-[36px] font-extrabold leading-tight tracking-normal text-slate-950 sm:text-[48px]">
              启智小学奥数逻辑思维
            </h1>

            <p className="mt-4 max-w-[640px] text-[17px] leading-8 text-slate-600">
              191 个知识点，覆盖 1-6 年级的例题拆解、专项训练和学习记录。
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/grades/3" className="rounded-[8px] bg-[#165DFF] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(22,93,255,0.22)] transition hover:bg-[#0E4FCC]">
                开始学习
              </Link>
              <Link href="/me" className="rounded-[8px] border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-[#165DFF] hover:text-[#165DFF]">
                继续上次学习
              </Link>
              <Link href="#modules" className="rounded-[8px] border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-[#165DFF] hover:text-[#165DFF]">
                按模块浏览
              </Link>
            </div>
          </div>

          <div className="w-full max-w-3xl rounded-[12px] border border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-slate-700 sm:text-base">
              <span className="whitespace-nowrap font-medium text-slate-900">6 个年级</span>
              <span className="text-slate-400">|</span>
              <span className="whitespace-nowrap font-medium text-slate-900">7 个模块</span>
              <span className="text-slate-400">|</span>
              <span className="whitespace-nowrap font-medium text-slate-900">57 个专题</span>
              <span className="text-slate-400">|</span>
              <span className="whitespace-nowrap font-medium text-slate-900">191 个知识点</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1200px] px-5 py-10 sm:px-8 lg:px-[10%] xl:px-0">
        <section>
          <div className="mb-5 text-center">
            <h2 className="text-[24px] font-bold text-slate-950">按年级学习</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {GRADE_CARDS.map((grade) => (
              <Link
                key={grade.label}
                href={grade.href}
                className={`group rounded-[8px] border p-4 text-center shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 sm:p-5 ${grade.cardClass} ${grade.hoverClass}`}
              >
                <div className={`mx-auto text-[48px] font-medium leading-none tracking-tight sm:text-[56px] ${grade.indexClass}`}>{grade.index}</div>
                <h3 className={`mt-3 text-xs font-normal text-slate-950 transition sm:mt-4 sm:text-sm ${grade.labelClass}`}>
                  {grade.label} · {grade.count}
                </h3>
              </Link>
            ))}
          </div>
        </section>

        <section id="modules" className="mt-12">
          <div className="mb-5 text-center">
            <h2 className="text-[24px] font-bold text-slate-950">按模块学习</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {MODULE_CARDS.map((module) => (
              <Link
                key={module.name}
                href={module.href}
                className={`group rounded-[8px] border p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 sm:p-5 ${module.cardClass} ${module.hoverClass}`}
              >
                <h3 className={`text-sm font-bold text-slate-950 transition sm:text-lg ${module.textHoverClass}`}>{module.name}</h3>
                <p className="mt-3 text-xs leading-5 text-slate-600 sm:mt-4 sm:text-sm sm:leading-6">{module.note}</p>
              </Link>
            ))}
          </div>
        </section>

        <footer className="mt-10 border-t border-slate-200 py-6 text-center text-sm text-slate-500">
          {footerText}
          {previewLabel ? <span className="ml-2">{previewLabel}</span> : null}
          {previewNote ? <span className="ml-2">{previewNote}</span> : null}
        </footer>
      </div>
    </main>
  );
}
