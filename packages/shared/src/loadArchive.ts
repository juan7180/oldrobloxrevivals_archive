import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import type { Archive, ArchiveChunk, ArchiveManifest } from "./index";

export interface ArchivePaths {
  /** Directory containing meta.json and chunks/ */
  archiveDir: string;
  /** Legacy single-file archive.json */
  archivePath: string;
}

async function loadChunkedArchive(archiveDir: string): Promise<Archive> {
  const metaPath = join(archiveDir, "meta.json");
  if (!existsSync(metaPath)) {
    throw new Error(
      `Archive not found at ${archiveDir}. Run: bun run build:archive`,
    );
  }

  const manifest = JSON.parse(
    await readFile(metaPath, "utf-8"),
  ) as ArchiveManifest;
  const chunksDir = join(archiveDir, "chunks");
  const files = manifest.chunks?.length
    ? manifest.chunks.map((c) => c.file)
    : (await readdir(chunksDir))
        .filter((f) => f.endsWith(".json"))
        .sort();

  const chunks = await Promise.all(
    files.map(async (file) => {
      const raw = await readFile(join(chunksDir, file), "utf-8");
      return JSON.parse(raw) as ArchiveChunk;
    }),
  );
  const posts = chunks.flatMap((c) => c.posts);

  return {
    subreddit: manifest.subreddit,
    generated: manifest.generated,
    post_count: manifest.post_count,
    comment_count: manifest.comment_count,
    posts,
  };
}

async function loadLegacyArchive(archivePath: string): Promise<Archive> {
  if (!existsSync(archivePath)) {
    throw new Error(
      `Archive not found. Run: bun run build:archive (chunked: data/archive/, legacy: data/archive.json)`,
    );
  }
  const raw = await readFile(archivePath, "utf-8");
  return JSON.parse(raw) as Archive;
}

/** Load posts from chunked data/archive/ or legacy data/archive.json. */
export async function loadArchiveFromDisk(
  paths: ArchivePaths,
): Promise<Archive> {
  const metaPath = join(paths.archiveDir, "meta.json");
  return existsSync(metaPath)
    ? loadChunkedArchive(paths.archiveDir)
    : loadLegacyArchive(paths.archivePath);
}
