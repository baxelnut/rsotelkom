import { throwIfError } from "../../lib/db";
import { AppError } from "../../lib/errors";
import { supabaseAdmin } from "../../lib/supabase";
import { invalidateProfile, type Role } from "../auth/auth.service";

const PROFILE_COLUMNS =
  "id,email,full_name,role,telegram_id,is_active,created_at";

export interface CreateUserInput {
  email: string;
  password: string;
  fullName?: string;
  role: Role;
  telegramId?: number;
}

export interface UpdateUserInput {
  fullName?: string;
  role?: Role;
  isActive?: boolean;
  telegramId?: number | null;
}

export async function listUsers(role?: Role) {
  let query = supabaseAdmin.from("profiles").select(PROFILE_COLUMNS);
  if (role) query = query.eq("role", role);

  const [{ data: profiles, error }, authList] = await Promise.all([
    query,
    supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);
  throwIfError(error, "users list");
  if (authList.error)
    throw new Error(`auth users list: ${authList.error.message}`);

  const lastSeen = new Map(
    authList.data.users.map((u) => [
      u.id,
      u.last_sign_in_at ?? u.created_at ?? null,
    ]),
  );

  return (profiles ?? [])
    .map((p) => ({ ...p, last_login: lastSeen.get(p.id) ?? null }))
    .sort((a, b) =>
      (a.full_name ?? "").localeCompare(b.full_name ?? "", undefined, {
        sensitivity: "base",
      }),
    );
}

export async function createUser(input: CreateUserInput) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
  });
  if (error || !data.user) {
    throw new AppError(
      400,
      error?.message ?? "Could not create user",
      "CREATE_USER_FAILED",
    );
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({
      role: input.role,
      full_name: input.fullName ?? null,
      telegram_id: input.telegramId ?? null,
    })
    .eq("id", data.user.id)
    .select(PROFILE_COLUMNS)
    .single();
  throwIfError(profileError, "profile update");
  return profile;
}

export async function updateUser(
  id: string,
  actorId: string,
  input: UpdateUserInput,
) {
  if (
    id === actorId &&
    ((input.role !== undefined && input.role !== "admin") ||
      input.isActive === false)
  ) {
    throw AppError.forbidden("You cannot demote or deactivate yourself");
  }

  if (input.isActive !== undefined) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
      ban_duration: input.isActive ? "none" : "876000h",
    });
    if (error) throw new AppError(400, error.message, "UPDATE_USER_FAILED");
  }

  const patch: Record<string, unknown> = {};
  if (input.fullName !== undefined) patch.full_name = input.fullName;
  if (input.role !== undefined) patch.role = input.role;
  if (input.isActive !== undefined) patch.is_active = input.isActive;
  if (input.telegramId !== undefined) patch.telegram_id = input.telegramId;

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update(patch)
    .eq("id", id)
    .select(PROFILE_COLUMNS)
    .maybeSingle();

  if (error?.code === "23505") {
    throw new AppError(
      409,
      "Telegram ID is already linked to another user",
      "TELEGRAM_TAKEN",
    );
  }
  throwIfError(error, "profile update");
  if (!data) throw AppError.notFound("User not found");

  invalidateProfile(id);
  return data;
}

export async function deleteUser(id: string, actorId: string) {
  if (id === actorId) throw AppError.forbidden("You cannot delete yourself");

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) {
    if (error.status === 404) throw AppError.notFound("User not found");
    throw new AppError(400, error.message, "DELETE_USER_FAILED");
  }
  invalidateProfile(id);
}
