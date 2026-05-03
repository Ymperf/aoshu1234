"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { AuthSession } from "@shared-types/content";
import { clearStoredSession, readStoredSession, subscribeSessionChange, writeStoredSession } from "@/lib/auth-session";
import { getSupabaseBrowserClient, mapSupabaseSessionToAuthSession } from "@/lib/supabase-browser";

export function LearningAccountEntry() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const syncSession = () => setSession(readStoredSession());
    syncSession();
    return subscribeSessionChange(syncSession);
  }, []);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  async function handleSubmit() {
    if (!email.trim() || !password.trim() || (mode === "register" && !displayName.trim())) {
      setError("请先填写完整的账号信息。");
      return;
    }

    setIsBusy(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const trimmedEmail = email.trim();

      if (mode === "register") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              display_name: displayName.trim(),
              role: "learner"
            }
          }
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data.session) {
          const nextSession = mapSupabaseSessionToAuthSession(data.session);
          writeStoredSession(nextSession);
          setSession(nextSession);
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password
        });

        if (signInError) {
          throw signInError;
        }

        if (data.session) {
          const nextSession = mapSupabaseSessionToAuthSession(data.session);
          writeStoredSession(nextSession);
          setSession(nextSession);
        }
      }

      setPassword("");
      setIsOpen(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : mode === "register" ? "注册失败，请稍后重试。" : "登录失败，请稍后重试。");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut().catch(() => undefined);
    clearStoredSession();
    setSession(null);
    setIsOpen(false);
  }

  if (session) {
    return (
      <div ref={containerRef} className="relative w-full max-w-sm">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="inline-flex items-center gap-3 rounded-full border border-line bg-white/90 px-4 py-3 text-sm font-semibold text-slate-800 shadow-card backdrop-blur transition hover:border-primary hover:text-primary"
          >
            <span className="max-w-[132px] truncate">{session.user.displayName}</span>
            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-sm text-slate-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} aria-hidden="true">
              ▾
            </span>
          </button>
        </div>

        {isOpen ? (
          <div className="absolute right-0 top-[calc(100%+12px)] z-20 w-[min(100vw-48px,320px)] rounded-[24px] border border-line bg-white p-5 shadow-panel">
            <div className="border-b border-[#E5E7EB] pb-4">
              <p className="text-sm font-semibold text-slate-900">{session.user.displayName}</p>
              <p className="mt-1 text-sm text-slate-500">{session.user.email}</p>
            </div>

            <div className="mt-4 grid gap-3">
              <Link
                href="/me"
                onClick={() => setIsOpen(false)}
                className="rounded-2xl border border-line bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary"
              >
                学习中心
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary"
              >
                退出登录
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex items-center gap-3 rounded-full border border-line bg-white/90 px-4 py-3 text-sm font-semibold text-slate-800 shadow-card backdrop-blur transition hover:border-primary hover:text-primary"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">账户入口</span>
          <span>{isOpen ? "收起" : "登录 / 注册"}</span>
        </button>
      </div>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+12px)] z-20 w-[min(100vw-48px,360px)] rounded-[28px] border border-line bg-white p-5 shadow-panel">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">学习账户</p>
            <strong className="mt-2 block text-2xl font-semibold text-slate-950">登录后同步学习进度和练习记录</strong>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === "login" ? "bg-primary text-white" : "border border-line bg-white text-slate-700 hover:border-primary hover:text-primary"}`}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === "register" ? "bg-primary text-white" : "border border-line bg-white text-slate-700 hover:border-primary hover:text-primary"}`}
            >
              注册
            </button>
          </div>

          <div className="mt-5 grid gap-3">
            {mode === "register" ? (
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="昵称"
                className="rounded-2xl border border-line px-4 py-3 text-sm outline-none transition focus:border-primary"
              />
            ) : null}
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="邮箱"
              className="rounded-2xl border border-line px-4 py-3 text-sm outline-none transition focus:border-primary"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="密码"
              className="rounded-2xl border border-line px-4 py-3 text-sm outline-none transition focus:border-primary"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isBusy}
              className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-70"
            >
              {mode === "register" ? "创建账号" : "登录"}
            </button>

            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
