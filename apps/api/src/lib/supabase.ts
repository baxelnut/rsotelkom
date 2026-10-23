import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";

const authOptions = { persistSession: false, autoRefreshToken: false };

// Bypasses RLS. Server-side jobs and trusted operations only.
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: authOptions },
);

// Acts as the logged-in user, so RLS applies.
export const supabaseForUser = (accessToken: string) =>
  createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: authOptions,
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
