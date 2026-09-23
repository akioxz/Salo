"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Home } from "lucide-react";

export function CountdownBanner() {
  const me = useQuery(api.households.getMine);
  const setVisitDate = useMutation(api.households.setVisitDate);
  const [isEditing, setIsEditing] = useState(false);
  const [tempDate, setTempDate] = useState("");

  if (me === undefined) return null; // loading
  if (!me || !me.household) return null; // no household

  const { household, myRole } = me;
  const targetDate = household.nextVisitDate;

  const handleSave = async () => {
    if (tempDate) {
      await setVisitDate({ nextVisitDate: new Date(tempDate).getTime() });
    }
    setIsEditing(false);
  };

  const isOfw = myRole === "ofw";

  return (
    <div className="col-span-2 relative overflow-hidden rounded-[24px] bg-white dark:bg-[#0A0A0A] border border-[#EAEAEA] dark:border-[#333333] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-5 flex flex-col justify-between transition-colors duration-300">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider flex items-center gap-1.5">
          <Home className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          Countdown to Uwi
        </span>
        {isEditing ? (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="date"
              className="px-3 py-1.5 rounded-xl text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 outline-none focus:ring-1 focus:ring-zinc-400 text-xs font-semibold"
              value={tempDate}
              onChange={(e) => setTempDate(e.target.value)}
            />
            <button
              onClick={handleSave}
              className="bg-[#111111] dark:bg-white text-white dark:text-[#111111] px-3 py-1.5 rounded-xl text-xs font-bold active:scale-[0.98] transition-transform duration-200 cursor-pointer"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs px-2 font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
          <span className="text-xl font-black text-zinc-950 dark:text-white mt-1 tracking-tight">
            {targetDate
              ? `${formatDistanceToNow(new Date(targetDate))} na lang!`
              : "Wala pang petsa ng uwi"}
          </span>
        )}
      </div>

      {!isEditing && isOfw && (
        <button
          onClick={() => setIsEditing(true)}
          className="self-start text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 mt-3 px-3 py-1.5 rounded-xl transition-colors active:scale-[0.98] cursor-pointer"
        >
          {targetDate ? "Palitan ang Petsa" : "I-set ang Petsa ng Uwi"}
        </button>
      )}
    </div>
  );
}

