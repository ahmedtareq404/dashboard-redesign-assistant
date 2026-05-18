import React from "react";

export default function KpiCard({
  title,
  value,
  delta,
  trend = "up",
  helper,
  icon,
  className = "",
}) {
  const positive = trend === "up";

  return (
    <article className={`kpi-card glass-panel flex min-h-[10rem] flex-col justify-between p-5 sm:p-6 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{title}</p>
          <div className="mt-4 text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">{value}</div>
        </div>
        {icon && <div className="kpi-icon shrink-0">{icon}</div>}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {delta && (
          <span className={`rounded-[var(--radius-pill)] px-3 py-1 text-sm font-medium ${positive ? "bg-emerald-300/10 text-[var(--accent-green)]" : "bg-rose-300/10 text-[var(--accent-rose)]"}`}>
            {delta}
          </span>
        )}
        {helper && <span className="text-sm text-[var(--text-muted)]">{helper}</span>}
      </div>
    </article>
  );
}
