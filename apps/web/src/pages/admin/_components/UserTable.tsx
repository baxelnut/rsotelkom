// Style
import "./UserTable.css";
// Components
import { DataTable, type TableColumn } from "@/components";
import { UserActions, UserBadges, UserIdentity } from ".";
import type { UserListProps } from "./types";
// Hooks
import type { UserRow } from "@/hooks";

export function UserTable({
  rows,
  isLoading,
  error,
  retry,
  pagination,
  emptyTitle,
  emptyMessage,
  handlers,
}: UserListProps) {
  const columns: TableColumn<UserRow>[] = [
    {
      key: "name",
      label: "User",
      render: (_, row) => <UserIdentity row={row} />,
    },
    {
      key: "role",
      label: "Access",
      render: (_, row) => <UserBadges row={row} />,
    },
    { key: "telegramId", label: "Telegram ID" },
    { key: "lastLogin", label: "Last login" },
    { key: "created", label: "Joined" },
    {
      key: "id",
      label: "Actions",
      align: "end",
      render: (_, row) => <UserActions row={row} handlers={handlers} />,
    },
  ];

  return (
    <DataTable
      data={rows}
      columns={columns}
      isLoading={isLoading}
      error={error}
      onRetry={retry}
      pagination={pagination}
      getRowKey={(row) => row.id}
      loadingLabel="Loading users..."
      emptyTitle={emptyTitle}
      emptyMessage={emptyMessage}
    />
  );
}
