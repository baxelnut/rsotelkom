import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Routes
import { appRoutes } from ".";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    element: <Outlet />,
    children: [...appRoutes],
  },
]);

export function AppRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
