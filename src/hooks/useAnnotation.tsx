import { useCallback } from "react";

export const useAnnotations = (chartInstance: any) => {
  const updateChart = useCallback(
    (annotationId: string) => {
      if (!chartInstance) return;
      const { p1, p2, c1Invisible, c2Invisible, selected } =
        chartInstance._annotationState.find(
          (a: any) => a.id === annotationId,
        ) || {};
      const chartId = chartInstance.id;

      // Generate reusable handlers
      const handlers = createGraphicHandlers(
        chartInstance,
        annotationId,
        updateChart,
      );

      const options = chartInstance.getOption();
      console.log("Existing graphic:", options.toString());
      chartInstance.setOption(
        {
          graphic: [
            {
              type: "group",
              id:
                "line-group-" +
                chartId +
                (annotationId ? "-" + annotationId : ""),
              children: [
                {
                  type: "line",
                  id:
                    "line-path-" +
                    chartId +
                    (annotationId ? "-" + annotationId : ""),
                  z: 100,
                  shape: { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1] },
                  style: {
                    stroke: selected ? "#5470c6" : "#aaa",
                    lineWidth: selected ? 4 : 2,
                  },
                  ...handlers, // Inject reusable handlers
                },
                {
                  type: "circle",
                  id:
                    "endpoint-1-" +
                    chartId +
                    (annotationId ? "-" + annotationId : ""),
                  position: [p1[0], p1[1]],
                  shape: { cx: 0, cy: 0, r: 6 },
                  invisible: c1Invisible,
                  draggable: true,
                  style: { fill: "#fff", stroke: "#5470c6", lineWidth: 2 },
                  ...handlers,
                  ondrag: (params: any) => {
                    chartInstance._annotationState[annotationId].p1 =
                      params.target.position;
                    updateChart(annotationId);
                    params.event?.stopPropagation();
                    params.event?.preventDefault();
                    params.cancelBubble = true;
                  },
                },
                {
                  type: "circle",
                  id:
                    "endpoint-2-" +
                    chartId +
                    (annotationId ? "-" + annotationId : ""),
                  position: [p2[0], p2[1]],
                  shape: { cx: 0, cy: 0, r: 6 },
                  invisible: c2Invisible,
                  draggable: true,
                  style: { fill: "#fff", stroke: "#5470c6", lineWidth: 2 },
                  ...handlers,
                  ondrag: (params: any) => {
                    chartInstance._annotationState[annotationId].p2 =
                      params.target.position;
                    updateChart(annotationId);
                    params.event?.stopPropagation();
                    params.event?.preventDefault();
                    params.cancelBubble = true;
                  },
                },
              ],
            },
          ],
        },
        false,
      );
    },
    [chartInstance],
  );

  const addLine = (initialP1: number[]) => {
    if (!chartInstance) return;

    // Initialize the state on the instance
    if (!chartInstance._annotationState) {
      chartInstance._annotationState = [];
    }
    const newAnnotation = createNewAnnotation(initialP1);

    chartInstance._annotationState.push(newAnnotation);

    // chartInstance._annotationState = {
    //   p1: initialP1,
    //   p2: [initialP1[0] + 100, initialP1[1] + 100],
    //   c1Invisible: true,
    //   c2Invisible: true,
    //   selected: false,
    // };

    updateChart(newAnnotation.id);
  };

  return { addLine };
};

export const createNewAnnotation = (initialP1: number[]) => ({
  // create a unique ID for the annotation, e.g., using a timestamp or a UUID library
  id: "annotation-" + Date.now(),
  p1: initialP1,
  p2: [initialP1[0] + 100, initialP1[1] + 100],
  c1Invisible: true,
  c2Invisible: true,
  selected: false,
});

export const createGraphicHandlers = (
  chart: any,
  annotationId: string,
  updateFn: (id: string) => void,
) => ({
  onmouseover: (params: any) => {
    chart._annotationState[annotationId].c1Invisible = false;
    chart._annotationState[annotationId].c2Invisible = false;
    updateFn(annotationId);
    params.event?.stopPropagation();
    params.event?.preventDefault();
  },
  onmouseout: (params: any) => {
    // Only hide if not selected
    if (!chart._annotationState[annotationId].selected) {
      chart._annotationState[annotationId].c1Invisible = true;
      chart._annotationState[annotationId].c2Invisible = true;
      params.cancelBubble = true;
      updateFn(annotationId);
    }
    params.event?.stopPropagation();
    params.event?.preventDefault();
    params.cancelBubble = true;
  },
  onclick: (params: any) => {
    chart._annotationState[annotationId].selected =
      !chart._annotationState[annotationId].selected;
    updateFn(annotationId);
    params.event?.stopPropagation();
    params.event?.preventDefault();
    params.cancelBubble = true;
  },
});
