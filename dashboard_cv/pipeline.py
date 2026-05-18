from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Iterable, List, Sequence, Tuple

import cv2
import numpy as np


@dataclass
class Detection:
    label: str
    bbox: Tuple[int, int, int, int]
    score: float

    @property
    def x(self) -> int:
        return self.bbox[0]

    @property
    def y(self) -> int:
        return self.bbox[1]

    @property
    def w(self) -> int:
        return self.bbox[2]

    @property
    def h(self) -> int:
        return self.bbox[3]


@dataclass
class Geometry:
    x: int
    y: int
    width: int
    height: int
    normalized: dict


@dataclass
class DashboardNode:
    id: str
    component_type: str
    geometry: Geometry
    confidence: float
    parent_id: str | None = None
    children: List[str] = field(default_factory=list)


@dataclass
class DashboardLayout:
    canvas: dict
    root_id: str
    nodes: List[DashboardNode]


class DashboardDetector:
    def __init__(self, min_area_ratio: float = 0.01) -> None:
        self.min_area_ratio = min_area_ratio

    def detect(self, image: np.ndarray) -> List[Detection]:
        height, width = image.shape[:2]
        image_area = height * width

        edges = self._edge_map(image)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        candidates: List[Detection] = []
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            area = w * h
            if area < image_area * self.min_area_ratio:
                continue

            fill_ratio = cv2.contourArea(contour) / max(area, 1)
            aspect_ratio = w / max(h, 1)
            rectangularity = self._rectangularity(contour, area)

            if self._is_sidebar(x, y, w, h, width, height):
                score = self._clamp(0.5 * rectangularity + 0.3 * fill_ratio + 0.2)
                candidates.append(Detection("sidebar", (x, y, w, h), score))
                continue

            if self._is_kpi_card(x, y, w, h, width, height, aspect_ratio):
                score = self._clamp(0.45 * rectangularity + 0.35 * fill_ratio + 0.2)
                candidates.append(Detection("kpi_card", (x, y, w, h), score))
                continue

            crop = image[y : y + h, x : x + w]
            if self._is_chart(crop, w, h, width, height):
                score = self._clamp(0.4 * rectangularity + 0.3 * fill_ratio + 0.3)
                candidates.append(Detection("chart", (x, y, w, h), score))
                continue

            if rectangularity > 0.65:
                score = self._clamp(0.55 * rectangularity + 0.45 * fill_ratio)
                candidates.append(Detection("container", (x, y, w, h), score))

        return self._non_max_suppression(candidates)

    def annotate(self, image: np.ndarray, detections: Sequence[Detection]) -> np.ndarray:
        annotated = image.copy()
        palette = {
            "container": (255, 193, 7),
            "kpi_card": (34, 197, 94),
            "chart": (59, 130, 246),
            "sidebar": (244, 63, 94),
        }

        for detection in detections:
            x, y, w, h = detection.bbox
            color = palette[detection.label]
            cv2.rectangle(annotated, (x, y), (x + w, y + h), color, 2)
            text = f"{detection.label} {detection.score:.2f}"
            cv2.putText(
                annotated,
                text,
                (x, max(20, y - 8)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                color,
                2,
                cv2.LINE_AA,
            )
        return annotated

    def to_layout(self, image: np.ndarray, detections: Sequence[Detection]) -> DashboardLayout:
        height, width = image.shape[:2]
        nodes: List[DashboardNode] = [
            DashboardNode(
                id="dashboard_root",
                component_type="dashboard",
                geometry=self._geometry((0, 0, width, height), width, height),
                confidence=1.0,
            )
        ]

        sorted_detections = sorted(
            detections,
            key=lambda item: (item.y, item.x, item.w * item.h),
        )

        for index, detection in enumerate(sorted_detections, start=1):
            component_type = {
                "container": "container",
                "kpi_card": "metric_card",
                "chart": "chart",
                "sidebar": "sidebar",
            }[detection.label]
            nodes.append(
                DashboardNode(
                    id=f"{component_type}_{index}",
                    component_type=component_type,
                    geometry=self._geometry(detection.bbox, width, height),
                    confidence=detection.score,
                )
            )

        self._assign_hierarchy(nodes)
        return DashboardLayout(
            canvas={"width": width, "height": height},
            root_id="dashboard_root",
            nodes=nodes,
        )

    @staticmethod
    def _edge_map(image: np.ndarray) -> np.ndarray:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 40, 120)
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
        return cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel, iterations=2)

    @staticmethod
    def _rectangularity(contour: np.ndarray, bbox_area: int) -> float:
        perimeter = cv2.arcLength(contour, True)
        polygon = cv2.approxPolyDP(contour, 0.03 * perimeter, True)
        contour_area = cv2.contourArea(contour)
        shape_bonus = 1.0 if len(polygon) == 4 else 0.75 if len(polygon) <= 6 else 0.5
        return min(1.0, (contour_area / max(bbox_area, 1)) * shape_bonus)

    @staticmethod
    def _is_sidebar(x: int, y: int, w: int, h: int, width: int, height: int) -> bool:
        edge_aligned = x < width * 0.08 or (x + w) > width * 0.92
        tall = h > height * 0.55
        narrow = w < width * 0.28
        return edge_aligned and tall and narrow

    @staticmethod
    def _is_kpi_card(
        x: int,
        y: int,
        w: int,
        h: int,
        width: int,
        height: int,
        aspect_ratio: float,
    ) -> bool:
        near_top = y < height * 0.4
        moderate_size = width * 0.08 < w < width * 0.35 and height * 0.08 < h < height * 0.28
        card_shape = 1.1 <= aspect_ratio <= 3.5
        return near_top and moderate_size and card_shape

    @staticmethod
    def _is_chart(crop: np.ndarray, w: int, h: int, width: int, height: int) -> bool:
        large_panel = w > width * 0.22 and h > height * 0.18
        gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        local_edges = cv2.Canny(gray, 50, 140)
        edge_density = float(np.count_nonzero(local_edges)) / max(w * h, 1)
        return large_panel and 0.02 < edge_density < 0.24

    @staticmethod
    def _clamp(value: float) -> float:
        return round(max(0.0, min(1.0, value)), 3)

    @staticmethod
    def _geometry(bbox: Tuple[int, int, int, int], width: int, height: int) -> Geometry:
        x, y, w, h = bbox
        return Geometry(
            x=x,
            y=y,
            width=w,
            height=h,
            normalized={
                "x": round(x / max(width, 1), 4),
                "y": round(y / max(height, 1), 4),
                "width": round(w / max(width, 1), 4),
                "height": round(h / max(height, 1), 4),
            },
        )

    def _assign_hierarchy(self, nodes: List[DashboardNode]) -> None:
        root = nodes[0]
        for node in nodes[1:]:
            possible_parents = [
                candidate
                for candidate in nodes
                if candidate.id != node.id
                and candidate.component_type in {"dashboard", "container", "sidebar"}
                and self._contains(candidate.geometry, node.geometry)
            ]
            parent = min(
                possible_parents,
                key=lambda candidate: candidate.geometry.width * candidate.geometry.height,
                default=root,
            )
            node.parent_id = parent.id
            parent.children.append(node.id)

    @staticmethod
    def _contains(outer: Geometry, inner: Geometry, padding: int = 2) -> bool:
        return (
            outer.x - padding <= inner.x
            and outer.y - padding <= inner.y
            and outer.x + outer.width + padding >= inner.x + inner.width
            and outer.y + outer.height + padding >= inner.y + inner.height
        )

    def _non_max_suppression(self, detections: Iterable[Detection], iou_threshold: float = 0.35) -> List[Detection]:
        ordered = sorted(detections, key=lambda item: item.score, reverse=True)
        kept: List[Detection] = []

        while ordered:
            current = ordered.pop(0)
            kept.append(current)
            ordered = [
                candidate
                for candidate in ordered
                if self._iou(current.bbox, candidate.bbox) < iou_threshold
                or current.label != candidate.label
            ]
        return kept

    @staticmethod
    def _iou(a: Tuple[int, int, int, int], b: Tuple[int, int, int, int]) -> float:
        ax1, ay1, aw, ah = a
        bx1, by1, bw, bh = b
        ax2, ay2 = ax1 + aw, ay1 + ah
        bx2, by2 = bx1 + bw, by1 + bh

        ix1, iy1 = max(ax1, bx1), max(ay1, by1)
        ix2, iy2 = min(ax2, bx2), min(ay2, by2)
        intersection = max(0, ix2 - ix1) * max(0, iy2 - iy1)
        union = aw * ah + bw * bh - intersection
        return intersection / max(union, 1)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Detect dashboard layout elements from a screenshot.")
    parser.add_argument("image", type=Path, help="Path to the dashboard screenshot.")
    parser.add_argument("--output", type=Path, default=Path("annotated_dashboard.png"), help="Annotated image path.")
    parser.add_argument("--json", type=Path, default=Path("detections.json"), help="Detection JSON path.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    image = cv2.imread(str(args.image))
    if image is None:
        raise FileNotFoundError(f"Could not read image: {args.image}")

    detector = DashboardDetector()
    detections = detector.detect(image)
    annotated = detector.annotate(image, detections)

    cv2.imwrite(str(args.output), annotated)
    layout = detector.to_layout(image, detections)

    args.json.write_text(json.dumps(asdict(layout), indent=2))

    print(f"Detected {len(detections)} regions")
    print(f"Annotated image: {args.output}")
    print(f"JSON output: {args.json}")


if __name__ == "__main__":
    main()
