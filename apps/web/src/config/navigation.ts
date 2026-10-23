import type { IconsType } from "@/types/icons";

export interface NavChild {
  label: string;
  path: string;
}

interface NavBase {
  label: string;
  icon: IconsType;
  adminOnly?: boolean; /** Hidden from non-admins */
}

export interface NavLeaf extends NavBase {
  path: string;
  children?: never;
}

export interface NavGroup extends NavBase {
  children: NavChild[];
  path?: never;
}

export type NavItem = NavLeaf | NavGroup;

export function isNavGroup(item: NavItem): item is NavGroup {
  return Array.isArray(item.children) && item.children.length > 0;
}

/** Paths must match apps/web/src/app/routes/AppRoutes.tsx */
export const SIDEBAR_MENUS: NavItem[] = [
  {
    label: "Overview",
    path: "/",
    icon: "gridFill",
  },
  {
    label: "Reports",
    icon: "graphUp",
    children: [
      { label: "AOSODOMORO", path: "/report/aosodomoro" },
      { label: "GALAKSI", path: "/report/galaksi" },
    ],
  },
  {
    label: "Action Based",
    path: "/action",
    icon: "handClick",
  },
  {
    label: "Admin Panel",
    path: "/admin-panel",
    icon: "peopleFill",
    adminOnly: true,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: "gearFill",
  },
];

/** Header title for a pathname: sidebar label, else extra title, else app name */
export function getPageTitle(pathname: string): string {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  for (const item of SIDEBAR_MENUS) {
    if (isNavGroup(item)) {
      const child = item.children.find((c) => c.path === path);
      if (child) return `${item.label} │ ${child.label}`;
    } else if (item.path === path) {
      return item.label;
    }
  }
  return "Dashboard";
}
