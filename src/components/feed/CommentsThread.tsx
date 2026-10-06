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
        <p className="py-1 text-sm text-[#787774] ">
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
                    "flex h-7 w-7 overflow-hidden shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                    !comment.author.image && role.avatarBg,
                    !comment.author.image && role.avatarText,
                  )}
                >
                  {comment.author.image ? (
                    <img src={comment.author.image} alt={comment.author.name} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(comment.author.name)
                  )}
                </div>
                <div
                  className={cn(
                    "min-w-0 flex-1 rounded-xl px-3 py-2",
                    role.bubbleBg,
                  )}
                >
                  <div className="flex flex-col">
                    <span className="truncate text-[13px] font-bold text-zinc-900 dark:text-zinc-100">
                      {comment.author.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#787774]">
                      {comment.author.familyTitle && (
                        <>
                          <span>{comment.author.familyTitle}</span>
                          <span>·</span>
                        </>
                      )}
                      <span>{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-200">
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
            "flex h-8 w-8 overflow-hidden shrink-0 items-center justify-center rounded-full text-xs font-semibold mb-1",
            currentUser && !currentUser.image
              ? ROLE_STYLES[currentUser.role].avatarBg
              : "bg-zinc-200 ",
            currentUser && !currentUser.image
              ? ROLE_STYLES[currentUser.role].avatarText
              : "text-[#787774] ",
          )}
        >
          {currentUser?.image ? (
            <img src={currentUser.image} alt={currentUser.name} className="w-full h-full object-cover" />
          ) : (
            currentUser ? getInitials(currentUser.name) : "?"
          )}
        </div>

        <div className="flex flex-1 items-center gap-1.5 rounded-xl border border-[#EAEAEA] bg-zinc-50/50 pl-4 pr-1 py-1 focus-within:ring-2 focus-within:ring-amber-400/50  ">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, maxLength))}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Write a comment"
            aria-label="Write a comment"
            className="max-h-24 flex-1 resize-none bg-transparent py-1.5 text-[15px] text-zinc-900 outline-none placeholder:text-[#787774]   my-auto"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Post comment"
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200 active:scale-[0.98]",
              draft.trim()
                ? "bg-amber-500 text-white  hover:bg-amber-400"
                : "bg-zinc-200 text-[#787774]  ",
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default CommentsThread;

