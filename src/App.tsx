import "./App.css";

import { ChartWorkspace } from "./components/chartWorkspace";
import { useEffect, useState } from "react";
import { Modal } from "./components/UILibrary/Modal";
import { AuthForm } from "./components/signupForm";
import { UserMenu } from "./components/userMenu";
import { Sidebar } from "./components/sidebar";
import { AuthProvider } from "./context/AuthContext";
import logo from "./assets/logo.svg";
import { AboutDialog } from "./components/aboutDialog";

function App() {
  const [charts, setCharts] = useState<
    Array<{
      id: number;
      instanceId: string;
      type: string;
      initialPosition?: { x: number; y: number };
    }>
  >([]);

  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);

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
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [pendingMobileChartType, setPendingMobileChartType] = useState<
    string | null
  >(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const syncPointerType = () => {
      const isMobile = mediaQuery.matches;
      setIsCoarsePointer(isMobile);
      if (!isMobile) {
        setPendingMobileChartType(null);
        setHeaderMenuOpen(false);
      }
    };

    syncPointerType();
    mediaQuery.addEventListener("change", syncPointerType);
    return () => mediaQuery.removeEventListener("change", syncPointerType);
  }, []);

  return (
    <AuthProvider>
      <div className="grid h-screen grid-cols-[64px_1fr] grid-rows-[auto_1fr] gap-0 bg-background text-foreground">
        {/* Header */}
        <header className="col-span-2 shadow-lg bg-zinc-950 text-zinc-100">
          <div className="px-6 py-4 flex items-center justify-between relative">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <img
                src={logo}
                alt="smart-charts logo"
                className="h-13.5 w-13.5 cursor-pointer"
                onClick={() => window.location.reload()}
              />
              <span>Chart Studio</span>
            </h1>
            {isCoarsePointer ? (
              <div className="relative">
                <button
                  type="button"
                  aria-label={headerMenuOpen ? "Close menu" : "Open menu"}
                  onClick={() => setHeaderMenuOpen((v) => !v)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-xl font-medium text-zinc-100 ring-1 ring-inset ring-zinc-700 shadow-sm transition hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
                >
                  {headerMenuOpen ? "✕" : "☰"}
                </button>
                {headerMenuOpen && (
                  <div className="absolute right-0 top-full z-[10002] mt-2 min-w-52 rounded-xl bg-zinc-900 p-1 ring-1 ring-zinc-700 shadow-lg backdrop-blur">
                    <UserMenu
                      openAuthModal={(mode) => {
                        setAuthModal(mode);
                        setHeaderMenuOpen(false);
                      }}
                      stacked
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="right-6 top-4">
                <UserMenu openAuthModal={setAuthModal} />
              </div>
            )}
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

        {aboutDialogOpen && (
          <AboutDialog
            isOpen={aboutDialogOpen}
            onClose={() => setAboutDialogOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className="shadow-md bg-zinc-900 text-zinc-100 h-full row-span-2 flex flex-col">
          <nav className="flex-1 flex flex-col p-2 h-full">
            <Sidebar
              isMobileMode={isCoarsePointer}
              setAboutOpen={setAboutDialogOpen}
              pendingMobileChartType={pendingMobileChartType}
              onSelectMobileChartType={setPendingMobileChartType}
            />
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="overflow-y-auto bg-background p-2 text-foreground">
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
