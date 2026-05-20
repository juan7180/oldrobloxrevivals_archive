import localFont from "next/font/local";

export const redditSans = localFont({
  src: [
    {
      path: "../../public/fonts/RedditSans.woff2",
      weight: "200 800",
      style: "normal",
    },
    {
      path: "../../public/fonts/RedditSans-Italic.woff2",
      weight: "200 800",
      style: "italic",
    },
  ],
  variable: "--font-reddit-sans",
  display: "swap",
});
