import type {
  ArchiveMeta,
  FlairInfo,
  Post,
  PostsListResponse,
  SearchScope,
  SortOption,
} from "@redditviewer/shared";
import { env } from "@/server/env";

function apiBase(): string {
  if (typeof window !== "undefined") return "";
  return env.appUrl;
}

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${path}`);
  }
  return res.json() as Promise<T>;
}

export function fetchMeta(): Promise<ArchiveMeta> {
  return fetchApi<ArchiveMeta>("/api/meta");
}

export function fetchFlairs(): Promise<FlairInfo[]> {
  return fetchApi<FlairInfo[]>("/api/flairs");
}

export function fetchPosts(params: {
  page?: number;
  limit?: number;
  sort?: SortOption;
  q?: string;
  scope?: SearchScope;
  flair?: string;
}): Promise<PostsListResponse> {
  const sp = new URLSearchParams();
  if (params.page) sp.set("page", String(params.page));
  if (params.limit) sp.set("limit", String(params.limit));
  if (params.sort) sp.set("sort", params.sort);
  if (params.q) sp.set("q", params.q);
  if (params.scope) sp.set("scope", params.scope);
  if (params.flair) sp.set("flair", params.flair);
  const qs = sp.toString();
  return fetchApi<PostsListResponse>(`/api/posts${qs ? `?${qs}` : ""}`);
}

export function fetchPost(id: string): Promise<Post> {
  return fetchApi<Post>(`/api/posts/${id}`);
}
