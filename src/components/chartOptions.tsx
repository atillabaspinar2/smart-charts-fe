import type React from "react";

export const ChartOptions: React.FC = () => {
  return (
    <div className="chart-options p-4">
      <h3 className="text-lg font-bold mb-2">Chart Options</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded"
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
