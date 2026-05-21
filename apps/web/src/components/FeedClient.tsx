'use client';

import type {
  PostSummary,
  PostsListResponse,
  SortOption,
  SearchScope,
} from "@redditviewer/shared";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
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
  const filterKey = `${sort}|${q}|${scope}|${flair}`;
  const limit = 25;

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
    queryFn: async ({ pageParam = 1 }) => {
      const sp = new URLSearchParams();
      sp.set("page", String(pageParam));
      sp.set("limit", String(limit));
      sp.set("sort", sort);
      if (q) sp.set("q", q);
      if (scope) sp.set("scope", scope);
      if (flair) sp.set("flair", flair);
      const res = await fetch(`/api/posts?${sp}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load posts (${res.status})`);
      return (await res.json()) as PostsListResponse;
    },
    getNextPageParam: (last: PostsListResponse) =>
      last.page < Math.ceil(last.total / limit) ? last.page + 1 : undefined,
    initialData: ({ pages: [initial], pageParams: [initial.page ?? 1] } as any),
  } as any);
  const pages = (data as any)?.pages as PostsListResponse[] | undefined;
  const items = pages ? pages.flatMap((p) => p.posts) : initial.posts;
  const total = pages?.[0]?.total ?? initial.total;
  const hasMore = items.length < total;

  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => (typeof document !== "undefined" ? document.scrollingElement : null),
    estimateSize: () => 120,
    overscan: 5,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

  // autofetch next page when scrolling near the end
  useEffect(() => {
    if (!virtualItems.length) return;
    const last = virtualItems[virtualItems.length - 1];
    if (last.index >= items.length - 3 && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [virtualItems, items.length, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const emptyMessage = q || flair ? "No posts match your filters." : "No posts in archive.";

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
        <div ref={parentRef} className="relative">
          <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
            {virtualItems.map((virtualRow: any) => {
              const post = items[virtualRow.index];
              return (
                <div
                  key={post?.id ?? virtualRow.index}
                  data-index={virtualRow.index}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {post ? <PostCard post={post} subreddit={subreddit} /> : null}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(isLoading || isFetchingNextPage) && <LoadingSpinner />}

      {isError && (
        <div className="text-center py-4 space-y-2">
          <p className="text-sm text-reddit-orange">{error?.message ?? "Failed to load posts"}</p>
          <button
            type="button"
            onClick={() => void fetchNextPage()}
            className="text-sm text-reddit-blue hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {hasMore && <div className="h-4" aria-hidden />}
    </div>
  );
}
