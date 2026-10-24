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

export interface UpdateOwnProfileInput {
  fullName?: string;
  telegramId?: number | null;
}

interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  telegram_id: number | null;
}

const CACHE_MS = 30_000;
const cache = new Map<string, { user: AuthUser; expires: number }>();

const toAuthUser = (p: ProfileRow): AuthUser => ({
  id: p.id,
  email: p.email,
  fullName: p.full_name,
  role: p.role,
  telegramId: p.telegram_id,
});

const titleCase = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

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

  const user = toAuthUser(profile as ProfileRow);
  cache.set(id, { user, expires: Date.now() + CACHE_MS });
  return user;
}

export async function updateOwnProfile(
  id: string,
  input: UpdateOwnProfileInput,
): Promise<AuthUser> {
  const patch: Record<string, unknown> = {};
  if (input.fullName !== undefined) patch.full_name = titleCase(input.fullName);
  if (input.telegramId !== undefined) patch.telegram_id = input.telegramId;

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update(patch)
    .eq("id", id)
    .select("id,email,full_name,role,telegram_id")
    .single();

  if (error?.code === "23505") {
    throw new AppError(
      409,
      "Telegram ID is already linked to another user",
      "TELEGRAM_TAKEN",
    );
  }
  throwIfError(error, "profile update");
  if (!data) throw AppError.notFound("Profile not found");

  invalidateProfile(id);
  return toAuthUser(data as ProfileRow);
}
