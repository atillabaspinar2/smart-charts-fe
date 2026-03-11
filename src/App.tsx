import "./App.css";

import { ChartArea } from "./components/chartArea";
import { useState } from "react";
import { Modal } from "./components/Modal";
import { SignupForm } from "./components/signupForm";
import { UserMenu } from "./components/userMenu";
import { Sidebar } from "./components/sidebar";

function App() {
  const [chart, setChart] = useState<string>("");

  const setChartType = (chartType: string) => {
    setChart(chartType);
  };

  const [signUpModal, setSignUpModal] = useState(false);

  return (
    <div className="grid grid-rows-[auto_1fr] grid-cols-[64px_1fr] h-screen gap-0 bg-slate-50">
      {/* Header */}
      <header className="col-span-2 bg-slate-900 text-white shadow-lg">
        <div className="px-6 py-4">
          <h1 className="text-3xl font-bold">Grapfio</h1>
          <div className="absolute right-6 top-4">
            <UserMenu setSingUpModal={setSignUpModal} />
          </div>
        </div>
      </header>
      {signUpModal && (
        <Modal isOpen={signUpModal} onClose={() => setSignUpModal(false)}>
          <SignupForm />
        </Modal>
      )}

      {/* Sidebar */}
      <aside className="bg-slate-800 text-slate-100 shadow-md overflow-y-auto">
        <nav className="p-4">
          <Sidebar setChartType={setChartType} />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="overflow-y-auto p-6">
        {chart && <ChartArea type={chart} />}
      </main>
    </div>
  );
}

export default App;
