import Link from "next/link";
import { GlobalSiteAccountEntry } from "@/components/global-site-account-entry";

export function GlobalSiteNav() {
  return (
    <header className="border-b border-[#E5E7EB] bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-5 py-4 sm:px-8 lg:px-[10%] xl:px-0 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-3 text-[#333333]">
          <div className="flex h-9 items-center justify-center whitespace-nowrap rounded-[10px] border border-[#165DFF] px-3 text-sm font-semibold text-[#165DFF]">
            启智小学奥数
          </div>
        </Link>

        <div className="w-full max-w-sm">
          <GlobalSiteAccountEntry />
        </div>
      </div>
    </header>
  );
}
