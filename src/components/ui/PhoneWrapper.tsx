import React from "react";

export function PhoneWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#FBFBFA] dark:bg-[#000000] flex flex-col items-center justify-center sm:p-8 text-[#111111] dark:text-[#FBFBFA] transition-colors duration-300">
      {/* Scrollable App Content */}
      <main className="h-full w-full overflow-y-auto no-scrollbar relative z-10 mx-auto sm:h-[90vh] sm:max-w-[430px] sm:rounded-[40px] sm:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:sm:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.05)] border border-[#EAEAEA] dark:border-[#222222] bg-white dark:bg-[#111111] transition-colors duration-300">
        {children}
      </main>
    </div>
  );
}
