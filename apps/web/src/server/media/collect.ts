import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { join } from "node:path";
import type { Comment, Post } from "@redditviewer/shared";
import { env } from "../env";

const IMG_HOSTS = [
  "i.redd.it",
  "preview.redd.it",
  "external-preview.redd.it",
  "i.imgur.com",
];
const URL_RE = /https?:\/\/[^\s)>"']+/g;
const IMAGE_EXT_RE = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i;

export function isImageUrl(url: string): boolean {
  if (!url) return false;
  if (IMG_HOSTS.some((h) => url.includes(h))) return true;
  return IMAGE_EXT_RE.test(url);
}

function normalizeUrl(url: string): string {
  return url.split("?")[0];
}

function add(
  mapping: Map<string, Set<string>>,
  url: string,
  ref: string,
): void {
  const clean = normalizeUrl(url);
  if (!isImageUrl(clean)) return;
  let refs = mapping.get(clean);
  if (!refs) {
    refs = new Set();
    mapping.set(clean, refs);
  }
  refs.add(ref);
}

function urlsFromText(text: string): string[] {
  if (!text) return [];
  return (text.match(URL_RE) ?? []).map((u) => u.replace(/[.,)]+$/, ""));
}

function flattenComments(nodes: Comment[], out: Comment[] = []): Comment[] {
  for (const c of nodes || []) {
    out.push(c);
    flattenComments(c.replies, out);
  }
  return out;
}

function urlsFromRawPost(post: Record<string, unknown>): string[] {
  const found: string[] = [];
  const url = String(post.url ?? "");
  if (isImageUrl(url)) found.push(normalizeUrl(url));

  const preview = post.preview as Record<string, unknown> | undefined;
  for (const img of (preview?.images as Record<string, unknown>[]) ?? []) {
    const src = (img.source as Record<string, unknown> | undefined)?.url;
    if (typeof src === "string") {
      found.push(normalizeUrl(src.replace(/&amp;/g, "&")));
    }
  }

  for (const item of Object.values(
    (post.media_metadata as Record<string, unknown>) ?? {},
  )) {
    if (!item || typeof item !== "object") continue;
    let u = String((item as { s?: { u?: string } }).s?.u ?? "");
    if (!u) continue;
    u = u.replace(/&amp;/g, "&");
    if (u.startsWith("/")) u = `https://i.redd.it${u}`;
    found.push(normalizeUrl(u));
  }

  return found;
}

export function collectFromArchive(posts: Post[]): Map<string, Set<string>> {
  const mapping = new Map<string, Set<string>>();

  for (const post of posts) {
    if (isImageUrl(post.url)) add(mapping, post.url, `post:${post.id}`);
    for (const u of urlsFromText(post.selftext)) {
      add(mapping, u, `post:${post.id}`);
    }
    for (const c of flattenComments(post.comments)) {
      for (const u of urlsFromText(c.body)) {
        if (u.startsWith("/media/")) continue;
        add(mapping, u, `comment:${c.id}`);
      }
    }
  }

  return mapping;
}

async function loadJsonl(path: string): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = [];
  const stream = createReadStream(path, { encoding: "utf-8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });
  for await (const line of rl) {
    const trimmed = line.trim();
    if (trimmed) rows.push(JSON.parse(trimmed) as Record<string, unknown>);
  }
  return rows;
}

export async function collectFromSourceJsonl(): Promise<Map<string, Set<string>>> {
  const mapping = new Map<string, Set<string>>();
  const sourceDir = join(env.repoRoot, "data/source");
  const postsFile = join(sourceDir, "r_oldrobloxrevivals_posts.jsonl");
  const commentsFile = join(sourceDir, "r_oldrobloxrevivals_comments.jsonl");

  try {
    const posts = await loadJsonl(postsFile);
    for (const post of posts) {
      const pid = String(post.id ?? "");
      for (const u of urlsFromRawPost(post)) add(mapping, u, `post:${pid}`);
      const thumb = post.thumbnail;
      if (typeof thumb === "string" && thumb.startsWith("http")) {
        add(mapping, thumb, `post:${pid}:thumb`);
      }
    }
  } catch {}

  try {
    const comments = await loadJsonl(commentsFile);
    for (const comment of comments) {
      const cid = String(comment.id ?? "");
      const body = String(comment.body ?? "");
      for (const u of urlsFromText(body)) add(mapping, u, `comment:${cid}`);
    }
  } catch {}

  return mapping;
}

export function mergeUrlMaps(
  ...maps: Map<string, Set<string>>[]
): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  for (const map of maps) {
    for (const [url, refs] of map) {
      let set = out.get(url);
      if (!set) {
        set = new Set();
        out.set(url, set);
      }
      for (const r of refs) set.add(r);
    }
  }
  return out;
}
