"use client";

import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CreatePostModal from "../components/CreatePostModal";
import ProfileModal from "../components/ProfileModal";
import { CountdownBanner } from "../components/feed/CountdownBanner";
import { HeroDashboard } from "../components/feed/HeroDashboard";
import { BoxStatusMini } from "../components/feed/BoxStatusMini";
import { OfwCompassCard } from "../components/feed/OfwCompassCard";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { AnalyticsDashboard } from "../components/analytics/AnalyticsDashboard";
import HouseholdActivityFeed from "../components/feed/HouseholdActivityFeed";
import { BalikbayanBoxView } from "../components/box/BalikbayanBoxView";
import type { HouseholdPost } from "../types/household";
import { cn } from "@/lib/cn";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"home" | "box" | "analytics">("home");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();

  const router = useRouter();

  const myHousehold = useQuery(api.households.getMine);
  const me = useQuery(api.users.getMe);
  const rawPosts = useQuery(api.posts.list);
  const posts: HouseholdPost[] | undefined = rawPosts?.map(p => ({
    id: p._id,
    type: p.type as "expense" | "need" | "padala",
    createdAt: new Date(p._creationTime).toISOString(),
    content: p.caption || "",
    category: p.category,
    amount: p.amount,
    photoUrl: p.photoUrl || undefined,
    audioUrl: p.audioUrl || undefined,
    reactionCount: p.reactions.length,
    hasReacted: p.hasReacted,
    isCovered: p.isCovered,
    commentCount: p.comments.length,
    author: {
      name: p.author.name,
      familyTitle: p.author.familyTitle,
      role: p.author.role as "ofw" | "family",
      image: p.author.image,
    },
    comments: p.comments.map(c => ({
      id: c._id,
      createdAt: new Date(c._creationTime).toISOString(),
      content: c.content,
      author: {
        name: c.author.name,
        familyTitle: c.author.familyTitle,
        role: c.author.role as "ofw" | "family",
        image: c.author.image,
      }
    }))
  }));

  const toggleReaction = useMutation(api.reactions.toggle);
  const addComment = useMutation(api.comments.add);

  const handleReact = (postId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toggleReaction({ postId: postId as any, type: "heart" });
  };

  const handleAddComment = (postId: string, content: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addComment({ postId: postId as any, content });
  };

  // Redirect if not logged in
  useEffect(() => {
    // Wait for Convex Auth to process OAuth redirect code if present
    if (typeof window !== 'undefined' && window.location.search.includes('code=')) {
      return;
    }
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/welcome");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Redirect if logged in but no household
  useEffect(() => {
    if (isAuthenticated && myHousehold === null) {
      router.push("/welcome");
    }
  }, [isAuthenticated, myHousehold, router]);

  // Loading checks
  if (isAuthLoading || !isAuthenticated || myHousehold === undefined) {
    return (
      <div className="bg-zinc-50 dark:bg-black min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  // If authenticated but no household, return empty while redirecting
  if (myHousehold === null) {
    return null;
  }

  return (
    <div className="w-full h-full flex flex-col relative text-zinc-900 ">
        {/* Header */}
        <div className="px-6 pt-12 pb-4 bg-white/70  backdrop-blur-xl border-b border-zinc-200 dark:bg-black/70 dark:border-[#333333] flex justify-between items-center sticky top-0 z-10 transition-colors duration-300">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#111111] dark:text-[#FBFBFA]">Salo</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Your Household</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              aria-label="Profile"
              className="rounded-full h-8 w-8 flex items-center justify-center shadow-xs transition-transform hover:scale-95 active:scale-90 cursor-pointer overflow-hidden border border-[#EAEAEA] dark:border-[#333333]"
            >
              {me?.image ? (
                <img src={me.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#111111] dark:bg-[#FBFBFA] flex items-center justify-center text-white dark:text-[#111111]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative z-0">
          {activeTab === "analytics" ? (
            <AnalyticsDashboard posts={posts || []} myHousehold={myHousehold} />
          ) : activeTab === "box" ? (
            <BalikbayanBoxView />
          ) : posts === undefined ? (
            <div className="text-center text-zinc-500 py-10 text-sm">
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center text-zinc-500 py-10 flex flex-col items-center">
              <svg
                className="w-12 h-12 mb-3 text-zinc-300 "
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                ></path>
              </svg>
              <p className="text-sm font-medium">No posts yet</p>
              <p className="text-xs mt-1">
                Tap the + button to create an expense or need.
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <HeroDashboard posts={posts} />
                <BoxStatusMini onClick={() => setActiveTab("box")} />
                <OfwCompassCard />
                <CountdownBanner />
              </div>
              <HouseholdActivityFeed
                currentUser={
                  myHousehold
                    ? {
                        name:
                          myHousehold.members.find((m) => m.role === myHousehold.myRole)?.name ??
                          "Unknown",
                        role: myHousehold.myRole,
                        image: myHousehold.members.find((m) => m.role === myHousehold.myRole)?.image,
                      }
                    : undefined
                }
                members={myHousehold?.members}
                inviteCode={myHousehold?.household?.inviteCode}
                onReact={handleReact}
                onAddComment={handleAddComment}
                posts={posts}
              />
            </div>
          )}
        </div>

        {/* Bottom Nav */}
        <div className="bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border-t border-zinc-200/50 dark:border-white/10 px-2 sm:px-6 pt-4 pb-8 sticky bottom-0 z-50 transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-none">
          <div className="max-w-md mx-auto grid grid-cols-5 items-end justify-items-center relative">
            <div 
              onClick={() => setActiveTab("home")}
              className={cn(
                "flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-full",
                activeTab === "home" ? "text-zinc-950 dark:text-white scale-105" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 active:scale-95"
              )}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              <span className="text-[10px] font-bold tracking-wide">Home</span>
            </div>
            <div 
              onClick={() => setActiveTab("box")}
              className={cn(
                "flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-full",
                activeTab === "box" ? "text-zinc-950 dark:text-white scale-105" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 active:scale-95"
              )}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
              <span className="text-[10px] font-bold tracking-wide">Box</span>
            </div>
            <div
              onClick={() => setIsCreateModalOpen(true)}
              className="flex flex-col items-center justify-center -mt-12 relative group cursor-pointer w-full"
            >
              <div className="absolute inset-0 bg-zinc-950 dark:bg-white rounded-full scale-[1.3] opacity-0 blur-xl group-hover:opacity-20 transition-opacity duration-500" />
              <div className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-full p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] relative z-10 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.9] group-hover:scale-110">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
            </div>
            <div 
              onClick={() => setActiveTab("analytics")}
              className={cn(
                "flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-full",
                activeTab === "analytics" ? "text-zinc-950 dark:text-white scale-105" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 active:scale-95"
              )}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <span className="text-[10px] font-bold tracking-wide">Analytics</span>
            </div>
            <div
              onClick={() => setIsProfileModalOpen(true)}
              className="flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-full text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 active:scale-95"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border border-zinc-200 dark:border-white/10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 shrink-0">
                {me?.image ? (
                  <img src={me.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <span className="text-[10px] font-bold tracking-wide">Profile</span>
            </div>
          </div>
        </div>

        {/* Create Post Modal */}
        <CreatePostModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
        />

        {/* Profile Modal */}
        <ProfileModal 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
        />
      </div>
  );
}

