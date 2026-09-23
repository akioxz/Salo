"use client";

import { useState, useEffect } from "react";
import { Globe, TrendingUp, Sun, Moon, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/cn";

interface Corridor {
  code: string;
  symbol: string;
  city: string;
  timezone: string;
  rate: number;
  change: string;
  isPositive: boolean;
}

const CORRIDORS: Corridor[] = [
  { code: "AED", symbol: "DXB", city: "Dubai", timezone: "Asia/Dubai", rate: 15.42, change: "+0.3%", isPositive: true },
  { code: "SAR", symbol: "RUH", city: "Riyadh", timezone: "Asia/Riyadh", rate: 15.52, change: "+0.2%", isPositive: true },
  { code: "USD", symbol: "NYC", city: "USA", timezone: "America/New_York", rate: 58.20, change: "+0.1%", isPositive: true },
  { code: "SGD", symbol: "SIN", city: "Singapore", timezone: "Asia/Singapore", rate: 44.15, change: "-0.1%", isPositive: false },
  { code: "QAR", symbol: "DOH", city: "Qatar", timezone: "Asia/Qatar", rate: 16.02, change: "+0.2%", isPositive: true },
  { code: "HKD", symbol: "HKG", city: "Hong Kong", timezone: "Asia/Hong_Kong", rate: 7.45, change: "+0.0%", isPositive: true },
];

export function OfwCompassCard() {
  const [corridorIndex, setCorridorIndex] = useState(0);
  const [time, setTime] = useState(new Date());

  const corridor = CORRIDORS[corridorIndex];

  // Update clock every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Format times in selected timezone and Manila
  const formatTime = (tz: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(time);
    } catch {
      return "--:--";
    }
  };

  // Get current hour in Manila (24-hour format) to determine awake/asleep state
  const manilaHour = (() => {
    try {
      const str = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila",
        hour: "numeric",
        hour12: false,
      }).format(time);
      return parseInt(str, 10);
    } catch {
      return 12;
    }
  })();

  const isManilaSleeping = manilaHour >= 22 || manilaHour < 6;

  const handleNextCorridor = () => {
    setCorridorIndex((prev) => (prev + 1) % CORRIDORS.length);
  };

  return (
    <div
      onClick={handleNextCorridor}
      role="button"
      tabIndex={0}
      title="I-tap para magpalit ng bansa / pera"
      className="col-span-1 relative overflow-hidden rounded-[24px] bg-white dark:bg-[#0A0A0A] border border-[#EAEAEA] dark:border-[#333333] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-5 flex flex-col justify-between cursor-pointer group transition-all duration-300 hover:bg-zinc-50 dark:hover:bg-[#161616] active:scale-95"
    >
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#F8F9FA] dark:from-[#111111] to-transparent pointer-events-none" />

      {/* Top Header Row: Icon + Active Corridor Pill */}
      <div className="flex justify-between items-center mb-3 relative z-10">
        <div className="w-8 h-8 rounded-full bg-[#F4F4F5] dark:bg-[#222222] border border-[#EAEAEA] dark:border-[#333333] flex items-center justify-center text-[#111111] dark:text-[#FBFBFA]">
          <Globe className="w-4 h-4" />
        </div>

        {/* Currency Switcher Pill */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-white/10 text-zinc-700 dark:text-zinc-300 text-xs font-bold tracking-tight group-hover:border-zinc-400 transition-colors">
          <span>{corridor.code} / PHP</span>
          <ArrowRightLeft className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
        </div>
      </div>

      {/* Section 1: Dual Timezone & Availability Radar */}
      <div className="relative z-10 flex flex-col gap-1.5 mb-2.5">
        <div className="flex items-center justify-between text-xs font-bold tabular-nums">
          <span className="text-zinc-600 dark:text-zinc-400">
            {corridor.symbol} {formatTime(corridor.timezone)}
          </span>
          <span className="text-zinc-400 dark:text-zinc-600">·</span>
          <span className="text-zinc-950 dark:text-white">
            MNL {formatTime("Asia/Manila")}
          </span>
        </div>

        {/* Sleep / Awake Status Badge */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
          {isManilaSleeping ? (
            <>
              <Moon className="w-3 h-3 text-indigo-500 shrink-0" />
              <span className="truncate">Tulog na sa Pinas</span>
            </>
          ) : (
            <>
              <Sun className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="truncate">Gising ang pamilya</span>
            </>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-zinc-100 dark:bg-white/5 my-0.5 relative z-10" />

      {/* Section 2: Forex Live Rate */}
      <div className="relative z-10 pt-1">
        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">
          Palitan Ngayon
        </p>

        <div className="flex items-baseline justify-between gap-1">
          <div className="flex items-baseline gap-1 text-zinc-950 dark:text-white">
            <span className="text-lg font-black tracking-tight tabular-nums">
              ₱{corridor.rate.toFixed(2)}
            </span>
            <span className="text-[11px] font-medium text-zinc-400">
              /{corridor.code}
            </span>
          </div>

          <div
            className={cn(
              "flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md",
              corridor.isPositive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            )}
          >
            <TrendingUp className="w-2.5 h-2.5" />
            <span>{corridor.change}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfwCompassCard;
