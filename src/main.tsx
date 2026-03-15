import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/noto-sans/index.css";
import "./index.css";
import App from "./App.tsx";
import { registerThemes } from "./assets/themes/registerThemes";

registerThemes();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
