import { useState } from "react";
import type { ManagedUser } from "@rso/shared";
// Hooks
import { useDeleteUser, useUpdateUser, useNotice } from ".";

export type ConfirmKind = "decline" | "delete" | "deactivate";

interface ConfirmState {
  kind: ConfirmKind;
  user: ManagedUser;
}

const COPY: Record<
  ConfirmKind,
  { title: string; confirmText: string; message: (name: string) => string }
> = {
  decline: {
    title: "Decline sign-up",
    confirmText: "Decline",
    message: (name) =>
      `${name} will be removed and would have to sign up again.`,
  },
  delete: {
    title: "Delete user",
    confirmText: "Delete",
    message: (name) => `Permanently delete ${name}? This cannot be undone.`,
  },
  deactivate: {
    title: "Deactivate user",
    confirmText: "Deactivate",
    message: (name) =>
      `${name} will be blocked from signing in. You can reactivate them later.`,
  },
};

const displayName = (user: ManagedUser) => user.full_name?.trim() || user.email;

export function useUserActions(meId?: string) {
  const update = useUpdateUser();
  const remove = useDeleteUser();
  const { notice, success, failure, clear } = useNotice();
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const run = async (
    id: string,
    task: () => Promise<unknown>,
    message: string,
  ) => {
    setBusyId(id);
    clear();
    try {
      await task();
      success(message);
    } catch (error) {
      failure(error instanceof Error ? error.message : "Gagal memuat data.");
    } finally {
      setBusyId(null);
    }
  };

  const approve = (user: ManagedUser) =>
    run(
      user.id,
      () => update.mutateAsync({ id: user.id, input: { role: "user" } }),
      `${displayName(user)} approved.`,
    );

  const activate = (user: ManagedUser) =>
    run(
      user.id,
      () => update.mutateAsync({ id: user.id, input: { isActive: true } }),
      `${displayName(user)} reactivated.`,
    );

  const request = (kind: ConfirmKind, user: ManagedUser) => {
    if (user.id === meId) return;
    clear();
    setConfirm({ kind, user });
  };

  const cancelConfirm = () => {
    if (busyId === null) setConfirm(null);
  };

  const confirmAction = async () => {
    if (!confirm) return;
    const { kind, user } = confirm;
    const name = displayName(user);

    if (kind === "deactivate") {
      await run(
        user.id,
        () => update.mutateAsync({ id: user.id, input: { isActive: false } }),
        `${name} deactivated.`,
      );
    } else {
      await run(
        user.id,
        () => remove.mutateAsync(user.id),
        kind === "decline" ? `${name} declined.` : `${name} deleted.`,
      );
    }
    setConfirm(null);
  };

  const dialog = confirm
    ? {
        title: COPY[confirm.kind].title,
        confirmText: COPY[confirm.kind].confirmText,
        message: COPY[confirm.kind].message(displayName(confirm.user)),
      }
    : null;

  return {
    notice,
    announce: success,
    busyId,
    isBusy: busyId !== null,
    dialog,
    approve,
    activate,
    request,
    confirmAction,
    cancelConfirm,
  };
}

export type UserActionsApi = ReturnType<typeof useUserActions>;
