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
    <div className="col-span-1 bg-white rounded-xl p-5 border border-[#EAEAEA] flex flex-col justify-between">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-semibold text-[#787774] tracking-wider">
          🏠 Countdown to Uwi
        </span>
        {isEditing ? (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="date"
              className="px-2 py-1 rounded-lg text-black border border-[#EAEAEA] outline-none focus:ring-2 focus:ring-[#111111]"
              value={tempDate}
              onChange={(e) => setTempDate(e.target.value)}
            />
            <button
              onClick={handleSave}
              className="bg-[#111111] text-white px-3 py-1 rounded-lg text-sm font-bold active:scale-[0.98] transition-transform duration-200 ease-out"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-[#787774] text-sm px-2 font-medium"
            >
              Cancel
            </button>
          </div>
        ) : (
          <span className="text-xl font-bold text-[#111111] mt-1">
            {targetDate
              ? `${formatDistanceToNow(new Date(targetDate))} na lang!`
              : "Wala pang petsa"}
          </span>
        )}
      </div>

      {!isEditing && isOfw && (
        <button
          onClick={() => setIsEditing(true)}
          className="text-[#1F6C9F] bg-[#E1F3FE] hover:bg-[#E1F3FE]/80 mt-3 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors active:scale-[0.98] duration-200 ease-out text-center"
        >
          {targetDate ? "Edit" : "Set Date"}
        </button>
      )}
    </div>
  );
}

