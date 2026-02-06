"use client";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Flag, MessageSquare } from "lucide-react";
import { CommentForm } from "./CommentForm";

interface CommentData {
  id: string;
  body: string;
  createdAt: string | Date;
  user: {
    name: string;
    image?: string | null;
  };
  replies?: CommentData[];
}

interface CommentItemProps {
  comment: CommentData;
  videoId: string;
  depth?: number;
}

export function CommentItem({ comment, videoId, depth = 0 }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const initials = comment.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const createdAt =
    typeof comment.createdAt === "string"
      ? new Date(comment.createdAt)
      : comment.createdAt;

  return (
    <div className={depth > 0 ? "ml-8 border-l pl-4" : ""}>
      <div className="flex gap-3">
        <Avatar className="size-8 shrink-0">
          {comment.user.image && (
            <AvatarImage src={comment.user.image} alt={comment.user.name} />
          )}
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{comment.user.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </span>
          </div>
          <p className="mt-1 text-sm text-foreground/90">{comment.body}</p>
          <div className="mt-1.5 flex items-center gap-2">
            {depth < 2 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs text-muted-foreground"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <MessageSquare className="size-3" />
                Reply
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs text-muted-foreground"
            >
              <Flag className="size-3" />
              Flag
            </Button>
          </div>
          {showReplyForm && (
            <div className="mt-2">
              <CommentForm
                videoId={videoId}
                parentId={comment.id}
                onSuccess={() => setShowReplyForm(false)}
              />
            </div>
          )}
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              videoId={videoId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
