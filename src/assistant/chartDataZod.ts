import { z } from "zod";

const lineSeriesSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  colorSource: z.enum(["theme", "custom"]).optional(),
  themeColorIndex: z.number().nullable().optional(),
  values: z.array(z.number()),
});

const barSeriesSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  colorSource: z.enum(["theme", "custom"]).optional(),
  themeColorIndex: z.number().nullable().optional(),
  values: z.array(z.number()),
});

const lineChartDataSchema = z.object({
  type: z.literal("line"),
  variation: z
    .enum(["basic", "smooth", "area", "stacked-area", "step"])
    .optional(),
  categories: z.array(z.string()),
  series: z.array(lineSeriesSchema),
});

const barChartDataSchema = z.object({
  type: z.literal("bar"),
  categories: z.array(z.string()),
  series: z.array(barSeriesSchema),
});

const pieChartDataSchema = z.object({
  type: z.literal("pie"),
  seriesName: z.string().optional(),
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      value: z.number(),
    }),
  ),
});

const mapChartDataSchema = z.object({
  type: z.literal("map"),
  mapName: z.string(),
  mapDisplayName: z.string().optional(),
  series: z.object({
    data: z.array(z.object({ name: z.string(), value: z.number() })),
  }),
});

export const chartDataSchema = z.discriminatedUnion("type", [
  lineChartDataSchema,
  barChartDataSchema,
  pieChartDataSchema,
  mapChartDataSchema,
]);

export type ChartDataZod = z.infer<typeof chartDataSchema>;

