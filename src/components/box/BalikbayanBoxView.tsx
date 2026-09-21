"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Package, CheckCircle2 } from "lucide-react";

export function BalikbayanBoxView() {
  const items = useQuery(api.balikbayan.list);
  const addItem = useMutation(api.balikbayan.add);
  const updateStatus = useMutation(api.balikbayan.updateStatus);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await addItem({
        title: title.trim(),
        price: price ? parseFloat(price) : undefined,
      });
      setTitle("");
      setPrice("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (itemId: string, currentStatus: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let nextStatus: any = "open";
    if (currentStatus === "open") nextStatus = "bought";
    else if (currentStatus === "bought") nextStatus = "packed";
    else if (currentStatus === "packed") nextStatus = "open";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateStatus({ itemId: itemId as any, status: nextStatus });
  };

  if (items === undefined) {
    return <div className="p-6 text-center text-zinc-500">Loading box...</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto w-full pb-32">
      <div className="bg-amber-100 dark:bg-[#0f1115] dark:ethereal-glass dark:shadow-[0_0_20px_rgba(245,158,11,0.05)] p-6 rounded-2xl mb-6 text-center border-x border-b border-x-zinc-200/80 border-b-zinc-200/80 dark:border-x-white/5 dark:border-b-white/5">
        <div className="flex justify-center mb-3">
          <div className="bg-amber-500/20 p-3 rounded-full">
            <Package className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        <h2 className="text-xl font-extrabold text-amber-900 dark:text-amber-500 mb-1 tracking-tight">Balikbayan Box</h2>
        <p className="text-sm text-amber-700 dark:text-amber-500/80">
          I-drop dito ang mga wishes niyo. Pag-uwi, bitbit na!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <div className="flex-1 flex gap-2 bg-white dark:bg-[#0f1115] p-2 rounded-xl border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-inner dark:ethereal-glass focus-within:ring-2 focus-within:ring-amber-500/20">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g., Sapatos ni bunso"
            className="flex-1 bg-transparent px-2 focus:outline-none text-sm min-w-0 placeholder:text-zinc-500/50"
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="₱"
            className="w-16 bg-zinc-50 dark:bg-white/5 px-2 rounded-lg text-sm focus:outline-none border-none border-l border-zinc-200 dark:border-transparent placeholder:text-zinc-500/50"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="bg-amber-500 hover:bg-amber-400 text-black px-5 rounded-xl font-bold text-sm transition-all active:scale-[0.96] disabled:opacity-50 shadow-[0_0_15px_rgba(245,158,11,0.2)] spring-bounce"
        >
          Add
        </button>
      </form>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-sm">
            Wala pang laman ang box. Mag-wish na!
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              className={cn(
                "p-4 rounded-xl border flex items-center justify-between transition-colors cursor-pointer active:scale-[0.98]",
                item.status === "packed"
                  ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30 dark:ethereal-glass"
                  : item.status === "bought"
                  ? "bg-amber-50 dark:bg-[#0f1115] border-amber-200 dark:border-white/5 dark:shadow-inner dark:ethereal-glass"
                  : "bg-white dark:bg-[#0f1115] border-zinc-200 dark:border-white/5 dark:shadow-inner dark:ethereal-glass"
              )}
              onClick={() => handleStatusChange(item._id, item.status)}
            >
              <div>
                <h3
                  className={cn(
                    "font-medium",
                    item.status === "packed"
                      ? "text-emerald-900 dark:text-emerald-100 line-through opacity-70"
                      : "text-zinc-900 dark:text-zinc-100"
                  )}
                >
                  {item.title}
                </h3>
                {item.price && (
                  <p className="text-xs text-zinc-500 font-medium tracking-tight">₱{item.price}</p>
                )}
              </div>
              <div className="shrink-0">
                {item.status === "open" && (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 bg-zinc-100 dark:bg-white/5 dark:border dark:border-white/5 dark:text-zinc-500 px-2 py-1 rounded-full">
                    Wish
                  </span>
                )}
                {item.status === "bought" && (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:shadow-[0_0_12px_rgba(16,185,129,0.15)] px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 shrink-0" /> Nabili Na
                  </span>
                )}
                {item.status === "packed" && (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                    <Package className="w-3 h-3 shrink-0" /> Nasa Box
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
