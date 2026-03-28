import { defaultMapOptions } from "./mapChartOptions";

export const lineOptions = {
  title: {
    text: "Energy Production",
  },
  xAxis: {
    data: ["Renewables", "Oil", "Grids & Storage", "Natural Gas", "Coal"],
  },
  yAxis: {
    type: "value",
  },
  series: [
    {
      name: '2015',
      type: 'line',
      stack: true,
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: [374, 818, 332, 454, 222],
    },
    {
      name: '2017',
      type: 'line',
      stack: true,
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: [410, 750, 350, 430, 215],
    },
    {
      name: '2019',
      type: 'line',
      stack: true,
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: [332, 690, 380, 410, 200],
    },
    {
      name: '2021',
      type: 'line',
      stack: true,
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: [550, 580, 420, 390, 210],
    },
    {
      name: '2023',
      type: 'line',
      stack: true,
      label: {
        show: true,
        position: 'top'
      },
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: [690, 560, 450, 380, 230],
    }
  ]
};

export const barOptions = {
  title: {
    text: "Battle of the Brands",
  },
  tooltip: {},
  xAxis: {
    data: ["Apple", "Samsung", "Xiaomi", "vivo", "OPPO"],
  },
  yAxis: {
    type: "value",
  },

  series: [
    {
      name: "Q1 2024",
      type: "bar",
      data: [17, 20, 14, 7, 8],
    },
    {
      name: "Q2 2024",
      type: "bar",
      data: [16, 19, 15, 9, 9],
    },
    {
      name: "Q3 2024",
      type: "bar",
      data: [17, 19, 14, 9, 9],
    },
    {
      name: "Q4 2024",
      type: "bar",
      data: [23, 16, 13, 8, 7],
    },
    {
      name: "Q1 2025",
      type: "bar",
      data: [19, 20, 14, 7, 7],
    },
  ],
  graphic: [],
};

export const pieOptions = {
  title: {
    text: "World Population by Continent",
    left: "center",
  },
  tooltip: {
    trigger: "item",
  },
  legend: {
    top: "bottom",
    left: "center",
    orient: "horizontal",
  },
  series: [
    {
      name: "World Population by Continent",
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
        { value: 59.40, name: "Asia" },
        { value: 17.60, name: "Africa" },
        { value: 9.40, name: "Europe" },
        { value: 7.50, name: "North America" },
        { value: 5.50, name: "South America" },
        { value: 0.60, name: "Oceania" },
      ],
    },
  ],
};

export const getOptionsByType = (type: string) => {
  switch (type) {
    case "line":
      return lineOptions;
    case "bar":
      return barOptions;
    case "pie":
      return pieOptions;
    case "map":
      return defaultMapOptions();
    case "scatter":
    //   return scatterOptions;
    // case "radar":
    //   return radarOptions;
    default:
      return {};
  }
};
