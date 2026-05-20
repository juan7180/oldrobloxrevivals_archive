import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import type { Post } from "@redditviewer/shared";
import { env } from "../env";
import {
  collectFromArchive,
  collectFromSourceJsonl,
  mergeUrlMaps,
} from "./collect";
import {
  completeMarkerPath,
  loadManifest,
  saveManifest,
} from "./manifest";
import type { MediaDownloadStatus, MediaManifest } from "./types";

const USER_AGENT = "oldrobloxrevivals-archive/1.0 (personal backup)";

export const downloadStatus: MediaDownloadStatus = {
  running: false,
  complete: false,
  total: 0,
  downloaded: 0,
  skipped: 0,
  failed: 0,
  startedAt: null,
  finishedAt: null,
  error: null,
};

function extFromUrl(url: string, contentType: string | null): string {
  const path = url.split("?")[0].toLowerCase();
  for (const ext of [".jpg", ".jpeg", ".png", ".gif", ".webp"]) {
    if (path.endsWith(ext)) return ext;
  }
  if (contentType?.includes("jpeg")) return ".jpg";
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("gif")) return ".gif";
  if (contentType?.includes("webp")) return ".webp";
  return ".jpg";
}

export function safeFileName(url: string, contentType: string | null): string {
  const digest = createHash("sha256").update(url).digest("hex").slice(0, 16);
  let base = basename(url.split("?")[0]);
  if (!base || base.length > 80) base = digest;
  base = base.replace(/[^\w.-]/g, "_");
  if (!base.includes(".")) base += extFromUrl(url, contentType);
  return `${digest}_${base}`;
}

async function downloadFile(url: string, dest: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      console.warn(`[media] HTTP ${res.status}: ${url.slice(0, 80)}`);
      return false;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (existsSync(dest)) {
      const prev = await stat(dest);
      if (prev.size === buf.length) return true;
    }
    await writeFile(dest, buf);
    return true;
  } catch (err) {
    console.warn(`[media] ${err instanceof Error ? err.message : err}: ${url.slice(0, 80)}`);
    return false;
  }
}

export function shouldAutoDownload(): boolean {
  if (process.env.MEDIA_AUTO_DOWNLOAD === "false") return false;
  if (process.env.NEXT_PUBLIC_MEDIA_URL?.trim()) return false;
  if (existsSync(completeMarkerPath())) return false;
  return true;
}

export async function collectAllUrls(
  posts: Post[],
): Promise<Map<string, Set<string>>> {
  const fromArchive = collectFromArchive(posts);
  const fromSource = await collectFromSourceJsonl();
  return mergeUrlMaps(fromArchive, fromSource);
}

export interface RunMediaDownloadOptions {
  limit?: number;
  delayMs?: number;
  onProgress?: (info: { index: number; total: number; url: string }) => void;
}

export async function runMediaDownload(
  posts: Post[],
  options: RunMediaDownloadOptions = {},
): Promise<void> {
  const limit =
    options.limit ??
    (process.env.MEDIA_DOWNLOAD_LIMIT
      ? Number(process.env.MEDIA_DOWNLOAD_LIMIT)
      : 0);
  const delayMs =
    options.delayMs ??
    (process.env.MEDIA_DOWNLOAD_DELAY_MS
      ? Number(process.env.MEDIA_DOWNLOAD_DELAY_MS)
      : 500);

  await mkdir(env.mediaRoot, { recursive: true });

  const urlRefs = await collectAllUrls(posts);
  let urls = [...urlRefs.keys()].sort();
  if (limit > 0) urls = urls.slice(0, limit);

  const manifest: MediaManifest = await loadManifest();
  const total = urls.length;

  downloadStatus.running = true;
  downloadStatus.complete = false;
  downloadStatus.total = total;
  downloadStatus.downloaded = 0;
  downloadStatus.skipped = 0;
  downloadStatus.failed = 0;
  downloadStatus.startedAt = new Date().toISOString();
  downloadStatus.finishedAt = null;
  downloadStatus.error = null;

  console.log(`[media] Downloading ${total} images to ${env.mediaRoot}`);

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]!;
    options.onProgress?.({ index: i + 1, total, url });

    const existing = manifest[url];
    if (existing) {
      const dest = join(env.mediaRoot, existing.file);
      if (existsSync(dest)) {
        downloadStatus.skipped++;
        continue;
      }
    }

    const fileName = existing?.file ?? safeFileName(url, null);
    const dest = join(env.mediaRoot, fileName);

    if (await downloadFile(url, dest)) {
      manifest[url] = {
        file: fileName,
        local: `media/${fileName}`,
        refs: [...(urlRefs.get(url) ?? [])].sort(),
      };
      downloadStatus.downloaded++;
      if (downloadStatus.downloaded % 25 === 0) {
        await saveManifest(manifest);
      }
    } else {
      downloadStatus.failed++;
    }

    if (delayMs > 0 && i < urls.length - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  await saveManifest(manifest);
  await writeFile(completeMarkerPath(), new Date().toISOString(), "utf-8");

  downloadStatus.running = false;
  downloadStatus.complete = true;
  downloadStatus.finishedAt = new Date().toISOString();

  console.log(
    `[media] Done: ${downloadStatus.downloaded} downloaded, ${downloadStatus.skipped} skipped, ${downloadStatus.failed} failed`,
  );
}
