// Guards
import { AdminRoute, GuestRoute, ProtectedRoute } from "@/app/routes/guards";
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
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";

export const appRoutes = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <OverviewPage /> },
          { path: "report/aosodomoro", element: <ReportPageA /> },
          { path: "report/galaksi", element: <ReportPageG /> },
          { path: "action", element: <ActionBasedPage /> },
          { path: "settings", element: <SettingsPage /> },
          {
            element: <AdminRoute />,
            children: [{ path: "admin", element: <AdminPage /> }],
          },
        ],
      },
    ],
  },
  {
    element: <GuestRoute />,
    children: [{ path: "login", element: <LoginPage /> }],
  },
  { path: "reset-password", element: <ResetPasswordPage /> },
  { path: "*", element: <NotFoundPage /> },
];
