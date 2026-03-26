/**
 * Factory function to create a new chart instance
 * with its own private coordinate state.
 */

import * as echarts from "echarts";

const graphic = [
  {
    type: "group",
    rotation: Math.PI / 4,
    bounding: "raw",
    right: 110,
    bottom: 110,
    z: 100,
    children: [
      {
        type: "rect",
        left: "center",
        top: "center",
        z: 100,
        shape: {
          width: 400,
          height: 50,
        },
        style: {
          fill: "rgba(0,0,0,0.3)",
        },
      },
      {
        type: "text",
        left: "center",
        top: "center",
        z: 100,
        style: {
          fill: "#fff",
          text: "ECHARTS LINE CHART",
          font: "bold 26px sans-serif",
        },
      },
    ],
  },
  {
    type: "group",
    left: "10%",
    top: "center",
    children: [
      {
        type: "rect",
        z: 100,
        left: "center",
        top: "middle",
        shape: {
          width: 240,
          height: 90,
        },
        style: {
          fill: "#fff",
          stroke: "#555",
          lineWidth: 1,
          shadowBlur: 8,
          shadowOffsetX: 3,
          shadowOffsetY: 3,
          shadowColor: "rgba(0,0,0,0.2)",
        },
      },
      {
        type: "text",
        z: 100,
        left: "center",
        top: "middle",
        style: {
          fill: "#333",
          width: 220,
          overflow: "break",
          text: "xAxis represents temperature in °C, yAxis represents altitude in km, An image watermark in the upper right, This text block can be placed in any place",
          font: "14px Microsoft YaHei",
        },
      },
    ],
  },
];

export function createLineAnnotation(
  chartId: string,
  initialDataPoints: { p1: number[]; p2: number[] },
) {
  // const chart = echarts.init(document.getElementById(containerId));
  const chart = echarts.getInstanceById(chartId); // Ensure instance is registered
  const updatedChart = chart as any; // TypeScript workaround to attach custom state

  // 1. Attach local state directly to this specific instance
  if (!updatedChart._annotationState) {
    updatedChart._annotationState = [];
  }

  updatedChart._annotationState = {
    p1: initialDataPoints.p1, // [x, y] in data units
    p2: initialDataPoints.p2, // [x, y] in data units
    c1Invisible: true,
    c2Invisible: true,
    selected: false,
  };

  const updateChart = () => {
    // 2. Extract current state
    const { p1, p2 } = updatedChart._annotationState;

    // 3. Convert data units to pixel units for rendering
    // const pos1 = getPixelsForPoint(updatedChart, { type: "data", value: p1 });
    // const pos2 = getPixelsForPoint(updatedChart, { type: "data", value: p2 });

    // const pos1 = updatedChart.convertToPixel("grid", p1);
    // const pos2 = updatedChart.convertToPixel("grid", p2);

    updatedChart.setOption(
      {
        graphic: [
          {
            type: "group",
            id: "line-group-" + chartId, // Unique ID per chart
            children: [
              {
                type: "line",
                id: "line-path-" + chartId,
                z: 100,
                // shape: { x1: 0, y1: 0, x2: 200, y2: 200 },
                shape: { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1] },
                style: updatedChart._annotationState.selected
                  ? { stroke: "#5470c6", lineWidth: 3 }
                  : { stroke: "#aaa", lineWidth: 1 },

                draggable: true,
                onclick: function (params) {
                  updatedChart._annotationState.selected =
                    !updatedChart._annotationState.selected;
                  updateChart();
                },
                onmouseover: function (params) {
                  updatedChart._annotationState.c1Invisible = false;
                  updatedChart._annotationState.c2Invisible = false; // Show handle on hover
                  updateChart();

                  params.event.stopPropagation();
                  params.event.preventDefault();
                  params.cancelBubble = true;
                },
                onmouseout: function (params) {
                  updatedChart._annotationState.c1Invisible = true;
                  updatedChart._annotationState.c2Invisible = true; // Hide handle on mouse out
                  updateChart();

                  params.event.stopPropagation();
                  params.event.preventDefault();
                  params.cancelBubble = true;
                },
              },
              {
                type: "circle",
                id: "endpoint-1-" + chartId,
                z: 100,
                // shape: { cx: p1[0], cy: p1[1], r: 10 },
                position: [p1[0], p1[1]],
                shape: { cx: 0, cy: 0, r: 5 },
                draggable: true,
                style: { fill: "blue", stroke: "#5470c6", lineWidth: 2 },
                invisible: updatedChart._annotationState.c1Invisible, // Hide the handle but keep it draggable
                ondrag: function (params) {
                  // 4. Update ONLY this chart's local state
                  const [newX, newY] = params.target.position;
                  updatedChart._annotationState.p1 = [newX, newY];

                  updateChart(); // Re-render to sync line
                  params.event.stopPropagation();
                  params.event.preventDefault();
                  params.cancelBubble = true;
                },
                onmouseover: function (params) {
                  updatedChart._annotationState.c1Invisible = false;
                  updatedChart._annotationState.c2Invisible = false; // Show handle on hover
                  updateChart();

                  params.event.stopPropagation();
                  params.event.preventDefault();
                  params.cancelBubble = true;
                },
                onmouseout: function (params) {
                  updatedChart._annotationState.c1Invisible = true;
                  updatedChart._annotationState.c2Invisible = true; // Hide handle on mouse out
                  updateChart();

                  params.event.stopPropagation();
                  params.event.preventDefault();
                  params.cancelBubble = true;
                },
              },
              {
                type: "circle",
                id: "endpoint-2-" + chartId,
                z: 100,
                // shape: { cx: p2[0], cy: p2[1], r: 10 },
                position: [p2[0], p2[1]],
                shape: { cx: 0, cy: 0, r: 5 },
                draggable: true,
                style: { fill: "blue", stroke: "#5470c6", lineWidth: 2 },
                invisible: updatedChart._annotationState.c2Invisible, // Hide the handle but keep it draggable
                ondrag: function (params) {
                  const [newX, newY] = params.target.position;
                  updatedChart._annotationState.p2 = [newX, newY];
                  updateChart();

                  params.event.stopPropagation();
                  params.event.preventDefault();
                  params.cancelBubble = true;
                },
                onmouseover: function (params) {
                  updatedChart._annotationState.c1Invisible = false;
                  updatedChart._annotationState.c2Invisible = false; // Show handle on hover
                  updateChart();

                  params.event.stopPropagation();
                  params.event.preventDefault();
                  params.cancelBubble = true;
                },
                onmouseout: function (params) {
                  updatedChart._annotationState.c1Invisible = true;
                  updatedChart._annotationState.c2Invisible = true; // Hide handle on mouse out
                  updateChart();

                  params.event.stopPropagation();
                  params.event.preventDefault();
                  params.cancelBubble = true;
                },
              },
            ],
          },
        ],
      },
      false,
    );
  };

  // // Sync positions when zooming/panning
  // updatedChart.on("dataZoom", updateChart);

  updateChart();
  // return updatedChart;
}

// Usage:
// const chartA = createAnnotatedChart('chart-container-a', { p1: [50, 50], p2: [150, 150] });
// const chartB = createAnnotatedChart('chart-container-b', { p1: [200, 10], p2: [300, 400] });
