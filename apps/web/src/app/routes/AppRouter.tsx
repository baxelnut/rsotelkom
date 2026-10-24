import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Routes
import { appRoutes } from "./AppRoutes";

const queryClient = new QueryClient();

const router = createBrowserRouter(appRoutes);

export function AppRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
