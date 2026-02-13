"use client";
import { useState } from "react";
import { useTRPC } from "@/lib/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentFormProps {
  videoId: string;
  parentId?: string;
  onSuccess?: () => void;
}

export function CommentForm({ videoId, parentId, onSuccess }: CommentFormProps) {
  const [body, setBody] = useState("");
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createComment = useMutation(
    trpc.comments.create.mutationOptions({
      onSuccess: () => {
        setBody("");
        queryClient.invalidateQueries({
          queryKey: trpc.comments.listByVideo.queryKey({ videoId }),
        });
        onSuccess?.();
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    createComment.mutate({ videoId, parentId, body: trimmed });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={parentId ? "Write a reply..." : "Add a comment..."}
        rows={parentId ? 2 : 3}
        className="resize-none"
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          disabled={!body.trim() || createComment.isPending}
        >
          {createComment.isPending ? "Posting..." : parentId ? "Reply" : "Comment"}
        </Button>
      </div>
    </form>
  );
}
