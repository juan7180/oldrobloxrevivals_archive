import Link from "next/link";
import type { PostSummary } from "@redditviewer/shared";
import { slugify } from "@/lib/utils";
import { VoteColumn } from "./VoteColumn";

export function PostCard({ post }: { post: PostSummary }) {
  const slug = slugify(post.title || post.id);
  const href = `/comments/${post.id}/${slug}`;

  return (
    <article className="flex bg-reddit-card border border-reddit-border rounded-md overflow-hidden hover:border-reddit-muted/50">
      <VoteColumn score={post.score} />
      <div className="flex-1 min-w-0 py-2 pr-3">
        <div className="flex flex-wrap items-center gap-1 text-xs text-reddit-muted mb-0.5">
          {post.stickied && (
            <span className="text-green-500 font-bold">Stickied</span>
          )}
          {post.link_flair && (
            <span className="bg-reddit-flair-bg text-reddit-flair-text px-1.5 py-0.5 rounded text-[10px] font-medium">
              {post.link_flair}
            </span>
          )}
          {post.removed && (
            <span className="text-red-600">[{post.removed}]</span>
          )}
          <span>
            Posted by{" "}
            <span className="text-reddit-text">u/{post.author}</span>
          </span>
          <span>· {post.created}</span>
        </div>
        <h2 className="text-lg font-medium leading-snug">
          <Link href={href} className="hover:underline">
            {post.title}
          </Link>
        </h2>
        {post.selftext && (
          <p className="text-sm text-reddit-muted mt-1 line-clamp-2">
            {post.selftext.slice(0, 200)}
            {post.selftext.length > 200 ? "…" : ""}
          </p>
        )}
        <div className="flex gap-3 mt-2 text-xs font-bold text-reddit-muted">
          <Link
            href={href}
            className="flex items-center gap-1 hover:bg-reddit-hover px-2 py-1 rounded"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 10c0 3.866-3.582 7-8 7a8.84 8.84 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" />
            </svg>
            {post.comment_count} Comments
          </Link>
          {!post.is_self && post.url && (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:bg-reddit-hover px-2 py-1 rounded truncate max-w-[200px]"
            >
              Link
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
