// show about dialog with info about the project and links to github, etc.

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

export const AboutDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 min-h-55 ">
        <DialogHeader className="rounded-t-xl px-4 py-3 border-b border-accent flex justify-center bg-zinc-700 text-zinc-100">
          <DialogTitle>About</DialogTitle>
        </DialogHeader>
        {/* <div className="rounded-t-xl px-4 py-3 text-base font-semibold tracking-tight border">
          About Chart Studio
        </div> */}
        <div className="px-4  min-h-35 rounded-b-xl flex flex-col">
          <div className="text-sm">
            ChartStudio is a project that provides interactive and customizable
            charts for data visualization.
          </div>
          <div className="text-sm mt-2">
            How to use:
            <ul className="list-disc list-inside mt-1">
              <li>
                Drag and drop a chart type from the sidebar to the canvas.
              </li>
              <li>
                Click on a chart to select it, then use the settings panel to
                customize it.
              </li>
              <li>
                import your own data by clickin on chart context menu import
                button.
              </li>
              <li>Use the export button save your chart as CSV</li>
              <li>Capture your chart or download as video</li>
            </ul>
          </div>
          <div className="text-xs mb-4 mt-4">Created by Atilla Baspinar</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
