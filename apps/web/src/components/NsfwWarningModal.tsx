"use client";

import Link from "next/link";
import { useState } from "react";
import { isExplicitPost } from "@/lib/explicitPostIds";

export function NsfwWarningModal({ postId }: { postId: string }) {
  const [dismissed, setDismissed] = useState(false);

  if (!isExplicitPost(postId) || dismissed) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-xl px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nsfw-warning-title"
    >
      <div className="w-full max-w-md rounded-md border border-reddit-border bg-reddit-card p-6 shadow-xl">
        <div className="flex items-center justify-center mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-7 mr-2 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" fill="currentColor" className="text-red-500" />
            <path
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01"
              />
          </svg>
          <h2
            id="nsfw-warning-title"
            className="text-lg font-semibold text-reddit-text"
          >
            NSFW Warning
          </h2>
        </div>
        <p className="text-sm text-reddit-muted leading-relaxed">
          This post may contain explicit or adult content. Continue only if you
          are comfortable viewing such material.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link
            href="/"
            className="rounded-full border border-reddit-border px-5 py-2.5 text-center text-sm font-semibold text-reddit-text hover:bg-reddit-hover transition-colors"
          >
            Go back
          </Link>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-full bg-reddit-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#006cbd] transition-colors"
          >
            View post
          </button>
        </div>
      </div>
    </div>
  );
}
