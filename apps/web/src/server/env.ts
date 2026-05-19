import { join } from "node:path";

/** Repo root (monorepo root when cwd is apps/web). */
export function getRepoRoot(): string {
  return join(process.cwd(), "../..");
}

function parseOrigins(value: string | undefined): string[] {
  if (!value?.trim()) return ["http://localhost:3000", "http://127.0.0.1:3000"];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const env = {
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
  archivePath:
    process.env.ARCHIVE_PATH ?? join(getRepoRoot(), "data/archive.json"),
  mediaRoot: process.env.MEDIA_ROOT ?? join(getRepoRoot(), "media"),
  appUrl:
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT ?? 3000}`),
};
