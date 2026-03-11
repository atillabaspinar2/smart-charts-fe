import type React from "react";

interface ChartOptionsProps {
  animationDuration: number;
  setAnimationDuration: (v: number) => void;
  mediaType: string;
  setMediaType: (v: string) => void;
  backgroundColor: string;
  setBackgroundColor: (v: string) => void;
}

export const ChartOptions: React.FC<ChartOptionsProps> = ({
  animationDuration,
  setAnimationDuration,
  mediaType,
  setMediaType,
  backgroundColor,
  setBackgroundColor,
}) => {
  return (
    <div className="chart-options p-4">
      <h3 className="text-lg font-bold mb-2">Chart Options</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Animation (ms)</label>
        <input
          type="number"
          className="w-full p-2 border border-gray-300 rounded"
          value={animationDuration}
          onChange={(e) => setAnimationDuration(Number(e.target.value))}
        />
      </div>
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
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Background</label>
        <input
          type="color"
          className="w-full h-8 p-1 border border-gray-300 rounded"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
        />
      </div>
      {/* existing controls could remain below */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          className="w-full p-2 border border-indigo-900 rounded"
          placeholder="Enter chart title"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">X-Axis Label</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Enter x-axis label"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Y-Axis Label</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Enter y-axis label"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Color Scheme</label>
        <select className="w-full p-2 border border-gray-300 rounded">
          <option>Default</option>
          <option>Dark</option>
          <option>Pastel</option>
          <option>Bright</option>
        </select>
      </div>
    </div>
  );
};
