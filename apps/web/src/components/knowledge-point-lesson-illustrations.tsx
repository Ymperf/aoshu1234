"use client";

import type { KnowledgePointLessonIllustration } from "@/lib/knowledge-point-lesson";

interface KnowledgePointLessonIllustrationsProps {
  items: KnowledgePointLessonIllustration[];
}

export function KnowledgePointLessonIllustrations({ items }: KnowledgePointLessonIllustrationsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <figure key={item.id} className="overflow-hidden rounded-[20px] border border-[#D9E7FF] bg-white p-3">
          {item.kind === "inline_svg" && item.svgContent ? (
            <div
              className="[&_svg]:h-auto [&_svg]:w-full [&_svg]:bg-white [&_svg_text]:[font-family:Segoe_UI,PingFang_SC,Microsoft_YaHei,sans-serif] [&_svg_line]:stroke-[1.2] [&_svg_path]:stroke-[1.2] [&_svg_rect]:stroke-[1.2] [&_svg_circle]:stroke-[1.2] [&_svg_ellipse]:stroke-[1.2]"
              aria-label={item.alt}
              dangerouslySetInnerHTML={{ __html: item.svgContent }}
            />
          ) : item.assetPath ? (
            <img src={item.assetPath} alt={item.alt} className="w-full bg-white" />
          ) : null}
        </figure>
      ))}
    </div>
  );
}
