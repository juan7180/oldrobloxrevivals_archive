export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 80);
}

export function linkify(text: string): string {
  const escaped = escapeHtml(text);
  return escaped.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-reddit-blue hover:underline">$1</a>',
  );
}

export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function highlightText(text: string, query: string): string {
  if (!query.trim()) return escapeHtml(text);
  const escaped = escapeHtml(text);
  const parts = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let out = escaped;
  for (const p of parts) {
    const re = new RegExp(
      `(${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    out = out.replace(re, '<mark class="bg-yellow-200 rounded px-0.5">$1</mark>');
  }
  return out;
}

export function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url || "");
}

export function isRemovedContent(text: string | null | undefined): boolean {
  if (!text?.trim()) return false;
  const t = text.trim().toLowerCase();
  return t === "[removed]" || t === "[deleted]";
}

export { mediaSrc, resolveMediaUrl } from "./media";
