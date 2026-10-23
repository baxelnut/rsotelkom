import { Outlet } from "react-router-dom";
// Layout
import { AppLayout } from "@/components/layout";
// Pages
import LoginPage from "@/pages/auth/LoginPage";
import OverviewPage from "@/pages/overview/OverviewPage";
import ReportPageA from "@/pages/report/ReportPageA";
import ReportPageG from "@/pages/report/ReportPageG";
import ActionBasedPage from "@/pages/action/ActionBasedPage";
import AdminPage from "@/pages/admin/AdminPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import NotFoundPage from "@/pages/404/NotFoundPage";

export const appRoutes = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: "report/aosodomoro", element: <ReportPageA /> },
      { path: "report/galaksi", element: <ReportPageG /> },
      { path: "action", element: <ActionBasedPage /> },
      { path: "admin", element: <AdminPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  {
    element: <Outlet />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
