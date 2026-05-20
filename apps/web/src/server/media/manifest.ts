import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "../env";
import type { MediaManifest } from "./types";

let cache: MediaManifest | null = null;

export function manifestPath(): string {
  return join(env.mediaRoot, "manifest.json");
}

export function completeMarkerPath(): string {
  return join(env.mediaRoot, ".download-complete");
}

export async function loadManifest(): Promise<MediaManifest> {
  if (cache) return cache;
  const path = manifestPath();
  if (!existsSync(path)) {
    cache = {};
    return cache;
  }
  try {
    cache = JSON.parse(await readFile(path, "utf-8")) as MediaManifest;
  } catch {
    cache = {};
  }
  return cache!;
}

export async function saveManifest(manifest: MediaManifest): Promise<void> {
  await mkdir(env.mediaRoot, { recursive: true });
  await writeFile(manifestPath(), JSON.stringify(manifest, null, 2), "utf-8");
  cache = manifest;
}

export function invalidateManifestCache(): void {
  cache = null;
}

export async function fileForPost(
  postId: string,
  localImage?: string,
): Promise<string | null> {
  if (localImage) return localImage.replace(/^media\//, "");
  const manifest = await loadManifest();
  const suffix = `post:${postId}`;
  for (const entry of Object.values(manifest)) {
    if (entry.refs.some((r) => r === suffix || r.startsWith(`${suffix}:`))) {
      return entry.file;
    }
  }
  return null;
}
