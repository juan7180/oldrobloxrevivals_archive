 "use client";

 import { useEffect, useRef, useState } from "react";
 import type { PostSummary } from "@redditviewer/shared";
 import { PostCard } from "./PostCard";

export function VirtualizedPost({
  post,
  subreddit = "oldrobloxrevivals",
}: {
  post: PostSummary;
  subreddit?: string;
}) {
  return (
    <div className="min-h-[96px]">
      <PostCard post={post} subreddit={subreddit} />
    </div>
  );
}

