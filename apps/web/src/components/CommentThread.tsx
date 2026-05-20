"use client";

import type { Comment } from "@redditviewer/shared";
import { useMemo, useState } from "react";
import { highlightText, isRemovedContent } from "@/lib/utils";
import { RemovedBanner } from "./RemovedBanner";
import { MarkdownBody } from "./MarkdownBody";
import { UserAvatar } from "./UserAvatar";
import { CommentActionBar } from "./CommentVoteBar";
import { SearchInput } from "./SearchInput";

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

function subtreeMatches(c: Comment, q: string): boolean {
  if (commentMatches(c, q)) return true;
  return (c.replies || []).some((r) => subtreeMatches(r, q));
}

function CommentNode({
  comment,
  depth,
  query,
  isLast,
  subreddit,
}: {
  comment: Comment;
  depth: number;
  query: string;
  isLast?: boolean;
  subreddit: string;
}) {
  const q = query.trim().toLowerCase();
  const show = !q || subtreeMatches(comment, q);
  const selfMatch = q && commentMatches(comment, q);
  const [collapsed, setCollapsed] = useState(false);
  const hasReplies = (comment.replies?.length ?? 0) > 0;
  const showHighlight = Boolean(q);

  if (!show) return null;

  return (
    <div
      className={`comment-tree ${depth > 0 ? "comment-tree--nested" : ""}`}
    >
      <div
        className={`flex items-start gap-2 py-3 ${
          selfMatch ? "bg-yellow-900/30 rounded-md -mx-1 px-1" : ""
        }`}
      >
        {hasReplies && (
          <div className="flex flex-col items-center w-6 shrink-0 pt-1">
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="w-6 h-6 rounded-full border border-reddit-border bg-reddit-card flex items-center justify-center text-reddit-muted hover:bg-reddit-hover text-sm font-bold leading-none shrink-0 z-10"
              aria-label={collapsed ? "Expand thread" : "Collapse thread"}
              aria-expanded={!collapsed}
            >
              {collapsed ? "+" : "−"}
            </button>
            {!collapsed && (
              <div
                className={`w-0.5 flex-1 bg-reddit-border mt-1 min-h-[24px] ${
                  isLast ? "rounded-b" : ""
                }`}
                aria-hidden
              />
            )}
          </div>
        )}
        {!hasReplies && depth > 0 && (
          <div className="w-6 shrink-0" aria-hidden />
        )}

        <UserAvatar username={comment.author} size={32} />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs mb-1">
            <span className="font-bold text-reddit-text hover:underline cursor-default">
              u/{comment.author}
            </span>
            <span className="text-reddit-muted">·</span>
            <span className="text-reddit-muted">{comment.created}</span>
          </div>

          <div className="text-sm text-reddit-text">
            {isRemovedContent(comment.body) ? (
              <RemovedBanner subreddit={subreddit} kind="comment" />
            ) : showHighlight ? (
              <div
                className="whitespace-pre-wrap break-words markdown-body"
                dangerouslySetInnerHTML={{
                  __html: highlightText(comment.body, query),
                }}
              />
            ) : (
              <MarkdownBody text={comment.body} />
            )}
          </div>

          <CommentActionBar score={comment.score} />
        </div>
      </div>

      {hasReplies && !collapsed && (
        <div className="comment-replies ml-6 pl-4 border-l-2 border-reddit-border">
          {comment.replies.map((r, i) => (
            <CommentNode
              key={r.id}
              comment={r}
              depth={depth + 1}
              query={query}
              isLast={i === comment.replies.length - 1}
              subreddit={subreddit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentThread({
  comments,
  subreddit = "oldrobloxrevivals",
}: {
  comments: Comment[];
  subreddit?: string;
}) {
  const [query, setQuery] = useState("");

  const total = useMemo(() => flattenComments(comments).length, [comments]);
  const matchCount = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return total;
    return flattenComments(comments).filter((c) => commentMatches(c, q)).length;
  }, [comments, query, total]);

  return (
    <section className="mt-6 bg-reddit-card border border-reddit-border rounded-md">
      <div className="p-4 border-b border-reddit-border">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h3 className="font-bold text-sm">
            {query.trim()
              ? `${matchCount} comment${matchCount === 1 ? "" : "s"} match`
              : `${total} Comments`}
          </h3>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search comments..."
            className="flex-1 max-w-sm"
          />
        </div>
      </div>

      {comments.length === 0 ? (
        <p className="text-reddit-muted text-sm p-4">No comments in archive.</p>
      ) : (
        <div className="px-4 py-2 divide-y divide-reddit-border/60">
          {comments.map((c, i) => (
            <CommentNode
              key={c.id}
              comment={c}
              depth={0}
              query={query}
              isLast={i === comments.length - 1}
              subreddit={subreddit}
            />
          ))}
        </div>
      )}
    </section>
  );
}
