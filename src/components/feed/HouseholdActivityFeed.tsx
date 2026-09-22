"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Heart, MessageCircle, X, Banknote, CheckCircle2, Play, Pause, Mic, ArrowDown } from "lucide-react";
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
} from "@/types/household";
import { CommentsThread } from "./CommentsThread";

interface HouseholdActivityFeedProps {
  posts?: HouseholdPost[];
  /** The signed-in person. Pass the real value from your auth/session. */
  currentUser?: HouseholdMember;
  onReact?: (postId: string) => void;
  /** Fires when a post's comment section is opened Ã¢â‚¬â€ a good place to lazy-load real comments. */
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
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold border dark:border-white/10",
            role.avatarBg,
            role.avatarText,
          )}
        >
          {getInitials(post.author.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-bold text-[#111111] dark:text-[#FBFBFA]">
              {post.author.name}
            </span>
            <span className={cn("text-[11px] font-bold", role.avatarText)}>
              {role.label}
            </span>
          </div>
          <span className="text-[10px] font-bold tracking-wide text-[#787774] dark:text-[#A1A1AA]">
            {formatTimeAgo(post.createdAt)}
          </span>
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
        <div className="absolute left-1/2 -bottom-6 w-[95%] -translate-x-1/2 rounded-[16px] bg-[#FBFBFA] dark:bg-[#111111] p-3 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-none border border-[#EAEAEA] dark:border-[#333333] flex items-center justify-between z-10 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1F7F1] dark:bg-[#1A2E1F] text-[#346538] dark:text-[#4ADE80]">
              <ArrowDown className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-[#111111] dark:text-[#FBFBFA]">From: <span className="font-bold">{post.author.name}</span></span>
              <span className="text-sm text-[#111111] dark:text-[#FBFBFA]">To: <span className="font-bold">Household</span></span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5">
               <span className="text-[13px] text-[#111111] dark:text-[#FBFBFA]">Sent: <span className="font-mono font-bold text-sm tracking-tight">{formatPHP(post.amount)}</span></span>
               <CheckCircle2 className="h-4 w-4 text-[#346538] dark:text-[#4ADE80]" />
            </div>
            <span className="text-xs text-[#787774] dark:text-[#A1A1AA] mt-0.5">{formatTimeAgo(post.createdAt)}</span>
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

      {/* Expense/Need Receipt Card */}
      {(post.type === "expense" || post.type === "need") && typeof post.amount === "number" && (
        <div className="mt-5 rounded-[24px] bg-white dark:bg-[#0A0A0A] p-6 border border-[#EAEAEA] dark:border-[#333333] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex flex-col items-center relative overflow-hidden transition-colors duration-300">
          {/* Subtle gradient background accent */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#F8F9FA] dark:from-[#111111] to-transparent pointer-events-none" />
          
          {/* Category Badge */}
          <div className="flex items-center gap-1.5 bg-[#F4F4F5] dark:bg-[#222222] px-3 py-1 rounded-full z-10 mb-3 border border-black/5 dark:border-white/5">
            <Banknote className="h-3 w-3 text-[#52525B] dark:text-[#A1A1AA]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#52525B] dark:text-[#A1A1AA]">
              {post.category || "GENERAL"}
            </span>
          </div>
          
          {/* Amount */}
          <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#111111] dark:text-[#FBFBFA] z-10 mb-4 tabular-nums">
            {formatPHP(post.amount)}
          </div>

          {/* Cover Action / Status */}
          <div className="w-full z-10 border-t border-[#F4F4F5] dark:border-[#333333] pt-4 mt-1">
            {post.isCovered ? (
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-[#346538] dark:text-[#4ADE80] bg-[#F1F7F1] dark:bg-[#1A2E1F] rounded-xl p-3">
                <CheckCircle2 className="h-4 w-4" />
                <span>Covered na!</span>
              </div>
            ) : currentUser?.role !== "child" ? (
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#111111] dark:bg-[#FBFBFA] p-3 text-sm font-bold text-white dark:text-[#111111] transition-all hover:bg-black/80 dark:hover:bg-white/90 active:scale-[0.98] shadow-sm">
                <CheckCircle2 className="h-4 w-4 opacity-80" />
                Mark as Covered
              </button>
            ) : (
              <div className="text-center text-xs font-medium text-zinc-400">
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
        <span className="font-mono text-[11px] font-medium tracking-wide text-[#787774] dark:text-[#A1A1AA] shrink-0 whitespace-nowrap">
          <span className="font-bold text-[#111111] dark:text-[#FBFBFA]">{formatTime(currentTime)}</span> / {formatTime(duration)}
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
  onReact,
  onComment,
  onAddComment,
}: HouseholdActivityFeedProps) {
  return (
    <div className="flex flex-col gap-6 pb-24">
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

