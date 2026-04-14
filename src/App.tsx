import "./App.css";

import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { Modal } from "./components/UILibrary/Modal";
import { AuthForm } from "./components/signupForm";
import { AboutDialog } from "./components/aboutDialog";
import { AuthProvider } from "./context/AuthContext";
import { AppHeader } from "./components/AppHeader";
import { IntroPage } from "./pages/IntroPage";
import { WorkspacePage } from "./pages/WorkspacePage";
import { Button } from "./components/ui/button";
import { AssistantSettingsDialog } from "./components/AssistantSettingsDialog";
function App() {
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [authModal, setAuthModal] = useState<"signup" | "signin" | null>(null);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [pendingMobileChartType, setPendingMobileChartType] = useState<
    string | null
  >(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [assistantSettingsOpen, setAssistantSettingsOpen] = useState(false);

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

      <AssistantSettingsDialog
        open={assistantSettingsOpen}
        onOpenChange={setAssistantSettingsOpen}
      />

      <Routes>
        <Route
          path="/"
          element={
            <div className="grid h-screen min-h-0 w-full grid-rows-[auto_minmax(0,1fr)] gap-0 bg-background text-foreground">
              <AppHeader
                isCoarsePointer={isCoarsePointer}
                headerMenuOpen={headerMenuOpen}
                setHeaderMenuOpen={setHeaderMenuOpen}
                openAuthModal={setAuthModal}
                onOpenAssistantSettings={() => setAssistantSettingsOpen(true)}
                endAdornment={
                  <Button asChild size="lg" className="text-xs shrink-0">
                    <Link to="/app">Open Chart Studio</Link>
                  </Button>
                }
              />
              <IntroPage onOpenAbout={() => setAboutDialogOpen(true)} />
            </div>
          }
        />
        <Route
          path="/app"
          element={
            <div className="grid h-screen min-h-0 w-full grid-cols-[64px_1fr] grid-rows-[auto_minmax(0,1fr)] gap-0 bg-background text-foreground">
              <AppHeader
                className="col-span-2"
                isCoarsePointer={isCoarsePointer}
                headerMenuOpen={headerMenuOpen}
                setHeaderMenuOpen={setHeaderMenuOpen}
                openAuthModal={setAuthModal}
                onOpenAssistantSettings={() => setAssistantSettingsOpen(true)}
              />
              <WorkspacePage
                isCoarsePointer={isCoarsePointer}
                pendingMobileChartType={pendingMobileChartType}
                setPendingMobileChartType={setPendingMobileChartType}
                setAuthModal={setAuthModal}
                setAboutDialogOpen={setAboutDialogOpen}
              />
            </div>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
