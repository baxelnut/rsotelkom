import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Styles
import "@/styles/index.css";
// Contexts
import { AuthProvider } from "@/contexts/auth";
import { ThemeProvider } from "@/contexts/theme";
import { LayoutProvider } from "@/contexts/layout";
// App
import App from "@/app/App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <LayoutProvider>
          <App />
        </LayoutProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
);
