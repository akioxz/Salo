"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Heart,
  MessageCircle,
  X,
  Banknote,
  CheckCircle2,
  Play,
  Pause,
  Mic,
  ArrowDown,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Filter,
  RotateCcw,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  formatTimeAgo,
  formatPHP,
  getInitials,
  getCategoryIcon,
  ROLE_STYLES,
} from "@/lib/format";
import type {
  HouseholdComment,
  HouseholdMember,
  HouseholdPost,
  HouseholdRole,
  PostType,
} from "@/types/household";
import { CommentsThread } from "./CommentsThread";

interface HouseholdActivityFeedProps {
  posts?: HouseholdPost[];
  /** The signed-in person. Pass the real value from your auth/session. */
  currentUser?: HouseholdMember;
  members?: Array<{ userId: string; role: string; name: string; image?: string }>;
  inviteCode?: string;
  onReact?: (postId: string) => void;
  /** Fires when a post's comment section is opened — a good place to lazy-load real comments. */
  onComment?: (postId: string) => void;
  onAddComment?: (postId: string, content: string) => void;
}

// ---------------------------------------------------------------------------
// Mock data Ã¢â‚¬â€ swap for real rows mapped to HouseholdPost.
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
    post.comments ?? [],
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
        "rounded-[24px] border bg-white dark:bg-[#0A0A0A] relative overflow-visible",
        "border-[#EAEAEA] dark:border-[#333333]", 
        "shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none",
        "p-6 mb-4",
        "transition-all motion-safe:duration-500 ease-out motion-reduce:transition-none",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#F8F9FA] dark:from-[#111111] to-transparent pointer-events-none rounded-[24px]" />
      
      {/* Background Subtle Glow */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />

      {/* Header */}
      <div className="flex items-start gap-4 relative z-10">
        <div
          role="img"
          aria-label={post.author.name}
          className={cn(
            "flex h-9 w-9 overflow-hidden shrink-0 items-center justify-center rounded-full text-sm font-semibold border dark:border-white/10",
            !post.author.image && role.avatarBg,
            !post.author.image && role.avatarText,
          )}
        >
          {post.author.image ? (
            <img src={post.author.image} alt={post.author.name} className="w-full h-full object-cover" />
          ) : (
            getInitials(post.author.name)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-[#111111] dark:text-[#FBFBFA]">
            {post.author.name}
          </span>
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-[#787774] dark:text-[#A1A1AA]">
            {post.author.familyTitle && (
              <>
                <span className="text-zinc-500 dark:text-zinc-400">{post.author.familyTitle}</span>
                <span>·</span>
              </>
            )}
            <span>{formatTimeAgo(post.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="mt-4 text-[15px] leading-relaxed text-[#111111] dark:text-[#FBFBFA] font-medium relative z-10">
        {post.content}
      </p>

      {/* Audio */}
      {post.audioUrl && <div className="relative z-10"><CustomAudioPlayer src={post.audioUrl} /></div>}

      {/* Photo */}
      {post.photoUrl && (
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="View photo full size"
          className="relative mt-4 block w-full overflow-hidden rounded-[20px] bg-zinc-100 dark:bg-zinc-800 z-10"
        >
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-zinc-200 dark:bg-zinc-700" />
          )}
          <img
            src={post.photoUrl}
            alt={`Photo shared by ${post.author.name}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={cn(
              "aspect-[4/3] w-full object-cover transition-opacity duration-300",
              imgLoaded ? "opacity-100" : "opacity-0",
            )}
          />
        </button>
      )}

      {/* Floating Remittance Pill if padala */}
      {post.type === "padala" && typeof post.amount === "number" && (
        <div className="absolute left-1/2 -bottom-6 w-[95%] -translate-x-1/2 rounded-[18px] bg-[#FBFBFA] dark:bg-[#111111] p-3.5 shadow-[0_4px_20px_rgb(0,0,0,0.06),0_1px_3px_rgb(0,0,0,0.04)] dark:shadow-none border border-[#E8E8E8] dark:border-white/10 flex items-center justify-between z-10 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/[0.08] dark:bg-emerald-500/[0.12] text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
              <ArrowDown className="h-4 w-4" />
            </div>
            <div className="flex flex-col text-xs sm:text-[13px] leading-tight gap-0.5">
              <span className="text-[#787774] dark:text-[#A1A1AA]">
                From: <span className="font-semibold text-[#111111] dark:text-[#FBFBFA]">{post.author.name}</span>
              </span>
              <span className="text-[#787774] dark:text-[#A1A1AA]">
                To: <span className="font-semibold text-[#111111] dark:text-[#FBFBFA]">Household</span>
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#787774] dark:text-[#A1A1AA] font-medium">Sent:</span>
              <span className="font-bold text-[15px] sm:text-base tracking-tight tabular-nums text-[#111111] dark:text-[#FBFBFA]">
                {formatPHP(post.amount)}
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-[11px] text-[#8E8E93] dark:text-[#71717A] mt-0.5">{formatTimeAgo(post.createdAt)}</span>
          </div>
        </div>
      )}

      {/* Regular Category / Amount strip for items without a receipt card */}
      {post.type !== "padala" && post.type !== "expense" && post.type !== "need" && (post.category || typeof post.amount === "number") && (
        <div
          className={cn(
            "mt-5 flex items-center justify-between gap-4 rounded-[20px] px-4 py-3 border bg-[#FBFBFA] dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333] transition-colors duration-300"
          )}
        >
          {post.category ? (
            <span className="flex min-w-0 items-center gap-2">
              {(() => {
                const Icon = getCategoryIcon(post.category);
                return (
                  <Icon className="h-4 w-4 shrink-0 text-[#787774] dark:text-[#A1A1AA]" />
                );
              })()}
              <span className="truncate text-[10px] font-bold uppercase tracking-wider text-[#787774] dark:text-[#A1A1AA]">
                {post.category}
              </span>
            </span>
          ) : (
            <span />
          )}

          {typeof post.amount === "number" && (
            <span className="shrink-0 text-xl font-bold tracking-tight tabular-nums text-[#111111] dark:text-[#FBFBFA]">
              {formatPHP(post.amount)}
            </span>
          )}
        </div>
      )}

      {/* Full-Bleed Split Receipt Band (Zero Nested Card) */}
      {(post.type === "expense" || post.type === "need") && typeof post.amount === "number" && (
        <div className="-mx-6 mt-5 border-y border-dashed border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFA] dark:bg-[#121212] px-6 py-5 transition-colors duration-300">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Category Badge & Micro-label */}
            <div className="flex flex-col items-start gap-1.5 min-w-0">
              <div className="flex items-center gap-1.5 rounded-full bg-white dark:bg-[#1C1C1E] px-2.5 py-1 border border-black/[0.04] dark:border-white/[0.06] shadow-sm">
                {(() => {
                  const Icon = getCategoryIcon(post.category);
                  return <Icon className="h-3.5 w-3.5 text-[#71717A] dark:text-[#A1A1AA]" />;
                })()}
                <span className="truncate text-[10px] font-bold uppercase tracking-[0.08em] text-[#71717A] dark:text-[#A1A1AA]">
                  {post.category || "GENERAL"}
                </span>
              </div>
              <span className="text-[11px] font-medium tracking-wide text-[#8E8E93] dark:text-[#71717A]">
                {post.type === "need" ? "Hiling ng Pamilya" : "Resibo ng Gastos"}
              </span>
            </div>

            {/* Right: Calibrated Tabular Amount */}
            <div className="shrink-0 text-right">
              <div className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#111111] dark:text-[#FBFBFA] leading-none tabular-nums">
                {formatPHP(post.amount)}
              </div>
            </div>
          </div>

          {/* Status / Cover Action Row */}
          <div className="mt-4 pt-3 border-t border-[#EAEAEA]/80 dark:border-white/[0.06]">
            {post.type === "expense" ? (
              /* Expense: stamped "Nabayaran na" receipt status */
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA] dark:text-[#71717A]">
                  Katayuan
                </span>
                <div className="flex items-center gap-1.5 rounded-lg bg-white dark:bg-[#1A1A1C] border border-[#E5E5E5] dark:border-[#262626] px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="uppercase tracking-wider">Nabayaran na</span>
                </div>
              </div>
            ) : post.isCovered ? (
              /* Need: covered celebration badge */
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA] dark:text-[#71717A]">
                  Katayuan
                </span>
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/[0.08] dark:bg-emerald-500/[0.12] border border-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Covered na!</span>
                </div>
              </div>
            ) : (currentUser?.role as string) !== "child" ? (
              /* Need: uncovered action button */
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#111111] dark:bg-[#FBFBFA] p-3 text-[13px] font-bold text-white dark:text-[#111111] transition-all duration-300 hover:bg-[#222222] dark:hover:bg-white/90 active:scale-[0.98] shadow-sm">
                <CheckCircle2 className="h-4 w-4 opacity-75" />
                Mark as Covered
              </button>
            ) : (
              /* Need: child waiting notice */
              <div className="text-center text-xs font-medium text-[#8E8E93] dark:text-[#71717A] py-1">
                Pending coverage
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className={cn(
        "mt-4 flex items-center gap-1 relative z-10",
        post.type === "padala" && typeof post.amount === "number" ? "mb-10" : ""
      )}>
        <button
          type="button"
          onClick={handleReact}
          aria-pressed={hasReacted}
          aria-label={hasReacted ? "Remove heart" : "Send a heart"}
          className={cn(
            "flex h-11 items-center gap-1.5 rounded-[12px] px-3 text-sm font-bold",
            "transition-all duration-200 active:scale-[0.98]",
            "hover:bg-[#F4F4F5] dark:hover:bg-[#222222]",
            "focus-visible:outline-none",
            hasReacted
              ? "text-rose-500"
              : "text-[#787774] dark:text-[#A1A1AA]",
          )}
        >
          <Heart
            className="h-[18px] w-[18px]"
            fill={hasReacted ? "currentColor" : "none"}
          />
          <span className="tabular-nums">{reactionCount}</span>
        </button>

        <button
          type="button"
          onClick={handleToggleComments}
          aria-expanded={commentsOpen}
          aria-label="Toggle comments"
          className={cn(
            "flex h-11 items-center gap-1.5 rounded-[12px] px-3 text-sm font-bold text-[#787774] dark:text-[#A1A1AA]",
            "transition-all duration-200 active:scale-[0.98]",
            "hover:bg-[#F4F4F5] dark:hover:bg-[#222222]",
            "focus-visible:outline-none",
          )}
        >
          <MessageCircle className="h-[18px] w-[18px]" />
          <span className="tabular-nums">{displayedCommentCount}</span>
        </button>
      </div>

      {/* Inline comments */}
      {commentsOpen && (
        <div className="mt-4 border-t border-[#EAEAEA] dark:border-[#333333] pt-4 relative z-10">
          <CommentsThread
            comments={localComments}
            currentUser={currentUser}
            onAddComment={handleAddComment}
          />
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && post.photoUrl && typeof document !== "undefined" && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-full h-full sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[430px] sm:h-[90vh] sm:rounded-[40px] overflow-hidden shadow-2xl"
        >
          {/* Ambient Background Blur (Ethereal Glass) */}
          <div className="absolute inset-0 z-0 bg-[#000000]">
            <img 
              src={post.photoUrl} 
              alt="" 
              className="absolute inset-0 h-full w-full object-cover blur-[100px] scale-150 opacity-90"
            />
            {/* Ethereal glass overlay - very light tint to let color shine through */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[40px]" />
          </div>

          <img
            src={post.photoUrl}
            alt={`Photo shared by ${post.author.name}`}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 max-h-[85vh] max-w-full rounded-[32px] object-contain shadow-[0_0_40px_rgba(0,0,0,0.4)]"
          />
          
          <button
            type="button"
            autoFocus
            onClick={() => setLightboxOpen(false)}
            aria-label="Close photo"
            className="absolute right-6 top-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-black/60 hover:scale-105 active:scale-[0.95] border border-white/10"
          >
            <X className="h-6 w-6" />
          </button>
        </div>,
        document.body
      )}
    </article>
  );
}

// ---------------------------------------------------------------------------
// Custom Audio Player Component
// ---------------------------------------------------------------------------
function CustomAudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration || 1;
      setProgress((current / total) * 100);
      setCurrentTime(current);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return "0:00";
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const WAVEFORM = [
    30, 40, 20, 60, 80, 50, 40, 70, 90, 100, 85, 60, 40, 75, 95, 100, 80, 60,
    50, 40, 65, 80, 55, 35, 45, 60, 40, 30, 20
  ];

  return (
    <div className="mt-4 flex flex-col gap-4 rounded-[24px] bg-[#FBFBFA] dark:bg-[#0A0A0A] p-5 border border-[#EAEAEA] dark:border-[#333333] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white dark:from-[#111111] to-transparent pointer-events-none opacity-50" />
      <div className="flex items-center gap-4 relative z-10">
        <button 
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#111111] dark:bg-[#FBFBFA] text-white dark:text-[#111111] transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 fill-current" />
          ) : (
            <Play className="h-5 w-5 fill-current ml-1" />
          )}
        </button>
        
        <div className="flex flex-1 items-center justify-start gap-[2px] h-8 overflow-hidden">
          {WAVEFORM.map((h, i) => (
            <div 
              key={i} 
              className={cn(
                "w-[2px] sm:w-[3px] rounded-full transition-colors duration-200",
                progress > (i / WAVEFORM.length) * 100 ? "bg-[#111111] dark:bg-[#FBFBFA]" : "bg-[#D4D4D4] dark:bg-[#333333]"
              )}
              style={{ height: `${h}%` }} 
            />
          ))}
        </div>
        
        <span className="font-mono text-xs font-bold tracking-tight text-[#111111] dark:text-[#FBFBFA]">
          {formatTime(duration)}
        </span>
      </div>
      
      <div className="flex items-center gap-3 relative z-10">
        <span className="font-mono text-xs font-medium tracking-wide text-zinc-500 dark:text-zinc-400 shrink-0 whitespace-nowrap">
          <span className="font-bold text-zinc-950 dark:text-white">{formatTime(currentTime)}</span> / {formatTime(duration)}
        </span>
        
        <div className="relative h-1.5 flex-1 overflow-visible rounded-full bg-[#EAEAEA] dark:bg-[#333333] cursor-pointer"
             onClick={(e) => {
               if (audioRef.current) {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const x = e.clientX - rect.left;
                 const newProgress = x / rect.width;
                 audioRef.current.currentTime = newProgress * audioRef.current.duration;
               }
             }}>
          <div 
            className="absolute bottom-0 left-0 top-0 rounded-full bg-[#111111] dark:bg-[#FBFBFA] transition-all duration-100 ease-linear pointer-events-none"
            style={{ width: `${progress}%` }}
          />
          <div 
            className="absolute top-1/2 -mt-1.5 h-3 w-3 rounded-full bg-[#111111] dark:bg-[#FBFBFA] shadow transition-all duration-100 ease-linear pointer-events-none"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>
      </div>

      <audio 
        ref={audioRef} 
        src={src} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(0);
          setCurrentTime(0);
        }} 
        className="hidden" 
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feed container
// ---------------------------------------------------------------------------

export default function HouseholdActivityFeed({
  posts = MOCK_POSTS,
  currentUser = { name: "You", role: "family" },
  members,
  inviteCode,
  onReact,
  onComment,
  onAddComment,
}: HouseholdActivityFeedProps) {
  const [selectedType, setSelectedType] = useState<"all" | PostType>("all");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  // Consolidate family members from props and distinct authors in posts
  const familyMembers = useMemo(() => {
    const map = new Map<string, HouseholdMember>();

    // 1. Known members from household
    if (members && members.length > 0) {
      members.forEach((m) => {
        map.set(m.name, { name: m.name, role: (m.role as HouseholdRole) || "family", image: m.image });
      });
    }

    // 2. Authors from posts
    posts.forEach((p) => {
      if (p.author?.name && !map.has(p.author.name)) {
        map.set(p.author.name, p.author);
      }
    });

    return Array.from(map.values());
  }, [members, posts]);

  // Filter posts based on active type and active member
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesType = selectedType === "all" || post.type === selectedType;
      const matchesMember =
        selectedMember === null ||
        post.author.name.toLowerCase() === selectedMember.toLowerCase();
      return matchesType && matchesMember;
    });
  }, [posts, selectedType, selectedMember]);

  const resetFilters = () => {
    setSelectedType("all");
    setSelectedMember(null);
  };

  const isFiltered = selectedType !== "all" || selectedMember !== null;

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* 1. FAMILY PULSE BAR (Bespoke Story Circles) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Sambahayan
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 tabular-nums">
              {familyMembers.length} {familyMembers.length === 1 ? "miyembro" : "miyembro"}
            </span>
          </div>

          {selectedMember && (
            <button
              onClick={() => setSelectedMember(null)}
              className="text-[11px] font-bold text-zinc-500 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Ipakita lahat</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Scrollable Story Avatar Row */}
        <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1 px-1">
          {/* All Members Circle */}
          <button
            onClick={() => setSelectedMember(null)}
            className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer active:scale-95 transition-transform"
          >
            <div
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
                selectedMember === null
                  ? "bg-[#111111] text-white dark:bg-white dark:text-[#111111] ring-2 ring-[#111111] dark:ring-white ring-offset-2 ring-offset-[#FBFBFA] dark:ring-offset-[#0A0A0A] shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 ring-1.5 ring-zinc-200 dark:ring-white/10 ring-offset-2 ring-offset-[#FBFBFA] dark:ring-offset-[#0A0A0A] group-hover:ring-zinc-400"
              )}
            >
              <Users className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-center w-16">
              <span
                className={cn(
                  "text-xs font-bold tracking-tight truncate w-full text-center leading-tight",
                  selectedMember === null
                    ? "text-zinc-950 dark:text-white font-black"
                    : "text-zinc-600 dark:text-zinc-400"
                )}
              >
                Lahat
              </span>
              <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 truncate w-full text-center tabular-nums leading-tight mt-0.5">
                {posts.length} {posts.length === 1 ? "post" : "posts"}
              </span>
            </div>
          </button>

          {/* Individual Member Circles */}
          {familyMembers.map((member) => {
            const isSelected = selectedMember?.toLowerCase() === member.name.toLowerCase();
            const memberPostsCount = posts.filter(
              (p) => p.author.name.toLowerCase() === member.name.toLowerCase()
            ).length;
            const isOfw = member.role === "ofw";

            return (
              <button
                key={member.name}
                onClick={() =>
                  setSelectedMember(isSelected ? null : member.name)
                }
                className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer active:scale-95 transition-transform"
              >
                <div className="relative">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center font-black text-sm tracking-tight transition-all duration-300",
                      isSelected
                        ? "ring-2 ring-[#111111] dark:ring-white ring-offset-2 ring-offset-[#FBFBFA] dark:ring-offset-[#0A0A0A] shadow-xs"
                        : "ring-1.5 ring-zinc-200 dark:ring-white/10 ring-offset-2 ring-offset-[#FBFBFA] dark:ring-offset-[#0A0A0A] group-hover:ring-zinc-400",
                      isOfw
                        ? "bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300"
                        : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300"
                    )}
                  >
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      getInitials(member.name)
                    )}
                  </div>

                </div>

                <div className="flex flex-col items-center w-16">
                  <span
                    className={cn(
                      "text-xs font-bold tracking-tight truncate w-full text-center leading-tight",
                      isSelected
                        ? "text-zinc-950 dark:text-white font-black"
                        : "text-zinc-800 dark:text-zinc-200"
                    )}
                  >
                    {member.name}
                  </span>
                  <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 truncate w-full text-center capitalize tabular-nums leading-tight mt-0.5">
                    {isOfw ? "OFW" : "Bahay"} · {memberPostsCount}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Add / Invite Member Circle */}
          {inviteCode && (
            <button
              onClick={() => {
                navigator.clipboard?.writeText(inviteCode);
                alert(`Nakopya ang Invite Code: ${inviteCode}\nI-send ito sa kapamilya para makasali sila sa Salo!`);
              }}
              title="I-tap para kopyahin ang Invite Code ng Sambahayan"
              className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-14 h-14 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 dark:hover:border-zinc-400 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors bg-zinc-50/50 dark:bg-zinc-900/30">
                <Plus className="w-4 h-4" />
              </div>
              <div className="flex flex-col items-center w-16">
                <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white truncate w-full text-center transition-colors leading-tight">
                  Imbita
                </span>
                <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 truncate w-full text-center leading-tight mt-0.5">
                  + Sambahayan
                </span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* 2. FEED SECTION HEADER & SMART FILTER PILLS */}
      <div className="flex flex-col gap-3 pt-2 border-t border-zinc-200/60 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black tracking-tight text-zinc-950 dark:text-white">
              Kaganapan sa Bahay
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 tabular-nums">
              {filteredPosts.length}
            </span>
          </div>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>I-reset</span>
            </button>
          )}
        </div>

        {/* Smart Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: "all", label: "Lahat", icon: null },
            { id: "expense", label: "Gastos", icon: ArrowUpRight },
            { id: "need", label: "Hiling", icon: Heart },
            { id: "padala", label: "Padala", icon: ArrowDownLeft },
          ].map((tab) => {
            const isTabSelected = selectedType === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id as PostType | "all")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer shrink-0",
                  isTabSelected
                    ? "bg-[#111111] text-white dark:bg-white dark:text-[#111111] shadow-xs"
                    : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                )}
              >
                {Icon && <Icon className="w-3 h-3" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. POSTS LIST OR ZERO-STATE */}
      {filteredPosts.length > 0 ? (
        filteredPosts.map((post, index) => (
          <PostCard
            key={post.id}
            post={post}
            index={index}
            currentUser={currentUser}
            onReact={onReact}
            onComment={onComment}
            onAddComment={onAddComment}
          />
        ))
      ) : (
        <div className="p-8 rounded-[24px] bg-zinc-50 dark:bg-[#0A0A0A] border border-zinc-200/80 dark:border-white/10 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-200/70 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
            <Filter className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
            Walang nahanap na post
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs leading-relaxed">
            Walang tumutugma sa kasalukuyang filter. Subukang pumili ng ibang kategorya o miyembro.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-xs font-bold active:scale-95 transition-all cursor-pointer"
          >
            Ipakita ang Lahat ng Posts
          </button>
        </div>
      )}
    </div>
  );
}

