# Dashboard CV Pipeline

This module detects coarse dashboard structure from a screenshot using OpenCV heuristics:

- `container`: large bordered or panel-like regions
- `kpi_card`: compact rectangular cards, usually near the top of the dashboard
- `chart`: larger analytic panels with internal line/bar density
- `sidebar`: tall navigation rails near the left or right edge

Run:

```bash
py -3 dashboard_cv/pipeline.py path/to/dashboard.png --output annotated.png --json detections.json
```

The JSON output is now a structured dashboard scene tree:

```json
{
  "canvas": { "width": 1440, "height": 900 },
  "root_id": "dashboard_root",
  "nodes": [
    {
      "id": "dashboard_root",
      "component_type": "dashboard",
      "geometry": {
        "x": 0,
        "y": 0,
        "width": 1440,
        "height": 900,
        "normalized": { "x": 0.0, "y": 0.0, "width": 1.0, "height": 1.0 }
      },
      "confidence": 1.0,
      "parent_id": null,
      "children": ["sidebar_1", "metric_card_2", "chart_3"]
    }
  ]
}
```

Detected labels are converted into component types:

- `sidebar` -> `sidebar`
- `kpi_card` -> `metric_card`
- `chart` -> `chart`
- `container` -> `container`

Hierarchy is inferred by containment: each node is assigned to the smallest enclosing dashboard/container/sidebar region, with `dashboard_root` as the fallback parent.

The detector is intentionally heuristic rather than model-based, so it is fast, explainable, and a good foundation for later ML refinement.
