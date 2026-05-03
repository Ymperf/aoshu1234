type ErrorPageProps = {
  statusCode?: number;
};

function ErrorPage({ statusCode }: ErrorPageProps) {
  const title = statusCode === 404 ? "椤甸潰涓嶅瓨鍦?" : "搴旂敤鍑虹幇闂";

  return (
    <main className="min-h-screen bg-white px-6 py-16 text-[#333333]">
      <div className="mx-auto flex w-full max-w-[680px] flex-col items-start gap-4 rounded-[28px] border border-[#E5E7EB] bg-[linear-gradient(135deg,#F8FAFC_0%,#FFFFFF_52%,#EFF6FF_100%)] p-10 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#165DFF]">{statusCode ?? 500}</p>
        <h1 className="text-3xl font-semibold leading-tight text-[#0F172A]">{title}</h1>
        <p className="max-w-[46ch] text-base leading-7 text-[#475569]">
          {statusCode === 404
            ? "杩欎釜鍦板潃娌℃湁瀵瑰簲鍐呭銆傚彲浠ヨ繑鍥炴甯稿鑸〉閲嶆柊杩涘叆銆"
            : "璐熻浇椤甸潰鏃跺嚭鐜伴棶棰樸€傝杩斿洖棣栭〉鍐嶈瘯涓娿€?"}
        </p>
      </div>
    </main>
  );
}

ErrorPage.getInitialProps = ({ res, err }: { res?: { statusCode?: number }; err?: { statusCode?: number } }) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return { statusCode };
};

export default ErrorPage;
