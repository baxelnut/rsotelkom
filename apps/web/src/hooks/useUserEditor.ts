import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { Role, UpdateUserInput } from "@rso/shared";
import type { CreateUserInput, ManagedUser } from "@rso/shared";
// Hooks
import { useCreateUser, useUpdateUser } from "./useAdminUsers";
// Data
import { ROLE_OPTIONS_CREATE, ROLE_OPTIONS_EDIT } from "@/data/users";

type Mode = { kind: "create" } | { kind: "edit"; user: ManagedUser };

interface Form {
  email: string;
  password: string;
  fullName: string;
  role: Role;
  telegramId: string;
}

type FormErrors = Partial<Record<keyof Form, string>>;

interface Options {
  meId?: string;
  onSaved: (message: string) => void;
}

const EMPTY: Form = {
  email: "",
  password: "",
  fullName: "",
  role: "user",
  telegramId: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIGITS_PATTERN = /^\d+$/;

function validate(form: Form, mode: Mode): FormErrors {
  const errors: FormErrors = {};
  const name = form.fullName.trim();
  const telegram = form.telegramId.trim();

  if (mode.kind === "create") {
    if (!EMAIL_PATTERN.test(form.email.trim())) {
      errors.email = "Masukkan alamat email yang valid.";
    }
    if (form.password.length < 8 || form.password.length > 72) {
      errors.password = "Kata sandi harus terdiri dari 8 hingga 72 karakter.";
    }
    if (!name) errors.fullName = "Name is required.";
  } else if (!name && (mode.user.full_name ?? "")) {
    errors.fullName = "Nama tidak boleh kosong.";
  }

  if (telegram && (!DIGITS_PATTERN.test(telegram) || Number(telegram) <= 0)) {
    errors.telegramId = "ID Telegram harus berupa angka positif.";
  }
  return errors;
}

export function useUserEditor({ meId, onSaved }: Options) {
  const create = useCreateUser();
  const update = useUpdateUser();
  const [mode, setMode] = useState<Mode | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pending = create.isPending || update.isPending;
  const isCreate = mode?.kind === "create";
  const roleLocked = mode?.kind === "edit" && mode.user.id === meId;

  const reset = (next: Form, nextMode: Mode) => {
    setForm(next);
    setMode(nextMode);
    setSubmitted(false);
    setError(null);
  };

  const openCreate = () => reset(EMPTY, { kind: "create" });

  const openEdit = (user: ManagedUser) =>
    reset(
      {
        email: user.email,
        password: "",
        fullName: user.full_name ?? "",
        role: user.role,
        telegramId: user.telegram_id !== null ? String(user.telegram_id) : "",
      },
      { kind: "edit", user },
    );

  const close = () => {
    if (!pending) setMode(null);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mode || pending) return;

    setSubmitted(true);
    if (Object.keys(validate(form, mode)).length > 0) return;

    setError(null);
    const name = form.fullName.trim();
    const raw = form.telegramId.trim();
    const telegram = raw ? Number(raw) : null;

    try {
      if (mode.kind === "create") {
        const input: CreateUserInput = {
          email: form.email.trim(),
          password: form.password,
          fullName: name,
          role: form.role,
        };
        if (telegram !== null) input.telegramId = telegram;
        await create.mutateAsync(input);
        onSaved(`${name} created.`);
      } else {
        const { user } = mode;
        const input: UpdateUserInput = {};
        if (name && name !== (user.full_name ?? "")) input.fullName = name;
        if (!roleLocked && form.role !== user.role) input.role = form.role;
        if (telegram !== user.telegram_id) input.telegramId = telegram;

        if (Object.keys(input).length > 0) {
          await update.mutateAsync({ id: user.id, input });
          onSaved(`${name || user.email} updated.`);
        }
      }
      setMode(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Tidak dapat menyimpan perubahan.",
      );
    }
  };

  return {
    isOpen: mode !== null,
    isCreate,
    title: isCreate ? "Tambah user" : "Edit user",
    submitText: isCreate ? "Buat user" : "Simpan user",
    values: form,
    errors: submitted && mode ? validate(form, mode) : ({} as FormErrors),
    error,
    pending,
    roleLocked,
    roleOptions: isCreate ? ROLE_OPTIONS_CREATE : ROLE_OPTIONS_EDIT,
    openCreate,
    openEdit,
    close,
    onChange,
    submit,
  };
}

export type UserEditorApi = ReturnType<typeof useUserEditor>;
