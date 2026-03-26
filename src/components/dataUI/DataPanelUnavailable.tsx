import type { FC, ReactNode } from "react";

type DataPanelUnavailableProps = {
  title?: string;
  children?: ReactNode;
};

/**
 * Shown when chart data is not yet loaded into the panel or is missing from storage.
 * Prevents the workspace from crashing when local React state lags behind the persisted store.
 */
export const DataPanelUnavailable: FC<DataPanelUnavailableProps> = ({
  title = "Data unavailable",
  children,
}) => (
  <div
    role="status"
    className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground"
  >
    <p className="font-medium text-foreground">{title}</p>
    <p className="mt-2 leading-relaxed">
      {children ??
        "Chart data is still loading, or it could not be read. Try selecting another chart or reload the page."}
    </p>
  </div>
);
