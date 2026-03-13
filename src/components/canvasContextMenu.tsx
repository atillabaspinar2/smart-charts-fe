import React from "react";
import { ChartContextMenu } from "./chartContextMenu";

type CanvasContextMenuProps = {
  onRemoveAll: () => void;
  onCaptureAll: () => void;
  onRefreshAll: () => void;
  onDownloadAll: () => void;
  onAutoArrange: () => void;
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
      showLayers={false}
      isRecording={isCapturing}
    />
  );
};
