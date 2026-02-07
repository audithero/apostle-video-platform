import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";
import {
  Flag,
  Hash,
  Heart,
  Flame,
  Hand,
  MessageCircle,
  Pin,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { RouteErrorBoundary } from "@/components/error-boundary";

const communitySearchSchema = z.object({
  creatorId: z.string().optional(),
});

export const Route = createFileRoute("/_authed/community")({
  component: CommunityFeedPage,
  errorComponent: RouteErrorBoundary,
  validateSearch: communitySearchSchema,
});

// -- Types -------------------------------------------------------------------

type ReactionType = "like" | "love" | "fire" | "clap";

const REACTION_CONFIG: ReadonlyArray<{
  type: ReactionType;
  icon: typeof Heart;
  label: string;
}> = [
  { type: "like", icon: Heart, label: "Like" },
  { type: "love", icon: Sparkles, label: "Love" },
  { type: "fire", icon: Flame, label: "Fire" },
  { type: "clap", icon: Hand, label: "Clap" },
];

const initials = (name: string): string =>
  name
    .split(" ")
    .map((part) => part.at(0) ?? "")
    .join("")
    .toUpperCase();

// -- Page Component ----------------------------------------------------------

function CommunityFeedPage() {
  // For the student feed, we need a creatorId to list channels.
  // In a real multi-tenant app, this would come from the route or subdomain.
  // For now we use a search param or show a placeholder.
  const { creatorId } = Route.useSearch();

  if (!creatorId) {
    return <CommunityPlaceholder />;
  }

  return <CommunityFeed creatorId={creatorId} />;
}

function CommunityPlaceholder() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl text-center">
        <MessageCircle className="mx-auto size-16 text-muted-foreground" />
        <h1 className="mt-4 text-3xl font-bold">Community</h1>
        <p className="mt-2 text-muted-foreground">
          Join a course to access the creator&apos;s community channels.
        </p>
        <Button type="button" className="mt-6" asChild>
          <a href="/my-courses">Browse My Courses</a>
        </Button>
      </div>
    </div>
  );
}

// -- Community Feed ----------------------------------------------------------

function CommunityFeed({ creatorId }: { readonly creatorId: string }) {
  const trpc = useTRPC();

  const { data: channels, isLoading: isLoadingChannels } = useQuery(
    trpc.communityChannels.list.queryOptions({ creatorId }),
  );

  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  // Auto-select first channel
  const selectedChannel = activeChannelId
    ? channels?.find((c) => c.id === activeChannelId)
    : channels?.at(0);

  const effectiveChannelId = selectedChannel?.id ?? null;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Channel sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-muted/30 md:block">
        <div className="p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Channels
          </h2>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <nav aria-label="Community channels" className="px-2 pb-4">
            {isLoadingChannels ? (
              <div className="space-y-2 px-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            ) : channels && channels.length > 0 ? (
              <ul className="space-y-1">
                {channels.map((channel) => {
                  const isActive = channel.id === effectiveChannelId;
                  return (
                    <li key={channel.id}>
                      <button
                        type="button"
                        onClick={() => setActiveChannelId(channel.id)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        <span>{channel.iconEmoji ?? "💬"}</span>
                        <span className="truncate">{channel.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-3 text-sm text-muted-foreground">
                No channels available.
              </p>
            )}
          </nav>
        </ScrollArea>
      </aside>

      {/* Main feed area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {effectiveChannelId ? (
          <ChannelFeed
            channelId={effectiveChannelId}
            channelName={selectedChannel?.name ?? "Channel"}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <p>Select a channel to view posts.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// -- Channel Feed ------------------------------------------------------------

function ChannelFeed({
  channelId,
  channelName,
}: {
  readonly channelId: string;
  readonly channelName: string;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    trpc.communityPosts.list.queryOptions({ channelId, limit: 20 }),
  );

  const [showComposer, setShowComposer] = useState(false);

  return (
    <>
      {/* Channel header */}
      <div className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-2">
          <Hash className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{channelName}</h2>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setShowComposer((prev) => !prev)}
        >
          <Send className="mr-1.5 size-4" />
          New Post
        </Button>
      </div>

      {/* Composer */}
      {showComposer && (
        <PostComposer
          channelId={channelId}
          onPostCreated={() => {
            setShowComposer(false);
            queryClient.invalidateQueries({
              queryKey: trpc.communityPosts.list.queryKey({ channelId }),
            });
          }}
        />
      )}

      {/* Posts feed */}
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="mt-3 h-16 w-full" />
                </CardContent>
              </Card>
            ))
          ) : data?.posts && data.posts.length > 0 ? (
            data.posts.map((item) => (
              <PostCard
                key={item.post.id}
                post={item.post}
                authorName={item.authorName ?? "Unknown"}
                authorImage={item.authorImage}
                channelId={channelId}
              />
            ))
          ) : (
            <div className="py-16 text-center">
              <MessageCircle className="mx-auto size-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">No posts yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Be the first to start a conversation.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  );
}

// -- Post Composer -----------------------------------------------------------

function PostComposer({
  channelId,
  onPostCreated,
}: {
  readonly channelId: string;
  readonly onPostCreated: () => void;
}) {
  const trpc = useTRPC();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const createMutation = useMutation(
    trpc.communityPosts.create.mutationOptions({
      onSuccess: () => {
        setTitle("");
        setContent("");
        onPostCreated();
      },
    }),
  );

  const handleSubmit = useCallback(() => {
    if (content.trim().length === 0) return;
    createMutation.mutate({
      channelId,
      title: title.trim() || undefined,
      contentHtml: `<p>${content.trim()}</p>`,
    });
  }, [channelId, title, content, createMutation]);

  return (
    <div className="border-b bg-muted/30 p-4">
      <div className="space-y-3">
        <div>
          <Label htmlFor="post-title" className="sr-only">Post title</Label>
          <Input
            id="post-title"
            placeholder="Post title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background"
          />
        </div>
        <div>
          <Label htmlFor="post-content" className="sr-only">Post content</Label>
          <Textarea
            id="post-content"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="resize-none bg-background"
          />
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            disabled={content.trim().length === 0 || createMutation.isPending}
            onClick={handleSubmit}
          >
            {createMutation.isPending ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// -- Post Card ---------------------------------------------------------------

interface PostData {
  readonly id: string;
  readonly title: string | null;
  readonly contentHtml: string | null;
  readonly pinned: boolean;
  readonly likesCount: number;
  readonly commentsCount: number;
  readonly createdAt: Date;
  readonly status: string;
}

function PostCard({
  post,
  authorName,
  authorImage,
  channelId,
}: {
  readonly post: PostData;
  readonly authorName: string;
  readonly authorImage: string | null;
  readonly channelId: string;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);

  const reactionMutation = useMutation(
    trpc.communityPosts.toggleReaction.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.communityPosts.list.queryKey({ channelId }),
        });
      },
    }),
  );

  const flagMutation = useMutation(
    trpc.communityPosts.flagPost.mutationOptions(),
  );

  const handleReaction = useCallback(
    (reactionType: ReactionType) => {
      reactionMutation.mutate({ postId: post.id, reactionType });
    },
    [post.id, reactionMutation],
  );

  const plainText = post.contentHtml
    ? post.contentHtml.replace(/<[^>]*>/g, "")
    : "";

  return (
    <Card className={cn(post.pinned && "border-amber-300 dark:border-amber-700")}>
      <CardContent className="py-4">
        {/* Author header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              {authorImage ? (
                <AvatarImage src={authorImage} alt={`${authorName} avatar`} />
              ) : null}
              <AvatarFallback className="text-xs">
                {initials(authorName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{authorName}</span>
                {post.pinned && (
                  <Badge variant="secondary" className="text-xs">
                    <Pin className="mr-1 size-3" />
                    Pinned
                  </Badge>
                )}
              </div>
              <time
                dateTime={new Date(post.createdAt).toISOString()}
                className="text-xs text-muted-foreground"
              >
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </time>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
            onClick={() => flagMutation.mutate({ id: post.id })}
            aria-label="Report post"
          >
            <Flag className="size-4" />
          </Button>
        </div>

        {/* Post content */}
        {post.title && (
          <h3 className="mt-3 text-lg font-semibold">{post.title}</h3>
        )}
        {plainText && (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
            {plainText}
          </p>
        )}

        <Separator className="my-3" />

        {/* Reactions and comment toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {REACTION_CONFIG.map(({ type, icon: Icon, label }) => (
              <Button
                key={type}
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground"
                onClick={() => handleReaction(type)}
                disabled={reactionMutation.isPending}
                aria-label={label}
              >
                <Icon className="mr-1 size-4" />
                {type === "like" && post.likesCount > 0 && (
                  <span className="text-xs">{String(post.likesCount)}</span>
                )}
              </Button>
            ))}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-muted-foreground"
            onClick={() => setShowComments((prev) => !prev)}
          >
            <MessageCircle className="mr-1 size-4" />
            {post.commentsCount > 0 && (
              <span className="text-xs">{String(post.commentsCount)}</span>
            )}
          </Button>
        </div>

        {/* Comments section */}
        {showComments && <CommentsSection postId={post.id} />}
      </CardContent>
    </Card>
  );
}

// -- Comments Section --------------------------------------------------------

function CommentsSection({ postId }: { readonly postId: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: threads, isLoading } = useQuery(
    trpc.communityPosts.getComments.queryOptions({ postId }),
  );

  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const addCommentMutation = useMutation(
    trpc.communityPosts.addComment.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.communityPosts.getComments.queryKey({ postId }),
        });
        setNewComment("");
        setReplyingTo(null);
        setReplyContent("");
      },
    }),
  );

  const handleAddComment = useCallback(() => {
    if (newComment.trim().length === 0) return;
    addCommentMutation.mutate({
      postId,
      content: newComment.trim(),
    });
  }, [postId, newComment, addCommentMutation]);

  const handleReply = useCallback(
    (parentId: string) => {
      if (replyContent.trim().length === 0) return;
      addCommentMutation.mutate({
        postId,
        content: replyContent.trim(),
        parentId,
      });
    },
    [postId, replyContent, addCommentMutation],
  );

  return (
    <div className="mt-3 space-y-3 border-t pt-3">
      {/* Comment input */}
      <div className="flex gap-2">
        <label htmlFor={`comment-${postId}`} className="sr-only">
          Write a comment
        </label>
        <Input
          id={`comment-${postId}`}
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAddComment();
            }
          }}
        />
        <Button
          type="button"
          size="sm"
          disabled={newComment.trim().length === 0 || addCommentMutation.isPending}
          onClick={handleAddComment}
        >
          <Send className="size-4" />
        </Button>
      </div>

      {/* Comment threads */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : threads && threads.length > 0 ? (
        <ul className="space-y-3">
          {threads.map((thread) => (
            <li key={thread.comment.id} className="space-y-2">
              {/* Parent comment */}
              <div className="flex gap-2">
                <Avatar className="size-7 shrink-0">
                  {thread.authorImage ? (
                    <AvatarImage
                      src={thread.authorImage}
                      alt={`${thread.authorName ?? "User"} avatar`}
                    />
                  ) : null}
                  <AvatarFallback className="text-[10px]">
                    {initials(thread.authorName ?? "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="rounded-lg bg-muted/50 px-3 py-2">
                    <span className="text-xs font-medium">
                      {thread.authorName ?? "Unknown"}
                    </span>
                    <p className="text-sm">{thread.comment.content}</p>
                  </div>
                  <div className="mt-1 flex items-center gap-3">
                    <time
                      dateTime={new Date(thread.comment.createdAt).toISOString()}
                      className="text-xs text-muted-foreground"
                    >
                      {formatDistanceToNow(new Date(thread.comment.createdAt), {
                        addSuffix: true,
                      })}
                    </time>
                    <button
                      type="button"
                      className="text-xs font-medium text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        setReplyingTo(
                          replyingTo === thread.comment.id
                            ? null
                            : thread.comment.id,
                        )
                      }
                    >
                      Reply
                    </button>
                  </div>

                  {/* Reply input */}
                  {replyingTo === thread.comment.id && (
                    <div className="mt-2 flex gap-2">
                      <label
                        htmlFor={`reply-${thread.comment.id}`}
                        className="sr-only"
                      >
                        Write a reply
                      </label>
                      <Input
                        id={`reply-${thread.comment.id}`}
                        placeholder="Write a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleReply(thread.comment.id);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        disabled={
                          replyContent.trim().length === 0 ||
                          addCommentMutation.isPending
                        }
                        onClick={() => handleReply(thread.comment.id)}
                      >
                        <Send className="size-3" />
                      </Button>
                    </div>
                  )}

                  {/* Replies */}
                  {thread.replies && thread.replies.length > 0 && (
                    <ul className="mt-2 space-y-2 pl-4 border-l-2 border-muted">
                      {thread.replies.map((reply) => (
                        <li key={reply.comment.id} className="flex gap-2">
                          <Avatar className="size-6 shrink-0">
                            {reply.authorImage ? (
                              <AvatarImage
                                src={reply.authorImage}
                                alt={`${reply.authorName ?? "User"} avatar`}
                              />
                            ) : null}
                            <AvatarFallback className="text-[9px]">
                              {initials(reply.authorName ?? "U")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="rounded-lg bg-muted/30 px-3 py-1.5">
                              <span className="text-xs font-medium">
                                {reply.authorName ?? "Unknown"}
                              </span>
                              <p className="text-sm">{reply.comment.content}</p>
                            </div>
                            <time
                              dateTime={new Date(
                                reply.comment.createdAt,
                              ).toISOString()}
                              className="mt-0.5 block text-xs text-muted-foreground"
                            >
                              {formatDistanceToNow(
                                new Date(reply.comment.createdAt),
                                { addSuffix: true },
                              )}
                            </time>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-xs text-muted-foreground">
          No comments yet.
        </p>
      )}
    </div>
  );
}
