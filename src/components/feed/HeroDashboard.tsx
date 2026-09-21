"use client";

import { Wallet, TrendingUp } from "lucide-react";

export function HeroDashboard() {
  return (
    <div className="col-span-2 relative overflow-hidden rounded-[32px] bg-[#0f1115] border border-white/5 p-6 shadow-2xl group flex flex-col justify-between">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-zinc-400">
          <Wallet className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Household Fund</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wide">
          <TrendingUp className="w-3 h-3" />
          +12% vs Last Month
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-1 text-amber-500">
          <span className="text-2xl font-bold tracking-tight opacity-70">₱</span>
          <span className="text-5xl font-black tracking-tighter">45,200</span>
        </div>
        <p className="text-xs text-zinc-500 mt-2 font-medium">Total Padala this November</p>
      </div>
    </div>
  );
}
