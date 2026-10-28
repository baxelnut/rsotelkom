export type UserRole = "admin" | "user" | "pending";

export interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  telegram_id: number | string | null; // bigint column
  image_url: string | null;
  role: UserRole | null;
}

/** App-facing profile (camelCase) */
export interface Profile {
  id: string;
  email: string;
  fullName: string;
  telegramId: string;
  imageUrl: string | null;
  role: UserRole | null;
}

/** Row shape of the Supabase `profiles` table (snake_case) */
export interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  telegram_id: number | string | null; // bigint column
  image_url: string | null;
  role: UserRole | null;
}

export type ProfileUpdate = Partial<Pick<Profile, "fullName" | "telegramId">>;

export interface ActionResult {
  error: string | null;
}

/** Why a signed-in user was bounced back to the login screen */
export type AuthNotice = "pending-approval" | "profile-error" | null;
