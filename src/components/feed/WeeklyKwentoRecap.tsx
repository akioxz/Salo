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
    <div className="bg-white dark:bg-[#0A0B0E] rounded-2xl p-4 mb-6 shadow-sm border border-zinc-200 dark:border-white/10 dark:border-t-amber-500/50 dark:shadow-[inset_0_1px_0_0_rgba(245,158,11,0.2)] transition-all">
      <div className="flex items-start gap-4">
        <div className="mt-1 shrink-0 bg-amber-100 dark:bg-amber-500/20 p-2 rounded-xl">
          <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Kwento ng Linggo
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
            {kwento}
          </p>
        </div>
      </div>
    </div>
  );
}
