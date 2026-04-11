import type { Dispatch, FC, SetStateAction } from "react";
import { ChartWorkspace } from "@/components/chartWorkspace";
import { Sidebar } from "@/components/sidebar";
import { useWorkspaceLayoutStore } from "@/store/workspaceLayoutStore";
import { useWorkspaceChartsStore } from "@/store/workspaceChartsStore";

type WorkspacePageProps = {
  isCoarsePointer: boolean;
  pendingMobileChartType: string | null;
  setPendingMobileChartType: Dispatch<SetStateAction<string | null>>;
  setAuthModal: Dispatch<SetStateAction<"signup" | "signin" | null>>;
  setAboutDialogOpen: Dispatch<SetStateAction<boolean>>;
};

export const WorkspacePage: FC<WorkspacePageProps> = ({
  isCoarsePointer,
  pendingMobileChartType,
  setPendingMobileChartType,
  setAuthModal,
  setAboutDialogOpen,
}) => {
  const activeWorkspaceId = useWorkspaceLayoutStore(
    (s) => s.activeWorkspaceId,
  );
  const chartEntities = useWorkspaceChartsStore(
    (s) => s.chartsByWorkspaceId[activeWorkspaceId],
  );
  const charts = Object.values(chartEntities ?? {}).map((c) => ({
    id: c.id,
    instanceId: c.instanceId,
    type: c.type,
    initialPosition: c.initialPosition,
  }));

  const addChart = (
    chartType: string,
    initialPosition?: { x: number; y: number },
  ) => {
    useWorkspaceChartsStore.getState().addChart(
      activeWorkspaceId,
      chartType,
      initialPosition,
    );
  };
  const removeChart = (id: number) => {
    useWorkspaceChartsStore.getState().removeChart(activeWorkspaceId, id);
  };

  return (
    <>
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

      <main className="overflow-y-auto bg-background p-2 text-foreground">
        <ChartWorkspace
          charts={charts}
          addChart={addChart}
          removeChart={removeChart}
          isMobileMode={isCoarsePointer}
          setAuthModal={setAuthModal}
          pendingMobileChartType={pendingMobileChartType}
          onPlaceMobileChartType={(type, position) => {
            addChart(type, position);
            setPendingMobileChartType(null);
          }}
          onCancelMobileChartPlacement={() => setPendingMobileChartType(null)}
        />
      </main>
    </>
  );
};
