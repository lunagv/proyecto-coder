from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageOps


SOURCE_EXTENSIONS = {".jpg", ".jpeg", ".png"}


def iter_images(paths: list[Path]) -> list[Path]:
    files: list[Path] = []
    for path in paths:
        if path.is_file() and path.suffix.lower() in SOURCE_EXTENSIONS:
            files.append(path)
        elif path.is_dir():
            for child in path.rglob("*"):
                if child.is_file() and child.suffix.lower() in SOURCE_EXTENSIONS:
                    files.append(child)
    return sorted(set(files))


def convert(path: Path, *, quality: int, apply: bool) -> tuple[int, int, Path]:
    target = path.with_suffix(".webp")
    source_size = path.stat().st_size

    with Image.open(path) as source:
        image = ImageOps.exif_transpose(source)
        if image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
        if apply:
            image.save(target, format="WEBP", quality=quality, method=6)
            target_size = target.stat().st_size
        else:
            import io

            output = io.BytesIO()
            image.save(output, format="WEBP", quality=quality, method=6)
            target_size = len(output.getvalue())

    return source_size, target_size, target


def mb(value: int) -> str:
    return f"{value / 1024 / 1024:.2f} MB"


def main() -> int:
    parser = argparse.ArgumentParser(description="Create high-quality WebP copies for JPG/PNG assets.")
    parser.add_argument("paths", nargs="+", type=Path)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--quality", type=int, default=92)
    parser.add_argument("--min-source-mb", type=float, default=0.5)
    args = parser.parse_args()

    min_source = int(args.min_source_mb * 1024 * 1024)
    total_before = 0
    total_after = 0
    converted = 0

    for path in iter_images(args.paths):
        if path.stat().st_size < min_source:
            continue
        try:
            before, after, target = convert(path, quality=args.quality, apply=args.apply)
        except Exception as exc:  # noqa: BLE001
            print(f"SKIP {path} ({exc})")
            continue

        if after >= before:
            continue

        converted += 1
        total_before += before
        total_after += after
        action = "WRITE" if args.apply else "WOULD"
        print(f"{action} {target} {mb(before)} -> {mb(after)} ({100 - after / before * 100:.1f}% less)")

    print(
        f"{'Applied' if args.apply else 'Dry run'}: {converted} files, "
        f"{mb(total_before)} -> {mb(total_after)} ({mb(total_before - total_after)} saved)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
