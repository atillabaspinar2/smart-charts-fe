import "./App.css";

import { ChartWorkspace } from "./components/chartWorkspace";
import { useEffect, useState } from "react";
import { Modal } from "./components/Modal";
import { SignupForm } from "./components/signupForm";
import { UserMenu } from "./components/userMenu";
import { Sidebar } from "./components/sidebar";
import type { ThemeName } from "./components/themeSwitcher";

function App() {
  const [charts, setCharts] = useState<
    Array<{ id: number; instanceId: string; type: string }>
  >([]);

  const addChart = (chartType: string) => {
    setCharts((prev) => [
      ...prev,
      {
        id: Date.now(),
        instanceId: `chart-${Date.now()}-${Math.random()}`,
        type: chartType,
      },
    ]);
  };
  const removeChart = (id: number) => {
    setCharts((prev) => prev.filter((c) => c.id !== id));
  };
  const [signUpModal, setSignUpModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>("blue-slate");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", selectedTheme);
  }, [selectedTheme]);

  return (
    <div className="grid grid-rows-[auto_1fr] grid-cols-[64px_1fr] h-screen gap-0 bg-theme-bg">
      {/* Header */}
      <header className="col-span-2 shadow-lg bg-theme-strong text-theme-bg">
        <div className="px-6 py-4 flex items-center justify-between relative">
          <h1 className="text-3xl font-bold">Grapfio</h1>
          <div className=" right-6 top-4">
            <UserMenu
              setSingUpModal={setSignUpModal}
              selectedTheme={selectedTheme}
              setSelectedTheme={setSelectedTheme}
            />
          </div>
        </div>
      </header>
      {signUpModal && (
        <Modal isOpen={signUpModal} onClose={() => setSignUpModal(false)}>
          <SignupForm />
        </Modal>
      )}

      {/* Sidebar */}
      <aside className="shadow-md overflow-y-auto bg-theme-accent text-theme-bg">
        <nav className="p-4">
          <Sidebar addChart={addChart} />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="overflow-y-auto p-2 bg-theme-surface">
        <ChartWorkspace
          charts={charts}
          addChart={addChart}
          removeChart={removeChart}
        />
      </main>
    </div>
  );
}

export default App;
