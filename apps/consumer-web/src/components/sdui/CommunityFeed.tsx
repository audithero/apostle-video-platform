import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Post {
  id: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  reactions: number;
  comments: number;
}

interface CommunityFeedProps {
  maxPosts?: number;
  showReactions?: boolean;
  showComments?: boolean;
  channelId?: string;
  posts?: Post[];
  sectionId?: string;
  blockId?: string;
  children?: ReactNode;
}

const placeholderPosts: Post[] = [
  {
    id: "1",
    authorName: "Sarah K.",
    content: "Just finished Module 3 and the exercises were really helpful!",
    timestamp: "2h ago",
    reactions: 12,
    comments: 3,
  },
  {
    id: "2",
    authorName: "Mike D.",
    content: "Can someone explain the concept from Lesson 5? I would love to discuss it further.",
    timestamp: "5h ago",
    reactions: 8,
    comments: 7,
  },
  {
    id: "3",
    authorName: "Priya R.",
    content: "Sharing my project from the final assignment. Feedback welcome!",
    timestamp: "1d ago",
    reactions: 24,
    comments: 11,
  },
];

export default function CommunityFeed({
  maxPosts = 10,
  showReactions = true,
  showComments = true,
  posts,
  sectionId,
  blockId,
  children,
}: CommunityFeedProps) {
  const items = (posts && posts.length > 0 ? posts : placeholderPosts).slice(0, maxPosts);

  return (
    <section id={sectionId ?? blockId} className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Community</h3>

      <div className="space-y-3">
        {items.map((post) => (
          <article
            key={post.id}
            className={cn(
              "rounded-xl bg-white/80 p-4 shadow-sm backdrop-blur-sm",
              "dark:bg-white/5",
            )}
          >
            <div className="flex items-start gap-3">
              {post.authorAvatar ? (
                <img
                  src={post.authorAvatar}
                  alt={`${post.authorName} avatar`}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--sdui-color-primary,#6366f1)]/10 text-xs font-bold text-[var(--sdui-color-primary,#6366f1)]">
                  {post.authorName.charAt(0)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {post.authorName}
                  </span>
                  <span className="text-xs text-gray-400">{post.timestamp}</span>
                </div>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{post.content}</p>

                {(showReactions || showComments) && (
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    {showReactions && (
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                          <title>Reactions</title>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        {post.reactions}
                      </span>
                    )}
                    {showComments && (
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                          <title>Comments</title>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                        </svg>
                        {post.comments}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {children}
    </section>
  );
}
