"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Package, CheckCircle2, Plus, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    return <div className="p-6 text-center text-[#787774] dark:text-[#A1A1AA] animate-pulse font-medium">Loading box...</div>;
  }

  const packedCount = items.filter(i => i.status === "packed").length;
  const totalCount = items.length;
  const progress = totalCount === 0 ? 0 : (packedCount / totalCount) * 100;

  return (
    <div className="max-w-md mx-auto w-full pb-32">
      
      {/* Premium Header - No Card, Flush to Background */}
      <div className="px-6 pt-10 pb-6 text-center flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-[#4ADE80] opacity-[0.03] dark:opacity-[0.05] blur-[80px] pointer-events-none rounded-full" />
        
        <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-[#F4F4F5] to-[#EAEAEA] dark:from-[#222222] dark:to-[#111111] flex items-center justify-center mb-6 shadow-sm border border-black/5 dark:border-white/5 relative z-10 transform -rotate-3 transition-transform hover:rotate-0">
          <Package className="w-8 h-8 text-[#111111] dark:text-[#FBFBFA]" strokeWidth={1.5} />
        </div>
        
        <h2 className="text-3xl font-extrabold text-[#111111] dark:text-[#FBFBFA] mb-2 tracking-tight relative z-10">
          Balikbayan
        </h2>
        <p className="text-[15px] text-[#787774] dark:text-[#A1A1AA] font-medium max-w-[240px] leading-relaxed relative z-10">
          I-drop ang wishes niyo. Pag-uwi, bitbit na.
        </p>

        {/* Minimal Progress Bar */}
        <div className="w-full max-w-[200px] mt-6 flex flex-col gap-2 relative z-10">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#787774] dark:text-[#A1A1AA]">Status</span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#111111] dark:text-[#FBFBFA]">{packedCount} of {totalCount} Packed</span>
          </div>
          <div className="h-1.5 w-full bg-[#EAEAEA] dark:bg-[#222222] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#111111] dark:bg-white rounded-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Apple-style premium form with slider */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-[#F4F4F5] dark:bg-[#111111] p-5 rounded-[24px] border border-[#EAEAEA] dark:border-white/5 focus-within:border-[#D4D4D8] dark:focus-within:border-white/15 transition-all focus-within:bg-white dark:focus-within:bg-[#0A0A0A] shadow-inner dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ano ang wish mo?"
                className="w-full bg-transparent px-1 focus:outline-none text-[17px] placeholder:text-[#A1A1AA] text-[#111111] dark:text-[#FBFBFA] font-bold tracking-tight"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="w-10 h-10 flex items-center justify-center bg-[#111111] dark:bg-[#FBFBFA] text-white dark:text-[#111111] rounded-full transition-all active:scale-[0.95] disabled:opacity-50 disabled:active:scale-100 shrink-0 shadow-sm"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="pt-2 border-t border-[#EAEAEA] dark:border-[#222222]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold tracking-widest uppercase text-[#787774] dark:text-[#A1A1AA]">Price Estimate</span>
              <div className="flex items-center bg-white dark:bg-[#0A0A0A] px-3 py-1 rounded-full border border-[#EAEAEA] dark:border-[#333333]">
                <span className="text-[#A1A1AA] text-xs font-medium mr-1">₱</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className="w-16 bg-transparent text-sm focus:outline-none placeholder:text-[#A1A1AA] text-[#111111] dark:text-[#FBFBFA] font-bold tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            
            <div className="relative flex items-center h-6 group cursor-pointer">
              {/* Custom Slider Track */}
              <div className="absolute inset-x-0 h-1.5 bg-[#EAEAEA] dark:bg-[#222222] rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-[#111111] dark:bg-[#FBFBFA] transition-all duration-75" 
                  style={{ width: `${Math.min(100, Math.max(0, (Number(price) || 0) / 10000 * 100))}%` }} 
                />
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={price || 0}
                onChange={(e) => setPrice(e.target.value)}
                className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
              />
              {/* Custom Slider Thumb (visual only) */}
              <div 
                className="absolute h-5 w-5 bg-white dark:bg-[#FBFBFA] border border-[#EAEAEA] dark:border-white/10 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)] pointer-events-none transition-all duration-75 group-active:scale-90"
                style={{ left: `calc(${Math.min(100, Math.max(0, (Number(price) || 0) / 10000 * 100))}% - 10px)` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2 px-1">
              <span className="text-[10px] text-[#A1A1AA] font-medium">₱0</span>
              <span className="text-[10px] text-[#A1A1AA] font-medium">₱10,000+</span>
            </div>
          </div>
        </form>

        {/* Premium Separated Cards List */}
        <div className="grid grid-cols-2 gap-3 relative">
          <AnimatePresence>
            {items.filter(i => i.status !== "packed").length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-2 py-12 flex flex-col items-center justify-center text-center px-6 bg-white dark:bg-[#111111] rounded-[24px] border border-[#EAEAEA] dark:border-[#222222]"
              >
                <Sparkles className="w-8 h-8 text-[#A1A1AA] mb-3 opacity-50" />
                <p className="text-[15px] font-medium text-[#787774] dark:text-[#A1A1AA]">
                  Walang laman ang wishlist.
                </p>
                <p className="text-xs text-[#A1A1AA] mt-1">Add items above to start wishing.</p>
              </motion.div>
            ) : (
              items.filter(item => item.status !== "packed").map((item) => (
                <motion.button
                  layout
                  layoutId={`item-${item._id}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  key={item._id}
                  onClick={() => handleStatusChange(item._id, item.status)}
                  aria-label={`Mark ${item.title} as bought`}
                  className={cn(
                    "group relative w-full text-left p-4 rounded-[20px] flex flex-col justify-between cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.98] border shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-none dark:hover:shadow-none min-h-[140px] overflow-hidden",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white/20",
                    item.status === "bought"
                      ? "bg-white dark:bg-[#111111] border-[#111111]/20 dark:border-white/20 ring-1 ring-[#111111]/5 dark:ring-white/5"
                      : "bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#222222]"
                  )}
                >
                  <div className="flex flex-col relative z-10">
                    {/* @ts-ignore */}
                    {item.authorName && (
                      <span className="text-[9px] uppercase tracking-wider font-bold mb-1.5 transition-colors duration-700 text-[#A1A1AA]">
                        {/* @ts-ignore */}
                        {item.authorName}
                      </span>
                    )}
                    <h3
                      className={cn(
                        "font-bold tracking-tight text-[15px] leading-tight transition-colors duration-700 line-clamp-2",
                        "text-[#111111] dark:text-[#FBFBFA]"
                      )}
                    >
                      {item.title}
                    </h3>
                    {item.price && (
                      <p className={cn(
                        "text-[13px] font-bold mt-1.5 tabular-nums transition-colors duration-700",
                        item.status === "bought" ? "text-[#111111] dark:text-[#FBFBFA]" : "text-[#787774] dark:text-[#A1A1AA]"
                      )}>
                        ₱{item.price.toLocaleString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-end justify-end w-full mt-3 relative z-10">
                    {item.status === "open" && (
                      <div className="flex items-center gap-1.5 bg-transparent px-2.5 py-1 rounded-full border border-[#EAEAEA] dark:border-[#333333] transition-colors duration-500 group-hover:bg-[#F4F4F5] dark:group-hover:bg-[#1A1A1A]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#A1A1AA] transition-transform duration-500 group-hover:scale-150 shrink-0" />
                        <span className="text-[9px] uppercase font-bold tracking-widest text-[#787774] dark:text-[#A1A1AA] whitespace-nowrap">
                          Baka Naman
                        </span>
                      </div>
                    )}
                    {item.status === "bought" && (
                      <div className="flex items-center gap-1.5 bg-[#111111] dark:bg-[#FBFBFA] px-2.5 py-1 rounded-full border border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-transform duration-500 group-hover:scale-105">
                        <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#111111] animate-pulse shrink-0" />
                        <span className="text-[9px] uppercase font-bold tracking-widest text-white dark:text-[#111111] whitespace-nowrap">
                          Ayan, Nabili Na
                        </span>
                      </div>
                    )}
                  </div>
                </motion.button>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Packed Items Section - The Cargo Box */}
        {items.filter(i => i.status === "packed").length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 pt-6 border-t border-[#EAEAEA] dark:border-[#222222]"
          >
            <div className="flex items-center gap-2 mb-4 px-1">
              <Package className="w-4 h-4 text-[#787774] dark:text-[#A1A1AA]" />
              <h2 className="text-xs font-bold tracking-widest uppercase text-[#787774] dark:text-[#A1A1AA]">
                Nasa Balikbayan Box Na
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence>
                {items.filter(item => item.status === "packed").map((item) => (
                  <motion.button
                    layout
                    layoutId={`item-${item._id}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    key={item._id}
                    onClick={() => handleStatusChange(item._id, item.status)}
                    aria-label={`Mark ${item.title} as open`}
                    className={cn(
                      "group relative w-full text-left p-4 rounded-[20px] flex flex-col justify-between cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.98] border min-h-[140px] overflow-hidden",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white/20",
                      "bg-[#D9C4A9] dark:bg-[#2A2118] border-[#C2AA8C] dark:border-[#3D3124] hover:brightness-95 shadow-[inset_0_0_40px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_40px_rgba(0,0,0,0.4)]"
                    )}
                  >
                    {/* Physical Box Packing Tape Effect */}
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-white/20 dark:bg-black/20 backdrop-blur-sm border-x border-white/30 dark:border-white/5 z-0 mix-blend-overlay opacity-100 scale-y-100" />
                    
                    <div className="flex flex-col relative z-10">
                      {/* @ts-ignore */}
                      {item.authorName && (
                        <span className="text-[9px] uppercase tracking-wider font-bold mb-1.5 text-[#8C7A61] dark:text-[#8C7A61]">
                          {/* @ts-ignore */}
                          {item.authorName}
                        </span>
                      )}
                      <h3 className="font-bold tracking-tight text-[15px] leading-tight text-[#5C452C] dark:text-[#C2AA8C] line-clamp-2">
                        Nabili na yung {item.title} mo
                      </h3>
                      {item.price && (
                        <p className="text-[13px] font-bold mt-1.5 tabular-nums text-[#8C7A61] dark:text-[#8C7A61]">
                          ₱{item.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-end justify-end w-full mt-3 relative z-10">
                      <div className="flex items-center gap-1.5 bg-[#5C452C] dark:bg-[#1A140F] px-2.5 py-1 rounded-[6px] border-l-2 border-dashed border-[#D9C4A9]/40 dark:border-[#C2AA8C]/30 shadow-sm relative overflow-hidden group-hover:scale-105 origin-right transition-transform duration-500">
                        {/* Subdued barcode texture effect inside the stamp */}
                        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHg9IjIiIHdpZHRoPSIyIiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiLz4KPHJlY3QgeD0iNSIgd2lkdGg9IjEiIGhlaWdodD0iOCIgZmlsbD0iI2ZmZiIvPgo8cmVjdCB4PSI3IiB3aWR0aD0iMSIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==')] mix-blend-overlay"></div>
                        <Package className="w-2.5 h-2.5 text-[#D9C4A9] dark:text-[#C2AA8C] shrink-0 relative z-10" />
                        <span className="text-[9px] uppercase font-bold tracking-widest text-[#D9C4A9] dark:text-[#C2AA8C] whitespace-nowrap relative z-10">
                          Nasa Box Na Po
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
