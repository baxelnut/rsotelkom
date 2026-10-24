import { useState, type FormEvent } from "react";
// Config
import { supabase } from "@/config/supabase";
// Contexts
import { useAuth } from "@/contexts/auth";
// Types
import type { AuthNotice } from "@/types/auth";

type LoginMode = "login" | "signup";

export interface LoginMessage {
  kind: "error" | "success" | "warning";
  text: string;
}

export interface LoginFields {
  fullName: string;
  telegramId: string;
  email: string;
  password: string;
}

const EMAIL_KEY = "rememberedEmail";

const EMPTY_FIELDS: LoginFields = {
  fullName: "",
  telegramId: "",
  email: "",
  password: "",
};

const NOTICES: Record<Exclude<AuthNotice, null>, LoginMessage> = {
  "pending-approval": {
    kind: "warning",
    text: "Your account is waiting for admin approval. You can sign in once it is approved.",
  },
  "profile-error": {
    kind: "error",
    text: "We could not load your profile. Please try again or contact an admin.",
  },
};

function readRememberedEmail() {
  try {
    return localStorage.getItem(EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeRememberedEmail(email: string | null) {
  try {
    if (email) localStorage.setItem(EMAIL_KEY, email);
    else localStorage.removeItem(EMAIL_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function useLoginForm() {
  const { authNotice } = useAuth();
  const [mode, setMode] = useState<LoginMode>("login");
  const [fields, setFields] = useState<LoginFields>(() => ({
    ...EMPTY_FIELDS,
    email: readRememberedEmail(),
  }));
  const [remember, setRemember] = useState(() => readRememberedEmail() !== "");
  const [message, setMessage] = useState<LoginMessage | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === "signup";

  const setField = (field: keyof LoginFields, value: string) =>
    setFields((prev) => ({ ...prev, [field]: value }));

  const toggleMode = () => {
    setMode(isSignup ? "login" : "signup");
    setMessage(null);
    setField("password", "");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const email = fields.email.trim();
    const { password } = fields;

    const { error } = isSignup
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fields.fullName.trim(),
              telegram_id: fields.telegramId.trim(),
            },
          },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) setMessage({ kind: "error", text: error.message });
    else writeRememberedEmail(remember ? email : null);

    setSubmitting(false);
  };

  const forgotPassword = async () => {
    const email = fields.email.trim();
    if (!email) {
      setMessage({ kind: "error", text: "Enter your email first." });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setMessage(
      error
        ? { kind: "error", text: error.message }
        : {
            kind: "success",
            text: "Password reset link sent. Check your inbox.",
          },
    );
  };

  return {
    isSignup,
    fields,
    setField,
    remember,
    setRemember,
    message: message ?? (authNotice ? NOTICES[authNotice] : null),
    submitting,
    submit,
    forgotPassword,
    toggleMode,
  };
}

export type LoginFormApi = ReturnType<typeof useLoginForm>;
