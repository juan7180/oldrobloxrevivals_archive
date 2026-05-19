"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { SortOption } from "@redditviewer/shared";

const SORTS: { value: SortOption; label: string }[] = [
  { value: "new", label: "New" },
  { value: "score", label: "Top" },
  { value: "old", label: "Old" },
  { value: "comments", label: "Most Comments" },
];

export function SortTabs() {
  const searchParams = useSearchParams();
  const current = (searchParams.get("sort") as SortOption) || "new";

  function href(sort: SortOption) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    params.delete("page");
    return `/?${params.toString()}`;
  }

  return (
    <div className="flex items-center gap-1 bg-reddit-card border border-reddit-border rounded-md p-1 text-sm font-bold">
      {SORTS.map((s) => (
        <Link
          key={s.value}
          href={href(s.value)}
          className={`px-3 py-1.5 rounded ${
            current === s.value
              ? "bg-reddit-bg text-reddit-text"
              : "text-reddit-muted hover:bg-reddit-hover"
          }`}
        >
          {s.label}
        </Link>
      ))}
    </div>
  );
}
