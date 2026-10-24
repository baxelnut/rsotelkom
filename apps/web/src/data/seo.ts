export const SITE_NAME = "Telkom";

export interface SeoEntry {
  title: string;
  description: string;
}

export const SEO = {
  overview: {
    title: "Dashboard Overview",
    description:
      "High-level overview of order performance, revenue and operational summaries across witels.",
  },
  aosodomoro: {
    title: "AOSODOMORO Report",
    description:
      "Regional 3 order aging report by witel and category, split by under and over two months.",
  },
  galaksi: {
    title: "GALAKSI Report",
    description:
      "In-process orders older than 60 days, grouped by sub-type and PIC.",
  },
  action: {
    title: "Action Based",
    description:
      "Update order status and notes for orders that need follow-up action.",
  },
  admin: {
    title: "Admin Panel",
    description: "Approve, create and manage dashboard users and roles.",
  },
  settings: {
    title: "Settings",
    description: "Manage your profile, notifications and data sync.",
  },
  login: {
    title: "Login",
    description:
      "Secure login portal for authorized Telkom Indonesia personnel.",
  },
  notFound: {
    title: "Page Not Found",
    description: "The page you are looking for does not exist.",
  },
} as const satisfies Record<string, SeoEntry>;

export type SeoKey = keyof typeof SEO;
