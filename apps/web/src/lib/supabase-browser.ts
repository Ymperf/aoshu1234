"use client";

import { createClient, type SupabaseClient, type Session, type User } from "@supabase/supabase-js";
import type { AuthSession, UserProfile } from "@shared-types/content";

let browserClient: SupabaseClient | null = null;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) {
    return browserClient;
  }

  if (!SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured");
  }

  if (!SUPABASE_ANON_KEY) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured");
  }

  browserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  return browserClient;
}

export function mapSupabaseUserToProfile(user: User): UserProfile {
  const metadata = user.user_metadata ?? {};
  const displayName = typeof metadata.display_name === "string" && metadata.display_name.trim() ? metadata.display_name.trim() : user.email ?? "用户";
  const role = metadata.role === "admin" ? "admin" : "learner";

  return {
    id: user.id,
    email: user.email ?? "",
    displayName,
    role,
    createdAt: user.created_at ?? new Date().toISOString(),
    lastActiveAt: user.updated_at ?? user.last_sign_in_at ?? user.created_at ?? new Date().toISOString()
  };
}

export function mapSupabaseSessionToAuthSession(session: Session): AuthSession {
  return {
    token: session.access_token,
    expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : new Date(Date.now() + 3600 * 1000).toISOString(),
    user: mapSupabaseUserToProfile(session.user)
  };
}
