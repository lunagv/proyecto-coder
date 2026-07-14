from __future__ import annotations

import argparse
import io
import os
from pathlib import Path

from PIL import Image, ImageOps


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def iter_images(paths: list[Path]) -> list[Path]:
    images: list[Path] = []
    for path in paths:
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS:
            images.append(path)
        elif path.is_dir():
            for child in path.rglob("*"):
                if child.is_file() and child.suffix.lower() in IMAGE_EXTENSIONS:
                    images.append(child)
    return sorted(set(images))


def encode_image(path: Path, *, jpeg_quality: int, webp_quality: int) -> bytes | None:
    suffix = path.suffix.lower()
    with Image.open(path) as source:
        image = ImageOps.exif_transpose(source)

        if suffix in {".jpg", ".jpeg"}:
            if image.mode not in {"RGB", "L"}:
                image = image.convert("RGB")
            output = io.BytesIO()
            image.save(
                output,
                format="JPEG",
                quality=jpeg_quality,
                optimize=True,
                progressive=True,
                subsampling="keep",
            )
            return output.getvalue()

        if suffix == ".png":
            output = io.BytesIO()
            image.save(output, format="PNG", optimize=True, compress_level=9)
            return output.getvalue()

        if suffix == ".webp":
            output = io.BytesIO()
            image.save(output, format="WEBP", quality=webp_quality, method=6)
            return output.getvalue()

    return None


def format_mb(size: int) -> str:
    return f"{size / 1024 / 1024:.2f} MB"


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Optimize JPG, PNG, and WebP files in place when the result is smaller."
    )
    parser.add_argument("paths", nargs="+", type=Path)
    parser.add_argument("--apply", action="store_true", help="Write optimized files.")
    parser.add_argument("--jpeg-quality", type=int, default=92)
    parser.add_argument("--webp-quality", type=int, default=88)
    parser.add_argument(
        "--min-saving",
        type=int,
        default=1024,
        help="Minimum bytes saved before replacing a file.",
    )
    args = parser.parse_args()

    files = iter_images(args.paths)
    total_before = 0
    total_after = 0
    changed = 0

    for path in files:
        before = path.stat().st_size
        total_before += before
        try:
            optimized = encode_image(
                path,
                jpeg_quality=args.jpeg_quality,
                webp_quality=args.webp_quality,
            )
        except Exception as exc:  # noqa: BLE001
            print(f"SKIP {path} ({exc})")
            total_after += before
            continue

        if not optimized:
            total_after += before
            continue

        after = len(optimized)
        if before - after >= args.min_saving:
            changed += 1
            total_after += after
            ratio = 100 - (after / before * 100)
            action = "WRITE" if args.apply else "WOULD"
            print(f"{action} {path} {format_mb(before)} -> {format_mb(after)} ({ratio:.1f}% less)")
            if args.apply:
                temp_path = path.with_suffix(path.suffix + ".tmp")
                temp_path.write_bytes(optimized)
                os.replace(temp_path, path)
        else:
            total_after += before

    saved = total_before - total_after
    mode = "Applied" if args.apply else "Dry run"
    print(
        f"{mode}: {changed} files, {format_mb(total_before)} -> {format_mb(total_after)} "
        f"({format_mb(saved)} saved)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
