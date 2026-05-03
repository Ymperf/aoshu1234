import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link href={item.href} className="transition hover:text-primary">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-slate-900" : undefined}>{item.label}</span>
            )}
            {!isLast ? <span className="text-slate-300">/</span> : null}
          </div>
        );
      })}
    </nav>
  );
}
