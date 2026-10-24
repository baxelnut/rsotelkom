import type { UserDirectoryApi, UserRow } from "@/hooks";

export interface UserRowHandlers {
  busyId: string | null;
  onApprove: (row: UserRow) => void;
  onDecline: (row: UserRow) => void;
  onEdit: (row: UserRow) => void;
  onToggleActive: (row: UserRow) => void;
  onDelete: (row: UserRow) => void;
}

export type UserListProps = Pick<
  UserDirectoryApi,
  | "rows"
  | "isLoading"
  | "error"
  | "retry"
  | "pagination"
  | "emptyTitle"
  | "emptyMessage"
> & { handlers: UserRowHandlers };
