"use client";

import { useState } from "react";
import { SUBREDDIT_RULES } from "@/lib/subredditRules";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-5 h-5 shrink-0 text-reddit-muted transition-transform ${
        open ? "rotate-180" : ""
      }`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path d="M5.5 7.5 10 12l4.5-4.5H5.5z" />
    </svg>
  );
}

export function SubredditRules() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="bg-reddit-card border border-reddit-border rounded-md overflow-hidden">
      <h2 className="px-4 py-3 text-xs font-bold text-reddit-muted uppercase tracking-wide border-b border-reddit-border">
        r/oldrobloxrevivals Rules
      </h2>
      <ul>
        {SUBREDDIT_RULES.map((rule, index) => {
          const open = openIndex === index;
          return (
            <li
              key={index}
              className="border-b border-reddit-border last:border-b-0"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : index)}
                className="w-full flex items-start gap-2 px-4 py-3 text-left hover:bg-reddit-hover transition-colors"
                aria-expanded={open}
              >
                <span className="text-reddit-muted font-bold text-sm w-5 shrink-0 pt-0.5">
                  {index + 1}
                </span>
                <span className="flex-1 text-sm text-reddit-text leading-snug pr-2">
                  {rule.title}
                </span>
                <Chevron open={open} />
              </button>
              {open && (
                <div className="px-4 pb-4 pl-11 text-sm text-reddit-muted leading-relaxed whitespace-pre-wrap">
                  {rule.body}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
