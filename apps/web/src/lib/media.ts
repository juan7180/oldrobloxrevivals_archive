import { mediaPublicBase, mediaKey } from "./mediaBase";

export { mediaPublicBase };

export function mediaSrc(
  localImage?: string,
  fileFromManifest?: string | null,
): string | null {
  const key = localImage
    ? mediaKey(localImage)
    : fileFromManifest
      ? mediaKey(fileFromManifest)
      : null;
  if (!key) return null;
  const base = mediaPublicBase();
  if (base) return `${base}/${key}`;
  return `/media/${key}`;
}

export function resolveMediaUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = mediaPublicBase();
  if (base && url.startsWith("/media/")) {
    return `${base}${url.slice("/media".length)}`;
  }
  return url;
}
