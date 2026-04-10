# Chart Studio frontend — agent context

This repo is the **Chart Studio** SPA: React + Vite + TypeScript. The npm package name is `smart-charts`; the product name in the UI is **Chart Studio**.

## Commands

Run from this directory (`chartstudioFE/`):

| Command | Use |
|--------|-----|
| `npm install` | Install dependencies |
| `npm run dev` | Dev server (Vite) |
| `npm run build` | `tsc -b` + production build → `dist/` |
| `npm run lint` | ESLint |
| `npm run preview` | Serve `dist/` locally |

## Environment

- Copy `.env.example` → `.env` if you need auth against an API.
- `VITE_API_URL` points at the backend (default in example: `http://localhost:3000`).

## Layout (where things live)

- `src/App.tsx` — Shell: header, sidebar, workspace.
- `src/components/chartWorkspace.tsx` — Main canvas, import/export, timeline, chart wiring (large file).
- `src/components/chartItem.tsx`, `chartTypes.ts` — Chart instances and typed data/settings.
- `src/store/workspaceChartsStore.ts`, `workspaceLayoutStore.ts` — Zustand + IndexedDB persistence.
- `src/utils/spreadsheetImport.ts`, `spreadsheetExport.ts` — CSV/Excel import via SheetJS (`xlsx`); not JSON files for user imports.
- `src/components/ui/` — shadcn-style primitives.

## Product facts (avoid doc drift)

- **Data import:** CSV or Excel (`.csv`, `.xls`, `.xlsx`) only; first sheet for Excel. See `README.md` and `src/components/aboutDialog.tsx` for formats.
- **Sketch style (Rough.js):** Optional hand-drawn look for **line** (`lineSketchEnabled`, `lineSketchIntensity`), **bar** (`barSketchEnabled`, `barSketchIntensity`), and **pie** (`pieSketchEnabled`, `pieSketchIntensity`; normal pie only, not rose/funnel). Line supports **Area** and **Stack**; bar supports **Stack**; pie uses theme palette colors. Implementation: `roughLineSeries.ts`, `roughBarPieSeries.ts`, `chartItem.tsx`. ECharts does not animate custom `renderItem` paths; **Animate** / **Animate all** / timeline **drive anime.js on the chart root div** (`sketchChartContainerMotion.ts`), stretched to the timeline clip duration. `#chart-canvas` uses `container-type: size` for `cqh` motion.
- Charts: line, bar, pie, map; annotations (line, circle, text, image). Optional auth UI exists when API is configured.

## What agents should do

- Match existing patterns in neighboring files; prefer extending current abstractions over new parallel systems.
- Keep changes scoped to the task; avoid drive-by refactors and unrelated files.
- After substantive edits, run `npm run lint` (and `npm run build` if types or imports changed heavily).

## What agents should avoid

- Claiming **JSON** import for spreadsheet data (not implemented for user files).
- Adding dependencies without a clear need; align with `package.json` stack (ECharts, Zustand, TanStack Table, Radix, Tailwind v4).

## Deeper docs

- End-user behavior: `README.md`
- Cursor rules: `.cursor/rules/*.mdc`
