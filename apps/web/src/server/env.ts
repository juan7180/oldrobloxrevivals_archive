import { existsSync } from "node:fs";
import { join } from "node:path";

export function getRepoRoot(): string {
  if (process.env.APP_ROOT) return process.env.APP_ROOT;
  return join(process.cwd(), "../..");
}

function parseOrigins(value: string | undefined): string[] {
  if (!value?.trim()) return ["http://localhost:3000", "http://127.0.0.1:3000"];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function defaultArchiveDir(): string {
  const dir = join(getRepoRoot(), "data/archive");
  if (existsSync(join(dir, "meta.json"))) return dir;
  return getRepoRoot();
}

export const env = {
  repoRoot: getRepoRoot(),
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
  archiveDir: process.env.ARCHIVE_DIR ?? defaultArchiveDir(),
  archivePath:
    process.env.ARCHIVE_PATH ?? join(getRepoRoot(), "data/archive.json"),
  mediaRoot: process.env.MEDIA_ROOT ?? join(getRepoRoot(), "media"),
  appUrl:
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT ?? 3000}`),
};
