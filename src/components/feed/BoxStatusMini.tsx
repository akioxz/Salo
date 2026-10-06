"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Package, ArrowRight } from "lucide-react";

export function BoxStatusMini({ onClick }: { onClick?: () => void }) {
  const items = useQuery(api.balikbayan.list);

  const isLoading = items === undefined;
  const readyCount = isLoading ? 0 : items.filter((i) => i.status === "bought" || i.status === "packed").length;
  const packedCount = isLoading ? 0 : items.filter((i) => i.status === "packed").length;

  return (
    <div
      onClick={onClick}
      className="col-span-1 relative overflow-hidden rounded-[24px] bg-white dark:bg-[#0A0A0A] border border-[#EAEAEA] dark:border-white/10 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] p-5 flex flex-col justify-between cursor-pointer group transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-zinc-50 dark:hover:bg-[#111111] active:scale-[0.97]"
    >
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#F8F9FA] dark:from-white/5 to-transparent pointer-events-none" />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="w-8 h-8 rounded-full bg-white dark:bg-[#111111] border border-[#EAEAEA] dark:border-white/10 flex items-center justify-center text-[#111111] dark:text-[#FBFBFA] shadow-sm">
          <Package className="w-4 h-4" />
        </div>
        <ArrowRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors duration-500" />
      </div>

      <div className="relative z-10">
        <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Balikbayan</p>
        {isLoading ? (
          <p className="text-base font-bold text-[#111111] dark:text-[#FBFBFA] tracking-tight leading-tight animate-pulse">
            Loading...
          </p>
        ) : readyCount === 0 ? (
          <p className="text-base font-bold text-[#111111] dark:text-[#FBFBFA] tracking-tight leading-tight">
            Wala pang<br />wish
          </p>
        ) : (
          <p className="text-base font-bold text-[#111111] dark:text-[#FBFBFA] tracking-tight leading-tight">
            {readyCount} {readyCount === 1 ? "Item" : "Items"}
            <br />
            {packedCount} Packed
          </p>
        )}
      </div>
    </div>
  );
}
