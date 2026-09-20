"use client";

import { useQuery } from "convex/react";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CreatePostModal from "../components/CreatePostModal";
import HouseholdActivityFeed from "../components/feed/HouseholdActivityFeed";
import type { HouseholdPost } from "../types/household";

export default function Home() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();

  const myHousehold = useQuery(api.households.getMine);
  const posts = useQuery(api.posts.list);

  // Redirect if not logged in (TEMPORARILY DISABLED FOR DEV)
  useEffect(() => {
    /*
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/auth");
    }
    */
  }, [isAuthLoading, isAuthenticated, router]);

  // Redirect if logged in but no household (TEMPORARILY DISABLED FOR DEV)
  useEffect(() => {
    /*
    if (isAuthenticated && myHousehold === null) {
      router.push("/pairing");
    }
    */
  }, [isAuthenticated, myHousehold, router]);

  // TEMPORARILY DISABLED Loading checks so unauthenticated users can see the UI
  /*
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
  */

  return (
    <div className="bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 min-h-screen flex justify-center">
      
      {/* Mobile Phone-like Container for desktop, full width on mobile */}
      <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-md md:border-x md:border-zinc-200 dark:md:border-zinc-800 shadow-sm relative flex flex-col min-h-screen">
        
        {/* Header */}
        <div className="px-6 pt-12 pb-4 bg-white dark:bg-[#0a0a0a] border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Salo</h1>
            <p className="text-xs text-zinc-500">Your Household</p>
          </div>
          <button className="bg-black dark:bg-white text-white dark:text-black rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg leading-none shadow-sm transition-transform hover:scale-95 active:scale-90 cursor-pointer">
            +
          </button>
        </div>

        {/* Feed */}
        <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-black">
          
          {posts === undefined ? (
            <div className="text-center text-zinc-500 py-10 text-sm">
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center text-zinc-500 py-10 flex flex-col items-center">
              <svg className="w-12 h-12 mb-3 text-zinc-300 dark:text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              <p className="text-sm font-medium">No posts yet</p>
              <p className="text-xs mt-1">Tap the + button to create an expense or need.</p>
            </div>
          ) : (
            <HouseholdActivityFeed 
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              posts={posts.map((p: any) => ({
                id: p._id,
                type: p.type,
                author: p.author || { name: "Unknown", role: "family" },
                createdAt: new Date(p._creationTime).toISOString(),
                content: p.caption || "",
                category: p.category,
                amount: p.amount,
                reactionCount: p.reactions?.length || 0,
                hasReacted: false,
                commentCount: p.comments?.length || 0,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                comments: p.comments?.map((c: any) => ({
                  id: c._id,
                  author: { name: "Unknown", role: "family" },
                  createdAt: new Date(c._creationTime).toISOString(),
                  content: "Comment content",
                })) || []
              })) as HouseholdPost[]}
            />
          )}

        </div>
        
        {/* Bottom Nav */}
        <div className="bg-white dark:bg-[#0a0a0a] border-t border-zinc-200 dark:border-zinc-800 p-4 flex justify-around items-center pb-8 sticky bottom-0 z-10">
          <div className="flex flex-col items-center gap-1 text-black dark:text-white cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            <span className="text-[10px] font-medium">Home</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            <span className="text-[10px] font-medium">Stats</span>
          </div>
          <div 
            onClick={() => signOut()}
            className="flex flex-col items-center gap-1 text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span className="text-[10px] font-medium">Log out</span>
          </div>
        </div>
        
        {/* Create Post Modal */}
        <CreatePostModal />
        
      </div>
    </div>
  );
}
