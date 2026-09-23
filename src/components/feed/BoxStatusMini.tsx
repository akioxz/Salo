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
      className="col-span-1 relative overflow-hidden rounded-[24px] bg-white dark:bg-[#0A0A0A] border border-[#EAEAEA] dark:border-[#333333] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-5 flex flex-col justify-between cursor-pointer group transition-all duration-300 hover:bg-zinc-50 dark:hover:bg-[#222222] active:scale-95"
    >
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#F8F9FA] dark:from-[#111111] to-transparent pointer-events-none" />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="w-8 h-8 rounded-full bg-[#F4F4F5] dark:bg-[#222222] border border-[#EAEAEA] dark:border-[#333333] flex items-center justify-center text-[#111111] dark:text-[#FBFBFA]">
          <Package className="w-4 h-4" />
        </div>
        <ArrowRight className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
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
