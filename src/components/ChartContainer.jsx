import React from "react";

export default function ChartContainer({
  title,
  subtitle,
  action,
  children,
  className = "",
}) {
  return (
    <section className={`chart-container glass-panel flex h-full flex-col p-5 sm:p-6 ${className}`}>
      {(title || subtitle || action) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            {title && <h2 className="eyebrow text-[var(--accent-cyan)]">{title}</h2>}
            {subtitle && <p className="mt-2 text-sm text-[var(--text-muted)]">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}
