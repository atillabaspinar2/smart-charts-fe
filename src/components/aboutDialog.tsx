import React from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export const AboutDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 w-[900px] sm:max-w-[95vw] max-h-[85vh] flex flex-col overflow-hidden top-[8vh] translate-y-0">
        {/* Panel-style header matching PanelView */}
        <div className="min-h-10 flex flex-row items-center rounded-t-xl border-b border-border bg-muted px-3 py-2 text-muted-foreground">
          <span className="text-[11px] font-semibold leading-none tracking-wide uppercase text-muted-foreground">
            Chart Studio
          </span>
        </div>

        <Tabs defaultValue="howto" className="flex flex-col flex-1 min-h-0">
          <TabsList className="mx-4 mt-3 shrink-0">
            <TabsTrigger value="howto">How To</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          {/* ── How To ── */}
          <TabsContent
            value="howto"
            className="flex-1 min-h-0 overflow-y-auto px-6 py-4"
          >
            <div className="space-y-2 text-sm text-foreground">

              <section>
                <h3 className="font-semibold text-base mb-1">Importing Data</h3>
                <p className="text-muted-foreground mb-2">
                  Each chart accepts data imported as a <strong>CSV</strong> or <strong>Excel</strong> file (<code className="bg-muted rounded px-1">.xls</code>, <code className="bg-muted rounded px-1">.xlsx</code>).
                  The first worksheet is used for Excel files. Files must follow the structure expected by the chart type:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>Line / Bar:</strong> first column is the category axis; subsequent columns are numeric series values. The first row must be headers (used as series names).</li>
                  <li><strong>Pie:</strong> two columns — <code className="bg-muted rounded px-1">name</code> and <code className="bg-muted rounded px-1">value</code>.</li>
                  <li><strong>Map:</strong> two columns — <code className="bg-muted rounded px-1">name</code> (region/country) and <code className="bg-muted rounded px-1">value</code> (numeric).</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  Click the chart's context menu (⋯ button on hover) and choose <strong>Import</strong> to load your file. Invalid rows are skipped automatically. The chart title is set from the file name (without extension).
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-1">Editing Data</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Open the <strong>Data</strong> panel at the bottom to view and edit values inline.</li>
                  <li>Add or remove rows and series directly from the table.</li>
                  <li>Changes are reflected on after you click <strong>Apply</strong>.</li>
                  <li>Use <strong>Export</strong> from the context menu to download the current data as CSV.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-1">Using the Animation Timeline</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Switch to the <strong>Animation Timeline</strong> tab in the canvas panel header.</li>
                  <li>Set the total canvas duration with the <strong>Duration (ms)</strong> input and click <strong>Apply</strong>.</li>
                  <li>Each chart row shows a clip representing when that chart animates. Drag the <strong>left handle</strong> to set the start time and the <strong>right handle</strong> to set the end time.</li>
                  <li>A chart will be <em>invisible</em> until its start time and animates for the duration of its clip.</li>
                  <li>Canvas end time always stays ≥ the latest chart end time.</li>
                  <li>Click <strong>Animate all</strong> in the workspace toolbar to preview the full timeline sequence.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-1">Using the Styles Tab</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Select a chart on the canvas, then open the <strong>Styles</strong> tab in the right panel.</li>
                  <li>Adjust title, font, colors, legend position, and chart-specific options (smooth lines, stacked bars, donut radius, etc.).</li>
                  <li>
                    <strong>Sketchy</strong> (line, bar, and normal pie only): turn on a hand-drawn look and use <strong>Sketch intensity</strong> to control how rough it appears. On the animation timeline, sketch charts use a different motion than the default chart animation.
                  </li>
                  <li>For map charts, choose color range from the dropdown menu.</li>
                  <li>Canvas-level settings (background color, workspace title, font) are available when no chart is selected.</li>
                  <li>The global theme and color scheme can be changed from the top toolbar.</li>
                </ul>
              </section>

            </div>
          </TabsContent>

          {/* ── About ── */}
          <TabsContent
            value="about"
            className="flex-1 min-h-0 overflow-y-auto px-6 py-4"
          >
            <div className="space-y-2 text-sm text-foreground">

              <section>
                <h3 className="font-semibold text-base mb-1">Chart Studio</h3>
                <p className="text-muted-foreground">
                  Chart Studio is a browser-based data visualization studio that lets you build, animate, and export
                  professional charts — no coding required.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-1">Features</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>Multiple chart types</strong> — Line, Bar, Pie, and Map charts on a shared canvas.</li>
                  <li><strong>Data import &amp; export</strong> — Load data from CSV or Excel; export back to CSV at any time.</li>
                  <li><strong>Animation timeline</strong> — Precisely control when each chart appears and how long it animates using a visual drag-and-drop timeline editor.</li>
                  <li><strong>Style customization</strong> — Full control over colors, fonts, legends, axes, and chart-specific visual options.</li>
                  <li><strong>Sketch style</strong> — Optional hand-drawn line, bar, and pie charts with adjustable intensity; works with the animation timeline.</li>
                  <li><strong>Theme support</strong> — Switch between light and dark mode and multiple color themes instantly.</li>
                  <li><strong>Video export</strong> — Capture the entire animated canvas as WebM or MP4 (your choice in canvas settings), respecting all timeline positions.</li>
                  <li><strong>Image export</strong> — Download any individual chart as a PNG.</li>
                  <li><strong>Annotations</strong> — Add shapes, lines, and text overlays directly on charts.</li>
                  <li><strong>Persistent workspaces</strong> — All charts, data, settings, and timeline clips are saved automatically in your browser.</li>
                </ul>
              </section>

              <section>
                <p className="text-muted-foreground text-xs pt-2 border-t border-border">
                  Developed and maintained by <strong>Atilla Baspinar</strong>.
                </p>
              </section>

            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom padding */}
        <div className="h-3 shrink-0" />
      </DialogContent>
    </Dialog>
  );
};
