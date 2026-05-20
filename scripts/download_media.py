#!/usr/bin/env python3
"""Download images referenced in the JSONL archive to media/."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "data" / "source"
POSTS_FILE = SOURCE_DIR / "r_oldrobloxrevivals_posts.jsonl"
COMMENTS_FILE = SOURCE_DIR / "r_oldrobloxrevivals_comments.jsonl"
MEDIA_DIR = ROOT / "media"
MANIFEST_FILE = MEDIA_DIR / "manifest.json"

USER_AGENT = "oldrobloxrevivals-archive/1.0 (personal backup)"
IMG_HOSTS = ("i.redd.it", "preview.redd.it", "external-preview.redd.it", "i.imgur.com")
URL_RE = re.compile(r"https?://[^\s)>\"]+")


def load_jsonl(path: Path):
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                yield json.loads(line)


def ext_from_url(url: str, content_type: str | None) -> str:
    path = url.split("?")[0].lower()
    for ext in (".jpg", ".jpeg", ".png", ".gif", ".webp"):
        if path.endswith(ext):
            return ext
    if content_type:
        if "jpeg" in content_type:
            return ".jpg"
        if "png" in content_type:
            return ".png"
        if "gif" in content_type:
            return ".gif"
        if "webp" in content_type:
            return ".webp"
    return ".jpg"


def safe_name(url: str, content_type: str | None) -> str:
    digest = hashlib.sha256(url.encode()).hexdigest()[:16]
    base = Path(url.split("?")[0]).name
    if not base or len(base) > 80:
        base = digest
    base = re.sub(r"[^\w.\-]", "_", base)
    if "." not in base:
        base += ext_from_url(url, content_type)
    return f"{digest}_{base}"


def is_image_url(url: str) -> bool:
    if any(h in url for h in IMG_HOSTS):
        return True
    return bool(re.search(r"\.(jpg|jpeg|png|gif|webp)(\?|$)", url, re.I))


def urls_from_post(post: dict) -> list[str]:
    found = []
    url = post.get("url") or ""
    if is_image_url(url):
        found.append(url.split("?")[0])

    for img in (post.get("preview") or {}).get("images") or []:
        src = (img.get("source") or {}).get("url", "")
        if src:
            found.append(src.replace("&amp;", "&").split("?")[0])

    for item in (post.get("media_metadata") or {}).values():
        if not isinstance(item, dict):
            continue
        u = (item.get("s") or {}).get("u", "")
        if not u:
            continue
        u = u.replace("&amp;", "&")
        if u.startswith("/"):
            u = "https://i.redd.it" + u
        found.append(u.split("?")[0])

    return found


def collect_urls():
    mapping: dict[str, set[str]] = {}

    def add(url: str, ref: str):
        url = url.split("?")[0]
        if not is_image_url(url):
            return
        mapping.setdefault(url, set()).add(ref)

    for post in load_jsonl(POSTS_FILE):
        pid = post.get("id", "")
        for u in urls_from_post(post):
            add(u, f"post:{pid}")
        if post.get("thumbnail") and str(post["thumbnail"]).startswith("http"):
            add(post["thumbnail"], f"post:{pid}:thumb")

    for comment in load_jsonl(COMMENTS_FILE):
        cid = comment.get("id", "")
        body = comment.get("body") or ""
        for m in URL_RE.findall(body):
            if is_image_url(m):
                add(m.rstrip(".,)"), f"comment:{cid}")

    return mapping


def download(url: str, dest: Path) -> bool:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
        if dest.exists() and dest.stat().st_size == len(data):
            return True
        dest.write_bytes(data)
        return True
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code}: {url[:80]}")
    except Exception as e:
        print(f"  Error: {e}: {url[:80]}")
    return False


def main():
    parser = argparse.ArgumentParser(description="Download images from Reddit archive JSONL")
    parser.add_argument("--limit", type=int, default=0, help="Max images to download (0 = all)")
    parser.add_argument("--delay", type=float, default=0.5, help="Seconds between requests")
    args = parser.parse_args()

    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    manifest: dict = {}
    if MANIFEST_FILE.exists():
        manifest = json.loads(MANIFEST_FILE.read_text(encoding="utf-8"))

    print("Scanning JSONL for image URLs...")
    url_refs = collect_urls()
    urls = sorted(url_refs.keys())
    print(f"Found {len(urls)} unique image URLs")

    if args.limit:
        urls = urls[: args.limit]

    ok = skip = fail = 0
    total = len(urls)
    for i, url in enumerate(urls, 1):
        if url in manifest and (MEDIA_DIR / manifest[url]["file"]).exists():
            skip += 1
            if skip % 500 == 0:
                print(f"  ... skipped {skip} already saved")
            continue

        dest_name = safe_name(url, None)
        dest = MEDIA_DIR / dest_name
        pct = round(100 * i / total)
        print(f"[{i}/{total} ({pct}%)] {url[:85]}")
        if download(url, dest):
            manifest[url] = {
                "file": dest_name,
                "local": f"media/{dest_name}",
                "refs": sorted(url_refs[url]),
            }
            ok += 1
            MANIFEST_FILE.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
        else:
            fail += 1
        time.sleep(args.delay)

    MANIFEST_FILE.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"\nDone: {ok} downloaded, {skip} skipped, {fail} failed")
    print(f"Manifest: {MANIFEST_FILE}")
    print("Re-run: bun run build:archive")


if __name__ == "__main__":
    main()
