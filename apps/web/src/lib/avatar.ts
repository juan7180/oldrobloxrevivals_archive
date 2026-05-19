const AVATAR_COUNT = 8;

/** Deterministic default Snoo avatar from username (offline assets in /avatars/). */
export function getDefaultAvatarSrc(username: string): string {
  const name = username || "[deleted]";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % AVATAR_COUNT;
  return `/avatars/snoo_${index}.png`;
}
