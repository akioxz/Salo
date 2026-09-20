"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatTimeAgo, getInitials, ROLE_STYLES } from "@/lib/format";
import type { HouseholdComment, HouseholdMember } from "@/types/household";

interface CommentsThreadProps {
  comments: HouseholdComment[];
  /** The signed-in person, for their own avatar in the input row. */
  currentUser?: HouseholdMember;
  onAddComment?: (content: string) => void;
  maxLength?: number;
}

export function CommentsThread({
  comments,
  currentUser,
  onAddComment,
  maxLength = 1000,
}: CommentsThreadProps) {
  const [draft, setDraft] = useState("");

  function submit(e?: FormEvent) {
    e?.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAddComment?.(trimmed);
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {comments.length === 0 ? (
        <p className="py-1 text-sm text-zinc-500 dark:text-zinc-400">
          No comments yet. Say something.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {comments.map((comment) => {
            const role = ROLE_STYLES[comment.author.role];
            return (
              <li key={comment.id} className="flex items-start gap-2.5">
                <div
                  role="img"
                  aria-label={comment.author.name}
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                    role.avatarBg,
                    role.avatarText
                  )}
                >
                  {getInitials(comment.author.name)}
                </div>
                <div
                  className={cn(
                    "min-w-0 flex-1 rounded-2xl px-3 py-2",
                    role.bubbleBg
                  )}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="truncate text-[13px] font-medium text-zinc-900 dark:text-zinc-50">
                      {comment.author.name}
                    </span>
                    <span className="shrink-0 text-[11px] text-zinc-500 dark:text-zinc-400">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {comment.content}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={submit} className="flex items-end gap-2 pt-1">
        <div
          role="img"
          aria-label={currentUser?.name ?? "You"}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            currentUser
              ? ROLE_STYLES[currentUser.role].avatarBg
              : "bg-zinc-200 dark:bg-zinc-800",
            currentUser
              ? ROLE_STYLES[currentUser.role].avatarText
              : "text-zinc-500 dark:text-zinc-400"
          )}
        >
          {currentUser ? getInitials(currentUser.name) : "?"}
        </div>

        <div className="flex flex-1 items-end gap-1.5 rounded-2xl border border-zinc-200 bg-white px-3 py-1.5 focus-within:ring-2 focus-within:ring-amber-400/50 dark:border-white/10 dark:bg-zinc-900">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, maxLength))}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Write a comment"
            aria-label="Write a comment"
            className="max-h-24 flex-1 resize-none bg-transparent py-1.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Post comment"
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-200 active:scale-[0.98]",
              draft.trim()
                ? "bg-amber-400 text-zinc-950 hover:bg-amber-300"
                : "bg-zinc-100 text-zinc-300 dark:bg-zinc-800 dark:text-zinc-600"
            )}
          >
            <Send className="h-[18px] w-[18px]" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default CommentsThread;
