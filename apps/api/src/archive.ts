import type {
  Archive,
  Comment,
  Post,
  PostSummary,
  SearchScope,
  SortOption,
} from "@redditviewer/shared";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "../../..");
const ARCHIVE_PATH = join(ROOT, "data/archive.json");

let archive: Archive | null = null;
const postById = new Map<string, Post>();

export function countComments(nodes: Comment[]): number {
  return nodes.reduce((n, c) => n + 1 + countComments(c.replies || []), 0);
}

function flattenComments(nodes: Comment[], out: Comment[] = []): Comment[] {
  for (const c of nodes || []) {
    out.push(c);
    flattenComments(c.replies, out);
  }
  return out;
}

function commentMatches(c: Comment, q: string): boolean {
  return (
    (c.body || "").toLowerCase().includes(q) ||
    (c.author || "").toLowerCase().includes(q)
  );
}

function postMatchesComments(post: Post, q: string): boolean {
  return flattenComments(post.comments).some((c) => commentMatches(c, q));
}

function toSummary(post: Post): PostSummary {
  return {
    id: post.id,
    title: post.title,
    author: post.author,
    created_utc: post.created_utc,
    created: post.created,
    score: post.score,
    num_comments: post.num_comments,
    selftext: post.selftext,
    url: post.url,
    is_self: post.is_self,
    stickied: post.stickied,
    removed: post.removed,
    link_flair: post.link_flair,
    local_image: post.local_image,
    comment_count: countComments(post.comments),
  };
}

export async function loadArchive(): Promise<Archive> {
  if (archive) return archive;

  const file = Bun.file(ARCHIVE_PATH);
  if (!(await file.exists())) {
    throw new Error(
      `Archive not found at ${ARCHIVE_PATH}. Run: bun run build:archive`,
    );
  }
  const data = await file.json();
  archive = data as Archive;

  for (const post of archive.posts) {
    postById.set(post.id, post);
  }

  return archive;
}

export function getMeta() {
  if (!archive) throw new Error("Archive not loaded");
  return {
    subreddit: archive.subreddit,
    generated: archive.generated,
    post_count: archive.post_count,
    comment_count: archive.comment_count,
  };
}

export function getPost(id: string): Post | undefined {
  return postById.get(id);
}

export function getFlairs(): { name: string; count: number }[] {
  if (!archive) throw new Error("Archive not loaded");
  const counts = new Map<string, number>();
  for (const post of archive.posts) {
    const flair = post.link_flair;
    if (!flair) continue;
    counts.set(flair, (counts.get(flair) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function queryPosts(options: {
  page?: number;
  limit?: number;
  sort?: SortOption;
  q?: string;
  scope?: SearchScope;
  flair?: string;
}): { posts: PostSummary[]; total: number; page: number; limit: number } {
  if (!archive) throw new Error("Archive not loaded");

  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(100, Math.max(1, options.limit ?? 25));
  const sort = options.sort ?? "new";
  const q = (options.q ?? "").trim().toLowerCase();
  const scope = options.scope ?? "posts";
  const flair = (options.flair ?? "").trim();

  let posts = archive.posts;

  if (flair) {
    posts = posts.filter((p) => p.link_flair === flair);
  }

  if (q) {
    posts = posts.filter((p) => {
      const inPost =
        (p.title || "").toLowerCase().includes(q) ||
        (p.author || "").toLowerCase().includes(q) ||
        (p.selftext || "").toLowerCase().includes(q);
      if (inPost) return true;
      if (scope === "all") return postMatchesComments(p, q);
      return false;
    });
  }

  posts = [...posts];
  if (sort === "new") {
    posts.sort((a, b) => b.created_utc - a.created_utc);
  } else if (sort === "old") {
    posts.sort((a, b) => a.created_utc - b.created_utc);
  } else if (sort === "score") {
    posts.sort((a, b) => b.score - a.score);
  } else if (sort === "comments") {
    posts.sort(
      (a, b) => countComments(b.comments) - countComments(a.comments),
    );
  }

  const total = posts.length;
  const start = (page - 1) * limit;
  const slice = posts.slice(start, start + limit);

  return {
    posts: slice.map(toSummary),
    total,
    page,
    limit,
  };
}

export function getMediaRoot(): string {
  return join(ROOT, "media");
}
