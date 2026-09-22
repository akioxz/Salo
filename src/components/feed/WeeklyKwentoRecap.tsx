"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { subDays } from "date-fns";
import { BookOpen } from "lucide-react";

export function WeeklyKwentoRecap() {
  const posts = useQuery(api.posts.list);

  if (posts === undefined) return null; // loading
  if (posts.length === 0) return null; // no posts

  const oneWeekAgo = subDays(new Date(), 7).getTime();
  
  const recentPosts = posts.filter((post) => post._creationTime > oneWeekAgo);

  if (recentPosts.length === 0) return null;

  const expenses = recentPosts.filter((p) => p.type === "expense");
  const needs = recentPosts.filter((p) => p.type === "need");
  const padalas = recentPosts.filter((p) => p.type === "padala");

  let totalReactions = 0;
  recentPosts.forEach((post) => {
    totalReactions += post.reactions.length;
  });

  // Construct the narrative sentence
  const parts = [];
  if (expenses.length > 0) parts.push(`${expenses.length} gastos`);
  if (needs.length > 0) {
    const coveredNeeds = needs.filter(n => n.isCovered).length;
    parts.push(`${coveredNeeds} / ${needs.length} needs covered`);
  }
  if (padalas.length > 0) parts.push(`${padalas.length} padala`);
  if (totalReactions > 0) parts.push(`${totalReactions} hearts & hugs`);

  let kwento = "Tahimik ang linggong ito.";
  if (parts.length > 0) {
    // Join with commas, and 'at' for the last item
    if (parts.length === 1) {
      kwento = `Ngayong linggo: May ${parts[0]}.`;
    } else if (parts.length === 2) {
      kwento = `Ngayong linggo: May ${parts[0]} at ${parts[1]}.`;
    } else {
      const last = parts.pop();
      kwento = `Ngayong linggo: May ${parts.join(", ")}, at ${last}.`;
    }
  }

  return (
    <div className="col-span-2 bg-[#FBFBFA] dark:bg-[#0A0A0A] rounded-[24px] p-6 border border-[#EAEAEA] dark:border-[#333333] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white dark:from-[#111111] to-transparent pointer-events-none opacity-50" />
      <div className="flex items-start gap-4 relative z-10">
        <div className="mt-1 shrink-0 bg-white dark:bg-[#222222] p-2.5 rounded-[14px] border border-[#EAEAEA] dark:border-[#333333] shadow-sm flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-[#111111] dark:text-[#FBFBFA]" />
        </div>
        <div>
          <h3 className="text-sm font-bold tracking-tight text-[#111111] dark:text-[#FBFBFA]">
            Kwento ng Linggo
          </h3>
          <p className="text-sm text-[#52525B] dark:text-[#A1A1AA] mt-1 leading-relaxed font-medium">
            {kwento}
          </p>
        </div>
      </div>
    </div>
  );
}

