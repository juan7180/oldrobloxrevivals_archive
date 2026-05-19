import Image from "next/image";

export function SubredditHeader() {
  return (
    <div className="bg-reddit-card border-b border-reddit-border">
      <div className="relative w-full h-28 sm:h-36 overflow-hidden bg-[#1a3a5c]">
        <img
          src="/subreddit/banner.png"
          alt=""
          width={1784}
          height={497}
          className="block w-full h-full min-h-[7rem] sm:min-h-[9rem] object-cover"
          style={{ objectPosition: "50% 42%" }}
          decoding="async"
          fetchPriority="high"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-reddit-card/95 to-transparent pointer-events-none"
          aria-hidden
        />
      </div>
      <div className="relative z-10 bg-reddit-card max-w-6xl mx-auto px-4 pb-4 pt-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-end gap-3 min-w-0">
            <div className="relative -mt-10 sm:-mt-12 w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-reddit-card bg-reddit-card overflow-hidden shrink-0 shadow-md">
              <Image
                src="/subreddit/icon.png"
                alt="r/oldrobloxrevivals"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
            <div className="pb-0.5 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-reddit-text truncate">
                r/oldrobloxrevivals
              </h1>
              <p className="text-xs text-reddit-muted mt-0.5 hidden sm:block">
                what do i put here again?
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
