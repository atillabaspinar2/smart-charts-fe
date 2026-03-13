import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  FileVideoCameraIcon,
  ImageDownload02Icon,
  Refresh01Icon,
} from "@hugeicons/core-free-icons";

type ChartContextMenuProps = {
  onRemove: () => void;
  onRecord: () => void;
  onReanimate: () => void;
  onDownload: () => void;
  isRecording?: boolean;
  className?: string;
  id?: string;
};

export const ChartContextMenu: React.FC<ChartContextMenuProps> = ({
  onRemove,
  onRecord,
  onReanimate,
  onDownload,
  isRecording = false,
  className = "",
  id,
}) => {
  return (
    <div
      id={id}
      className={`drop-shadow-lg bg-white/90 rounded p-1 flex space-x-2 ${className}`}
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
    </div>
  );
};
