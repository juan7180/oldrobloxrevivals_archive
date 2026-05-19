"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { SearchScope as Scope } from "@redditviewer/shared";

export function SearchScopeToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scope = (searchParams.get("scope") as Scope) || "posts";

  function setScope(next: Scope) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("scope", next);
    params.delete("page");
    router.push(`/?${params.toString()}`);
  }

  if (!searchParams.get("q")) return null;

  return (
    <div className="flex gap-2 text-xs text-reddit-muted">
      <span>Search in:</span>
      <button
        type="button"
        onClick={() => setScope("posts")}
        className={scope === "posts" ? "text-reddit-blue font-bold" : "hover:underline"}
      >
        Posts
      </button>
      <span>·</span>
      <button
        type="button"
        onClick={() => setScope("all")}
        className={scope === "all" ? "text-reddit-blue font-bold" : "hover:underline"}
      >
        Posts + comments
      </button>
    </div>
  );
}
