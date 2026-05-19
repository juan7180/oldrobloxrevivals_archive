export type SortOption = "new" | "old" | "score" | "comments";
export type SearchScope = "posts" | "all";

export interface Comment {
  id: string;
  parent_id: string;
  link_id: string;
  author: string;
  body: string;
  created_utc: number;
  created: string;
  score: number;
  replies: Comment[];
}

export interface Post {
  id: string;
  title: string;
  author: string;
  created_utc: number;
  created: string;
  score: number;
  num_comments: number;
  selftext: string;
  url: string;
  is_self: boolean;
  permalink: string;
  stickied: boolean;
  removed: string | null;
  link_flair: string | null;
  local_image?: string;
  comments: Comment[];
}

export interface PostSummary {
  id: string;
  title: string;
  author: string;
  created_utc: number;
  created: string;
  score: number;
  num_comments: number;
  selftext: string;
  url: string;
  is_self: boolean;
  stickied: boolean;
  removed: string | null;
  link_flair: string | null;
  local_image?: string;
  comment_count: number;
}

export interface ArchiveMeta {
  subreddit: string;
  generated: string;
  post_count: number;
  comment_count: number;
}

export interface Archive {
  subreddit: string;
  generated: string;
  post_count: number;
  comment_count: number;
  posts: Post[];
}

export interface PostsListResponse {
  posts: PostSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface FlairInfo {
  name: string;
  count: number;
}
