function UpvoteOutline({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <path d="M10 4.5 5 10h3.5v5.5h3V10H15L10 4.5z" />
    </svg>
  );
}

function DownvoteOutline({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <path d="M10 15.5 15 11h-3.5V5.5h-3V11H5l5 4.5z" />
    </svg>
  );
}

function ReplyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M18 10c0 3.866-3.582 7-8 7a8.84 8.84 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <path d="M12 4.5h5v5M17 4.5 8.5 13.5M8.5 6.5H3v10h10v-5.5" />
    </svg>
  );
}

export function CommentActionBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5 mt-2 -ml-1 flex-wrap">
      <div
        className="flex items-center gap-0.5 text-xs font-bold text-reddit-muted"
        aria-label={`${score} votes`}
      >
        <button
          type="button"
          disabled
          className="p-1.5 rounded hover:bg-reddit-hover text-reddit-muted hover:text-reddit-upvote disabled:cursor-default"
          aria-label="Upvote"
        >
          <UpvoteOutline className="w-5 h-5" />
        </button>
        <span className="text-reddit-text min-w-[1.25rem] text-center tabular-nums px-0.5">
          {score}
        </span>
        <button
          type="button"
          disabled
          className="p-1.5 rounded hover:bg-reddit-hover text-reddit-muted hover:text-reddit-downvote disabled:cursor-default"
          aria-label="Downvote"
        >
          <DownvoteOutline className="w-5 h-5" />
        </button>
      </div>

      <button
        type="button"
        disabled
        className="flex items-center gap-1.5 px-2 py-1.5 rounded font-bold text-reddit-muted hover:bg-reddit-hover disabled:cursor-default text-xs"
      >
        <ReplyIcon className="w-4 h-4" />
        Reply
      </button>
      <button
        type="button"
        disabled
        className="flex items-center gap-1.5 px-2 py-1.5 rounded font-bold text-reddit-muted hover:bg-reddit-hover disabled:cursor-default text-xs"
      >
        <ShareIcon className="w-5 h-5" />
        Share
      </button>
      <button
        type="button"
        disabled
        className="p-1.5 rounded font-bold text-reddit-muted hover:bg-reddit-hover disabled:cursor-default text-lg leading-none"
        aria-label="More options"
      >
        ···
      </button>
    </div>
  );
}
