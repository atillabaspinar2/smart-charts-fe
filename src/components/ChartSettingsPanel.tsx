import { useEffect, useState, type FC } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { CustomInput } from "./UILibrary/customInput";

interface ChartSettingsPanelProps {
  animationDuration: number;
  setAnimationDuration: (v: number) => void;
  mediaType: string;
  setMediaType: (v: string) => void;
  backgroundColor: string;
  setBackgroundColor: (v: string) => void;
  title: string;
  setTitle: (v: string) => void;
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
  title,
  setTitle,
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
    : "Canvas Options";

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

      <CustomInput
        id="settings-title"
        label={selectedChartType ? "Chart Title" : "Title"}
        type="text"
        placeholder={
          selectedChartType ? "Enter chart title" : "Enter workspace title"
        }
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <CustomInput
        id="settings-animation"
        label="Animation (ms)"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={animationInput}
        placeholder="1000"
        onChange={(e) => handleAnimationChange(e.target.value)}
      />
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
        <label className="block text-sm font-medium mb-1">
          Background Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            aria-label="Background color"
            title="Pick background color"
            className="h-10 w-10 p-1 border border-gray-300 rounded-md cursor-pointer bg-white"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          />
          <span className="text-sm text-gray-600 uppercase">
            {backgroundColor}
          </span>
        </div>
      </div>
      {!selectedChartType && (
        <>
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
