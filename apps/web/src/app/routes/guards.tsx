import { Navigate, Outlet, useLocation } from "react-router-dom";
// Components
import { LoadingSpinner } from "@/components";
// Contexts & Hooks
import { useAuth } from "@/contexts/auth";
// Pages
import NotFoundPage from "@/pages/404/NotFoundPage";

interface FromState {
  from?: { pathname: string };
}

function Splash() {
  return (
    <div className="page loading">
      <LoadingSpinner />
    </div>
  );
}

export function ProtectedRoute() {
  const { authLoading, isApprovedUser } = useAuth();
  const location = useLocation();

  if (authLoading) return <Splash />;
  if (!isApprovedUser)
    return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

export function AdminRoute() {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <NotFoundPage />;
}

export function GuestRoute() {
  const { authLoading, isApprovedUser } = useAuth();
  const location = useLocation();
  const from = (location.state as FromState | null)?.from?.pathname ?? "/";

  if (authLoading) return <Splash />;
  if (isApprovedUser) return <Navigate to={from} replace />;
  return <Outlet />;
}
