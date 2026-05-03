import Link from "next/link";
import { getCatalogOverview, getGrades } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const GRADE_NOTES: Record<number, string> = {
  1: "建立数感与基础图形",
  2: "练习分类、枚举与基础应用",
  3: "进入逻辑推理和典型模型",
  4: "强化专题方法与综合题",
  5: "提升抽象建模能力",
  6: "面向小升初综合训练"
};

const GRADE_ACCENTS: Record<number, string> = {
  1: "border-sky-200 bg-sky-50 text-sky-700",
  2: "border-teal-200 bg-teal-50 text-teal-700",
  3: "border-emerald-200 bg-emerald-50 text-emerald-700",
  4: "border-amber-200 bg-amber-50 text-amber-700",
  5: "border-violet-200 bg-violet-50 text-violet-700",
  6: "border-rose-200 bg-rose-50 text-rose-700"
};

const MODULES = [
  {
    slug: "calculation",
    name: "计算",
    note: "速算巧算、运算律、分数小数",
    accent: "border-sky-200 bg-sky-50 text-sky-700",
    mark: "算"
  },
  {
    slug: "number-theory",
    name: "数论",
    note: "整除、余数、质数、因倍数",
    accent: "border-indigo-200 bg-indigo-50 text-indigo-700",
    mark: "数"
  },
  {
    slug: "geometry",
    name: "几何",
    note: "周长面积、角度、图形分割",
    accent: "border-emerald-200 bg-emerald-50 text-emerald-700",
    mark: "形"
  },
  {
    slug: "word-problems",
    name: "应用题",
    note: "和差倍、行程、工程、盈亏",
    accent: "border-orange-200 bg-orange-50 text-orange-700",
    mark: "用"
  },
  {
    slug: "sequence",
    name: "数列",
    note: "找规律、周期、等差与递推",
    accent: "border-violet-200 bg-violet-50 text-violet-700",
    mark: "列"
  },
  {
    slug: "logic",
    name: "逻辑",
    note: "真假话、数独、条件推理",
    accent: "border-pink-200 bg-pink-50 text-pink-700",
    mark: "推"
  },
  {
    slug: "combinatorics",
    name: "组合",
    note: "计数、排列组合、抽屉原理",
    accent: "border-lime-200 bg-lime-50 text-lime-700",
    mark: "组"
  }
] as const;

const PATH_STEPS = ["选年级", "进专题", "学知识点", "拆例题", "做练习"];

function formatCount(value: number | undefined) {
  return typeof value === "number" ? value.toLocaleString("zh-CN") : "-";
}

export default async function HomePreviewPage() {
  const [grades, overview] = await Promise.all([getGrades(), getCatalogOverview()]);
  const gradeCards = grades.slice(0, 6).sort((left, right) => left.id - right.id);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-[1200px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-[10%] xl:px-0">
          <div className="flex flex-col justify-center">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">首页方案 B 预览</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">学习导航首页</span>
            </div>
            <h1 className="max-w-[760px] text-[36px] font-extrabold leading-tight tracking-normal text-slate-950 sm:text-[44px]">
              启智小学奥数逻辑思维
            </h1>
            <p className="mt-4 max-w-[620px] text-[17px] leading-8 text-slate-600">
              191知识点详解 · 例题拆解 · 专项练习。按年级建立学习路径，按专题快速进入核心方法。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/grades/3" className="rounded-[8px] bg-[#165DFF] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(22,93,255,0.22)] transition hover:bg-[#0E4FCC]">
                从三年级开始
              </Link>
              <Link href="/modules/logic" className="rounded-[8px] border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-[#165DFF] hover:text-[#165DFF]">
                查看逻辑专题
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[8px] border border-slate-200 bg-[#F8FAFC] p-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-[8px] bg-white p-4">
                  <p className="text-2xl font-bold text-slate-950">{formatCount(overview.gradeCount)}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">年级</p>
                </div>
                <div className="rounded-[8px] bg-white p-4">
                  <p className="text-2xl font-bold text-slate-950">{formatCount(overview.topicCount)}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">专题</p>
                </div>
                <div className="rounded-[8px] bg-white p-4">
                  <p className="text-2xl font-bold text-slate-950">{formatCount(overview.knowledgePointCount)}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">知识点</p>
                </div>
              </div>
            </div>

            <div className="rounded-[8px] border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-950">学习路径</h2>
                  <p className="mt-1 text-sm text-slate-500">从目录入口到专项练习，路径更明确。</p>
                </div>
                <span className="rounded-[8px] bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">5步完成</span>
              </div>
              <div className="mt-5 grid grid-cols-5 gap-2">
                {PATH_STEPS.map((step, index) => (
                  <div key={step} className="rounded-[8px] border border-slate-200 bg-slate-50 px-2 py-3 text-center">
                    <p className="text-[11px] font-semibold text-slate-400">0{index + 1}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1200px] px-5 py-10 sm:px-8 lg:px-[10%] xl:px-0">
        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-[24px] font-bold text-slate-950">按年级学习</h2>
              <p className="mt-1 text-sm text-slate-500">选择孩子当前阶段，进入对应知识地图。</p>
            </div>
            <Link href="/grades/3" className="text-sm font-semibold text-[#165DFF] hover:text-[#0E4FCC]">
              推荐从三年级逻辑开始
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gradeCards.map((grade) => {
              const accent = GRADE_ACCENTS[grade.id] ?? GRADE_ACCENTS[1];
              return (
                <Link key={grade.id} href={`/grades/${grade.id}`} className="group rounded-[8px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-[#165DFF] hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-950 group-hover:text-[#165DFF]">{grade.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{GRADE_NOTES[grade.id] ?? grade.intro}</p>
                    </div>
                    <span className={`rounded-[8px] border px-3 py-2 text-sm font-bold ${accent}`}>{grade.id}</span>
                  </div>
                  <div className="mt-5 flex gap-2 text-xs font-semibold text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">{formatCount(grade.topicCount)} 个专题</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">{formatCount(grade.freeTopicCount)} 个开放</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5">
            <h2 className="text-[24px] font-bold text-slate-950">按专题学习</h2>
            <p className="mt-1 text-sm text-slate-500">适合有明确薄弱项时，直接进入对应方法体系。</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MODULES.map((module) => (
              <Link key={module.slug} href={`/modules/${module.slug}`} className="group rounded-[8px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-[#165DFF] hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]">
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-[8px] border text-sm font-bold ${module.accent}`}>{module.mark}</span>
                  <h3 className="text-lg font-bold text-slate-950 group-hover:text-[#165DFF]">{module.name}</h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-500">{module.note}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-[8px] border border-slate-200 bg-white p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-950">推荐体验路径</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">先从“三年级 · 逻辑 · 简单数独入门”体验完整知识点详解、例题拆解和专项练习。</p>
            </div>
            <Link href="/grades/3/modules/logic/topics/30401/knowledge-points/3040103" className="rounded-[8px] bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800">
              查看示例知识点
            </Link>
          </div>
        </section>

        <footer className="mt-10 border-t border-slate-200 py-6 text-center text-sm text-slate-500">预览页，不影响正式首页</footer>
      </div>
    </main>
  );
}
