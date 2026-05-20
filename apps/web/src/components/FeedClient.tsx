"use client";

import type {
  PostSummary,
  PostsListResponse,
  SortOption,
  SearchScope,
} from "@redditviewer/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PostCard } from "./PostCard";

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-6" role="status" aria-label="Loading">
      <div className="w-8 h-8 border-2 border-reddit-border border-t-reddit-orange rounded-full animate-spin" />
    </div>
  );
}

export function FeedClient({
  initial,
  subreddit = "oldrobloxrevivals",
}: {
  initial: PostsListResponse;
  subreddit?: string;
}) {
  const searchParams = useSearchParams();
  const sort = (searchParams.get("sort") as SortOption) || "new";
  const q = searchParams.get("q") ?? "";
  const scope = (searchParams.get("scope") as SearchScope) || "posts";
  const flair = searchParams.get("flair") ?? "";

  const [posts, setPosts] = useState<PostSummary[]>(initial.posts);
  const [total, setTotal] = useState(initial.total);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageRef = useRef(initial.page);
  const postsRef = useRef(posts);
  const totalRef = useRef(total);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  postsRef.current = posts;
  totalRef.current = total;

  const filterKey = `${sort}|${q}|${scope}|${flair}`;

  const hasMore = posts.length < total;

  const loadMore = useCallback(async () => {
    if (loadingRef.current || postsRef.current.length >= totalRef.current) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    const nextPage = pageRef.current + 1;

    try {
      const sp = new URLSearchParams();
      sp.set("page", String(nextPage));
      sp.set("limit", "25");
      sp.set("sort", sort);
      if (q) sp.set("q", q);
      if (scope) sp.set("scope", scope);
      if (flair) sp.set("flair", flair);

      const res = await fetch(`/api/posts?${sp}`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Failed to load posts (${res.status})`);
      }

      const data: PostsListResponse = await res.json();
      if (!Array.isArray(data.posts)) {
        throw new Error("Invalid response from server");
      }

      pageRef.current = data.page;
      totalRef.current = data.total;
      setTotal(data.total);
      setPosts((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const next = data.posts.filter((p) => !ids.has(p.id));
        if (next.length === 0 && data.posts.length > 0) {
          setError("Received duplicate posts; try again.");
        }
        return [...prev, ...next];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more posts");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [sort, q, scope, flair]);

  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMoreRef.current();
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, filterKey]);

  const emptyMessage =
    q || flair
      ? "No posts match your filters."
      : "No posts in archive.";

  return (
    <div className="space-y-2">
      {(q || flair) && (
        <p className="text-sm text-reddit-muted px-1">
          {total.toLocaleString()} result{total === 1 ? "" : "s"}
          {total !== posts.length ? ` · showing ${posts.length}` : ""}
        </p>
      )}

      {posts.length === 0 && !loading ? (
        <div className="bg-reddit-card border border-reddit-border rounded-md p-8 text-center text-reddit-muted">
          {emptyMessage}
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} subreddit={subreddit} />
        ))
      )}

      {loading && <LoadingSpinner />}

      {error && (
        <div className="text-center py-4 space-y-2">
          <p className="text-sm text-reddit-orange">{error}</p>
          <button
            type="button"
            onClick={() => void loadMore()}
            className="text-sm text-reddit-blue hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {hasMore && <div ref={sentinelRef} className="h-4" aria-hidden />}
    </div>
  );
}
