#!/usr/bin/env python3
"""Convert Pushshift-style JSONL dumps into chunked data/archive/."""

from __future__ import annotations

import json
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "data" / "source"
POSTS_FILE = SOURCE_DIR / "r_oldrobloxrevivals_posts.jsonl"
COMMENTS_FILE = SOURCE_DIR / "r_oldrobloxrevivals_comments.jsonl"
ARCHIVE_DIR = ROOT / "data" / "archive"
CHUNKS_DIR = ARCHIVE_DIR / "chunks"
META_FILE = ARCHIVE_DIR / "meta.json"
LEGACY_OUT = ROOT / "data" / "archive.json"
MANIFEST_FILE = ROOT / "media" / "manifest.json"
MAX_CHUNK_BYTES = 8 * 1024 * 1024


def load_jsonl(path: Path):
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                yield json.loads(line)


def fmt_time(utc: int | float | None) -> str:
    if not utc:
        return ""
    return datetime.fromtimestamp(utc, tz=timezone.utc).strftime("%Y-%m-%d %H:%M UTC")


def load_media_refs() -> tuple[dict[str, str], dict[str, str], dict[str, str]]:
    post_images: dict[str, str] = {}
    post_thumbs: dict[str, str] = {}
    url_to_local: dict[str, str] = {}

    if not MANIFEST_FILE.exists():
        return post_images, post_thumbs, url_to_local

    manifest = json.loads(MANIFEST_FILE.read_text(encoding="utf-8"))
    for url, entry in manifest.items():
        local = entry.get("local", "")
        if not local:
            continue
        serve_path = local.removeprefix("media/")
        url_to_local[url] = serve_path
        for ref in entry.get("refs", []):
            if ref.startswith("post:") and ":thumb" in ref:
                pid = ref.split(":")[1]
                post_thumbs[pid] = serve_path
            elif ref.startswith("post:"):
                pid = ref.split(":")[1]
                post_images[pid] = serve_path
    return post_images, post_thumbs, url_to_local


def rewrite_body_urls(body: str, url_to_local: dict[str, str]) -> str:
    if not body or not url_to_local:
        return body
    out = body
    for url, local in url_to_local.items():
        out = out.replace(url, f"/media/{local}")
    return out


def strip_post(raw: dict, post_images: dict[str, str], post_thumbs: dict[str, str]) -> dict:
    pid = raw.get("id")
    local_image = post_images.get(pid) or post_thumbs.get(pid)
    return {
        "id": pid,
        "title": raw.get("title") or "",
        "author": raw.get("author") or "[deleted]",
        "created_utc": raw.get("created_utc"),
        "created": fmt_time(raw.get("created_utc")),
        "score": raw.get("score", 0),
        "num_comments": raw.get("num_comments", 0),
        "selftext": raw.get("selftext") or "",
        "url": raw.get("url") or "",
        "is_self": bool(raw.get("is_self")),
        "permalink": raw.get("permalink") or "",
        "stickied": bool(raw.get("stickied")),
        "removed": raw.get("removed_by_category"),
        "link_flair": raw.get("link_flair_text"),
        **({"local_image": local_image} if local_image else {}),
    }


def strip_comment(raw: dict, url_to_local: dict[str, str]) -> dict:
    body = raw.get("body") or ""
    return {
        "id": raw.get("id"),
        "parent_id": raw.get("parent_id"),
        "link_id": raw.get("link_id", "").replace("t3_", ""),
        "author": raw.get("author") or "[deleted]",
        "body": rewrite_body_urls(body, url_to_local),
        "created_utc": raw.get("created_utc", 0),
        "created": fmt_time(raw.get("created_utc")),
        "score": raw.get("score", 0),
    }


def build_comment_tree(comments: list[dict]) -> list[dict]:
    by_id = {c["id"]: {**c, "replies": []} for c in comments}
    roots: list[dict] = []

    for c in by_id.values():
        parent = c["parent_id"]
        if parent and parent.startswith("t1_"):
            parent_id = parent[3:]
            parent_node = by_id.get(parent_id)
            if parent_node:
                parent_node["replies"].append(c)
                continue
        roots.append(c)

    def sort_tree(nodes: list[dict]):
        nodes.sort(key=lambda n: n.get("created_utc", 0))
        for n in nodes:
            if n["replies"]:
                sort_tree(n["replies"])

    sort_tree(roots)
    return roots


def main():
    print("Loading media manifest...")
    post_images, post_thumbs, url_to_local = load_media_refs()
    if post_images or post_thumbs:
        print(f"  {len(post_images)} post images, {len(post_thumbs)} thumbnails")

    print("Loading posts...")
    posts_raw = list(load_jsonl(POSTS_FILE))
    posts_raw.sort(key=lambda p: p.get("created_utc") or 0, reverse=True)
    posts = [strip_post(p, post_images, post_thumbs) for p in posts_raw]
    post_ids = {p["id"] for p in posts}

    print("Loading comments...")
    comments_by_post: dict[str, list[dict]] = defaultdict(list)
    for raw in load_jsonl(COMMENTS_FILE):
        link_id = (raw.get("link_id") or "").replace("t3_", "")
        if link_id not in post_ids:
            continue
        comments_by_post[link_id].append(strip_comment(raw, url_to_local))

    print("Building comment trees...")
    archive_posts = []
    for post in posts:
        flat = comments_by_post.get(post["id"], [])
        archive_posts.append({**post, "comments": build_comment_tree(flat)})

    meta = {
        "subreddit": "oldrobloxrevivals",
        "generated": datetime.now(tz=timezone.utc).isoformat(),
        "post_count": len(archive_posts),
        "comment_count": sum(len(comments_by_post[pid]) for pid in comments_by_post),
    }

    print(f"Writing chunks to {CHUNKS_DIR} (max {MAX_CHUNK_BYTES // (1024 * 1024)} MB each)...")
    chunk_manifest = write_chunks(archive_posts)

    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {**meta, "chunk_count": len(chunk_manifest), "chunks": chunk_manifest}
    META_FILE.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    total_bytes = sum(c["bytes"] for c in chunk_manifest)
    print(f"Done: {meta['post_count']} posts, {meta['comment_count']} comments")
    print(f"Archive: {ARCHIVE_DIR} ({len(chunk_manifest)} chunks, {total_bytes / (1024 * 1024):.1f} MB)")
    print("Run: bun run dev")


def write_chunks(posts: list[dict]) -> list[dict]:
    CHUNKS_DIR.mkdir(parents=True, exist_ok=True)
    for old in CHUNKS_DIR.glob("*.json"):
        old.unlink()

    chunk_posts: list[dict] = []
    chunk_index = 0
    manifest: list[dict] = []

    def flush() -> None:
        nonlocal chunk_index, chunk_posts
        if not chunk_posts:
            return
        name = f"{chunk_index:04d}.json"
        path = CHUNKS_DIR / name
        payload = json.dumps({"posts": chunk_posts}, ensure_ascii=False, separators=(",", ":"))
        path.write_text(payload, encoding="utf-8")
        manifest.append(
            {"file": name, "post_count": len(chunk_posts), "bytes": len(payload.encode("utf-8"))}
        )
        chunk_index += 1
        chunk_posts = []

    wrapper_overhead = len('{"posts":[]}')  # brackets + key
    running_bytes = wrapper_overhead

    for post in posts:
        post_bytes = len(
            json.dumps(post, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        )
        sep = 1 if chunk_posts else 0
        if running_bytes + sep + post_bytes > MAX_CHUNK_BYTES and chunk_posts:
            flush()
            running_bytes = wrapper_overhead
            sep = 0
        chunk_posts.append(post)
        running_bytes += sep + post_bytes

    flush()
    return manifest


if __name__ == "__main__":
    main()
