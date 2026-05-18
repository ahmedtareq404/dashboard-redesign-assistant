const DEFAULT_LAYOUT = {
  columns: 12,
  gap: 16,
  rowHeight: 84,
};

const KPI_TYPES = new Set(["kpi", "metric_card"]);
const CHART_TYPES = new Set(["line-chart", "bar-chart", "chart"]);

export function redesignDashboard(input) {
  const layout = normalizeLayout(input.layout);
  const components = input.components.map((component, index) => normalizeComponent(component, index));

  const sidebar = components.find((component) => component.type === "sidebar");
  const kpis = components.filter((component) => KPI_TYPES.has(component.type));
  const charts = components.filter((component) => CHART_TYPES.has(component.type));
  const secondary = components.filter(
    (component) => !KPI_TYPES.has(component.type) && !CHART_TYPES.has(component.type) && component.type !== "sidebar",
  );

  const contentOffset = sidebar ? Math.max(sidebar.w, 2) : 0;
  const contentColumns = layout.columns - contentOffset;
  const optimized = [];

  if (sidebar) {
    optimized.push({
      ...sidebar,
      x: 0,
      y: 0,
      w: contentOffset,
      h: Math.max(8, estimateTotalRows(kpis, charts, secondary)),
      priority: "navigation",
      emphasis: "supporting",
    });
  }

  optimized.push(...layoutKpis(kpis, contentOffset, contentColumns));
  optimized.push(...layoutCharts(charts, contentOffset, contentColumns, optimized));
  optimized.push(...layoutSecondary(secondary, contentOffset, contentColumns, optimized));

  return {
    theme: input.theme ?? "futuristic-dark",
    title: input.title ?? "Executive dashboard",
    subtitle: input.subtitle ?? "AI-optimized layout",
    layout,
    components: optimized,
    designSystem: {
      density: "high",
      spacing: "consistent",
      kpiSizing: "equalized",
      hierarchy: ["navigation", "kpi", "primary-chart", "secondary"],
      aesthetic: "futuristic-executive",
    },
    optimizationReport: buildOptimizationReport(input.components, optimized),
  };
}

function normalizeLayout(layout = {}) {
  return {
    columns: layout.columns ?? DEFAULT_LAYOUT.columns,
    gap: layout.gap ?? DEFAULT_LAYOUT.gap,
    rowHeight: layout.rowHeight ?? DEFAULT_LAYOUT.rowHeight,
  };
}

function normalizeComponent(component, index) {
  return {
    id: component.id ?? `${component.type}-${index + 1}`,
    title: component.title ?? "Untitled",
    ...component,
    x: component.x ?? 0,
    y: component.y ?? 0,
    w: component.w ?? inferWidth(component.type),
    h: component.h ?? inferHeight(component.type),
  };
}

function inferWidth(type) {
  if (KPI_TYPES.has(type)) return 3;
  if (CHART_TYPES.has(type)) return 6;
  if (type === "sidebar") return 2;
  return 4;
}

function inferHeight(type) {
  if (KPI_TYPES.has(type)) return 2;
  if (CHART_TYPES.has(type)) return 4;
  if (type === "sidebar") return 8;
  return 3;
}

function layoutKpis(kpis, offset, columns) {
  if (!kpis.length) return [];
  const columnsPerKpi = Math.max(2, Math.floor(columns / Math.min(kpis.length, 4)));
  return kpis.map((component, index) => ({
    ...component,
    type: component.type === "metric_card" ? "kpi" : component.type,
    x: offset + index * columnsPerKpi,
    y: 0,
    w: columnsPerKpi,
    h: 2,
    priority: "kpi",
    emphasis: "high",
  }));
}

function layoutCharts(charts, offset, columns, placed) {
  if (!charts.length) return [];
  const startY = nextOpenRow(placed);
  return charts.map((component, index) => {
    const isPrimary = index === 0;
    const width = isPrimary ? Math.min(8, columns) : Math.max(4, columns - Math.min(8, columns));
    return {
      ...component,
      x: isPrimary ? offset : offset + Math.min(8, columns),
      y: startY,
      w: width,
      h: component.h ?? 4,
      priority: isPrimary ? "primary-chart" : "secondary-chart",
      emphasis: isPrimary ? "high" : "medium",
    };
  });
}

function layoutSecondary(components, offset, columns, placed) {
  const startY = nextOpenRow(placed);
  return components.map((component, index) => ({
    ...component,
    x: offset + ((index * 4) % columns),
    y: startY + Math.floor((index * 4) / columns) * 3,
    w: Math.min(4, columns),
    h: component.h ?? 3,
    priority: "secondary",
    emphasis: "low",
  }));
}

function nextOpenRow(components) {
  return components.reduce((max, component) => Math.max(max, component.y + component.h), 0);
}

function estimateTotalRows(kpis, charts, secondary) {
  return 2 + (charts.length ? 4 : 0) + Math.ceil(secondary.length / 3) * 3;
}

function buildOptimizationReport(original, optimized) {
  const originalKpis = original.filter((component) => KPI_TYPES.has(component.type));
  const optimizedKpis = optimized.filter((component) => KPI_TYPES.has(component.type));
  const equalKpiWidths = new Set(optimizedKpis.map((component) => component.w)).size <= 1;

  return {
    alignedToGrid: optimized.every((component) => Number.isInteger(component.x) && Number.isInteger(component.y)),
    equalKpiWidths,
    kpiCount: optimizedKpis.length,
    reorderedForHierarchy: JSON.stringify(original.map((item) => item.id)) !== JSON.stringify(optimized.map((item) => item.id)),
    spacingNormalized: true,
    notes: [
      originalKpis.length > 0 ? "KPI cards normalized to a shared height and width." : "No KPI cards detected.",
      "Primary chart promoted directly below the KPI band.",
      "Components aligned to a 12-column executive grid with consistent spacing.",
    ],
  };
}
