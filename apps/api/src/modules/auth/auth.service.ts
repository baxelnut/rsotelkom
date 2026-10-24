import { throwIfError } from "../../lib/db";
import { AppError } from "../../lib/errors";
import { supabaseAdmin } from "../../lib/supabase";

export type Role = "admin" | "user" | "pending";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
  telegramId: number | null;
}

const CACHE_MS = 30_000;
const cache = new Map<string, { user: AuthUser; expires: number }>();

export function invalidateProfile(id: string) {
  cache.delete(id);
}

export async function authenticate(token: string): Promise<AuthUser> {
  const { data, error } = await supabaseAdmin.auth.getClaims(token);
  const id = data?.claims?.sub;
  if (error || !id) throw AppError.unauthorized("Invalid or expired token");

  const cached = cache.get(id);
  if (cached && cached.expires > Date.now()) return cached.user;

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id,email,full_name,role,telegram_id,is_active")
    .eq("id", id)
    .maybeSingle();
  throwIfError(profileError, "profile lookup");

  if (!profile) throw AppError.forbidden("No profile for this account");
  if (!profile.is_active) throw AppError.forbidden("Account is deactivated");

  const user: AuthUser = {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    telegramId: profile.telegram_id,
  };
  cache.set(id, { user, expires: Date.now() + CACHE_MS });
  return user;
}
