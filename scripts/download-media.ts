#!/usr/bin/env bun
import { join } from "node:path";

const root = join(import.meta.dir, "..");
process.env.APP_ROOT = root;

const { loadArchive } = await import("../apps/web/src/server/archive.ts");
const { runMediaDownload, shouldAutoDownload } = await import(
  "../apps/web/src/server/media/download.ts"
);

const limitArg = process.argv.indexOf("--limit");
const limit =
  limitArg >= 0 ? Number(process.argv[limitArg + 1]) : 0;

if (process.argv.includes("--force")) {
  const { unlink } = await import("node:fs/promises");
  const { completeMarkerPath } = await import(
    "../apps/web/src/server/media/manifest.ts"
  );
  await unlink(completeMarkerPath()).catch(() => {});
}

if (!shouldAutoDownload() && !process.argv.includes("--force")) {
  console.log(
    "Media download already complete (media/.download-complete exists).",
  );
  console.log("Use --force to run again.");
  process.exit(0);
}

const archive = await loadArchive();
await runMediaDownload(archive.posts, {
  limit: limit || undefined,
  onProgress: ({ index, total, url }) => {
    const pct = Math.round((100 * index) / total);
    console.log(`[${index}/${total} (${pct}%)] ${url.slice(0, 85)}`);
  },
});
