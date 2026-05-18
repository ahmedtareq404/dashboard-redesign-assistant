export const dashboardConfig = {
  theme: "futuristic-dark",
  title: "Executive overview",
  subtitle: "Generated from dashboard JSON",
  layout: {
    columns: 12,
    gap: 16,
    rowHeight: 84
  },
  components: [
    {
      id: "revenue-kpi",
      type: "kpi",
      title: "Revenue",
      value: "$284,912",
      delta: "+12.4%",
      x: 0,
      y: 0,
      w: 3,
      h: 2
    },
    {
      id: "sales-trend",
      type: "line-chart",
      title: "Sales Trend",
      values: [18, 28, 26, 41, 38, 56, 61, 58, 72],
      x: 0,
      y: 2,
      w: 6,
      h: 4
    }
  ]
};
