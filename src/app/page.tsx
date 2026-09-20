"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatDistanceToNow } from "date-fns";

export default function Home() {
  const posts = useQuery(api.posts.list);

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
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-black">
          
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
            posts.map((post) => (
              <div key={post._id} className={`bg-white dark:bg-[#0a0a0a] p-4 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors ${post.type === 'expense' ? 'hover:border-blue-500/50' : 'hover:border-amber-500/50'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                    post.type === 'expense' 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                      : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'
                  }`}>
                    {post.author.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {post.author.name} {post.author.role ? `(${post.author.role})` : ''}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {formatDistanceToNow(post._creationTime, { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <span className={`inline-block px-2 py-1 text-[10px] uppercase tracking-wider rounded font-bold mb-2 border ${
                    post.type === 'expense'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                  }`}>
                    {post.type} • {post.category}
                  </span>
                  
                  {post.caption && (
                    <p className="text-sm">{post.caption}</p>
                  )}
                  
                  {post.amount !== undefined && (
                    <div className="mt-2 text-2xl font-black">
                      ₱{post.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <button className="flex items-center gap-1.5 text-zinc-500 hover:text-pink-500 text-xs transition-colors font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    <span>{post.reactions.filter((r) => r.type === "heart").length}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-zinc-500 hover:text-pink-500 text-xs transition-colors font-medium">
                    {/* Placeholder for thanks icon */}
                    <span>🙏 {post.reactions.filter((r) => r.type === "thanks").length}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-zinc-500 hover:text-blue-500 text-xs transition-colors font-medium ml-auto">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    <span>{post.comments.length}</span>
                  </button>
                </div>
              </div>
            ))
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
          <div className="flex flex-col items-center gap-1 text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            <span className="text-[10px] font-medium">Profile</span>
          </div>
        </div>
        
      </div>
    </div>
  );
}
