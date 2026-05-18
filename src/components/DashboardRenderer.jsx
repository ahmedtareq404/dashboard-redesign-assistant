import React from "react";
import KpiCard from "./KpiCard.jsx";
import ChartContainer from "./ChartContainer.jsx";
import AnalyticsSidebar from "./AnalyticsSidebar.jsx";
function CardShell({ title, children, className = "" }) {
  return (
    <section className={`glass-panel h-full p-5 ${className}`}>
      {title && <h2 className="eyebrow mb-4">{title}</h2>}
      {children}
    </section>
  );
}

function MetricCard({ component }) {
  return (
    <KpiCard
      title={component.title}
      value={component.value}
      delta={component.delta}
      trend={component.delta?.startsWith("-") ? "down" : "up"}
      helper={component.helper}
    />
  );
}

function Sidebar({ component }) {
  return (
    <AnalyticsSidebar
      brand={component.title}
      items={(component.items ?? []).map((label, index) => ({
        label,
        icon: ["grid", "trend", "users", "nodes", "download"][index] ?? "grid",
      }))}
      activeItem={component.items?.[0]}
    />
  );
}

function LineChart({ values }) {
  const max = Math.max(...values);
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * 100;
    const y = 100 - (value / max) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
      <polyline fill="none" stroke="currentColor" strokeWidth="3" points={points} className="text-[var(--accent-cyan)] drop-shadow-[0_0_12px_rgba(103,232,249,0.8)]" />
    </svg>
  );
}

function BarChart({ values, labels }) {
  const max = Math.max(...values);
  return (
    <div className="flex h-full items-end gap-3">
      {values.map((value, index) => (
        <div key={`${value}-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-3">
          <div className="w-full rounded-t-2xl bg-gradient-to-t from-[var(--accent-blue)] to-[var(--accent-cyan)] shadow-[0_0_20px_rgba(103,232,249,0.18)]" style={{ height: `${(value / max) * 100}%` }} />
          <span className="text-xs text-[var(--text-muted)]">{labels?.[index]}</span>
        </div>
      ))}
    </div>
  );
}

function Chart({ component }) {
  return (
    <ChartContainer title={component.title} subtitle={component.subtitle}>
      <div className="h-full min-h-[180px]">
        {component.chartType === "bars" ? <BarChart values={component.values} labels={component.labels} /> : <LineChart values={component.values} />}
      </div>
    </ChartContainer>
  );
}

function Container({ component }) {
  return (
    <CardShell title={component.title}>
      <div className="grid gap-3 md:grid-cols-3">
        {component.children?.map((item) => (
          <div key={item.label} className="inner-panel p-4">
            <div className="text-sm text-[var(--text-muted)]">{item.label}</div>
            <div className="mt-2 text-lg font-medium text-[var(--text)]">{item.meta}</div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function renderComponent(component) {
  switch (component.type) {
    case "kpi": return <MetricCard component={component} />;
    case "line-chart": return <Chart component={{ ...component, chartType: "line" }} />;
    case "bar-chart": return <Chart component={{ ...component, chartType: "bars" }} />;
    case "sidebar": return <Sidebar component={component} />;
    case "metric_card": return <MetricCard component={component} />;
    case "chart": return <Chart component={component} />;
    case "container": return <Container component={component} />;
    default:
      return <CardShell title={component.title}><p className="text-sm text-[var(--text-muted)]">Unsupported component type: {component.type}</p></CardShell>;
  }
}

export default function DashboardRenderer({ config }) {
  const layout = config.layout ?? {
    columns: config.columns,
    gap: config.gap,
    rowHeight: config.rowHeight,
  };

  return (
    <section>
      <header className="mb-6">
        <p className="eyebrow text-[var(--accent-cyan)]">Dynamic renderer</p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--text)]">{config.title}</h1>
        <p className="mt-2 text-[var(--text-muted)]">{config.subtitle}</p>
      </header>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`, gridAutoRows: `${layout.rowHeight ?? 84}px`, gap: `${layout.gap}px` }}>
        {config.components.map((component) => (
          <div
            key={component.id ?? `${component.type}-${component.title}`}
            style={{
              gridColumn: component.grid
                ? `${component.grid.colStart} / span ${component.grid.colSpan}`
                : `${component.x + 1} / span ${component.w}`,
              gridRow: component.grid
                ? `${component.grid.rowStart} / span ${component.grid.rowSpan}`
                : `${component.y + 1} / span ${component.h}`,
            }}
          >
            {renderComponent(component)}
          </div>
        ))}
      </div>
    </section>
  );
}





