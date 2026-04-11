import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource/noto-sans/index.css";
import "./index.css";
import App from "./App.tsx";
import { registerThemes } from "./assets/themes/registerThemes";
import { ThemeProvider } from "./components/theme-provider";

registerThemes();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="theme-red" defaultMode="dark">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
