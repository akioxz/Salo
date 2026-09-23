"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Package, Plus, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getWishCategory } from "@/lib/wishCategory";

export function BalikbayanBoxView() {
  const items = useQuery(api.balikbayan.list);
  const addItem = useMutation(api.balikbayan.add);
  const updateStatus = useMutation(api.balikbayan.updateStatus);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Packed section starts closed — it opens into the spread-out grid on tap.
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [justPackedId, setJustPackedId] = useState<string | null>(null);

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
    else if (currentStatus === "bought") {
      nextStatus = "packed";
      // Auto-open and close the box
      setJustPackedId(itemId);
      setIsBoxOpen(true);
      setShowGrid(false); // Make sure grid doesn't pop out!
      setTimeout(() => {
        setIsBoxOpen(false);
        setTimeout(() => setJustPackedId(null), 500); // Unhide from popcorn grid after box closes
      }, 1500);
    }
    else if (currentStatus === "packed") nextStatus = "open";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateStatus({ itemId: itemId as any, status: nextStatus });
  };

  if (items === undefined) {
    return <div className="p-6 text-center text-zinc-500 dark:text-zinc-400 animate-pulse font-medium">Loading box...</div>;
  }

  const packedCount = items.filter((i) => i.status === "packed").length;
  const totalCount = items.length;
  const progress = totalCount === 0 ? 0 : (packedCount / totalCount) * 100;
  const packedItems = items.filter((item) => item.status === "packed");

  return (
    <div className="max-w-md mx-auto w-full pb-32">

      {/* Premium Header with 3D Balikbayan Box Centerpiece */}
      <div className="px-6 pt-8 pb-4 text-center flex flex-col items-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[240px] h-[240px] bg-[#C2AA8C] opacity-[0.06] dark:opacity-[0.08] blur-[100px] pointer-events-none rounded-full" />

        <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white mb-1 tracking-tight relative z-10">
          Balikbayan
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 font-medium max-w-[280px] leading-relaxed relative z-10 mb-4">
          I-drop ang wishes niyo. Pag-uwi, bitbit na.
        </p>

        {/* Minimal Progress Bar (Placed cleanly above the box) */}
        <div className="w-full max-w-[210px] mb-8 flex flex-col gap-1.5 relative z-10">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">Status</span>
            <span className="text-xs font-bold tracking-wider uppercase text-zinc-950 dark:text-white">
              {packedCount} of {totalCount} Packed
            </span>
          </div>
          <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-zinc-950 dark:bg-white rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {/* 3D BALIKBAYAN HERO BOX (Interactive, perfectly spaced with realistic 3D angles) */}
        <div className="w-full flex flex-col items-center py-4 mb-8 relative">
          <div 
            className="relative w-full max-w-[210px] aspect-[10/8.5] cursor-pointer group mx-auto z-30"
            onClick={() => {
              const nextOpen = !isBoxOpen;
              setIsBoxOpen(nextOpen);
              setShowGrid(nextOpen);
            }}
            style={{ perspective: "1000px" }}
          >
            {/* Floor Shadow */}
            <div className="absolute -bottom-6 inset-x-4 h-9 bg-black/10 dark:bg-black/50 blur-2xl rounded-[100%] transition-all duration-700 group-hover:scale-105 group-active:scale-95" />
            
            {/* Box Interior (Deep OLED Void) */}
            <div className="absolute inset-0 bg-[#3D2E1A] dark:bg-[#000000] rounded-[22px] border-[7px] border-[#2A2118] dark:border-[#0A0704] overflow-hidden flex flex-col items-center justify-center shadow-[inset_0_35px_70px_rgba(0,0,0,0.9)]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)]" />
            </div>

            {/* Top/Back Flap (Opens at realistic 3D angle: -110deg) */}
            <motion.div 
              className="absolute inset-x-0 top-0 h-1/2 bg-[#C2AA8C] dark:bg-[#231A12] origin-top z-20 rounded-t-[22px] overflow-hidden border-x border-t border-[#D9C4A9]/20 dark:border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_-2px_10px_rgba(0,0,0,0.5)]"
              initial={false}
              animate={{ rotateX: isBoxOpen ? -110 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
            >
              {/* Cargo Print / Decal */}
              <div className="absolute top-3 left-4 flex gap-1.5 opacity-20 dark:opacity-10">
                <div className="w-1 h-8 bg-black" />
                <div className="w-2.5 h-8 bg-black" />
                <div className="w-1 h-8 bg-black" />
                <div className="w-4 h-8 bg-black" />
                <div className="w-0.5 h-8 bg-black" />
              </div>
              
              {/* Top Half Ethereal Glass Tape */}
              <motion.div 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-full bg-white/30 dark:bg-white/10 backdrop-blur-2xl border-x border-white/40 dark:border-white/20 origin-bottom shadow-[0_2px_15px_rgba(255,255,255,0.2)]"
                animate={{ scaleY: isBoxOpen ? 0 : 1, opacity: isBoxOpen ? 0 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
              </motion.div>
            </motion.div>

            {/* Bottom/Front Flap (Opens forward at realistic 3D angle: 100deg) */}
            <motion.div 
              className="absolute inset-x-0 bottom-0 h-1/2 bg-[#D9C4A9] dark:bg-[#2A2118] origin-bottom z-30 rounded-b-[22px] flex flex-col items-center justify-start overflow-hidden border-x border-b border-[#E8D5BC]/30 dark:border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_5px_20px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_5px_20px_rgba(0,0,0,0.6)]"
              initial={false}
              animate={{ rotateX: isBoxOpen ? 100 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
            >
              {/* Cargo Print */}
              <div className="absolute bottom-3 right-4 font-mono text-[11px] font-bold text-black/20 dark:text-black/40 tracking-widest transform -rotate-90 origin-bottom-right">
                FRAGILE
              </div>
              
              {/* Bottom Half Ethereal Glass Tape */}
              <motion.div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-full bg-white/30 dark:bg-white/10 backdrop-blur-2xl border-x border-white/40 dark:border-white/20 origin-top shadow-[0_-2px_15px_rgba(255,255,255,0.2)]"
                animate={{ scaleY: isBoxOpen ? 0 : 1, opacity: isBoxOpen ? 0 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
              </motion.div>

              {/* Badge (Hidden when open) */}
              <motion.div 
                className="relative z-10 bg-[#5C452C] dark:bg-[#0A0A0A] px-4 py-1.5 rounded-full flex items-center gap-2 mt-4 shadow-xl border border-[#C2AA8C]/30 dark:border-white/10 backdrop-blur-md"
                animate={{ opacity: isBoxOpen ? 0 : 1, scale: isBoxOpen ? 0.8 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <Package className="w-3.5 h-3.5 text-[#D9C4A9]" />
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#D9C4A9]">
                  {packedCount} {packedCount === 1 ? 'Item' : 'Items'}
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Packed Items Popcorn Grid (Visible when box is opened by user) */}
        <div className="w-full relative z-40 mt-4">
          <AnimatePresence>
            {showGrid && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full overflow-visible"
              >
                <div className="flex flex-wrap justify-center gap-2 pb-2 px-2 pt-2 w-full max-w-[340px] mx-auto relative z-10">
                  {packedItems.map((item, index) => {
                    if (item._id === justPackedId) return null;
                    
                    const category = getWishCategory(item.title);
                    const CategoryIcon = category.icon;
                    
                    const delay = index * 0.05; 
                    const randomRotate = (index % 2 === 0 ? 1 : -1) * (5 + (index % 10));
                    const stickerRotate = (index % 2 === 0 ? 1 : -1) * (1 + (index % 3));
                    
                    return (
                      <motion.button
                        layout
                        layoutId={`packed-item-${item._id}`}
                        initial={{ opacity: 0, scale: 0.2, y: 100, rotate: randomRotate * 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotate: randomRotate }}
                        exit={{ opacity: 0, scale: 0.2, y: 100, rotate: 0 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 450, 
                          damping: 20, 
                          delay: delay 
                        }}
                        whileHover={{ scale: 1.05, rotate: 0, zIndex: 50 }}
                        key={item._id}
                        onClick={() => handleStatusChange(item._id, item.status)}
                        aria-label={`Unpack ${item.title}`}
                        className={cn(
                          "group relative w-[76px] sm:w-[82px] shrink-0 aspect-square rounded-[8px] flex items-center justify-center cursor-pointer active:scale-[0.96] overflow-hidden text-left",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white/20",
                          "bg-[#C2AA8C] dark:bg-[#2A2118]",
                          "border border-[#A88F6D]/50 dark:border-[#1A130D]",
                          "shadow-[0_8px_15px_rgba(0,0,0,0.1),inset_0_2px_0_rgba(255,255,255,0.3)] dark:shadow-[0_8px_15px_rgba(0,0,0,0.5),inset_0_2px_0_rgba(255,255,255,0.05)]",
                          "hover:brightness-105 transition-all duration-300"
                        )}
                        style={{ zIndex: 10 + index }}
                      >
                        <div className="absolute inset-x-0 bottom-0 h-2 bg-[#A88F6D]/50 dark:bg-[#1A130D]/80" />
                        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 bg-white/20 dark:bg-black/20 border-x border-white/10 dark:border-black/10" />
                        <div 
                          className="relative z-10 w-[85%] h-[85%] bg-[#F8F9FA] dark:bg-[#EAEAEA] rounded-[2px] shadow-sm flex flex-col items-start justify-between p-1.5 border border-[#E0E0E0] dark:border-white/20 group-hover:rotate-0 transition-transform duration-300"
                          style={{ transform: `rotate(${stickerRotate}deg)` }}
                        >
                          <div className="flex items-start gap-1 w-full">
                            <CategoryIcon className="w-4 h-4 text-[#111111] shrink-0 opacity-80" strokeWidth={2.5} />
                          </div>
                          <span className="text-[9px] sm:text-[10px] font-extrabold tracking-tight text-[#111111] uppercase leading-[1] line-clamp-2 w-full mt-1">
                            {item.title}
                          </span>
                          <div className="w-full h-2 mt-1 flex gap-[1px] opacity-30">
                            <div className="h-full w-[2px] bg-black" />
                            <div className="h-full w-[1px] bg-black" />
                            <div className="h-full w-[3px] bg-black" />
                            <div className="h-full w-[1px] bg-black" />
                            <div className="h-full w-[2px] bg-black" />
                            <div className="h-full w-[1px] bg-black" />
                            <div className="h-full w-[3px] bg-black" />
                            <div className="h-full w-[1px] bg-black" />
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
        </form>

        {/* Waybill / Shipping Label List — open + bought items */}
        <div className="flex flex-col gap-3 w-full relative">
          <AnimatePresence>
            {items.filter((i) => i.status !== "packed").length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full py-12 flex flex-col items-center justify-center text-center px-6 bg-white dark:bg-[#111111] rounded-[4px] border border-dashed border-[#EAEAEA] dark:border-[#222222]"
              >
                <Package className="w-8 h-8 text-[#A1A1AA] mb-3 opacity-50" />
                <p className="text-base font-semibold text-zinc-700 dark:text-zinc-200">
                  Walang laman ang wishlist.
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Add items above to start wishing.</p>
              </motion.div>
            ) : (
              items
                .filter((item) => item.status !== "packed")
                .map((item) => {
                  const category = getWishCategory(item.title);
                  const CategoryIcon = category.icon;
                  const waybillVariants = {
                    initial: { opacity: 0, y: 10 },
                    animate: { opacity: 1, y: 0 },
                    exit: { 
                      scale: 0.28,
                      y: -380, // Shoots UP directly into the open Balikbayan box above
                      backgroundColor: "#C2AA8C", // Morphs to cardboard
                      borderColor: "#A88F6D",
                      borderRadius: "14px",
                      zIndex: 50,
                      opacity: 0,
                      transition: { 
                        duration: 0.75,
                        ease: [0.16, 1, 0.3, 1] as const, // Apple spring curve
                        y: { duration: 0.75, ease: [0.32, 0, 0.67, 0] as const }, // Upward launch into box
                        scale: { duration: 0.28, ease: "easeOut" as const },
                        backgroundColor: { duration: 0.2 },
                        borderColor: { duration: 0.2 },
                        borderRadius: { duration: 0.2 },
                        opacity: { duration: 0.15, delay: 0.6 } // STAYS 100% VISIBLE until entering the box!
                      }
                    }
                  };

                  return (
                    <motion.button
                      layout
                      layoutId={`feed-item-${item._id}`}
                      variants={waybillVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      key={item._id}
                      onClick={() => handleStatusChange(item._id, item.status)}
                      aria-label={`Mark ${item.title} as bought`}
                      className={cn(
                        "group relative w-full text-left p-4 rounded-[4px] flex justify-between items-stretch cursor-pointer active:scale-[0.98] min-h-[96px] overflow-hidden",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white/20",
                        // Waybill / Sticker Aesthetics
                        "bg-[#F8F9FA] dark:bg-[#EAEAEA] border border-[#E0E0E0] dark:border-[#D4D4D4] shadow-sm hover:shadow-[0_5px_15px_rgba(0,0,0,0.08)]"
                      )}
                    >
                      {/* Normal Waybill Content (Fades out when packing) */}
                      <motion.div 
                        className="w-full flex justify-between items-stretch absolute inset-0 p-4"
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {/* Fake Vertical Barcode on the left edge */}
                        <div className="absolute left-4 top-4 bottom-4 flex gap-[2px] opacity-20 group-hover:opacity-40 transition-opacity">
                          <div className="w-[2px] h-full bg-[#111111]" />
                          <div className="w-[1px] h-full bg-[#111111]" />
                          <div className="w-[3px] h-full bg-[#111111]" />
                          <div className="w-[1px] h-full bg-[#111111]" />
                          <div className="w-[2px] h-full bg-[#111111]" />
                          <div className="w-[1px] h-full bg-[#111111]" />
                          <div className="w-[4px] h-full bg-[#111111]" />
                          <div className="w-[1px] h-full bg-[#111111]" />
                        </div>
                        
                        <div className="pl-8 w-full flex justify-between items-center z-10 gap-4">
                          {/* Left Side: Text Details */}
                          <div className="flex flex-col flex-1 min-w-0 py-1">
                            {/* @ts-ignore */}
                            {item.authorName && (
                              <span className="text-[9px] uppercase tracking-[0.2em] font-extrabold text-[#111111]/40 mb-1 flex items-center gap-1.5">
                                {/* @ts-ignore */}
                                {item.authorName}
                              </span>
                            )}
                            <h3 className="font-black tracking-tight text-[16px] leading-tight text-[#111111] line-clamp-2 uppercase">
                              {item.title}
                            </h3>
                          </div>

                          {/* Right Side: Icon & CTA Stamp */}
                          <div className="flex flex-col items-end justify-between h-full gap-3 shrink-0 py-1">
                            <CategoryIcon className="w-5 h-5 text-[#111111] opacity-70" strokeWidth={2.5} />
                            
                            {/* Rubber Stamp Buttons */}
                            {item.status === "open" && (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] border-2 border-[#111111]/10 text-[#111111]/40 group-hover:border-[#111111] group-hover:text-[#111111] group-hover:bg-[#111111]/5 transition-all duration-300 transform group-hover:-rotate-2">
                                <span className="text-[9px] uppercase font-black tracking-[0.1em] whitespace-nowrap">
                                  Baka Naman
                                </span>
                              </div>
                            )}
                            {item.status === "bought" && (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] border-2 border-[#8C7A61] bg-[#8C7A61]/10 text-[#8C7A61] shadow-sm transform -rotate-3 group-hover:-rotate-1 transition-transform">
                                <span className="text-[9px] uppercase font-black tracking-[0.1em] whitespace-nowrap">
                                  Nabili Na
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>

                      {/* Mini Parcel Morph Overlay (Visible when morphing into a cardboard box flying to the big box) */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        exit={{ opacity: 1 }}
                        transition={{ duration: 0.18 }}
                        className="absolute inset-0 pointer-events-none flex items-center justify-center p-2"
                      >
                        {/* Box 3D Edge (Bottom) */}
                        <div className="absolute inset-x-0 bottom-0 h-3 bg-[#A88F6D]/70 dark:bg-[#1A130D]/80" />
                        
                        {/* Packaging Tape (Vertical across the box) */}
                        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-white/25 dark:bg-black/25 border-x border-white/10 dark:border-black/10" />

                        {/* Slapped-on Shipping Label (Sticker) */}
                        <div className="relative z-10 w-[80%] h-[80%] bg-[#F8F9FA] dark:bg-[#EAEAEA] rounded-[3px] shadow-sm flex flex-col items-start justify-between p-2 border border-[#E0E0E0] dark:border-white/20">
                          <div className="flex items-center gap-1.5 w-full">
                            <CategoryIcon className="w-4 h-4 text-[#111111] shrink-0 opacity-80" strokeWidth={2.5} />
                            <span className="text-[10px] font-black tracking-tight text-[#111111] uppercase leading-tight line-clamp-1">
                              {item.title}
                            </span>
                          </div>
                          <div className="w-full h-1.5 flex gap-[1px] opacity-30">
                            <div className="h-full w-[2px] bg-black" />
                            <div className="h-full w-[1px] bg-black" />
                            <div className="h-full w-[3px] bg-black" />
                            <div className="h-full w-[1px] bg-black" />
                            <div className="h-full w-[2px] bg-black" />
                          </div>
                        </div>
                      </motion.div>
                    </motion.button>
                  );
                })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
