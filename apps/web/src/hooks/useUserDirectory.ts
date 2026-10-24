import { useMemo, useState } from "react";
import type { ManagedUser, Role } from "@rso/shared";
// Hooks
import { useAdminUsers } from "./useAdminUsers";
// Data
import { ROLE_LABEL, ROLE_TONE, USER_TABS, type UserTab } from "@/data/users";
// Utils
import { formatDateTime } from "@/utils/format";

const PAGE_SIZE = 10;
const ROLE_ORDER: Record<Role, number> = { pending: 0, admin: 1, user: 2 };

export type UserRow = {
  id: string;
  user: ManagedUser;
  name: string;
  email: string;
  role: Role;
  roleLabel: string;
  roleTone: string;
  statusLabel: string;
  statusTone: string;
  isActive: boolean;
  isPending: boolean;
  isSelf: boolean;
  telegramId: string;
  lastLogin: string;
  created: string;
};

function toRow(user: ManagedUser, meId?: string): UserRow {
  const isPending = user.role === "pending";

  return {
    id: user.id,
    user,
    name: user.full_name?.trim() || "Unnamed",
    email: user.email,
    role: user.role,
    roleLabel: ROLE_LABEL[user.role],
    roleTone: ROLE_TONE[user.role],
    statusLabel: isPending ? "" : user.is_active ? "Active" : "Inactive",
    statusTone: user.is_active ? "safe" : "secondary",
    isActive: user.is_active,
    isPending,
    isSelf: user.id === meId,
    telegramId:
      user.telegram_id !== null ? String(user.telegram_id) : "Not set",
    lastLogin: user.last_login ? formatDateTime(user.last_login) : "Never",
    created: formatDateTime(user.created_at),
  };
}

export function useUserDirectory(meId?: string) {
  const query = useAdminUsers();
  const [tab, setTabState] = useState<UserTab>("all");
  const [search, setSearchState] = useState("");
  const [page, setPage] = useState(0);

  const users = useMemo(() => query.data ?? [], [query.data]);

  const counts = useMemo(() => {
    const next: Record<UserTab, number> = {
      all: users.length,
      pending: 0,
      user: 0,
      admin: 0,
    };
    for (const u of users) next[u.role] += 1;
    return next;
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = users.filter(
      (u) =>
        (tab === "all" || u.role === tab) &&
        (!q ||
          (u.full_name ?? "").toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)),
    );
    return tab === "all"
      ? list.sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role])
      : list;
  }, [users, tab, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);

  const rows = useMemo(
    () =>
      filtered
        .slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)
        .map((u) => toRow(u, meId)),
    [filtered, currentPage, meId],
  );

  const tabs = USER_TABS.map(({ value, label }) => ({
    value,
    label,
    count: counts[value],
    alert: value === "pending" && counts.pending > 0,
  }));

  const activeTab = USER_TABS.find((t) => t.value === tab) ?? USER_TABS[0];
  const searching = search.trim() !== "";

  const setTab = (next: UserTab) => {
    setTabState(next);
    setPage(0);
  };

  const setSearch = (value: string) => {
    setSearchState(value);
    setPage(0);
  };

  return {
    tab,
    setTab,
    search,
    setSearch,
    tabs,
    total: filtered.length,
    rows,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    retry: () => void query.refetch(),
    emptyTitle: searching ? "No results" : activeTab.emptyTitle,
    emptyMessage: searching
      ? "No user matches your search."
      : activeTab.emptyMessage,
    pagination: {
      page: currentPage,
      pageSize: PAGE_SIZE,
      total: filtered.length,
      onPageChange: setPage,
    },
  };
}

export type UserDirectoryApi = ReturnType<typeof useUserDirectory>;
