import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Styles
import "./styles/index.css";
// App
import App from "./app/App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
