"use client";

import { Package, ArrowRight } from "lucide-react";

export function BoxStatusMini({ onClick }: { onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="col-span-1 relative overflow-hidden rounded-[24px] bg-[#0f1115] border border-white/5 p-5 flex flex-col justify-between cursor-pointer group transition-all hover:bg-[#15181e] active:scale-95"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
      
      <div className="flex justify-between items-start mb-4">
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
          <Package className="w-4 h-4" />
        </div>
        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-500 transition-colors" />
      </div>

      <div>
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Balikbayan</p>
        <p className="text-base font-bold text-zinc-100 tracking-tight leading-tight">
          3 Items<br/>Ready
        </p>
      </div>
    </div>
  );
}
