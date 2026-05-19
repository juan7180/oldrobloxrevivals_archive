#!/usr/bin/env python3
"""Verify chunked data/archive/ matches meta.json."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE_DIR = ROOT / "data" / "archive"
META_FILE = ARCHIVE_DIR / "meta.json"
CHUNKS_DIR = ARCHIVE_DIR / "chunks"


def count_comments(nodes: list[dict]) -> int:
    n = 0
    for c in nodes or []:
        n += 1 + count_comments(c.get("replies") or [])
    return n


def main() -> int:
    if not META_FILE.exists():
        print(f"FAIL: missing {META_FILE}", file=sys.stderr)
        return 1

    meta = json.loads(META_FILE.read_text(encoding="utf-8"))
    errors: list[str] = []
    warnings: list[str] = []
    all_posts: list[dict] = []
    seen_ids: set[str] = set()
    dup_ids: list[str] = []

    for entry in meta.get("chunks") or []:
        path = CHUNKS_DIR / entry["file"]
        if not path.exists():
            errors.append(f"missing chunk: {entry['file']}")
            continue

        raw = path.read_bytes()
        if len(raw) != entry["bytes"]:
            errors.append(
                f"{entry['file']}: size {len(raw)} != manifest {entry['bytes']}"
            )

        try:
            data = json.loads(raw)
        except json.JSONDecodeError as exc:
            errors.append(f"{entry['file']}: invalid JSON: {exc}")
            continue

        posts = data.get("posts")
        if not isinstance(posts, list):
            errors.append(f"{entry['file']}: missing posts array")
            continue

        if len(posts) != entry["post_count"]:
            errors.append(
                f"{entry['file']}: {len(posts)} posts != manifest {entry['post_count']}"
            )

        for post in posts:
            pid = post.get("id")
            if pid in seen_ids:
                dup_ids.append(pid)
            seen_ids.add(pid)
            all_posts.append(post)

    chunk_post_sum = sum(c["post_count"] for c in meta.get("chunks") or [])
    actual_comments = sum(count_comments(p.get("comments")) for p in all_posts)

    if chunk_post_sum != meta["post_count"]:
        errors.append(
            f"chunk post_count sum {chunk_post_sum} != manifest {meta['post_count']}"
        )
    if len(all_posts) != meta["post_count"]:
        errors.append(
            f"loaded {len(all_posts)} posts != manifest {meta['post_count']}"
        )
    if actual_comments != meta["comment_count"]:
        warnings.append(
            f"comment count: manifest {meta['comment_count']} vs tree {actual_comments}"
        )
    if dup_ids:
        errors.append(f"{len(dup_ids)} duplicate post ids (e.g. {dup_ids[:3]})")

    expected_chunks = meta.get("chunk_count")
    if expected_chunks is not None and expected_chunks != len(meta.get("chunks") or []):
        errors.append(
            f"chunk_count {expected_chunks} != len(chunks) {len(meta.get('chunks') or [])}"
        )

    print("Archive integrity")
    print(f"  posts:    {len(all_posts)} / {meta['post_count']}")
    print(f"  comments: {actual_comments} / {meta['comment_count']}")
    print(f"  chunks:   {len(meta.get('chunks') or [])}")

    if warnings:
        print("Warnings:")
        for w in warnings:
            print(f"  - {w}")

    if errors:
        print("FAIL")
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        return 1

    print("PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
