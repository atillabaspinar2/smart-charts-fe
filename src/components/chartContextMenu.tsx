import React, { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowHorizontalIcon,
  Delete02Icon,
  FileImportIcon,
  FileVideoCameraIcon,
  FitToScreenIcon,
  GridViewIcon,
  ImageDownload02Icon,
  Layers01Icon,
  Refresh01Icon,
} from "@hugeicons/core-free-icons";
import { Tooltip } from "./UILibrary/Tooltip";

type ChartContextMenuProps = {
  onRemove: () => void;
  onRecord: () => void;
  onReanimate: () => void;
  onDownload: () => void;
  onImport?: () => void;
  onAutoArrange?: () => void;
  onExpandToFullWidth?: () => void;
  onExpandContainerToPanel?: () => void;
  onAutofitContainer?: () => void;
  onMoveToTop?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onMoveToBottom?: () => void;
  showLayers?: boolean;
  isRecording?: boolean;
  contextType?: "chart" | "canvas";
  className?: string;
  id?: string;
};

export const ChartContextMenu: React.FC<ChartContextMenuProps> = ({
  onRemove,
  onRecord,
  onReanimate,
  onDownload,
  onImport,
  onAutoArrange,
  onExpandToFullWidth,
  onExpandContainerToPanel,
  onAutofitContainer,
  onMoveToTop,
  onMoveUp,
  onMoveDown,
  onMoveToBottom,
  showLayers = true,
  isRecording = false,
  contextType = "chart",
  className = "",
  id,
}) => {
  const [layersOpen, setLayersOpen] = useState(false);
  const layersMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!layersMenuRef.current) return;
      if (layersMenuRef.current.contains(event.target as Node)) return;
      setLayersOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const removeLabel = contextType === "canvas" ? "Remove all" : "Remove";
  const animateLabel = contextType === "canvas" ? "Animate all" : "Animate";
  const showImport = contextType === "chart" && Boolean(onImport);
  // Match annotation panel (Card) look, without changing layout.
  const menuContainerClassName =
    "border border-border bg-card text-card-foreground shadow-lg";
  const iconButtonClassName =
    "rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground";
  const separatorClassName = "bg-border";
  const iconSize = 16;

  return (
    <div
      id={id}
      className={`relative flex items-center rounded p-0.5 ${menuContainerClassName} ${className}`}
      style={{ opacity: 0.92 }}
    >
      {showImport && (
        <>
          <div className="flex items-center gap-1">
            <Tooltip content="Import CSV or Excel">
              <button
                type="button"
                onClick={onImport}
                aria-label="Import CSV or Excel"
                className={iconButtonClassName}
              >
                <HugeiconsIcon icon={FileImportIcon} size={iconSize} />
              </button>
            </Tooltip>
          </div>
          <div
            className={`mx-1.5 h-4 w-px self-center ${separatorClassName}`}
          />
        </>
      )}

      <div className="flex items-center gap-1">
        <Tooltip content="Download as video">
          <button
            type="button"
            onClick={onRecord}
            aria-label="Download as video"
            className={`${iconButtonClassName} ${isRecording ? "text-red-500 animate-pulse hover:text-red-600" : ""}`}
          >
            <HugeiconsIcon icon={FileVideoCameraIcon} size={iconSize} />
          </button>
        </Tooltip>

        <Tooltip content="Download as image">
          <button
            type="button"
            onClick={onDownload}
            aria-label="Download as image"
            className={iconButtonClassName}
          >
            <HugeiconsIcon icon={ImageDownload02Icon} size={iconSize} />
          </button>
        </Tooltip>
      </div>

      <div className={`mx-1.5 h-4 w-px self-center ${separatorClassName}`} />

      <div className="flex items-center gap-1">
        <Tooltip content={animateLabel}>
          <button
            type="button"
            onClick={onReanimate}
            aria-label={animateLabel}
            className={iconButtonClassName}
          >
            <HugeiconsIcon icon={Refresh01Icon} size={iconSize} />
          </button>
        </Tooltip>

        {onAutoArrange && (
          <Tooltip content="Auto arrange">
            <button
              type="button"
              onClick={onAutoArrange}
              aria-label="Auto arrange"
              className={iconButtonClassName}
            >
              <HugeiconsIcon icon={GridViewIcon} size={iconSize} />
            </button>
          </Tooltip>
        )}

        {onExpandToFullWidth && (
          <Tooltip content="Expand chart">
            <button
              type="button"
              onClick={onExpandToFullWidth}
              aria-label="Expand chart"
              className={iconButtonClassName}
            >
              <HugeiconsIcon icon={ArrowHorizontalIcon} size={iconSize} />
            </button>
          </Tooltip>
        )}

        {onExpandContainerToPanel && (
          <Tooltip content="Expand canvas">
            <button
              type="button"
              onClick={onExpandContainerToPanel}
              aria-label="Expand canvas"
              className={iconButtonClassName}
            >
              <HugeiconsIcon icon={ArrowHorizontalIcon} size={iconSize} />
            </button>
          </Tooltip>
        )}
        {onAutofitContainer && (
          <Tooltip content="Autofit">
            <button
              type="button"
              onClick={onAutofitContainer}
              aria-label="Autofit"
              className={iconButtonClassName}
            >
              <HugeiconsIcon icon={FitToScreenIcon} size={iconSize} />
            </button>
          </Tooltip>
        )}
        {showLayers && (
          <div ref={layersMenuRef} className="relative flex items-center">
            <Tooltip content="Layer order">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLayersOpen((prev) => !prev);
                }}
                aria-label="Layer order"
                className={iconButtonClassName}
              >
                <HugeiconsIcon icon={Layers01Icon} size={iconSize} />
              </button>
            </Tooltip>

            {layersOpen && (
              <div className="absolute top-6 left-0 z-50 min-w-36 rounded-md border border-border bg-card py-1 text-card-foreground shadow-lg">
                <button
                  type="button"
                  className="w-full px-3 py-1.5 text-left text-sm text-card-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    onMoveToTop?.();
                    setLayersOpen(false);
                  }}
                >
                  Move to top
                </button>
                <button
                  type="button"
                  className="w-full px-3 py-1.5 text-left text-sm text-card-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    onMoveUp?.();
                    setLayersOpen(false);
                  }}
                >
                  Move up
                </button>
                <button
                  type="button"
                  className="w-full px-3 py-1.5 text-left text-sm text-card-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    onMoveDown?.();
                    setLayersOpen(false);
                  }}
                >
                  Move down
                </button>
                <button
                  type="button"
                  className="w-full px-3 py-1.5 text-left text-sm text-card-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    onMoveToBottom?.();
                    setLayersOpen(false);
                  }}
                >
                  Move to bottom
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mx-1.5 h-4 w-px self-center bg-border" />

      <Tooltip content={removeLabel}>
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className={iconButtonClassName}
        >
          <HugeiconsIcon icon={Delete02Icon} size={iconSize} />
        </button>
      </Tooltip>
    </div>
  );
};
