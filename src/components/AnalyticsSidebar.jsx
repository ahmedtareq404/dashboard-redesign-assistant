import React, { useState } from "react";

const defaultItems = [
  { label: "Overview", icon: "grid" },
  { label: "Revenue", icon: "trend" },
  { label: "Customers", icon: "users" },
  { label: "Funnels", icon: "nodes" },
  { label: "Exports", icon: "download" },
];

function Icon({ name }) {
  switch (name) {
    case "trend":
      return <path d="M4 16 10 10l4 4 6-8" />;
    case "users":
      return <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 14v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />;
    case "nodes":
      return <path d="M6 6h.01M18 6h.01M12 18h.01M6 6l6 12M18 6l-6 12" />;
    case "download":
      return <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />;
    default:
      return <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />;
  }
}

export default function AnalyticsSidebar({
  brand = "Acme",
  items = defaultItems,
  activeItem = "Overview",
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`analytics-sidebar glass-panel glow-violet flex h-full flex-col p-3 sm:p-4 ${collapsed ? "is-collapsed" : ""}`}>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="neon-pill grid h-11 w-11 shrink-0 place-items-center font-semibold text-slate-950">A</div>
          <div className="sidebar-label min-w-0">
            <div className="truncate text-lg font-semibold text-[var(--text)]">{brand}</div>
            <div className="text-xs text-[var(--text-muted)]">Analytics</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="rounded-[var(--radius-pill)] border border-white/10 px-3 py-2 text-xs text-[var(--text-muted)] transition hover:border-white/25 hover:text-[var(--text)]"
        >
          {collapsed ? ">" : "<"}
        </button>
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const active = item.label === activeItem;
          return (
            <button
              key={item.label}
              type="button"
              className={`sidebar-item flex w-full items-center gap-3 rounded-[var(--radius-inner)] px-3 py-3 text-left text-sm transition ${
                active ? "neon-pill text-slate-950" : "text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text)]"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <Icon name={item.icon} />
              </svg>
              <span className="sidebar-label truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-label mt-auto pt-6 text-xs text-[var(--text-muted)]">v2.4 executive suite</div>
    </aside>
  );
}
