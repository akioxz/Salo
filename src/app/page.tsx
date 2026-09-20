
export default function Home() {
  return (
    <div className="bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 min-h-screen flex justify-center">
      
      {/* Mobile Phone-like Container for desktop, full width on mobile */}
      <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-md md:border-x md:border-zinc-200 dark:md:border-zinc-800 shadow-sm relative flex flex-col min-h-screen">
        
        {/* Header */}
        <div className="px-6 pt-12 pb-4 bg-white dark:bg-[#0a0a0a] border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Salo</h1>
            <p className="text-xs text-zinc-500">Reyes Household</p>
          </div>
          <button className="bg-black dark:bg-white text-white dark:text-black rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg leading-none shadow-sm transition-transform hover:scale-95 active:scale-90 cursor-pointer">
            +
          </button>
        </div>

        {/* Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-black">
          
          {/* Post: Expense */}
          <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                J
              </div>
              <div>
                <p className="font-semibold text-sm">Juan (OFW)</p>
                <p className="text-[10px] text-zinc-500">2 hours ago</p>
              </div>
            </div>
            
            <div className="mb-3">
              <span className="inline-block px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] uppercase tracking-wider rounded font-bold mb-2 border border-red-200 dark:border-red-800/50">
                Expense • Groceries
              </span>
              <p className="text-sm">Padala for this month&apos;s groceries and rice. Kasya na ba ito?</p>
              <div className="mt-2 text-2xl font-black">₱15,000.00</div>
            </div>
            
            <div className="flex items-center gap-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button className="flex items-center gap-1.5 text-zinc-500 hover:text-pink-500 text-xs transition-colors font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                <span>Heart</span>
              </button>
              <button className="flex items-center gap-1.5 text-zinc-500 hover:text-blue-500 text-xs transition-colors font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                <span>2 Comments</span>
              </button>
            </div>
          </div>

          {/* Post: Need */}
          <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-300 font-bold">
                M
              </div>
              <div>
                <p className="font-semibold text-sm">Maria (Family)</p>
                <p className="text-[10px] text-zinc-500">5 hours ago</p>
              </div>
            </div>
            
            <div className="mb-3">
              <span className="inline-block px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] uppercase tracking-wider rounded font-bold mb-2 border border-amber-200 dark:border-amber-800/50">
                Need • Tuition
              </span>
              <p className="text-sm">Kailangan na magbayad ng tuition fee para kay bunso next week. May deadline sa Friday.</p>
              <div className="mt-2 text-2xl font-black">₱8,500.00</div>
            </div>
            
            <div className="flex items-center gap-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button className="flex items-center gap-1.5 text-pink-500 text-xs transition-colors font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
                <span>Thanks</span>
              </button>
              <button className="flex items-center gap-1.5 text-zinc-500 hover:text-blue-500 text-xs transition-colors font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                <span>Comment</span>
              </button>
            </div>
          </div>

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
