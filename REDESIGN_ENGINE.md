# Dashboard Redesign Engine

`redesignDashboard(input)` takes loose dashboard JSON and returns an optimized dashboard configuration.

It improves:

- spacing consistency
- equal KPI sizing
- grid alignment
- visual hierarchy
- executive-style component ordering

## Example

```js
import { redesignDashboard } from "./src/engine/redesignDashboard.js";

const improved = redesignDashboard({
  theme: "futuristic-dark",
  layout: { columns: 12, gap: 16 },
  components: [
    { type: "kpi", title: "Revenue", x: 0, y: 0, w: 2, h: 2 },
    { type: "line-chart", title: "Sales Trend", x: 1, y: 3, w: 5, h: 4 },
  ],
});
```

The returned JSON includes:

- optimized `components`
- normalized `layout`
- semantic `priority` and `emphasis`
- `designSystem` metadata
- an `optimizationReport`

The engine is intentionally deterministic and explainable, which makes it useful before adding heavier AI ranking or learned layout models.
