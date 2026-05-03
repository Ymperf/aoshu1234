import type { AuthSession } from "@shared-types/content";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, mapSupabaseSessionToAuthSession } from "@/lib/supabase-browser";

export const SESSION_STORAGE_KEY = "math-olympiad-user-session";
export const SESSION_EVENT_NAME = "math-olympiad-session-change";

let bootstrapStarted = false;

function isBrowser() {
  return typeof window !== "undefined";
}

function syncStoredSession(session: Session | null) {
  if (!isBrowser()) {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    emitSessionChange();
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(mapSupabaseSessionToAuthSession(session)));
  emitSessionChange();
}

async function bootstrapSessionCache() {
  if (!isBrowser() || bootstrapStarted) {
    return;
  }

  bootstrapStarted = true;
  const supabase = getSupabaseBrowserClient();

  const { data } = await supabase.auth.getSession();
  syncStoredSession(data.session);

  supabase.auth.onAuthStateChange((_event, session) => {
    syncStoredSession(session);
  });
}

void bootstrapSessionCache();

export function readStoredSession(): AuthSession | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthSession;

    if (!parsed?.token || !parsed?.expiresAt || !parsed?.user) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function emitSessionChange() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(SESSION_EVENT_NAME));
}

export function writeStoredSession(session: AuthSession) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  emitSessionChange();
}

export function clearStoredSession() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  emitSessionChange();
}

export function subscribeSessionChange(callback: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  window.addEventListener(SESSION_EVENT_NAME, callback);

  return () => {
    window.removeEventListener(SESSION_EVENT_NAME, callback);
  };
}
