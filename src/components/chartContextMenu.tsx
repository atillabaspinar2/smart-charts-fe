import React, { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowAllDirectionIcon,
  Delete02Icon,
  FileVideoCameraIcon,
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
  const reanimateLabel =
    contextType === "canvas" ? "Reanimate all" : "Reanimate";

  return (
    <div
      id={id}
      className={`relative drop-shadow-lg bg-white/90 rounded p-1 flex space-x-2 ${className}`}
    >
      <Tooltip content={removeLabel}>
        <button type="button" onClick={onRemove} aria-label={removeLabel}>
          <HugeiconsIcon
            icon={Delete02Icon}
            size={16}
            className="text-gray-500 hover:text-red-800 cursor-pointer"
          />
        </button>
      </Tooltip>

      <Tooltip content="Record video">
        <button type="button" onClick={onRecord} aria-label="Record video">
          <HugeiconsIcon
            icon={FileVideoCameraIcon}
            size={16}
            className={`cursor-pointer hover:text-red-600 ${
              isRecording ? "text-red-500 animate-pulse" : "text-gray-500"
            }`}
          />
        </button>
      </Tooltip>

      <Tooltip content={reanimateLabel}>
        <button type="button" onClick={onReanimate} aria-label={reanimateLabel}>
          <HugeiconsIcon
            icon={Refresh01Icon}
            size={16}
            className="text-gray-500 hover:text-emerald-600 cursor-pointer"
          />
        </button>
      </Tooltip>

      <Tooltip content="Download image">
        <button type="button" onClick={onDownload} aria-label="Download image">
          <HugeiconsIcon
            icon={ImageDownload02Icon}
            size={16}
            className="text-gray-500 hover:text-blue-600 cursor-pointer"
          />
        </button>
      </Tooltip>

      {onAutoArrange && (
        <Tooltip content="Auto arrange">
          <button
            type="button"
            onClick={onAutoArrange}
            aria-label="Auto arrange"
          >
            <HugeiconsIcon
              icon={GridViewIcon}
              size={16}
              className="text-gray-500 hover:text-fuchsia-600 cursor-pointer"
            />
          </button>
        </Tooltip>
      )}

      {onExpandToFullWidth && (
        <Tooltip content="Expand chart">
          <button
            type="button"
            onClick={onExpandToFullWidth}
            aria-label="Expand chart"
          >
            <HugeiconsIcon
              icon={ArrowAllDirectionIcon}
              size={16}
              className="text-gray-500 hover:text-teal-600 cursor-pointer"
            />
          </button>
        </Tooltip>
      )}

      {onExpandContainerToPanel && (
        <Tooltip content="Expand canvas">
          <button
            type="button"
            onClick={onExpandContainerToPanel}
            aria-label="Expand canvas"
          >
            <HugeiconsIcon
              icon={ArrowAllDirectionIcon}
              size={16}
              className="text-gray-500 hover:text-cyan-600 cursor-pointer"
            />
          </button>
        </Tooltip>
      )}
      {onAutofitContainer && (
        <Tooltip content="Autofit">
          <button
            type="button"
            onClick={onAutofitContainer}
            aria-label="Autofit"
          >
            <HugeiconsIcon
              icon={ArrowAllDirectionIcon}
              size={16}
              className="text-gray-500 hover:text-orange-500 cursor-pointer rotate-45"
            />
          </button>
        </Tooltip>
      )}
      {showLayers && (
        <div ref={layersMenuRef} className="relative">
          <Tooltip content="Layer order">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLayersOpen((prev) => !prev);
              }}
              aria-label="Layer order"
            >
              <HugeiconsIcon
                icon={Layers01Icon}
                size={16}
                className="text-gray-500 hover:text-indigo-600 cursor-pointer"
              />
            </button>
          </Tooltip>

          {layersOpen && (
            <div className="absolute top-6 left-0 z-50 min-w-36 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  onMoveToTop?.();
                  setLayersOpen(false);
                }}
              >
                Move to top
              </button>
              <button
                type="button"
                className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  onMoveUp?.();
                  setLayersOpen(false);
                }}
              >
                Move up
              </button>
              <button
                type="button"
                className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  onMoveDown?.();
                  setLayersOpen(false);
                }}
              >
                Move down
              </button>
              <button
                type="button"
                className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
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
  );
};
