import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchMeta, fetchPost } from "@/lib/api";
import { isImageUrl, isRemovedContent, mediaSrc } from "@/lib/utils";
import { RemovedBanner } from "@/components/RemovedBanner";
import { fileForPost } from "@/server/media/manifest";
import { VoteColumn } from "@/components/VoteColumn";
import { PostBody } from "@/components/PostBody";
import { CommentThread } from "@/components/CommentThread";
import { SubredditSidebar } from "@/components/SubredditSidebar";

interface PageProps {
  params: Promise<{ id: string; slug?: string[] }>;
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;

  let post;
  let meta;
  try {
    [post, meta] = await Promise.all([fetchPost(id), fetchMeta()]);
  } catch {
    notFound();
  }

  if (!post || "error" in (post as { error?: string })) {
    notFound();
  }

  const manifestFile = await fileForPost(post.id, post.local_image);
  const localImg = mediaSrc(post.local_image, manifestFile);
  const showRemoteImg =
    !localImg && !post.is_self && post.url && isImageUrl(post.url);

  return (
    <main className="max-w-6xl mx-auto px-4 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_312px] gap-4">
        <article className="min-w-0">
          <div className="bg-reddit-card border border-reddit-border rounded-md overflow-hidden">
            <div className="flex">
              <VoteColumn score={post.score} />
              <div className="flex-1 p-4 min-w-0">
                <div className="flex flex-wrap items-center gap-1 text-xs text-reddit-muted mb-2">
                  <Link href="/" className="font-bold hover:underline">
                    r/{meta.subreddit}
                  </Link>
                  <span>·</span>
                  <span>
                    Posted by{" "}
                    <span className="text-reddit-text">u/{post.author}</span>
                  </span>
                  <span>· {post.created}</span>
                  {post.stickied && (
                    <span className="text-green-500 font-bold ml-1">
                      Stickied
                    </span>
                  )}
                  {post.link_flair && (
                    <span className="bg-reddit-flair-bg text-reddit-flair-text px-1.5 py-0.5 rounded text-[10px]">
                      {post.link_flair}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-medium leading-tight mb-3">
                  {post.title}
                </h1>

                {isRemovedContent(post.selftext) ? (
                  <div className="mb-4">
                    <RemovedBanner subreddit={meta.subreddit} />
                  </div>
                ) : (
                  post.selftext && (
                    <div className="mb-4">
                      <PostBody text={post.selftext} />
                    </div>
                  )
                )}

                {!isRemovedContent(post.selftext) && localImg && (
                  <img
                    src={localImg}
                    alt=""
                    className="max-w-full rounded-md mb-4"
                  />
                )}
                {!isRemovedContent(post.selftext) && showRemoteImg && (
                  <img
                    src={post.url}
                    alt=""
                    className="max-w-full rounded-md mb-4"
                    loading="lazy"
                  />
                )}

                {!post.is_self && post.url && (
                  <p className="mb-4">
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-reddit-blue hover:underline text-sm break-all"
                    >
                      {post.url}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>

          <CommentThread comments={post.comments} subreddit={meta.subreddit} />
        </article>

        <div className="hidden lg:block">
          <SubredditSidebar meta={meta} />
        </div>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  try {
    const post = await fetchPost(id);
    return { title: `${post.title} : r/oldrobloxrevivals` };
  } catch {
    return { title: "Post not found" };
  }
}
