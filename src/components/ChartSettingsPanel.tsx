import { useEffect, useState, type FC } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

interface ChartSettingsPanelProps {
  animationDuration: number;
  setAnimationDuration: (v: number) => void;
  mediaType: string;
  setMediaType: (v: string) => void;
  backgroundColor: string;
  setBackgroundColor: (v: string) => void;
  selectedChartType?: string;
  onClose?: () => void;
}

export const ChartSettingsPanel: FC<ChartSettingsPanelProps> = ({
  animationDuration,
  setAnimationDuration,
  mediaType,
  setMediaType,
  backgroundColor,
  setBackgroundColor,
  selectedChartType,
  onClose,
}) => {
  const [animationInput, setAnimationInput] = useState(
    String(animationDuration),
  );

  useEffect(() => {
    setAnimationInput(String(animationDuration));
  }, [animationDuration]);

  const handleAnimationChange = (value: string = "1000") => {
    if (!/^\d*$/.test(value)) return;
    setAnimationInput(value);
  };

  useEffect(() => {
    if (animationInput === "") return;
    const parsed = Number(animationInput);
    if (parsed === animationDuration) return;
    const timeout = setTimeout(() => {
      setAnimationDuration(parsed);
    }, 500);
    return () => clearTimeout(timeout);
  }, [animationInput, animationDuration, setAnimationDuration]);

  const panelTitle = selectedChartType
    ? `${selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)} Settings`
    : "Chart Options";

  return (
    <div className="chart-options p-1">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">{panelTitle}</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded"
            title="Close settings"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={20}
              className="text-gray-600"
            />
          </button>
        )}
      </div>
      {selectedChartType && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          Editing settings for selected{" "}
          <span className="font-semibold">{selectedChartType}</span> chart
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Animation (ms)</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          className="w-full p-2 border border-gray-300 rounded"
          value={animationInput}
          placeholder="1000"
          onChange={(e) => handleAnimationChange(e.target.value)}
        />
      </div>
      {!selectedChartType && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Media Format</label>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value)}
          >
            <option value="webm">WebM</option>
            <option value="mp4">MP4</option>
          </select>
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Background</label>
        <input
          type="color"
          className="w-full h-8 p-1 border border-gray-300 rounded"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
        />
      </div>
      {!selectedChartType && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full p-2 border border-indigo-900 rounded"
              placeholder="Enter chart title"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              X-Axis Label
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter x-axis label"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Y-Axis Label
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter y-axis label"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Color Scheme
            </label>
            <select className="w-full p-2 border border-gray-300 rounded">
              <option>Default</option>
              <option>Dark</option>
              <option>Pastel</option>
              <option>Bright</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
};
