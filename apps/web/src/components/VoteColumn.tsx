function UpvoteIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path d="M10 3.5 4.5 9H8v7h4V9h3.5L10 3.5z" />
    </svg>
  );
}

function DownvoteIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path d="M10 16.5 15.5 11H12V4H8v7H4.5L10 16.5z" />
    </svg>
  );
}

export function VoteColumn({
  score,
  size = "default",
}: {
  score: number;
  size?: "default" | "compact";
}) {
  const compact = size === "compact";

  return (
    <div
      className={`flex flex-col items-center shrink-0 text-reddit-muted ${
        compact ? "w-6 gap-0 pt-0.5" : "w-10 gap-0.5 pt-2"
      }`}
      aria-label={`${score} votes`}
    >
      <button
        type="button"
        disabled
        className={`rounded hover:bg-reddit-hover text-reddit-upvote disabled:opacity-100 disabled:cursor-default ${
          compact ? "p-0" : "p-0.5"
        }`}
        aria-label="Upvote"
      >
        <UpvoteIcon className={compact ? "w-4 h-4" : "w-5 h-5"} />
      </button>
      <span
        className={`font-bold text-reddit-text leading-none ${
          compact ? "text-[10px] min-w-[1ch]" : "text-xs"
        }`}
      >
        {score}
      </span>
      <button
        type="button"
        disabled
        className={`rounded hover:bg-reddit-hover text-reddit-downvote disabled:opacity-100 disabled:cursor-default ${
          compact ? "p-0" : "p-0.5"
        }`}
        aria-label="Downvote"
      >
        <DownvoteIcon className={compact ? "w-4 h-4" : "w-5 h-5"} />
      </button>
    </div>
  );
}
