"use client";

import { Wallet, TrendingUp } from "lucide-react";

export function HeroDashboard() {
  return (
    <div className="col-span-2 relative overflow-hidden rounded-[24px] bg-white dark:bg-[#0A0A0A] border border-[#EAEAEA] dark:border-[#333333] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-6 group flex flex-col justify-between transition-colors duration-300">
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#F8F9FA] dark:from-[#111111] to-transparent pointer-events-none" />
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-2 text-[#787774] dark:text-[#A1A1AA]">
          <Wallet className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Household Fund</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F1F7F1] dark:bg-[#1A2E1F] text-[#346538] dark:text-[#4ADE80] text-[10px] font-bold tracking-wide">
          <TrendingUp className="w-3 h-3" />
          +12% vs Last Month
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-baseline gap-1 text-[#111111] dark:text-[#FBFBFA]">
          <span className="text-2xl font-bold tracking-tight opacity-70">₱</span>
          <span className="text-5xl font-extrabold tracking-tighter tabular-nums">45,200</span>
        </div>
        <p className="text-xs text-[#787774] dark:text-[#A1A1AA] mt-2 font-medium">Total Padala this November</p>
      </div>
    </div>
  );
}

