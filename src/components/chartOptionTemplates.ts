export const lineOptions = {
  animationDuration: 1000,
  xAxis: {
    data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  yAxis: {
    type: "value",
  },
  series: [
    {
      data: [150, 230, 224, 218, 135, 147, 260],
      type: "line",
      areaStyle: {},
    },
  ],
};

export const barOptions = {
  animationDuration: 1000,
  title: {
    text: "ECharts Example",
  },
  tooltip: {},
  xAxis: {
    data: ["A", "B", "C", "D", "E"],
  },
  yAxis: {},
  series: [
    {
      name: "Example Series",
      type: "bar",
      data: [5, 20, 36, 10, 10],
    },
  ],
};

export const pieOptions = {
  animationDuration: 1200,
  title: {
    text: "Referer of a Website",
    left: "center",
  },
  tooltip: {
    trigger: "item",
  },
  legend: {
    top: "bottom",
    left: "left",
    orient: "vertical",
    padding: [15, 15],
  },
  series: [
    {
      name: "Access From",
      type: "pie",
      radius: ["40%", "70%"],
      padAngle: 10,
      roseType: "area",
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: "black",
        borderWidth: 2,
      },
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: "bold",
        },
      },
      labelLine: {
        show: false,
      },
      data: [
        { value: 1048, name: "Search Engine" },
        { value: 735, name: "Direct" },
        { value: 580, name: "Email" },
        { value: 484, name: "Union Ads" },
        { value: 300, name: "Video Ads" },
      ],
    },
  ],
};

export const mapOptions = {
  title: {
    text: "Map Chart",
    left: "center",
  },
  animationDelayUpdate: function (idx: number) {
    return idx * 100;
  },
  tooltip: {
    trigger: "item",
  },
  visualMap: {
    min: 0,
    max: 1000,
    left: "left",
    top: "bottom",
    text: ["High", "Low"],
    calculable: true,
    inRange: {
      color: ["#e0f2fe", "#0369a1"], // Light blue to Dark blue
    },
  },
  series: [
    {
      visualMap: {
        min: 0,
        max: 1000,
        left: "left",
        top: "bottom",
        text: ["High", "Low"],
        calculable: true,
        inRange: {
          color: ["#e0f2fe", "#0369a1"], // Light blue to Dark blue
        },
      },
      name: "Iceland Map",
      type: "map",
      map: "iceland", // Use the correct map name matching the GeoJSON file
      roam: true,
      label: {
        show: true,
      },
      itemStyle: {
        borderRadius: 10,
        borderColor: "yellow",
        borderWidth: 2,
      },
      data: [],
    },
  ],
};

// export const radarOptions = {
//   animationDuration: 1000,
//   title: {
//     text: "Basic Radar Chart",
//   },
//   legend: {
//     data: ["Allocated Budget", "Actual Spending"],
//   },
//   radar: {
//     indicator: [
//       { name: "Sales", max: 6500 },
//       { name: "Administration", max: 16000 },
//       { name: "Information Technology", max: 30000 },
//       { name: "Customer Support", max: 38000 },
//       { name: "Development", max: 52000 },
//       { name: "Marketing", max: 25000 },
//     ],
//   },
//   series: [
//     {
//       name: "Budget vs spending",
//       type: "radar",
//       data: [
//         {
//           value: [4200, 3000, 20000, 35000, 50000, 18000],
//           name: "Allocated Budget",
//         },
//         {
//           value: [5000, 14000, 28000, 26000, 42000, 21000],
//           name: "Actual Spending",
//         },
//       ],
//     },
//   ],
// };

// export const scatterOptions = {
//   animationDuration: 1000,
//   title: {
//     text: "Scatter Plot",
//   },
//   tooltip: {},
//   xAxis: {
//     data: ["A", "B", "C", "D", "E"],
//   },
//   yAxis: {},
//   series: [
//     {
//       symbolSize: 20,
//       data: [
//         [10.0, 8.04],
//         [8.07, 6.95],
//         [13.0, 7.58],
//         [9.05, 8.81],
//         [11.0, 8.33],
//         [14.0, 7.66],
//         [13.4, 6.81],
//         [10.0, 6.33],
//         [14.0, 8.96],
//         [12.5, 6.82],
//         [9.15, 7.2],
//         [11.5, 7.2],
//         [3.03, 4.23],
//         [12.2, 7.83],
//         [2.02, 4.47],
//         [1.05, 3.33],
//         [4.05, 4.96],
//         [6.03, 7.24],
//         [12.0, 6.26],
//         [12.0, 8.84],
//         [7.08, 5.82],
//         [5.02, 5.68],
//       ],
//       type: "scatter",
//     },
//   ],
// };

export const getOptionsByType = (type: string) => {
  switch (type) {
    case "line":
      return lineOptions;
    case "bar":
      return barOptions;
    case "pie":
      return pieOptions;
    case "map":
      return mapOptions;
    case "scatter":
    //   return scatterOptions;
    // case "radar":
    //   return radarOptions;
    default:
      return {};
  }
};
