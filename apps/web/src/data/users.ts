import type { Role } from "@rso/shared";

export type UserTab = Role | "all";

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  user: "User",
  pending: "Pending",
};

/** Badge tone class from styles/cards.css ("" = neutral) */
export const ROLE_TONE: Record<Role, string> = {
  admin: "primary",
  user: "",
  pending: "danger",
};

export const ROLE_OPTIONS_CREATE = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
];

export const ROLE_OPTIONS_EDIT = [
  ...ROLE_OPTIONS_CREATE,
  { value: "pending", label: "Pending (revokes access)" },
];

export const USER_TABS: {
  value: UserTab;
  label: string;
  emptyTitle: string;
  emptyMessage: string;
}[] = [
  {
    value: "all",
    label: "All",
    emptyTitle: "No users yet",
    emptyMessage: "Add a user to get started.",
  },
  {
    value: "pending",
    label: "Pending",
    emptyTitle: "No pending approvals",
    emptyMessage: "New sign-ups will appear here for approval.",
  },
  {
    value: "user",
    label: "Users",
    emptyTitle: "No users found",
    emptyMessage: "Approved users will appear here.",
  },
  {
    value: "admin",
    label: "Admins",
    emptyTitle: "No admins found",
    emptyMessage: "",
  },
];
