import type { MapChartData } from "../components/chartTypes";
import {
  KNOWN_MAP_IDS,
  getMapData,
  loadMapPopulationDefaults,
} from "../components/mapChartOptions";

/** Minimum similarity (0–1) to accept a region name match. */
const SIM_MIN_DEFAULT = 0.82;
const SIM_MIN_SHORT = 0.92;

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeForMatch(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[\s_-]+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[m][n];
}

function similarityRatio(a: string, b: string): number {
  if (!a.length && !b.length) return 1;
  if (!a.length || !b.length) return 0;
  const d = levenshtein(a, b);
  return 1 - d / Math.max(a.length, b.length);
}

function minSimilarityFor(name: string): number {
  const n = normalizeForMatch(name).length;
  if (n <= 2) return SIM_MIN_SHORT;
  if (n <= 4) return 0.88;
  return SIM_MIN_DEFAULT;
}

function bestRegionMatch(
  rawName: string,
  regionNames: string[],
): { name: string; score: number } | null {
  const n = normalizeForMatch(rawName);
  if (!n) return null;
  let best: { name: string; score: number } | null = null;
  for (const r of regionNames) {
    const rn = normalizeForMatch(r);
    if (rn === n) return { name: r, score: 1 };
    const score = similarityRatio(n, rn);
    if (!best || score > best.score) best = { name: r, score };
  }
  if (!best) return null;
  const threshold = minSimilarityFor(rawName);
  return best.score >= threshold ? best : null;
}

export type ParsedMapRows = {
  /** Map id from first row when file was `mapId,Value` + data. */
  hintMapId?: string;
  items: { name: string; value: number }[];
};

/**
 * Parses rows as region name + value. No header row required.
 * Optional header: `mapId,Value` (known map id) or `Region,Name,Value`-style labels.
 */
export function parseMapImportRows(rows: unknown[][]): ParsedMapRows {
  const normalized = rows
    .map((row) => (Array.isArray(row) ? row : []))
    .filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""));

  if (normalized.length === 0) return { items: [] };

  let start = 0;
  let hintMapId: string | undefined;

  const r0 = normalized[0];
  const c0 = String(r0[0] ?? "").trim();
  const c1 = String(r0[1] ?? "").trim();
  const c1Lower = c1.toLowerCase();

  const known = new Set<string>([...KNOWN_MAP_IDS]);
  if (known.has(c0) && (c1Lower === "value" || c1Lower === "")) {
    hintMapId = c0;
    start = 1;
  } else {
    const c0Lower = c0.toLowerCase();
    if (
      (c0Lower === "region" ||
        c0Lower === "name" ||
        c0Lower === "label" ||
        c0Lower === "state" ||
        c0Lower === "country" ||
        c0Lower === "category") &&
      (c1Lower === "value" ||
        c1Lower === "values" ||
        c1Lower === "amount" ||
        c1Lower === "")
    ) {
      start = 1;
    }
  }

  const items: { name: string; value: number }[] = [];
  for (let i = start; i < normalized.length; i++) {
    const row = normalized[i];
    if (row.length < 2) continue;
    const name = String(row[0] ?? "").trim();
    if (!name) continue;
    items.push({ name, value: toNumber(row[1]) });
  }

  return { hintMapId, items };
}

function uniqueOrdered(ids: (string | undefined)[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export type MapImportResolveResult =
  | { ok: true; data: MapChartData }
  | { ok: false; message: string };

export type ResolveMapChartImportOptions = {
  /** Current chart map — tried early when disambiguating. */
  preferredMapName?: string;
};

/**
 * Matches imported region names to a known GeoJSON map (fuzzy), merges values onto
 * the full region list for that map. Fails if names cannot be matched reliably.
 */
export async function resolveMapChartImport(
  rows: unknown[][],
  options: ResolveMapChartImportOptions = {},
): Promise<MapImportResolveResult> {
  const { hintMapId, items } = parseMapImportRows(rows);
  if (items.length === 0) {
    return {
      ok: false,
      message:
        "No valid region rows found. Use two columns: region name and numeric value.",
    };
  }

  const candidateIds = uniqueOrdered([
    hintMapId,
    options.preferredMapName,
    ...KNOWN_MAP_IDS,
  ]);

  type Trial = { mapName: string; index: number; score: number; data: MapChartData };

  const trials = await Promise.all(
    candidateIds.map(async (mapName, index) => {
      const trial = await tryBuildMapChartData(mapName, items);
      if (!trial) return null;
      return { mapName, index, score: trial.score, data: trial.data };
    }),
  );

  const valid = trials.filter((t): t is Trial => t != null);
  valid.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.index - b.index;
  });
  const best = valid[0];

  if (!best) {
    return {
      ok: false,
      message:
        "Could not match these region names to any map in this app. Check spelling, accents, and that the region names match the map (e.g. France mainland vs full country).",
    };
  }

  return { ok: true, data: best.data };
}

async function tryBuildMapChartData(
  mapName: string,
  items: { name: string; value: number }[],
): Promise<{ score: number; data: MapChartData } | null> {
  const regions = await getMapData(mapName);
  if (regions.length === 0) return null;

  const regionNames = regions.map((r) => r.name);
  const populationDefaults = await loadMapPopulationDefaults(mapName);

  let sumScore = 0;
  const byCanonical = new Map<string, number>();

  for (const row of items) {
    const m = bestRegionMatch(row.name, regionNames);
    if (!m) return null;
    sumScore += m.score;
    byCanonical.set(m.name, row.value);
  }

  const merged = regions.map((region) => ({
    name: region.name,
    value: byCanonical.has(region.name)
      ? (byCanonical.get(region.name) as number)
      : (populationDefaults[region.name] ?? 0),
  }));

  const data: MapChartData = {
    type: "map",
    mapName,
    series: { data: merged },
  };

  return {
    score: sumScore / items.length,
    data,
  };
}
