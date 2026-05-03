"use client";

import { useState } from "react";
import type { ChickenRabbitLessonPackage, ChickenRabbitMediaManifest } from "@/lib/chicken-rabbit-demo";
import { ChickenRabbitDemoQuiz } from "@/components/chicken-rabbit-demo-quiz";

interface ChickenRabbitDemoWorkspaceProps {
  lesson: ChickenRabbitLessonPackage;
  media: ChickenRabbitMediaManifest | null;
}

type TabId = "lesson" | "practice";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "lesson", label: "学习讲解" },
  { id: "practice", label: "开始练习" }
];

export function ChickenRabbitDemoWorkspace({ lesson, media }: ChickenRabbitDemoWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<TabId>("lesson");

  return (
    <section
      style={{
        display: "grid",
        gap: 20,
        padding: 24,
        borderRadius: 28,
        background: "#fff",
        border: "1px solid rgba(143, 122, 92, 0.16)"
      }}
    >
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 160,
                  padding: "12px 18px",
                  borderRadius: 18,
                  border: `1px solid ${isActive ? "rgba(217,107,39,0.28)" : "rgba(143,122,92,0.14)"}`,
                  background: isActive ? "linear-gradient(180deg, rgba(255,244,235,1), rgba(255,250,244,1))" : "#fff",
                  color: "#2f2a24",
                  cursor: "pointer"
                }}
              >
                <strong style={{ color: isActive ? "var(--accent)" : "#2f2a24", fontSize: 16 }}>{tab.label}</strong>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "lesson" ? (
        <div style={{ display: "grid", gap: 20 }}>
          <section
            style={{
              borderRadius: 26,
              overflow: "hidden",
              border: "1px solid rgba(143, 122, 92, 0.14)",
              background: "#120d09",
              boxShadow: "0 18px 40px rgba(0, 0, 0, 0.18)"
            }}
          >
            {media?.videoUrl ? (
              <video
                controls
                preload="metadata"
                poster={media.posterUrl}
                style={{ width: "100%", display: "block", background: "#000" }}
                src={media.videoUrl}
              />
            ) : (
              <div
                style={{
                  aspectRatio: "16 / 9",
                  display: "grid",
                  placeItems: "center",
                  color: "#fff"
                }}
              >
                视频资源暂未生成
              </div>
            )}
          </section>

          <article
            style={{
              padding: 22,
              borderRadius: 24,
              background: "#fff",
              border: "1px solid rgba(143,122,92,0.14)",
              display: "grid",
              gap: 18
            }}
          >
            <div style={{ display: "grid", gap: 8 }}>
              <p style={{ margin: 0, color: "var(--accent)", fontWeight: 800 }}>学习重点</p>
              <h2 style={{ margin: 0, fontSize: 26 }}>本节课核心内容</h2>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {lesson.keyTakeaways.map((item) => (
                <div key={item} style={{ display: "grid", gridTemplateColumns: "18px 1fr", gap: 10, lineHeight: 1.8, color: "#405044" }}>
                  <span style={{ color: "#3a8a68", fontWeight: 900 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div
              style={{
                height: 1,
                background: "rgba(143,122,92,0.12)"
              }}
            />

            <div style={{ display: "grid", gap: 8 }}>
              <p style={{ margin: 0, color: "var(--accent)", fontWeight: 800 }}>解题步骤</p>
              <h3 style={{ margin: 0, fontSize: 22 }}>跟着视频这样想</h3>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {lesson.scenes.map((scene, index) => (
                <div
                  key={scene.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px 1fr",
                    gap: 12,
                    padding: 12,
                    borderRadius: 16,
                    background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(255,250,244,1))",
                    border: "1px solid rgba(143,122,92,0.12)"
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "rgba(217,107,39,0.12)",
                      color: "var(--accent)",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 800
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ display: "grid", gap: 4 }}>
                    <strong>{scene.title}</strong>
                    <span style={{ color: "#62574b", lineHeight: 1.7 }}>{scene.caption}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      ) : (
        <ChickenRabbitDemoQuiz lesson={lesson} />
      )}
    </section>
  );
}
