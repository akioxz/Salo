"use client";

import { useEffect, useState } from "react";
import { Heart, MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  formatTimeAgo,
  formatPHP,
  getInitials,
  getCategoryIcon,
  ROLE_STYLES,
} from "@/lib/format";
import type { HouseholdComment, HouseholdMember, HouseholdPost } from "@/types/household";
import { CommentsThread } from "./CommentsThread";

interface HouseholdActivityFeedProps {
  posts?: HouseholdPost[];
  /** The signed-in person. Pass the real value from your auth/session. */
  currentUser?: HouseholdMember;
  onReact?: (postId: string) => void;
  /** Fires when a post's comment section is opened — a good place to lazy-load real comments. */
  onComment?: (postId: string) => void;
  onAddComment?: (postId: string, content: string) => void;
}

// ---------------------------------------------------------------------------
// Mock data — swap for real rows mapped to HouseholdPost.
// Photo URL below is a placeholder service for local preview only.
// ---------------------------------------------------------------------------

const MOCK_POSTS: HouseholdPost[] = [
  {
    id: "1",
    type: "expense",
    author: { name: "Marco", role: "ofw" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    content:
      "Sent this week's grocery money, plus a little extra for Lola's birthday cake.",
    category: "Groceries",
    amount: 1200,
    photoUrl: "https://picsum.photos/seed/salo-groceries/800/600",
    reactionCount: 3,
    commentCount: 2,
    comments: [
      {
        id: "c1",
        author: { name: "Elena", role: "family" },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
        content: "Salamat! Kakainin namin ito this weekend.",
      },
      {
        id: "c2",
        author: { name: "Marco", role: "ofw" },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
        content: "Sana ma-enjoy niyo, miss you guys!",
      },
    ],
  },
  {
    id: "2",
    type: "need",
    author: { name: "Elena", role: "family" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    content:
      "Ana needs a few more supplies for her school project this week. Nothing urgent.",
    category: "Education",
    amount: 850,
    reactionCount: 5,
    hasReacted: true,
    commentCount: 0,
  },
  {
    id: "3",
    type: "need",
    author: { name: "Marco", role: "ofw" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    content: "Missing you both today. Sending extra hugs from here.",
    reactionCount: 8,
    commentCount: 0,
  },
  {
    id: "4",
    type: "expense",
    author: { name: "Elena", role: "family" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    content: "Paid this month's electric bill early to skip the queue.",
    category: "Utilities",
    amount: 2850,
    reactionCount: 2,
    commentCount: 0,
  },
];

// ---------------------------------------------------------------------------
// Post card
// ---------------------------------------------------------------------------

function PostCard({
  post,
  index,
  currentUser,
  onReact,
  onComment,
  onAddComment,
}: {
  post: HouseholdPost;
  index: number;
  currentUser?: HouseholdMember;
  onReact?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onAddComment?: (postId: string, content: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [hasReacted, setHasReacted] = useState(Boolean(post.hasReacted));
  const [reactionCount, setReactionCount] = useState(post.reactionCount);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [localComments, setLocalComments] = useState<HouseholdComment[]>(
    post.comments ?? []
  );

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), index * 60);
    return () => clearTimeout(t);
  }, [index]);

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  const role = ROLE_STYLES[post.author.role];
  const displayedCommentCount = post.comments
    ? localComments.length
    : post.commentCount;

  function handleReact() {
    setHasReacted((prev) => !prev);
    setReactionCount((prev) => (hasReacted ? prev - 1 : prev + 1));
    onReact?.(post.id);
  }

  function handleToggleComments() {
    setCommentsOpen((prev) => !prev);
    onComment?.(post.id);
  }

  function handleAddComment(content: string) {
    const optimistic: HouseholdComment = {
      id: `local-${Date.now()}`,
      author: currentUser ?? { name: "You", role: post.author.role },
      createdAt: new Date().toISOString(),
      content,
    };
    setLocalComments((prev) => [...prev, optimistic]);
    onAddComment?.(post.id, content);
  }

  return (
    <article
      className={cn(
        "rounded-2xl border bg-white dark:bg-zinc-900",
        "border-zinc-200/80 dark:border-white/10",
        "shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]",
        "p-4",
        "transition-all motion-safe:duration-500 ease-out motion-reduce:transition-none",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          role="img"
          aria-label={post.author.name}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
            role.avatarBg,
            role.avatarText
          )}
        >
          {getInitials(post.author.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {post.author.name}
            </span>
            <span className={cn("text-[11px] font-medium", role.avatarText)}>
              {role.label}
            </span>
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {formatTimeAgo(post.createdAt)}
          </span>
        </div>
      </div>

      {/* Content */}
      <p className="mt-3 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
        {post.content}
      </p>

      {/* Photo */}
      {post.photoUrl && (
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="View photo full size"
          className="relative mt-3 block w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800"
        >
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
          )}
          <img
            src={post.photoUrl}
            alt={`Photo shared by ${post.author.name}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={cn(
              "aspect-[4/3] w-full object-cover transition-opacity duration-300",
              imgLoaded ? "opacity-100" : "opacity-0"
            )}
          />
        </button>
      )}

      {/* Category / amount strip */}
      {(post.category || typeof post.amount === "number") && (
        <div
          className={cn(
            "mt-3 flex items-center justify-between gap-3 rounded-xl px-3 py-2",
            post.type === "expense"
              ? "bg-zinc-100/80 dark:bg-white/5"
              : "bg-amber-500/[0.06] dark:bg-amber-400/[0.06]"
          )}
        >
          {post.category ? (
            <span className="flex min-w-0 items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-300">
              {(() => {
                const Icon = getCategoryIcon(post.category);
                return <Icon className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />;
              })()}
              <span className="truncate">{post.category}</span>
            </span>
          ) : (
            <span />
          )}

          {typeof post.amount === "number" && (
            <span
              className={cn(
                "shrink-0 font-semibold tabular-nums tracking-tight",
                post.type === "expense"
                  ? "text-[17px] text-zinc-900 dark:text-zinc-50"
                  : "text-sm text-amber-700 dark:text-amber-300"
              )}
            >
              {formatPHP(post.amount)}
            </span>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="mt-3 flex items-center gap-1">
        <button
          type="button"
          onClick={handleReact}
          aria-pressed={hasReacted}
          aria-label={hasReacted ? "Remove heart" : "Send a heart"}
          className={cn(
            "flex h-11 items-center gap-1.5 rounded-lg px-3 text-sm",
            "transition-all duration-200 active:scale-[0.98]",
            "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900",
            hasReacted
              ? "text-rose-500 dark:text-rose-400"
              : "text-zinc-500 dark:text-zinc-400"
          )}
        >
          <Heart className="h-[18px] w-[18px]" fill={hasReacted ? "currentColor" : "none"} />
          <span className="tabular-nums">{reactionCount}</span>
        </button>

        <button
          type="button"
          onClick={handleToggleComments}
          aria-expanded={commentsOpen}
          aria-label="Toggle comments"
          className={cn(
            "flex h-11 items-center gap-1.5 rounded-lg px-3 text-sm text-zinc-500 dark:text-zinc-400",
            "transition-all duration-200 active:scale-[0.98]",
            "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
          )}
        >
          <MessageCircle className="h-[18px] w-[18px]" />
          <span className="tabular-nums">{displayedCommentCount}</span>
        </button>
      </div>

      {/* Inline comments */}
      {commentsOpen && (
        <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-white/5">
          <CommentsThread
            comments={localComments}
            currentUser={currentUser}
            onAddComment={handleAddComment}
          />
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && post.photoUrl && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        >
          <img
            src={post.photoUrl}
            alt={`Photo shared by ${post.author.name}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
          />
          <button
            type="button"
            autoFocus
            onClick={() => setLightboxOpen(false)}
            aria-label="Close photo"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-200 hover:bg-white/20 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </article>
  );
}

// ---------------------------------------------------------------------------
// Feed container
// ---------------------------------------------------------------------------

export default function HouseholdActivityFeed({
  posts = MOCK_POSTS,
  currentUser = { name: "You", role: "family" },
  onReact,
  onComment,
  onAddComment,
}: HouseholdActivityFeedProps) {
  return (
    <div className="flex flex-col gap-3 pb-24 pt-4 px-4">
      {posts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          index={index}
          currentUser={currentUser}
          onReact={onReact}
          onComment={onComment}
          onAddComment={onAddComment}
        />
      ))}
    </div>
  );
}
