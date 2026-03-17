import "./App.css";

import { ChartWorkspace } from "./components/chartWorkspace";
import { useEffect, useState } from "react";
import { Modal } from "./components/UILibrary/Modal";
import { AuthForm } from "./components/signupForm";
import { UserMenu } from "./components/userMenu";
import { Sidebar } from "./components/sidebar";
import type { ThemeName } from "./components/themeSwitcher";
import { AuthProvider } from "./context/AuthContext";
import logo from "./assets/logo.svg";

function App() {
  const [charts, setCharts] = useState<
    Array<{
      id: number;
      instanceId: string;
      type: string;
      initialPosition?: { x: number; y: number };
    }>
  >([]);

  const addChart = (
    chartType: string,
    initialPosition?: { x: number; y: number },
  ) => {
    setCharts((prev) => [
      ...prev,
      {
        id: Date.now(),
        instanceId: `chart-${Date.now()}-${Math.random()}`,
        type: chartType,
        initialPosition,
      },
    ]);
  };
  const removeChart = (id: number) => {
    setCharts((prev) => prev.filter((c) => c.id !== id));
  };
  const [authModal, setAuthModal] = useState<"signup" | "signin" | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>("rose-wine");
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [pendingMobileChartType, setPendingMobileChartType] = useState<
    string | null
  >(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", selectedTheme);
  }, [selectedTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const syncPointerType = () => {
      const isMobile = mediaQuery.matches;
      setIsCoarsePointer(isMobile);
      if (!isMobile) {
        setPendingMobileChartType(null);
      }
    };

    syncPointerType();
    mediaQuery.addEventListener("change", syncPointerType);
    return () => mediaQuery.removeEventListener("change", syncPointerType);
  }, []);

  return (
    <AuthProvider>
      <div className="grid grid-rows-[auto_1fr] grid-cols-[64px_1fr] h-screen gap-0 bg-theme-bg">
        {/* Header */}
        <header className="col-span-2 shadow-lg bg-theme-strong text-theme-bg">
          <div className="px-6 py-4 flex items-center justify-between relative">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <img
                src={logo}
                alt="smart-charts logo"
                className="h-13.5 w-13.5"
              />
              <span>smart charts</span>
            </h1>
            <div className="right-6 top-4">
              <UserMenu
                openAuthModal={setAuthModal}
                selectedTheme={selectedTheme}
                setSelectedTheme={setSelectedTheme}
              />
            </div>
          </div>
        </header>
        {authModal && (
          <Modal isOpen={!!authModal} onClose={() => setAuthModal(null)}>
            <AuthForm
              initialMode={authModal}
              onSuccess={() => setAuthModal(null)}
            />
          </Modal>
        )}

        {/* Sidebar */}
        <aside className="shadow-md overflow-y-auto bg-theme-accent text-theme-bg">
          <nav className="p-4">
            <Sidebar
              isMobileMode={isCoarsePointer}
              pendingMobileChartType={pendingMobileChartType}
              onSelectMobileChartType={setPendingMobileChartType}
            />
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="overflow-y-auto p-2 bg-theme-surface">
          <ChartWorkspace
            charts={charts}
            addChart={addChart}
            removeChart={removeChart}
            isMobileMode={isCoarsePointer}
            pendingMobileChartType={pendingMobileChartType}
            onPlaceMobileChartType={(type, position) => {
              addChart(type, position);
              setPendingMobileChartType(null);
            }}
            onCancelMobileChartPlacement={() => setPendingMobileChartType(null)}
          />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
