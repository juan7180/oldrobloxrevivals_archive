function RemovedIcon() {
  return (
    <svg
      className="w-6 h-6 shrink-0 text-reddit-orange"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function RemovedBanner({
  subreddit,
  kind = "post",
}: {
  subreddit: string;
  kind?: "post" | "comment";
}) {
  const label = kind === "comment" ? "comment" : "post";

  return (
    <div
      className="flex items-start gap-3 rounded-md border border-reddit-border bg-reddit-bg/80 px-4 py-3"
      role="status"
    >
      <RemovedIcon />
      <p className="text-sm text-reddit-muted leading-snug pt-0.5">
        Sorry, this {label} has been removed by the moderators of{" "}
        <span className="text-reddit-text font-medium">r/{subreddit}</span>
      </p>
    </div>
  );
}
