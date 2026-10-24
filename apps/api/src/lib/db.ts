import type { PostgrestError } from "@supabase/supabase-js";

export function throwIfError(
  error: PostgrestError | null,
  context: string,
): void {
  if (error) throw new Error(`${context}: ${error.message}`);
}
