/** post IDs that require an nsfw warning before viewing. */
/** added in petition of meditext **/
export const EXPLICIT_POST_IDS: Record<string, true> = {
  "16ptb4j": true,
  "18vdwky": true,
};

export function isExplicitPost(id: string): boolean {
  return id in EXPLICIT_POST_IDS;
}
