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

  return (
    <div
      id={id}
      className={`relative drop-shadow-lg bg-white/90 rounded p-1 flex space-x-2 ${className}`}
    >
      <button
        type="button"
        data-tooltip="Remove chart"
        className="tooltip"
        onClick={onRemove}
        aria-label="Remove chart"
      >
        <HugeiconsIcon
          icon={Delete02Icon}
          size={16}
          className="text-gray-500 hover:text-red-800 cursor-pointer"
        />
      </button>

      <button
        type="button"
        data-tooltip="Record video"
        className="tooltip"
        onClick={onRecord}
        aria-label="Record video"
      >
        <HugeiconsIcon
          icon={FileVideoCameraIcon}
          size={16}
          className={`cursor-pointer hover:text-red-600 ${
            isRecording ? "text-red-500 animate-pulse" : "text-gray-500"
          }`}
        />
      </button>

      <button
        type="button"
        data-tooltip="Reanimate chart"
        className="tooltip"
        onClick={onReanimate}
        aria-label="Reanimate chart"
      >
        <HugeiconsIcon
          icon={Refresh01Icon}
          size={16}
          className="text-gray-500 hover:text-emerald-600 cursor-pointer"
        />
      </button>

      <button
        type="button"
        data-tooltip="Download image"
        className="tooltip"
        onClick={onDownload}
        aria-label="Download image"
      >
        <HugeiconsIcon
          icon={ImageDownload02Icon}
          size={16}
          className="text-gray-500 hover:text-blue-600 cursor-pointer"
        />
      </button>

      {onAutoArrange && (
        <button
          type="button"
          data-tooltip="Auto arrange charts"
          className="tooltip"
          onClick={onAutoArrange}
          aria-label="Auto arrange charts"
        >
          <HugeiconsIcon
            icon={GridViewIcon}
            size={16}
            className="text-gray-500 hover:text-fuchsia-600 cursor-pointer"
          />
        </button>
      )}

      {onExpandToFullWidth && (
        <button
          type="button"
          data-tooltip="Expand chart to full width"
          className="tooltip"
          onClick={onExpandToFullWidth}
          aria-label="Expand chart to full width"
        >
          <HugeiconsIcon
            icon={ArrowAllDirectionIcon}
            size={16}
            className="text-gray-500 hover:text-teal-600 cursor-pointer"
          />
        </button>
      )}

      {onExpandContainerToPanel && (
        <button
          type="button"
          data-tooltip="Expand canvas"
          className="tooltip"
          onClick={onExpandContainerToPanel}
          aria-label="Expand canvas"
        >
          <HugeiconsIcon
            icon={ArrowAllDirectionIcon}
            size={16}
            className="text-gray-500 hover:text-cyan-600 cursor-pointer"
          />
        </button>
      )}
      {onAutofitContainer && (
        <button
          type="button"
          data-tooltip="Autofit container to charts"
          className="tooltip"
          onClick={onAutofitContainer}
          aria-label="Autofit container to charts"
        >
          <HugeiconsIcon
            icon={ArrowAllDirectionIcon}
            size={16}
            className="text-gray-500 hover:text-orange-500 cursor-pointer rotate-45"
          />
        </button>
      )}
      {showLayers && (
        <div ref={layersMenuRef} className="relative">
          <button
            type="button"
            data-tooltip="Layer order"
            className="tooltip"
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
