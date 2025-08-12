import argparse
import json
import os
from pathlib import Path
from typing import Dict, List, Tuple

from PIL import Image

"""
PKLot converter assumptions:
- Raw PKLot under /workspace/data/raw/pklot with subfolders per lot/camera and XML annotations (common in forks)
- This script expects a pre-generated CSV or JSON mapping of slot polygons and occupancy per image
- Output: /workspace/data/processed/pklot with structure:
  images/{train|val}/...jpg
  labels/{train|val}/...txt  (YOLO bbox for car in slot or classification via per-slot crops)

Note: PKLot is per-slot occupancy. Two approaches:
1) Detection-based: treat each occupied slot as a bounding box (slot polygon bbox) labeled "occupied"; vacant slots labeled "vacant" with low box confidence is not standard; better as classification.
2) Classification-based: export per-slot crops and label as vacant/occupied.

We implement (2): export crops and a YOLO-style classification directory layout:
  images/train/{vacant|occupied}/*.jpg
  images/val/{vacant|occupied}/*.jpg
This fits torchvision/ImageFolder or simple classifiers. For YOLO detect, use (1) adaptation.
"""


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def load_annotations(ann_path: Path) -> List[Dict]:
    with open(ann_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    # expected format: list of {image_path, slots: [{id, polygon: [[x,y],...], status: "vacant"|"occupied"]}
    return data


def polygon_bbox(polygon: List[List[float]]) -> Tuple[int, int, int, int]:
    xs = [p[0] for p in polygon]
    ys = [p[1] for p in polygon]
    x1, y1 = int(min(xs)), int(min(ys))
    x2, y2 = int(max(xs)), int(max(ys))
    return x1, y1, x2, y2


def crop_slot(image_path: Path, bbox: Tuple[int, int, int, int]) -> Image.Image:
    img = Image.open(image_path).convert("RGB")
    x1, y1, x2, y2 = bbox
    return img.crop((x1, y1, x2, y2))


def split_indices(n: int, val_ratio: float = 0.2) -> Tuple[List[int], List[int]]:
    import random
    idx = list(range(n))
    random.shuffle(idx)
    v = int(n * val_ratio)
    return idx[v:], idx[:v]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ann", type=str, required=True, help="Path to PKLot annotations JSON")
    parser.add_argument("--raw_root", type=str, default="/workspace/data/raw/pklot")
    parser.add_argument("--out_root", type=str, default="/workspace/data/processed/pklot")
    parser.add_argument("--val_ratio", type=float, default=0.2)
    args = parser.parse_args()

    ann = load_annotations(Path(args.ann))

    # Build a flat list of samples: (image_path, bbox, label)
    samples: List[Tuple[Path, Tuple[int, int, int, int], str]] = []
    for item in ann:
        img_path = Path(args.raw_root) / item["image_path"]
        for slot in item.get("slots", []):
            poly = slot.get("polygon")
            status = slot.get("status")  # "vacant" or "occupied"
            if not poly or status not in {"vacant", "occupied"}:
                continue
            bbox = polygon_bbox(poly)
            samples.append((img_path, bbox, status))

    train_idx, val_idx = split_indices(len(samples), args.val_ratio)

    for split_name, idxs in [("train", train_idx), ("val", val_idx)]:
        for cls_name in ["vacant", "occupied"]:
            ensure_dir(Path(args.out_root) / "images" / split_name / cls_name)

        for i in idxs:
            img_path, bbox, label = samples[i]
            try:
                crop = crop_slot(img_path, bbox)
            except Exception:
                continue
            out_path = Path(args.out_root) / "images" / split_name / label / f"{img_path.stem}_{i}.jpg"
            ensure_dir(out_path.parent)
            crop.save(out_path, quality=95)

    print(f"Exported classification dataset to {args.out_root}")


if __name__ == "__main__":
    main()