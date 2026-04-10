# Chart Studio

Chart Studio is a browser-based data visualization studio for building, animating, and exporting charts without writing code. This repository is the **frontend** (React + Vite): a shared canvas of interactive charts powered by [Apache ECharts](https://echarts.apache.org/), with local persistence in the browser.

## Features

- **Chart types** — Line, bar, pie, and map charts on one canvas.
- **Annotations** — Lines, circles, text labels, and image overlays on the canvas.
- **Workspaces** — Create, rename, and switch between multiple workspaces; layout, data, styles, and timeline state persist automatically (IndexedDB).
- **Data** — Import **CSV** or **Excel** (`.xls`, `.xlsx`) per chart; edit values in the **Data** table and apply changes; export the current series as CSV.
- **Animation timeline** — Set total canvas duration, place each chart on a visual timeline, and preview the full sequence (**Animate all**). Charts stay hidden until their clip starts.
- **Styles** — Per-chart options (titles, fonts, colors, legend, axes, chart-specific settings). When nothing is selected, edit canvas-level background, workspace title, and fonts. Global app theme and light/dark mode live in the header.
- **Export** — Record the animated canvas as **WebM** (timeline-aware) and download individual charts as **PNG**.
- **Responsive layout** — On touch devices, pick a chart type from the sidebar, then tap the canvas to place it.

Optional **Sign in / Sign up** is available when a backend API is configured (see [Local development](#local-development)).

## How to use the app

### Add charts and annotations

- **Desktop:** Drag a chart or annotation from the **left sidebar** onto the canvas.
- **Mobile / touch:** Tap a sidebar item to select it, then tap where it should go on the canvas.

Resize and drag charts to arrange them. Use each chart’s menu (for example the **⋯** control) for actions such as **Import**, **Export**, duplicate, or remove.

### Import data

Imports use a **tabular** file: **CSV** or **Excel** (`.xls` / `.xlsx`). The file picker and parser do not accept standalone **JSON** data files. Open **Import** from the chart’s context menu (same as the tooltip: CSV or Excel), then shape the sheet like a table with a header row:

| Chart   | Expected shape |
|--------|-----------------|
| **Line / Bar** | First column = category axis; following columns = numeric series. First row = headers (series names). |
| **Pie** | Two columns: `name` and `value`. |
| **Map** | Two columns: `name` (region or country) and `value` (number). |

The first worksheet in an Excel workbook is read. Empty rows are skipped when building the chart from the sheet.

### Edit data

1. Select a chart.
2. Open the **Data** panel (bottom).
3. Edit cells, add or remove rows/series as supported.
4. Click **Apply** to update the chart.

Use **Export** from the chart menu to download the current data as CSV.

### Animation timeline

1. In the canvas panel header, open the **Animation Timeline** tab (next to the workspace name).
2. Set **Duration (ms)** and **Apply** for the overall canvas length.
3. For each chart row, drag the **left** handle for start time and the **right** handle for end time. A chart is invisible until its start time.
4. Use **Animate all** in the workspace toolbar to preview.

### Styles and theme

- Select a chart, then use the **Styles** tab in the right panel for colors, fonts, legend, and type-specific options (for example smooth lines, stacked bars, map color scale).
- With no chart selected, adjust canvas background and workspace title/fonts.
- Use the header controls for **theme** and **light / dark / system** appearance.

### Canvas toolbar and menu

The workspace toolbar and canvas context menu support actions such as arranging charts, fitting the container, refreshing, capturing or downloading assets, and clearing the canvas—exact options depend on context (see the in-app **Help / About** dialog for the full walkthrough).

### Help in the app

Open **Help / About** from the question icon at the bottom of the sidebar. The **How To** tab mirrors data formats, editing, timeline, and styles; the **About** tab summarizes product features.

## Local development

### Prerequisites

- [Node.js](https://nodejs.org/) (current LTS recommended)
- npm (bundled with Node)

### Setup

```bash
npm install
```

### Environment

If you use authentication against an API, copy the example env file and point it at your backend:

```bash
cp .env.example .env
```

`VITE_API_URL` defaults to `http://localhost:3000` in `.env.example`; adjust to match your server.

### Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start the Vite dev server with hot reload. |
| `npm run build` | Typecheck and production build to `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run ESLint on the project. |

### Tech stack (high level)

React 19, TypeScript, Vite, Tailwind CSS, Zustand, TanStack Table, ECharts (`echarts-for-react`), Radix UI primitives, and client-side persistence via IndexedDB.

---

Chart Studio is developed and maintained by **Atilla Baspinar**.
