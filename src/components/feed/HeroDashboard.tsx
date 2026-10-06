"use client";

import { Wallet } from "lucide-react";

import type { HouseholdPost } from "@/types/household";

export function HeroDashboard({ posts }: { posts?: HouseholdPost[] }) {
  const totalPadala = (posts || [])
    .filter((p) => p.type === "padala")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="col-span-2 relative overflow-hidden rounded-[24px] bg-white dark:bg-[#0A0A0A] border border-[#EAEAEA] dark:border-[#333333] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-6 group flex flex-col justify-between transition-colors duration-300">
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#F8F9FA] dark:from-[#111111] to-transparent pointer-events-none" />
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
          <Wallet className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Household Fund</span>
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-baseline gap-1 text-zinc-950 dark:text-white">
          <span className="text-2xl font-bold tracking-tight opacity-70">₱</span>
          <span className="text-5xl font-extrabold tracking-tighter tabular-nums">
            {totalPadala.toLocaleString("en-US")}
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Total Padala this November</p>
      </div>
    </div>
  );
}

