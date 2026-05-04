"use client";

import React from "react";
import { LearningAccountEntry } from "@/components/learning-account-entry";

function AccountEntryFallback() {
  return (
    <div className="flex justify-end" data-account-entry-state="fallback">
      <button
        type="button"
        className="inline-flex items-center gap-3 whitespace-nowrap rounded-full border border-line bg-white/90 px-4 py-3 text-sm font-semibold text-slate-800 shadow-card backdrop-blur transition hover:border-primary hover:text-primary"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">璐︽埛鍏ュ彛</span>
        <span>鐧诲綍 / 娉ㄥ唽</span>
      </button>
    </div>
  );
}

class AccountEntryErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return <AccountEntryFallback />;
    }

    return this.props.children;
  }
}

export function GlobalSiteAccountEntry() {
  return (
    <AccountEntryErrorBoundary>
      <LearningAccountEntry />
    </AccountEntryErrorBoundary>
  );
}
