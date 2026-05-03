import { getModuleByName } from "@/lib/site-navigation";

export interface ModuleCardTheme {
  sectionSurfaceClass: string;
  sectionBorderClass: string;
  sectionHoverClass: string;
  primaryPillClass: string;
  secondaryPillClass: string;
  itemSurfaceClass: string;
  itemBorderClass: string;
  itemHoverClass: string;
  itemTitleHoverClass: string;
  accentDotClass: string;
  accentLineClass: string;
}

const DEFAULT_THEME: ModuleCardTheme = {
  sectionSurfaceClass: "bg-[linear-gradient(135deg,#F8FAFC_0%,#FFFFFF_60%,#EEF2F7_100%)]",
  sectionBorderClass: "border-slate-200/90",
  sectionHoverClass: "hover:border-slate-300 hover:shadow-[0_18px_32px_rgba(15,23,42,0.08)]",
  primaryPillClass: "border-slate-200 bg-white/85 text-slate-700",
  secondaryPillClass: "border-slate-200 bg-slate-50/90 text-slate-600",
  itemSurfaceClass: "bg-[linear-gradient(135deg,#FAFBFC_0%,#FFFFFF_60%,#F3F6F8_100%)]",
  itemBorderClass: "border-slate-200/90",
  itemHoverClass: "hover:border-slate-300 hover:shadow-[0_20px_36px_rgba(15,23,42,0.08)]",
  itemTitleHoverClass: "group-hover:text-slate-800",
  accentDotClass: "bg-slate-500/80",
  accentLineClass: "bg-slate-200"
};

const MODULE_THEMES: Record<string, ModuleCardTheme> = {
  calculation: {
    sectionSurfaceClass: "bg-[linear-gradient(135deg,#F0F9FF_0%,#FFFFFF_60%,#E0F2FE_100%)]",
    sectionBorderClass: "border-sky-200/90",
    sectionHoverClass: "hover:border-sky-300/90 hover:shadow-[0_18px_32px_rgba(14,165,233,0.12)]",
    primaryPillClass: "border-sky-200/80 bg-white/85 text-sky-700",
    secondaryPillClass: "border-sky-100 bg-sky-50/90 text-sky-700",
    itemSurfaceClass: "bg-[linear-gradient(135deg,#F8FCFF_0%,#FFFFFF_60%,#EAF6FF_100%)]",
    itemBorderClass: "border-sky-100/90",
    itemHoverClass: "hover:border-sky-400/90 hover:shadow-[0_20px_36px_rgba(14,165,233,0.18)]",
    itemTitleHoverClass: "group-hover:text-sky-700",
    accentDotClass: "bg-sky-500/80",
    accentLineClass: "bg-sky-200"
  },
  "number-theory": {
    sectionSurfaceClass: "bg-[linear-gradient(135deg,#EEF2FF_0%,#FFFFFF_60%,#DBEAFE_100%)]",
    sectionBorderClass: "border-indigo-200/90",
    sectionHoverClass: "hover:border-indigo-300/90 hover:shadow-[0_18px_32px_rgba(79,70,229,0.12)]",
    primaryPillClass: "border-indigo-200/80 bg-white/85 text-indigo-700",
    secondaryPillClass: "border-indigo-100 bg-indigo-50/90 text-indigo-700",
    itemSurfaceClass: "bg-[linear-gradient(135deg,#F7F8FF_0%,#FFFFFF_60%,#EEF2FF_100%)]",
    itemBorderClass: "border-indigo-100/90",
    itemHoverClass: "hover:border-indigo-400/90 hover:shadow-[0_20px_36px_rgba(79,70,229,0.18)]",
    itemTitleHoverClass: "group-hover:text-indigo-700",
    accentDotClass: "bg-indigo-500/80",
    accentLineClass: "bg-indigo-200"
  },
  geometry: {
    sectionSurfaceClass: "bg-[linear-gradient(135deg,#F0FDFA_0%,#FFFFFF_60%,#D1FAE5_100%)]",
    sectionBorderClass: "border-emerald-200/90",
    sectionHoverClass: "hover:border-emerald-300/90 hover:shadow-[0_18px_32px_rgba(16,185,129,0.12)]",
    primaryPillClass: "border-emerald-200/80 bg-white/85 text-emerald-700",
    secondaryPillClass: "border-emerald-100 bg-emerald-50/90 text-emerald-700",
    itemSurfaceClass: "bg-[linear-gradient(135deg,#F7FEFB_0%,#FFFFFF_60%,#E7FBF1_100%)]",
    itemBorderClass: "border-emerald-100/90",
    itemHoverClass: "hover:border-emerald-400/90 hover:shadow-[0_20px_36px_rgba(16,185,129,0.18)]",
    itemTitleHoverClass: "group-hover:text-emerald-700",
    accentDotClass: "bg-emerald-500/80",
    accentLineClass: "bg-emerald-200"
  },
  "word-problems": {
    sectionSurfaceClass: "bg-[linear-gradient(135deg,#FFF7ED_0%,#FFFFFF_60%,#FED7AA_100%)]",
    sectionBorderClass: "border-orange-200/90",
    sectionHoverClass: "hover:border-orange-300/90 hover:shadow-[0_18px_32px_rgba(249,115,22,0.12)]",
    primaryPillClass: "border-orange-200/80 bg-white/85 text-orange-700",
    secondaryPillClass: "border-orange-100 bg-orange-50/90 text-orange-700",
    itemSurfaceClass: "bg-[linear-gradient(135deg,#FFF9F4_0%,#FFFFFF_60%,#FFF0DD_100%)]",
    itemBorderClass: "border-orange-100/90",
    itemHoverClass: "hover:border-orange-400/90 hover:shadow-[0_20px_36px_rgba(249,115,22,0.18)]",
    itemTitleHoverClass: "group-hover:text-orange-700",
    accentDotClass: "bg-orange-500/80",
    accentLineClass: "bg-orange-200"
  },
  sequence: {
    sectionSurfaceClass: "bg-[linear-gradient(135deg,#FAF5FF_0%,#FFFFFF_60%,#E9D5FF_100%)]",
    sectionBorderClass: "border-violet-200/90",
    sectionHoverClass: "hover:border-violet-300/90 hover:shadow-[0_18px_32px_rgba(168,85,247,0.12)]",
    primaryPillClass: "border-violet-200/80 bg-white/85 text-violet-700",
    secondaryPillClass: "border-violet-100 bg-violet-50/90 text-violet-700",
    itemSurfaceClass: "bg-[linear-gradient(135deg,#FCF8FF_0%,#FFFFFF_60%,#F3E8FF_100%)]",
    itemBorderClass: "border-violet-100/90",
    itemHoverClass: "hover:border-violet-400/90 hover:shadow-[0_20px_36px_rgba(168,85,247,0.18)]",
    itemTitleHoverClass: "group-hover:text-violet-700",
    accentDotClass: "bg-violet-500/80",
    accentLineClass: "bg-violet-200"
  },
  logic: {
    sectionSurfaceClass: "bg-[linear-gradient(135deg,#FDF2F8_0%,#FFFFFF_60%,#FBCFE8_100%)]",
    sectionBorderClass: "border-pink-200/90",
    sectionHoverClass: "hover:border-pink-300/90 hover:shadow-[0_18px_32px_rgba(236,72,153,0.12)]",
    primaryPillClass: "border-pink-200/80 bg-white/85 text-pink-700",
    secondaryPillClass: "border-pink-100 bg-pink-50/90 text-pink-700",
    itemSurfaceClass: "bg-[linear-gradient(135deg,#FFF8FB_0%,#FFFFFF_60%,#FDE8F3_100%)]",
    itemBorderClass: "border-pink-100/90",
    itemHoverClass: "hover:border-pink-400/90 hover:shadow-[0_20px_36px_rgba(236,72,153,0.18)]",
    itemTitleHoverClass: "group-hover:text-pink-700",
    accentDotClass: "bg-pink-500/80",
    accentLineClass: "bg-pink-200"
  },
  combinatorics: {
    sectionSurfaceClass: "bg-[linear-gradient(135deg,#F7FEE7_0%,#FFFFFF_60%,#D9F99D_100%)]",
    sectionBorderClass: "border-lime-200/90",
    sectionHoverClass: "hover:border-lime-300/90 hover:shadow-[0_18px_32px_rgba(132,204,22,0.12)]",
    primaryPillClass: "border-lime-200/80 bg-white/85 text-lime-700",
    secondaryPillClass: "border-lime-100 bg-lime-50/90 text-lime-700",
    itemSurfaceClass: "bg-[linear-gradient(135deg,#FBFFF5_0%,#FFFFFF_60%,#ECFCCB_100%)]",
    itemBorderClass: "border-lime-100/90",
    itemHoverClass: "hover:border-lime-400/90 hover:shadow-[0_20px_36px_rgba(132,204,22,0.18)]",
    itemTitleHoverClass: "group-hover:text-lime-700",
    accentDotClass: "bg-lime-500/80",
    accentLineClass: "bg-lime-200"
  }
};

export function getModuleCardThemeBySlug(slug?: string | null): ModuleCardTheme {
  if (!slug) {
    return DEFAULT_THEME;
  }

  return MODULE_THEMES[slug] ?? DEFAULT_THEME;
}

export function getModuleCardThemeByName(name?: string | null): ModuleCardTheme {
  const moduleItem = getModuleByName(name ?? undefined);
  return getModuleCardThemeBySlug(moduleItem?.slug);
}
