import { useCallback, useEffect, useState } from "react";
// Hooks
import { useNotice } from "./useNotice";
// Contexts
import { useAuth } from "@/contexts/auth";

const COOLDOWN_SECONDS = 60;

export function usePasswordReset() {
  const { profile, resetPassword } = useAuth();
  const { notice, success, failure, clear } = useNotice();
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const email = profile?.email ?? "";

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const send = useCallback(async () => {
    setPending(true);
    clear();
    const { error } = await resetPassword();
    setPending(false);

    if (error) {
      failure(error);
      return;
    }
    success(`Reset email sent to ${email}.`);
    setCooldown(COOLDOWN_SECONDS);
  }, [clear, email, failure, resetPassword, success]);

  return { email, pending, cooldown, notice, send };
}

export type PasswordResetApi = ReturnType<typeof usePasswordReset>;
