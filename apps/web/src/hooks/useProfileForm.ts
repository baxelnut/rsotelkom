import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
// Contexts & Hooks
import { useNotice } from "./useNotice";
import { useAuth } from "@/contexts/auth";

type Field = "fullName" | "telegramId";
type Draft = Partial<Record<Field, string>>;

const FIELDS: Field[] = ["fullName", "telegramId"];
const TELEGRAM_PATTERN = /^\d+$/;

export function useProfileForm() {
  const { profile, updateProfile } = useAuth();
  const { notice, success, failure, clear } = useNotice();
  const [draft, setDraft] = useState<Draft>({});
  const [pending, setPending] = useState(false);

  const saved = {
    fullName: String(profile?.fullName ?? ""),
    telegramId: String(profile?.telegramId ?? ""),
  };
  const values = {
    fullName: draft.fullName ?? saved.fullName,
    telegramId: draft.telegramId ?? saved.telegramId,
  };

  const changes: Draft = {};
  for (const field of FIELDS) {
    if (values[field].trim() !== saved[field]) changes[field] = values[field];
  }
  const isDirty = Object.keys(changes).length > 0;

  const errors: Draft = {};
  if (changes.fullName !== undefined && !changes.fullName.trim()) {
    errors.fullName = "Name can't be empty.";
  }
  if (changes.telegramId !== undefined) {
    const raw = changes.telegramId.trim();
    if (raw && (!TELEGRAM_PATTERN.test(raw) || Number(raw) <= 0)) {
      errors.telegramId = "Telegram ID must be a positive number.";
    }
  }

  const canSubmit = isDirty && !pending && Object.keys(errors).length === 0;

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
    clear();
  };

  const reset = () => {
    setDraft({});
    clear();
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setPending(true);
    clear();
    const { error } = await updateProfile(changes);
    setPending(false);

    if (error) {
      failure(error);
      return;
    }
    setDraft({});
    success("Profile updated.");
  };

  return {
    values,
    errors,
    email: profile?.email ?? "",
    isDirty,
    canSubmit,
    pending,
    notice,
    onChange,
    submit,
    reset,
  };
}

export type ProfileFormApi = ReturnType<typeof useProfileForm>;
