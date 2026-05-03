import Link from "next/link";
import { UserLearningSummary } from "@/components/user-learning-summary";

export const dynamic = "force-dynamic";

export default function LearningCenterPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 lg:px-[10%] xl:px-0">
        <header className="grid gap-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Link href="/" className="text-sm font-medium text-[#165DFF] transition-colors hover:text-[#0E42D2]">
                返回首页
              </Link>
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#165DFF]">Learning Center</p>
              <h1 className="mt-3 text-[34px] font-bold tracking-tight text-[#0F172A]">学习中心</h1>
              <p className="mt-2 text-sm leading-7 text-[#64748B]">查看继续学习、最近学习和专题进度。</p>
            </div>
          </div>
        </header>

        <section className="mt-8">
          <UserLearningSummary />
        </section>
      </div>
    </main>
  );
}
