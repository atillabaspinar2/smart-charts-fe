import React from "react";
import { ChartContextMenu } from "./chartContextMenu";

type CanvasContextMenuProps = {
  onRemoveAll: () => void;
  onCaptureAll: () => void;
  onRefreshAll: () => void;
  onDownloadAll: () => void;
  onAutoArrange: () => void;
  onExpandContainerToPanel: () => void;
  onAutofitContainer: () => void;
  isCapturing?: boolean;
  className?: string;
  id?: string;
};

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  onRemoveAll,
  onCaptureAll,
  onRefreshAll,
  onDownloadAll,
  onAutoArrange,
  onExpandContainerToPanel,
  onAutofitContainer,
  isCapturing = false,
  className = "",
  id,
}) => {
  return (
    <ChartContextMenu
      id={id}
      className={className}
      onRemove={onRemoveAll}
      onRecord={onCaptureAll}
      onReanimate={onRefreshAll}
      onDownload={onDownloadAll}
      onAutoArrange={onAutoArrange}
      onExpandContainerToPanel={onExpandContainerToPanel}
      onAutofitContainer={onAutofitContainer}
      showLayers={false}
      isRecording={isCapturing}
    />
  );
};
