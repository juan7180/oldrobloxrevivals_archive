import type { ArchiveMeta } from "@redditviewer/shared";
import { SubredditRules } from "./SubredditRules";

export function SubredditSidebar({ meta }: { meta: ArchiveMeta }) {
  return (
    <aside className="space-y-4">
      <div className="bg-reddit-card border border-reddit-border rounded-md overflow-hidden">
        <div className="p-4">
          <h2 className="font-bold text-base text-reddit-text">
            Old Roblox Revivals
          </h2>
          <p className="text-sm text-reddit-muted mt-2 leading-relaxed">
            A subreddit for discussion of legacy Roblox private servers,
            colloquially known as revivals!
          </p>
          <p className="text-xs text-reddit-muted mt-3 flex items-center gap-1.5">
            <span aria-hidden>🎂</span>
            Created Jul 18, 2021
          </p>
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-reddit-border">
            <div>
              <p className="text-lg font-bold text-reddit-text tabular-nums">
                {meta.post_count.toLocaleString()}
              </p>
              <p className="text-xs text-reddit-muted">Archived posts</p>
            </div>
            <div className="text-right sm:text-left">
              <p className="text-lg font-bold text-reddit-text tabular-nums">
                {meta.comment_count.toLocaleString()}
              </p>
              <p className="text-xs text-reddit-muted">Archived comments</p>
            </div>
          </div>
        </div>
      </div>

      <SubredditRules />

      <div className="bg-reddit-card border border-reddit-border rounded-md p-4 text-xs text-reddit-muted leading-relaxed">
        <p>
          This is a read-only historical snapshot. Voting, posting, and joining
          are disabled.
        </p>
      </div>
    </aside>
  );
}
