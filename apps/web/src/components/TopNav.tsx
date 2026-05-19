"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SearchInput } from "./SearchInput";

export function TopNav() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function onSubmit() {
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) {
      params.set("q", q.trim());
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`/?${params.toString()}`);
  }

  return (
    <header className="sticky top-0 z-[60] bg-reddit-card border-b border-reddit-border">
      <div className="max-w-6xl mx-auto flex items-center gap-3 px-4 h-12">
        <Link href="/" className="flex items-center shrink-0" aria-label="Home">
          <img
            src="/reddit-logo.svg"
            alt="Reddit"
            className="h-6 sm:h-7 w-auto"
            width={120}
            height={32}
          />
        </Link>

        <div className="flex items-center gap-1 min-w-0">
          <span className="text-reddit-muted text-sm">/</span>
          <Link
            href="/"
            className="font-bold text-sm hover:underline truncate"
          >
            r/oldrobloxrevivals
          </Link>
        </div>

        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="Search archive..."
          className="flex-1 max-w-xl mx-auto"
          onSubmit={onSubmit}
        />
      </div>
    </header>
  );
}
