"use client";

import type {
  PostsListResponse,
  SortOption,
  SearchScope,
} from "@redditviewer/shared";
import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  useInfiniteQuery,
  type InfiniteData,
} from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { PostCard } from "./PostCard";

const PAGE_SIZE = 25;
const POST_GAP = 8;
const ESTIMATED_ROW_HEIGHT = 200;

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

  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    isError,
    error,
    isLoading,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts", sort, q, scope, flair],
    queryFn: async ({ pageParam }) => {
      const sp = new URLSearchParams();
      sp.set("page", String(pageParam));
      sp.set("limit", String(PAGE_SIZE));
      sp.set("sort", sort);
      if (q) sp.set("q", q);
      if (scope) sp.set("scope", scope);
      if (flair) sp.set("flair", flair);
      const res = await fetch(`/api/posts?${sp}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load posts (${res.status})`);
      return (await res.json()) as PostsListResponse;
    },
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < Math.ceil(last.total / PAGE_SIZE) ? last.page + 1 : undefined,
    maxPages: 5,
    refetchOnWindowFocus: false,
  });

  const pages =
    (data as InfiniteData<PostsListResponse> | undefined)?.pages ??
    [initial];
  const items = pages.flatMap((p) => p.posts);
  const total = pages[0]?.total ?? initial.total;
  const hasMore = hasNextPage ?? items.length < total;

  const listRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () =>
      typeof document !== "undefined" ? document.documentElement : null,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 3,
    gap: POST_GAP,
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  const loadMore = useCallback(() => {
    if (
      loadingMoreRef.current ||
      !hasNextPage ||
      isFetchingNextPage
    ) {
      return;
    }
    loadingMoreRef.current = true;
    void fetchNextPage().finally(() => {
      loadingMoreRef.current = false;
    });
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const emptyMessage =
    q || flair ? "No posts match your filters." : "No posts in archive.";

  return (
    <div className="space-y-2">
      {(q || flair) && (
        <p className="text-sm text-reddit-muted px-1">
          {total.toLocaleString()} result{total === 1 ? "" : "s"}
          {total !== items.length ? ` · showing ${items.length}` : ""}
        </p>
      )}

      {items.length === 0 && !isLoading ? (
        <div className="bg-reddit-card border border-reddit-border rounded-md p-8 text-center text-reddit-muted">
          {emptyMessage}
        </div>
      ) : (
        <div ref={listRef} className="relative w-full">
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              position: "relative",
              width: "100%",
            }}
          >
            {virtualItems.map((virtualRow) => {
              const post = items[virtualRow.index];
              if (!post) return null;
              return (
                <div
                  key={post.id}
                  ref={rowVirtualizer.measureElement}
                  data-index={virtualRow.index}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <PostCard post={post} subreddit={subreddit} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(isLoading || isFetchingNextPage) && <LoadingSpinner />}

      {isError && (
        <div className="text-center py-4 space-y-2">
          <p className="text-sm text-reddit-orange">
            {error?.message ?? "Failed to load posts"}
          </p>
          <button
            type="button"
            onClick={() => void fetchNextPage()}
            className="text-sm text-reddit-blue hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {hasMore && (
        <div ref={sentinelRef} className="h-4 shrink-0" aria-hidden />
      )}
    </div>
  );
}
