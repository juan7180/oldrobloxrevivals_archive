 "use client";

 import { useEffect, useRef, useState } from "react";
 import type { PostSummary } from "@redditviewer/shared";
 import { PostCard } from "./PostCard";

// i made this to prevent memory leaks when scrolling through the feed :cry:
 export function VirtualizedPost({
   post,
   subreddit = "oldrobloxrevivals",
 }: {
   post: PostSummary;
   subreddit?: string;
 }) {
   const ref = useRef<HTMLDivElement | null>(null);
   const [visible, setVisible] = useState(false);

   useEffect(() => {
     const el = ref.current;
     if (!el) return;

     const observer = new IntersectionObserver(
       (entries) => {
         const e = entries[0];
         if (e?.isIntersecting) {
           setVisible(true);
         } else {
           setVisible(false);
         }
       },
       { rootMargin: "1000px" },
     );

     observer.observe(el);
     return () => observer.disconnect();
   }, []);

   return (
     <div ref={ref} className="min-h-[96px]">
       {visible ? <PostCard post={post} subreddit={subreddit} /> : <div aria-hidden className="min-h-[96px]" />}
     </div>
   );
 }

