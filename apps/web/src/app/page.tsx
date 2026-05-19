import { Suspense } from "react";
import { fetchMeta, fetchPosts, fetchFlairs } from "@/lib/api";
import type { FlairInfo, SortOption, SearchScope } from "@redditviewer/shared";
import { FeedClient } from "@/components/FeedClient";
import { SortTabs } from "@/components/SortTabs";
import { SearchScopeToggle } from "@/components/SearchScope";
import { FlairFilter } from "@/components/FlairFilter";
import { SubredditSidebar } from "@/components/SubredditSidebar";
import { SubredditHeader } from "@/components/SubredditHeader";

interface PageProps {
  searchParams: Promise<{
    sort?: string;
    q?: string;
    scope?: string;
    flair?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sort = (params.sort as SortOption) || "new";
  const q = params.q ?? "";
  const scope = (params.scope as SearchScope) || "posts";
  const flair = params.flair ?? "";
  const page = params.page ? Number(params.page) : 1;
  const feedKey = `${sort}|${q}|${scope}|${flair}`;

  const [meta, posts, flairsResult] = await Promise.all([
    fetchMeta(),
    fetchPosts({ page, limit: 25, sort, q, scope, flair }),
    fetchFlairs().catch(() => [] as FlairInfo[]),
  ]);
  const flairs = flairsResult;

  return (
    <>
      <SubredditHeader />
      <main className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_312px] gap-4">
          <div className="min-w-0 space-y-3">
            <Suspense fallback={<div className="h-10 bg-reddit-card rounded" />}>
              <SortTabs />
            </Suspense>
            <Suspense>
              <FlairFilter flairs={flairs} />
            </Suspense>
            <Suspense>
              <SearchScopeToggle />
            </Suspense>
            <Suspense fallback={<div className="h-32 bg-reddit-card rounded animate-pulse" />}>
              <FeedClient key={feedKey} initial={posts} />
            </Suspense>
          </div>
          <aside className="hidden lg:block">
            <SubredditSidebar meta={meta} />
          </aside>
        </div>
        <aside className="lg:hidden mt-4">
          <SubredditSidebar meta={meta} />
        </aside>
      </main>
    </>
  );
}
