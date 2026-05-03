"use client";

import type { KnowledgePointLessonMediaManifest } from "@/lib/knowledge-point-lesson";

interface KnowledgePointLessonMediaProps {
  media: KnowledgePointLessonMediaManifest | null;
  fallbackPoster: string;
}

export function KnowledgePointLessonMedia({ media, fallbackPoster }: KnowledgePointLessonMediaProps) {
  const hasPlayableVideo = Boolean(media?.videoUrl) && media?.isConsistent !== false;

  return (
    <section className="grid gap-3">
      {media?.isConsistent === false ? (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-900">
          当前视频素材与最新讲解稿不同步，旧媒体已被拦截展示。请重新生成音频、时序和视频后再播放。
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[24px] border border-line/60 bg-slate-100">
        {hasPlayableVideo ? (
          <video controls preload="metadata" poster={media?.posterUrl ?? fallbackPoster} className="block w-full bg-slate-100" src={media?.videoUrl} />
        ) : (
          <div className="grid aspect-video place-items-center bg-[linear-gradient(135deg,#F5F9FF,#E6F0FF)] px-8 text-center text-sm leading-7 text-slate-500">
            {media?.isConsistent === false ? "视频资源待同步更新" : "视频资源暂未生成"}
          </div>
        )}
      </div>
    </section>
  );
}
