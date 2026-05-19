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
}: {
  initial: PostsListResponse;
}) {
  const searchParams = useSearchParams();
  const sort = (searchParams.get("sort") as SortOption) || "new";
  const q = searchParams.get("q") ?? "";
  const scope = (searchParams.get("scope") as SearchScope) || "posts";
  const flair = searchParams.get("flair") ?? "";

  const [posts, setPosts] = useState<PostSummary[]>(initial.posts);
  const [page, setPage] = useState(initial.page);
  const [total, setTotal] = useState(initial.total);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filterKey = `${sort}|${q}|${scope}|${flair}`;

  useEffect(() => {
    setPosts(initial.posts);
    setPage(initial.page);
    setTotal(initial.total);
    loadingRef.current = false;
    setLoading(false);
  }, [initial, filterKey]);

  const hasMore = posts.length < total;

  const loadMore = useCallback(async () => {
    if (loadingRef.current || posts.length >= total) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      sp.set("page", String(page + 1));
      sp.set("limit", "25");
      sp.set("sort", sort);
      if (q) sp.set("q", q);
      if (scope) sp.set("scope", scope);
      if (flair) sp.set("flair", flair);
      const res = await fetch(`/api/posts?${sp}`);
      const data: PostsListResponse = await res.json();
      setPosts((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const next = data.posts.filter((p) => !ids.has(p.id));
        return [...prev, ...next];
      });
      setPage(data.page);
      setTotal(data.total);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [page, sort, q, scope, flair, posts.length, total]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, hasMore, filterKey]);

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
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}

      {loading && <LoadingSpinner />}

      {hasMore && <div ref={sentinelRef} className="h-4" aria-hidden />}
    </div>
  );
}
