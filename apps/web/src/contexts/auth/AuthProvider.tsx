import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
// Config
import { api } from "@/config/api";
import { supabase } from "@/config/supabase";
// Context
import { AuthContext, type AuthContextValue } from "./AuthContext";
// Types
import type { ActionResult, AuthNotice, Profile } from "@/types/auth";
import type { ProfileRow, ProfileUpdate } from "@/types/auth";
import type { ApiResponse, AuthUser } from "@rso/shared";

const PROFILE_COLUMNS = "id, email, full_name, telegram_id, role";

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email ?? "",
    fullName: row.full_name ?? "",
    telegramId: row.telegram_id != null ? String(row.telegram_id) : "",
    imageUrl: null,
    role: row.role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initialised, setInitialised] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<AuthNotice>(null);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setInitialised(true);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(PROFILE_COLUMNS)
        .eq("id", userId)
        .maybeSingle<ProfileRow>();

      if (cancelled) return;

      const approved =
        !error && !!data && (data.role === "admin" || data.role === "user");

      if (!approved) {
        setAuthNotice(error || !data ? "profile-error" : "pending-approval");
        setProfile(null);
        setLoadedFor(userId);
        await supabase.auth.signOut();
        return;
      }

      setAuthNotice(null);
      setProfile(toProfile(data));
      setLoadedFor(userId);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const activeProfile =
    userId !== null && loadedFor === userId ? profile : null;

  const updateProfile = useCallback(
    async (patch: ProfileUpdate): Promise<ActionResult> => {
      if (!userId) return { error: "You are not signed in." };

      const body: { fullName?: string; telegramId?: number | null } = {};
      if (patch.fullName !== undefined) body.fullName = patch.fullName.trim();
      if (patch.telegramId !== undefined) {
        const raw = patch.telegramId.trim();
        const parsed = raw === "" ? null : Number(raw);
        if (parsed !== null && !Number.isInteger(parsed)) {
          return { error: "Telegram ID must be a number." };
        }
        body.telegramId = parsed;
      }

      try {
        const { data } = await api<ApiResponse<AuthUser>>("/auth/me", {
          method: "PATCH",
          body,
        });
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                fullName: data?.fullName ?? "",
                telegramId: data?.telegramId?.toString() ?? "",
              }
            : prev,
        );
        return { error: null };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Update failed.",
        };
      }
    },
    [userId],
  );

  const resetPassword = useCallback(async (): Promise<ActionResult> => {
    const email = session?.user.email;
    if (!email) return { error: "No email found for this account." };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message ?? null };
  }, [session]);

  const signOut = useCallback(async (): Promise<ActionResult> => {
    const { error } = await supabase.auth.signOut();
    return { error: error?.message ?? null };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const role = activeProfile?.role ?? null;

    return {
      session,
      user: session?.user ?? null,
      profile: activeProfile,
      role,
      isAdmin: role === "admin",
      isApprovedUser: role === "admin" || role === "user",
      authLoading: !initialised || (userId !== null && loadedFor !== userId),
      authNotice,
      updateProfile,
      resetPassword,
      signOut,
    };
  }, [
    session,
    activeProfile,
    initialised,
    userId,
    loadedFor,
    authNotice,
    updateProfile,
    resetPassword,
    signOut,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
