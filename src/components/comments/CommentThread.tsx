"use client";
import { useTRPC } from "@/lib/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";

interface CommentThreadProps {
  videoId: string;
}

export function CommentThread({ videoId }: CommentThreadProps) {
  const trpc = useTRPC();

  const { data: comments, isLoading } = useQuery(
    trpc.comments.listByVideo.queryOptions({ videoId }),
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Comments</h3>
      <CommentForm videoId={videoId} />
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading comments...</p>
        ) : comments && comments.length > 0 ? (
          comments.map((comment: any) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              videoId={videoId}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
}
