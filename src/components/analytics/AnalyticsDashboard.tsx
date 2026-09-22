"use client";

import { HouseholdPost, Household } from "@/types/household";
import { formatPHP } from "@/lib/format";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { useMemo } from "react";

export function AnalyticsDashboard({
  posts,
  myHousehold,
}: {
  posts: HouseholdPost[];
  myHousehold: Household | null | undefined;
}) {
  const { theme } = useTheme();

  const chartData = useMemo(() => {
    // Group posts by date and calculate totals
    const data: Record<string, { date: string; inflows: number; outflows: number }> = {};
    
    // Sort posts chronologically
    const sortedPosts = [...posts].sort((a, b) => a._creationTime - b._creationTime);

    sortedPosts.forEach((post) => {
      if (post.type === "padala" || post.type === "expense") {
        const date = new Date(post._creationTime).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        if (!data[date]) {
          data[date] = { date, inflows: 0, outflows: 0 };
        }

        if (post.type === "padala") {
          data[date].inflows += post.amount || 0;
        } else if (post.type === "expense") {
          data[date].outflows += post.amount || 0;
        }
      }
    });

    // If no data, provide dummy data for preview
    if (Object.keys(data).length === 0) {
      return [
        { date: "Nov 1", inflows: 15000, outflows: 2000 },
        { date: "Nov 5", inflows: 0, outflows: 3500 },
        { date: "Nov 10", inflows: 10000, outflows: 1500 },
        { date: "Nov 15", inflows: 0, outflows: 4200 },
        { date: "Nov 20", inflows: 20200, outflows: 5000 },
      ];
    }

    return Object.values(data);
  }, [posts]);

  // Aggregate totals
  const totalPadala = chartData.reduce((acc, curr) => acc + curr.inflows, 0);
  const totalExpense = chartData.reduce((acc, curr) => acc + curr.outflows, 0);

  const isDark = theme === "dark";

  return (
    <div className="p-6 pb-24 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#111111] dark:text-[#FBFBFA]">
          Financial Overview
        </h2>
        <p className="text-sm text-[#787774] dark:text-[#A1A1AA] font-medium mt-1">
          Track your padala and household expenses
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0A0A0A] rounded-[24px] p-5 border border-[#EAEAEA] dark:border-[#333333] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-colors duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#F8F9FA] dark:from-[#111111] to-transparent pointer-events-none" />
          <p className="text-[10px] font-bold text-[#787774] dark:text-[#A1A1AA] uppercase tracking-wider mb-2 relative z-10">
            Total Inflow
          </p>
          <p className="text-2xl font-bold text-[#346538] dark:text-[#4ADE80] tracking-tight tabular-nums relative z-10">
            {formatPHP(totalPadala)}
          </p>
        </div>
        <div className="bg-white dark:bg-[#0A0A0A] rounded-[24px] p-5 border border-[#EAEAEA] dark:border-[#333333] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-colors duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#F8F9FA] dark:from-[#111111] to-transparent pointer-events-none" />
          <p className="text-[10px] font-bold text-[#787774] dark:text-[#A1A1AA] uppercase tracking-wider mb-2 relative z-10">
            Total Expense
          </p>
          <p className="text-2xl font-bold text-[#111111] dark:text-[#FBFBFA] tracking-tight tabular-nums relative z-10">
            {formatPHP(totalExpense)}
          </p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white dark:bg-[#0A0A0A] rounded-[32px] p-6 border border-[#EAEAEA] dark:border-[#333333] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-colors duration-300 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#F8F9FA] dark:from-[#111111] to-transparent pointer-events-none" />
        <div className="mb-6 relative z-10">
          <p className="text-[10px] font-bold text-[#787774] dark:text-[#A1A1AA] uppercase tracking-wider">
            Cashflow Trend
          </p>
          <h3 className="text-lg font-bold text-[#111111] dark:text-[#FBFBFA] tracking-tight mt-1">
            Padala vs Expenses
          </h3>
        </div>
        <div className="w-full h-64 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInflows" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isDark ? "#4ADE80" : "#346538"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isDark ? "#4ADE80" : "#346538"} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOutflows" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isDark ? "#FBFBFA" : "#111111"} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={isDark ? "#FBFBFA" : "#111111"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isDark ? "#A1A1AA" : "#787774", fontSize: 10, fontWeight: 500 }} 
                dy={10} 
              />
              <YAxis 
                hide 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? "#111111" : "#FFFFFF", 
                  borderColor: isDark ? "#333333" : "#EAEAEA",
                  borderRadius: "16px",
                  color: isDark ? "#FBFBFA" : "#111111",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.12)"
                }}
                itemStyle={{ fontSize: 13, fontWeight: 700 }}
                labelStyle={{ fontSize: 11, color: isDark ? "#A1A1AA" : "#787774", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}
                formatter={(value: number) => formatPHP(value)}
              />
              <Area 
                type="monotone" 
                dataKey="inflows" 
                name="Padala"
                stroke={isDark ? "#4ADE80" : "#346538"} 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorInflows)" 
              />
              <Area 
                type="monotone" 
                dataKey="outflows" 
                name="Expenses"
                stroke={isDark ? "#FBFBFA" : "#111111"} 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorOutflows)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
