import Link from "next/link";
import { GlobalSiteAccountEntry } from "@/components/global-site-account-entry";

export function GlobalSiteNav() {
  return (
    <header className="border-b border-[#E5E7EB] bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-3 px-4 py-3 sm:px-8 lg:px-[10%] xl:px-0">
        <Link href="/" className="flex shrink-0 items-center gap-2 whitespace-nowrap text-[#333333]">
          <div className="flex h-8 items-center justify-center rounded-[10px] border border-[#165DFF] px-2.5 text-[12px] font-semibold text-[#165DFF] sm:h-9 sm:px-3 sm:text-sm">
            启智小学奥数
          </div>
        </Link>

        <div className="shrink-0">
          <GlobalSiteAccountEntry />
        </div>
      </div>
    </header>
  );
}
