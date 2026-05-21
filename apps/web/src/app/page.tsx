import { Suspense } from "react";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import QueryProviderClient from "@/components/QueryProviderClient";
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
  const qc = new QueryClient();
  // fetch first page and seed it into the query client so the client can hydrate
  const firstPage = await fetchPosts({ page, limit: 25, sort, q, scope, flair });
  qc.setQueryData(["posts", sort, q, scope, flair], { pages: [firstPage], pageParams: [1] });

  const [meta, flairsResult] = await Promise.all([
    fetchMeta(),
    fetchFlairs().catch(() => [] as FlairInfo[]),
  ]);
  const flairs = flairsResult;
  const dehydrated = dehydrate(qc);
  const initial = qc.getQueryData<any>(["posts", sort, q, scope, flair])?.pages?.[0] ?? firstPage;

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
              <QueryProviderClient dehydratedState={dehydrated}>
                <FeedClient key={feedKey} initial={initial} subreddit={meta.subreddit} />
              </QueryProviderClient>
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
