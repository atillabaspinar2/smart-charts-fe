import { useEffect, useState, type FC } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { CustomInput } from "./UILibrary/customInput";
import { CustomButton } from "./UILibrary/CustomButton";
import { CustomSelect } from "./UILibrary/CustomSelect";
import { ECHARTS_THEMES } from "../assets/themes/registerThemes";
import type { DataOrientation } from "../utils/spreadsheetImport";

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
  workspaceTheme?: string;
  setWorkspaceTheme?: (theme: string) => void;
  onApplyThemeColors?: () => void;
  onApplyThemeColorsToAll?: () => void;
  dataOrientation?: DataOrientation;
  setDataOrientation?: (orientation: DataOrientation) => void;
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
  workspaceTheme,
  setWorkspaceTheme,
  onApplyThemeColors,
  onApplyThemeColorsToAll,
  dataOrientation,
  setDataOrientation,
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
          <CustomSelect
            id="settings-media-format"
            label="Media Format"
            value={mediaType}
            options={[
              { value: "webm", label: "WebM" },
              { value: "mp4", label: "MP4" },
            ]}
            onChange={(e) => setMediaType(e.target.value)}
          />
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

      {(selectedChartType === "line" || selectedChartType === "bar") &&
        dataOrientation &&
        setDataOrientation && (
          <div className="mb-4 rounded-md border border-theme-primary bg-theme-bg p-3">
            <p className="mb-2 text-sm font-medium">Data Orientation</p>
            <div className="inline-flex overflow-hidden rounded-md border border-theme-primary">
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-medium ${
                  dataOrientation === "columns-as-series"
                    ? "bg-theme-accent text-theme-bg"
                    : "bg-theme-bg text-theme-text hover:bg-theme-surface"
                }`}
                onClick={() => setDataOrientation("columns-as-series")}
              >
                Columns as Series
              </button>
              <button
                type="button"
                className={`border-l border-theme-primary px-3 py-1.5 text-xs font-medium ${
                  dataOrientation === "rows-as-series"
                    ? "bg-theme-accent text-theme-bg"
                    : "bg-theme-bg text-theme-text hover:bg-theme-surface"
                }`}
                onClick={() => setDataOrientation("rows-as-series")}
              >
                Rows as Series
              </button>
            </div>
            <p className="mt-2 text-xs text-theme-text/80">
              Columns mode: first column values are x-axis labels. Rows mode:
              first row values are x-axis labels.
            </p>
          </div>
        )}

      {(selectedChartType === "line" || selectedChartType === "bar") &&
        onApplyThemeColors && (
          <div className="mb-4 rounded-md border border-theme-primary bg-theme-bg p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Series Colors</p>
              <CustomButton onClick={onApplyThemeColors}>
                Apply Theme Colors
              </CustomButton>
            </div>
            <p className="text-xs text-theme-text/80">
              Applies current theme palette to all series in order. You can
              still override individual series colors from the Chart Data panel.
            </p>
          </div>
        )}

      {!selectedChartType && (
        <>
          <CustomSelect
            id="settings-chart-theme"
            label="Chart Theme"
            value={workspaceTheme ?? ""}
            options={ECHARTS_THEMES}
            onChange={(e) => setWorkspaceTheme?.(e.target.value)}
          />
          {onApplyThemeColorsToAll && (
            <div className="mb-4 rounded-md border border-theme-primary bg-theme-bg p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Series Colors</p>
                <CustomButton onClick={onApplyThemeColorsToAll}>
                  Apply to All Charts
                </CustomButton>
              </div>
              <p className="text-xs text-theme-text/80">
                Applies the current theme palette and background to all charts
                on the canvas.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
