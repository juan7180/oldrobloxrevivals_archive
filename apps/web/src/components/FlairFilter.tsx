"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { FlairInfo } from "@redditviewer/shared";

export function FlairFilter({ flairs }: { flairs: FlairInfo[] }) {
  const searchParams = useSearchParams();
  const current = searchParams.get("flair") ?? "";

  function href(flair: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (flair) {
      params.set("flair", flair);
    } else {
      params.delete("flair");
    }
    params.delete("page");
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  if (flairs.length === 0) return null;

  return (
    <div className="bg-reddit-card border border-reddit-border rounded-md p-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-reddit-muted px-1 mb-2">
        Filter by flair
      </p>
      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
        <Link
          href={href(null)}
          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
            !current
              ? "bg-reddit-orange text-white border-reddit-orange"
              : "bg-reddit-bg border-reddit-border hover:border-reddit-orange text-reddit-text"
          }`}
        >
          All
        </Link>
        {flairs.map((f) => (
          <Link
            key={f.name}
            href={href(f.name)}
            title={`${f.count.toLocaleString()} posts`}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              current === f.name
                ? "bg-reddit-orange text-white border-reddit-orange"
                : "bg-reddit-bg border-reddit-border hover:border-reddit-blue text-reddit-text"
            }`}
          >
            {f.name}
            <span className="ml-1 opacity-70">{f.count.toLocaleString()}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
