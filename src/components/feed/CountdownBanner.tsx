"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

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
    <div className="bg-amber-100 dark:bg-amber-900/30 rounded-2xl p-4 mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-amber-200/50 dark:border-amber-700/30 flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-sm text-amber-800 dark:text-amber-400 font-medium tracking-tight">
          🏠 Countdown to Uwi
        </span>
        {isEditing ? (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="date"
              className="px-2 py-1 rounded-lg text-black border border-amber-300 outline-none focus:ring-2 focus:ring-amber-500"
              value={tempDate}
              onChange={(e) => setTempDate(e.target.value)}
            />
            <button
              onClick={handleSave}
              className="bg-amber-500 text-white px-3 py-1 rounded-lg text-sm font-bold active:scale-[0.98] transition-transform duration-200 ease-out shadow-sm"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-amber-700 text-sm px-2 font-medium"
            >
              Cancel
            </button>
          </div>
        ) : (
          <span className="text-xl font-bold text-amber-950 dark:text-amber-100 mt-1">
            {targetDate
              ? `${formatDistanceToNow(new Date(targetDate))} na lang!`
              : "Wala pang petsa"}
          </span>
        )}
      </div>

      {!isEditing && isOfw && (
        <button
          onClick={() => setIsEditing(true)}
          className="text-amber-600 bg-amber-200/50 hover:bg-amber-200 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors active:scale-[0.98] duration-200 ease-out"
        >
          {targetDate ? "Edit" : "Set Date"}
        </button>
      )}
    </div>
  );
}
