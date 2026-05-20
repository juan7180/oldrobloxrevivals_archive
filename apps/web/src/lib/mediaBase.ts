export function mediaPublicBase(): string | null {
  const base = process.env.NEXT_PUBLIC_MEDIA_URL?.trim();
  return base ? base.replace(/\/$/, "") : null;
}

export function mediaKey(localImage: string): string {
  return localImage.replace(/^media\//, "");
}
