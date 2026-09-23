"use client";

import { useQuery, useMutation } from "convex/react";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CreatePostModal from "../components/CreatePostModal";
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
  
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();

  const myHousehold = useQuery(api.households.getMine);
  const posts = useQuery(api.posts.list);
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
        <div className="px-6 pt-12 pb-4 bg-white/70  backdrop-blur-xl border-b border-zinc-200  flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Salo</h1>
            <p className="text-xs text-zinc-500">Your Household</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              aria-label="Create Post"
              className="bg-[#111111] hover:bg-black text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-[#111111] rounded-full h-8 w-8 flex items-center justify-center shadow-xs transition-transform hover:scale-95 active:scale-90 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
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
                <HeroDashboard />
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
                      }
                    : undefined
                }
                members={myHousehold?.members}
                inviteCode={myHousehold?.household?.inviteCode}
                onReact={handleReact}
                onAddComment={handleAddComment}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                posts={
                  posts.map((p: any) => ({
                    id: p._id,
                    type: p.type,
                    author: p.author || { name: "Unknown", role: "family" },
                    createdAt: new Date(p._creationTime).toISOString(),
                    content: p.caption || "",
                    category: p.category,
                    photoUrl: p.photoUrl,
                    audioUrl: p.audioUrl,
                    amount: p.amount,
                    reactionCount: p.reactions?.length || 0,
                    hasReacted: p.hasReacted || false,
                    isCovered: p.isCovered || false,
                    commentCount: p.comments?.length || 0,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    comments:
                      p.comments?.map((c: any) => ({
                        id: c._id,
                        author: c.author,
                        createdAt: new Date(c._creationTime).toISOString(),
                        content: c.content,
                      })) || [],
                  })) as HouseholdPost[]
                }
              />
            </div>
          )}
        </div>

        {/* Bottom Nav */}
        <div className="bg-white/80 dark:bg-[#111111]/80 backdrop-blur-2xl border-t border-[#EAEAEA] dark:border-[#222222] p-6 flex justify-around items-center pb-8 sticky bottom-0 z-10 transition-colors duration-300">
          <div 
            onClick={() => setActiveTab("home")}
            className={cn(
              "flex flex-col items-center gap-1 cursor-pointer transition-all",
              activeTab === "home" ? "text-[#111111] dark:text-[#FBFBFA] scale-110" : "text-[#A1A1AA] hover:text-[#111111] dark:hover:text-[#FBFBFA]"
            )}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <span className="text-xs font-bold tracking-tight">Home</span>
          </div>
          <div 
            onClick={() => setActiveTab("box")}
            className={cn(
              "flex flex-col items-center gap-1 cursor-pointer transition-all",
              activeTab === "box" ? "text-zinc-950 dark:text-white scale-110" : "text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
            )}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            <span className="text-xs font-bold tracking-tight">Box</span>
          </div>
          <div 
            onClick={() => setActiveTab("analytics")}
            className={cn(
              "flex flex-col items-center gap-1 cursor-pointer transition-all",
              activeTab === "analytics" ? "text-zinc-950 dark:text-white scale-110" : "text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
            )}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <span className="text-xs font-bold tracking-tight">Analytics</span>
          </div>
          <div
            onClick={() => {
              signOut();
              router.push("/welcome");
            }}
            className="flex flex-col items-center gap-1 text-zinc-400 hover:text-rose-500 transition-all cursor-pointer"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              ></path>
            </svg>
            <span className="text-xs font-bold tracking-tight">Log out</span>
          </div>
        </div>

        {/* Create Post Modal */}
        <CreatePostModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
        />
    </div>
  );
}

