"use client";

import { HouseholdPost, Household } from "@/types/household";
import { formatPHP, getCategoryIcon, formatTimeAgo } from "@/lib/format";
import { useTheme } from "@/components/ThemeProvider";
import { useState, useMemo } from "react";
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Receipt,
  Calendar,
  Sparkles,
  ShoppingBag,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

export function AnalyticsDashboard({
  posts,
  myHousehold,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  posts: (HouseholdPost | any)[];
  myHousehold: Household | null | undefined;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Financial transactions only
  const financialPosts = useMemo(() => {
    return posts.filter(
      (p) => (p.type === "padala" || p.type === "expense") && typeof p.amount === "number"
    );
  }, [posts]);

  // Aggregate totals
  const totalInflow = useMemo(() => {
    return posts
      .filter((p) => p.type === "padala")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [posts]);

  const totalExpense = useMemo(() => {
    return posts
      .filter((p) => p.type === "expense")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [posts]);

  const padalaCount = posts.filter((p) => p.type === "padala").length;
  const expenseCount = posts.filter((p) => p.type === "expense").length;

  const netBalance = totalInflow - totalExpense;
  const isPositive = netBalance >= 0;
  const retentionPercentage = totalInflow > 0 
    ? Math.max(0, Math.min(100, Math.round(((totalInflow - totalExpense) / totalInflow) * 100)))
    : 0;

  // 7-Day Tactile Activity Rhythm (Mon - Sun of current week)
  // Replaces the awkward broken Recharts single-dot graph with an authentic Apple-style weekly barometer
  const weeklyRhythm = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sun, 1 = Mon...
    // Start from Monday (or 6 days ago up to today)
    const days = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      // Find transactions on this day
      const dayPosts = financialPosts.filter((p) => {
        // @ts-ignore
        const rawTime = p._creationTime || (p.createdAt ? new Date(p.createdAt).getTime() : 0);
        return rawTime >= d.getTime() && rawTime < nextD.getTime();
      });

      const dayInflows = dayPosts.filter((p) => p.type === "padala").reduce((s, p) => s + (p.amount || 0), 0);
      const dayOutflows = dayPosts.filter((p) => p.type === "expense").reduce((s, p) => s + (p.amount || 0), 0);

      days.push({
        date: d,
        dayLabel: dayNames[d.getDay()],
        dayNumber: d.getDate(),
        isToday: i === 0,
        inflows: dayInflows,
        outflows: dayOutflows,
        hasActivity: dayInflows > 0 || dayOutflows > 0,
      });
    }

    // Determine max value for scaling the bars (min 1000)
    const maxVal = Math.max(
      1000,
      ...days.map((d) => Math.max(d.inflows, d.outflows))
    );

    return { days, maxVal };
  }, [financialPosts]);

  // Spending Category Breakdown
  const categoryBreakdown = useMemo(() => {
    const expensePosts = posts.filter((p) => p.type === "expense" && (p.amount || 0) > 0);
    const total = expensePosts.reduce((sum, p) => sum + (p.amount || 0), 0);

    const map: Record<string, number> = {};
    expensePosts.forEach((p) => {
      const cat = p.category || "Iba pa (General)";
      map[cat] = (map[cat] || 0) + (p.amount || 0);
    });

    return Object.entries(map)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [posts]);

  // Recent Transactions sorted by timestamp descending
  const recentTransactions = useMemo(() => {
    return [...financialPosts].sort((a, b) => {
      // @ts-ignore
      const timeA = a._creationTime || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      // @ts-ignore
      const timeB = b._creationTime || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      return timeB - timeA;
    });
  }, [financialPosts]);

  return (
    <div className="max-w-md mx-auto w-full px-5 pt-8 pb-36 flex flex-col gap-8">
      
      {/* 1. HERO FINANCIAL STATEMENT (Unboxed, Pure Typographic Elegance) */}
      <section className="flex flex-col items-center text-center pt-2">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-1.5">
          Natitirang Badyet
        </span>

        {/* Big Crisp Amount */}
        <h2 className="text-4xl sm:text-5xl font-black text-zinc-950 dark:text-white tracking-tight tabular-nums mb-2">
          {formatPHP(netBalance)}
        </h2>

        {/* Human Context Line */}
        <p className="text-sm text-zinc-600 dark:text-zinc-300 font-medium max-w-[320px] leading-relaxed">
          {totalInflow > 0 ? (
            <>
              May <span className="font-bold text-zinc-950 dark:text-white">{retentionPercentage}%</span> pa ang natitira mula sa {formatPHP(totalInflow)} na padala
            </>
          ) : (
            "Wala pang naitalang padala ngayong panahon"
          )}
        </p>

        {/* Minimal Tactile Split Bar */}
        {totalInflow > 0 && (
          <div className="w-full max-w-[280px] mt-5">
            <div className="h-2.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden flex p-0.5 gap-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${retentionPercentage}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-emerald-500 rounded-full"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${100 - retentionPercentage}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-zinc-900 dark:bg-zinc-300 rounded-full"
              />
            </div>
            <div className="flex justify-between items-center text-xs font-semibold text-zinc-600 dark:text-zinc-400 mt-2 px-0.5">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Natitira ({retentionPercentage}%)
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-300 inline-block" />
                Nagastos ({100 - retentionPercentage}%)
              </span>
            </div>
          </div>
        )}
      </section>

      {/* 2. TACTILE 2-COLUMN BENTO TILES (Padala vs Gastos) */}
      <section className="grid grid-cols-2 gap-3">
        {/* Padala Tile */}
        <div className="p-4 rounded-[20px] bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-white/10 flex flex-col justify-between min-h-[104px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Ipinadala
            </span>
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight tabular-nums">
              +{formatPHP(totalInflow)}
            </div>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mt-0.5">
              {padalaCount} {padalaCount === 1 ? "padala" : "padala"} naitala
            </span>
          </div>
        </div>

        {/* Gastos Tile */}
        <div className="p-4 rounded-[20px] bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-white/10 flex flex-col justify-between min-h-[104px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Nagastos
            </span>
            <div className="w-6 h-6 rounded-full bg-zinc-200/80 dark:bg-white/10 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-900 dark:text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight tabular-nums">
              -{formatPHP(totalExpense)}
            </div>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mt-0.5">
              {expenseCount} {expenseCount === 1 ? "gastos" : "gastos"} naitala
            </span>
          </div>
        </div>
      </section>

      {/* 3. 7-DAY ACTIVITY BAROMETER (Clean Apple-Style Columns, NO Glitchy 1-Point Dots!) */}
      <section className="p-5 rounded-[24px] bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-white/10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-zinc-950 dark:text-white tracking-tight">
              Aktibidad Ngayong Linggo
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              Araw-araw na daloy ng padala at resibo
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold text-zinc-600 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Padala
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-800 dark:bg-zinc-300 inline-block" /> Gastos
            </span>
          </div>
        </div>

        {/* 7 Columns for the 7 Days */}
        <div className="grid grid-cols-7 gap-2 pt-4 pb-1 items-end h-36">
          {weeklyRhythm.days.map((day, idx) => {
            const inflowHeight = (day.inflows / weeklyRhythm.maxVal) * 100;
            const outflowHeight = (day.outflows / weeklyRhythm.maxVal) * 100;
            const isSelected = selectedDayIndex === idx;

            return (
              <button
                key={`rhythm-day-${day.dayLabel}-${day.dayNumber}-${idx}`}
                type="button"
                onClick={() => setSelectedDayIndex(isSelected ? null : idx)}
                className="group relative flex flex-col items-center h-full justify-end cursor-pointer focus:outline-none"
              >
                {/* Popover on Tap / Active */}
                <AnimatePresence>
                  {isSelected && day.hasActivity && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: -6, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      className="absolute -top-12 z-30 px-2.5 py-1.5 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold tracking-tight whitespace-nowrap shadow-xl pointer-events-none"
                    >
                      {day.inflows > 0 && <div className="text-emerald-400 dark:text-emerald-600 font-bold">+{formatPHP(day.inflows)}</div>}
                      {day.outflows > 0 && <div>-{formatPHP(day.outflows)}</div>}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Vertical Bar Stack */}
                <div className="w-3.5 sm:w-4.5 bg-zinc-200/80 dark:bg-white/10 rounded-full flex flex-col justify-end p-0.5 gap-1 h-24 overflow-hidden group-hover:bg-zinc-300 dark:group-hover:bg-white/20 transition-colors">
                  {/* Inflow (Emerald) */}
                  {day.inflows > 0 && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(14, inflowHeight)}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="w-full bg-emerald-500 rounded-full"
                    />
                  )}

                  {/* Outflow (Dark) */}
                  {day.outflows > 0 && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(14, outflowHeight)}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="w-full bg-zinc-900 dark:bg-zinc-300 rounded-full"
                    />
                  )}

                  {/* Empty Dot if zero activity */}
                  {!day.hasActivity && (
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto my-auto" />
                  )}
                </div>

                {/* Day Label (M, T, W...) */}
                <span className={cn(
                  "text-xs font-bold mt-2 uppercase tracking-wide transition-colors",
                  day.isToday 
                    ? "text-zinc-950 dark:text-white font-black" 
                    : "text-zinc-500 dark:text-zinc-400"
                )}>
                  {day.dayLabel}
                </span>

                {/* Today indicator dot */}
                {day.isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. CATEGORY BREAKDOWN (Clean Minimalist Chips) */}
      {categoryBreakdown.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
              Saan Napunta ang Pera
            </h3>
            <span className="text-xs font-extrabold text-zinc-950 dark:text-white tabular-nums">
              {formatPHP(totalExpense)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {categoryBreakdown.map((item, idx) => {
              const Icon = getCategoryIcon(item.category);
              return (
                <div
                  key={`${item.category}-${idx}`}
                  className="p-3.5 rounded-[18px] bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-white/10 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-zinc-200/80 dark:bg-white/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-zinc-950 dark:text-white truncate block capitalize">
                        {item.category}
                      </span>
                      <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mt-0.5">
                        {item.percentage}% ng gastos
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-zinc-950 dark:text-white tabular-nums shrink-0">
                    {formatPHP(item.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. THE HOUSEHOLD LEDGER (Transparent Family Receipts & Transactions) */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Talaan ng Transaksyon
          </h3>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {recentTransactions.length} naitala
          </span>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/80 rounded-[20px] border border-dashed border-zinc-200 dark:border-white/10">
            <Receipt className="w-8 h-8 text-zinc-400 mb-2 opacity-50" />
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Wala pang padala o gastos na naitala.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-zinc-200/80 dark:divide-white/10 bg-zinc-50 dark:bg-zinc-900/80 rounded-[20px] border border-zinc-200/80 dark:border-white/10 overflow-hidden">
            {recentTransactions.map((tx, idx) => {
              const isPadala = tx.type === "padala";
              // @ts-ignore
              const rawTime = tx._creationTime || (tx.createdAt ? new Date(tx.createdAt).getTime() : Date.now());
              const uniqueKey = `${(tx as any)._id || tx.id || "tx"}-${idx}-${rawTime}`;
              const Icon = getCategoryIcon(tx.category);

              return (
                <div
                  key={uniqueKey}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Directional Icon Badge */}
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      isPadala 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                        : "bg-zinc-200/80 dark:bg-white/10 text-zinc-800 dark:text-zinc-200"
                    )}>
                      {isPadala ? (
                        <ArrowDownLeft className="w-4 h-4" strokeWidth={2.5} />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-zinc-950 dark:text-white truncate">
                        {tx.content || (isPadala ? "Padala mula sa OFW" : "Gastos sa Bahay")}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                          {tx.author?.name || "Family Member"}
                        </span>
                        <span>·</span>
                        <span>{formatTimeAgo(new Date(rawTime).toISOString())}</span>
                        {tx.category && (
                          <>
                            <span>·</span>
                            <span className="capitalize">{tx.category}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Attached Photo (Receipt) Thumbnail & Amount */}
                  <div className="flex items-center gap-3 shrink-0">
                    {tx.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setSelectedPhoto(tx.photoUrl || null)}
                        aria-label="View receipt photo"
                        className="w-9 h-9 rounded-[10px] overflow-hidden border border-zinc-300 dark:border-white/20 relative group cursor-pointer shadow-xs"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={tx.photoUrl} 
                          alt="Receipt" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                        />
                      </button>
                    )}

                    <span className={cn(
                      "text-sm font-black tabular-nums tracking-tight",
                      isPadala 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : "text-zinc-950 dark:text-white"
                    )}>
                      {isPadala ? "+" : "-"}{formatPHP(tx.amount || 0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* RECEIPT PHOTO MODAL VIEWER */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative max-w-sm w-full bg-white dark:bg-[#111111] rounded-[24px] p-3 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhoto}
                alt="Receipt Full View"
                className="w-full h-auto max-h-[70vh] object-contain rounded-[18px]"
              />
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="w-full mt-3 py-2.5 rounded-full bg-[#111111] text-white dark:bg-white dark:text-[#111111] text-xs font-bold uppercase tracking-wider"
              >
                Isara
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
