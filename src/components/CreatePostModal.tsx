"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { cn } from "@/lib/cn";
import { formatPHP, formatBytes, stripEmojis } from "@/lib/format";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingCart,
  Zap,
  GraduationCap,
  HeartPulse,
  Tag,
  Camera,
  Mic,
  Trash2,
  Check,
  Play,
  Pause,
  ArrowDownLeft,
  ArrowUpRight,
  Heart,
  Loader2,
  Plus,
} from "lucide-react";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_OPTIONS = [
  { id: "Groceries", label: "Pagkain", icon: ShoppingCart },
  { id: "Utilities", label: "Kuryente / Tubig", icon: Zap },
  { id: "Health", label: "Gamot / Doktor", icon: HeartPulse },
  { id: "Education", label: "Tuition / Baon", icon: GraduationCap },
  { id: "General", label: "Iba pa", icon: Tag },
];

export default function CreatePostModal({
  isOpen,
  onClose,
}: CreatePostModalProps) {
  const [type, setType] = useState<"need" | "expense" | "padala">("need");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("Groceries");
  const [customCategory, setCustomCategory] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [linkedNeedId, setLinkedNeedId] = useState<string>("");

  // Media attachments
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Audio recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const createPost = useMutation(api.posts.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const posts = useQuery(api.posts.list);

  const openNeeds = (posts || []).filter((p) => p.type === "need" && !p.isCovered);

  // Reset form helper
  const resetForm = () => {
    setContent("");
    setAmount("");
    setCategory("Groceries");
    setCustomCategory("");
    setErrorMsg("");
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setPhotoFile(null);
    setPhotoPreview(null);
    setAudioBlob(null);
    setAudioUrl(null);
    
    // Stop recording and mic stream if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
    setRecordingSeconds(0);
    setLinkedNeedId("");
    setType("need");
    if (timerRef.current) clearInterval(timerRef.current);
    onClose();
  };

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        resetForm();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Clean up media stream on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Handle Photo selection
  const handlePhotoSelect = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Pumili lamang ng JPG o PNG na litrato.");
      return;
    }
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  };

  const handleRemovePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Audio Recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access error:", err);
      setErrorMsg("Kailangan ng pahintulot sa mikropono upang makapagtala ng voice note.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleRemoveAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlayingAudio(false);
  };

  const toggleAudioPlayback = () => {
    if (!audioElementRef.current && audioUrl) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlayingAudio(false);
    }

    if (audioElementRef.current) {
      if (isPlayingAudio) {
        audioElementRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioElementRef.current.play();
        setIsPlayingAudio(true);
      }
    }
  };

  // Preset Amount Quick Chips
  const handleAddPresetAmount = (preset: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + preset).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !amount) return;

    setLoading(true);
    try {
      let photoStorageId: string | undefined;
      let audioStorageId: string | undefined;

      if (photoFile) {
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": photoFile.type },
          body: photoFile,
        });
        if (!res.ok) throw new Error("Photo upload failed");
        const { storageId } = await res.json();
        photoStorageId = storageId;
      }

      if (audioBlob) {
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": audioBlob.type },
          body: audioBlob,
        });
        if (!res.ok) throw new Error("Audio upload failed");
        const { storageId } = await res.json();
        audioStorageId = storageId;
      }

      const finalCategory =
        type === "padala"
          ? "Remittance"
          : category === "General" && customCategory.trim()
            ? customCategory.trim()
            : category;

      await createPost({
        type,
        category: finalCategory,
        caption: content.trim() || (type === "padala" ? "Nagpadala ng biyaya sa pamilya" : ""),
        amount: amount ? parseFloat(amount) : undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        photoStorageId: photoStorageId as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        audioStorageId: audioStorageId as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        linkedNeedId: type === "expense" && linkedNeedId ? (linkedNeedId as any) : undefined,
      });

      resetForm();
    } catch (err) {
      console.error("Failed to post:", err);
      setErrorMsg("May naganap na problema sa pag-post. Subukan muli.");
    } finally {
      setLoading(false);
    }
  };

  // Color & Theme configuration based on Post Type
  const themeConfig = {
    need: {
      title: "Mag-post ng Hiling",
      subtitle: "Ipaalam sa pamilya kung may kailangang bayaran o bilhin",
      submitButton: "bg-[#111111] hover:bg-black text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-[#111111] font-extrabold shadow-[0_4px_16px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.08)]",
      submitLabel: "I-post ang Hiling",
      placeholder: "Halimbawa: Pambili ng gamot ni Nanay o pambayad ng kuryente...",
      icon: Heart,
    },
    expense: {
      title: "Magtala ng Gastos",
      subtitle: "I-upload ang resibo at detalye ng binayaran",
      submitButton: "bg-[#111111] hover:bg-black text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-[#111111] font-extrabold shadow-[0_4px_16px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.08)]",
      submitLabel: "I-tala ang Gastos",
      placeholder: "Halimbawa: Grocery sa Puregold o resibo sa Mercury Drug...",
      icon: ArrowUpRight,
    },
    padala: {
      title: "Mag-post ng Padala",
      subtitle: "Ibahagi ang naipadalang biyaya at suporta sa pamilya",
      submitButton: "bg-[#111111] hover:bg-black text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-[#111111] font-extrabold shadow-[0_4px_16px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.08)]",
      submitLabel: "I-post ang Padala",
      placeholder: "Halimbawa: Padala via BDO / GCash para sa monthly budget...",
      icon: ArrowDownLeft,
    },
  }[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/75 backdrop-blur-md p-0 sm:p-4 overflow-hidden"
          onClick={resetForm}
        >
          {/* Main Modal Surface */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-[#0F1115] border-t sm:border border-zinc-200/90 dark:border-white/10 rounded-t-[32px] sm:rounded-[28px] p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto no-scrollbar relative"
          >
            {/* Mobile Sheet Pull Bar Indicator */}
            <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto mb-4 sm:hidden" />

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 text-sm font-medium">
                {errorMsg}
              </div>
            )}

            {/* Modal Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
                  {themeConfig.title}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                  {themeConfig.subtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center justify-center transition-colors active:scale-90 cursor-pointer"
                aria-label="Isara"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* 1. TYPE SELECTOR (Tactile 3-Tab Pill Switcher) */}
              <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900/90 rounded-2xl border border-zinc-200/60 dark:border-white/5">
                {(
                  [
                    { id: "need", label: "Hiling (Need)", icon: Heart },
                    { id: "expense", label: "Gastos", icon: ArrowUpRight },
                    { id: "padala", label: "Padala", icon: ArrowDownLeft },
                  ] as const
                ).map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = type === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setType(tab.id)}
                      className={cn(
                        "relative flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer",
                        isSelected
                          ? "bg-[#111111] text-white dark:bg-white dark:text-[#111111] shadow-xs font-black"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white active:scale-95"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 2. HERO MONETARY AMOUNT INPUT (Apple Wallet / Monzo Style) */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/10 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {type === "need" ? "Tantiyang Halaga (Opsyonal)" : "Halaga"}
                  </span>
                  {amount && (
                    <button
                      type="button"
                      onClick={() => setAmount("")}
                      className="text-xs font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      Burahin
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-zinc-400 dark:text-zinc-600 select-none">
                    ₱
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*\.?\d*$/.test(val)) {
                        setAmount(val);
                      }
                    }}
                    placeholder="0"
                    className="w-full bg-transparent text-3xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                {/* Quick Increment Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {[500, 1000, 2000, 5000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddPresetAmount(preset)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-95 transition-all cursor-pointer"
                    >
                      +{formatPHP(preset)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. CATEGORY SELECTION (Interactive Chips) */}
              {type !== "padala" ? (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Kategorya
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_OPTIONS.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer active:scale-95",
                            isSelected
                              ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-xs"
                              : "bg-white dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/10 hover:border-zinc-300"
                          )}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom category input if 'General' is chosen */}
                  {category === "General" && (
                    <motion.input
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Tukuyin ang kategorya (hal. Pamasahe, Repair, atbp.)"
                      className="w-full mt-1 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 text-xs font-semibold text-zinc-950 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    />
                  )}
                </div>
              ) : (
                /* Padala auto-category badge */
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-4 h-4" />
                  <span className="text-xs font-bold">
                    Awtomatikong nakatala bilang OFW Remittance / Padala
                  </span>
                </div>
              )}

              {/* 4. COVER OPEN NEED (If Expense and open needs exist) - Tactile Card List, NO UGLY SELECT */}
              {type === "expense" && openNeeds.length > 0 && (
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-zinc-500" />
                      I-link sa Hiling ng Pamilya (Opsyonal)
                    </span>
                    {linkedNeedId && (
                      <button
                        type="button"
                        onClick={() => setLinkedNeedId("")}
                        className="text-xs font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                      >
                        Alisin ang Link
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {openNeeds.map((need) => {
                      const isSelected = linkedNeedId === need._id;
                      return (
                        <button
                          key={need._id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setLinkedNeedId("");
                            } else {
                              setLinkedNeedId(need._id);
                              if (!amount || amount === "0") {
                                setAmount(need.amount?.toString() || "");
                              }
                              if (need.category && need.category !== "General") {
                                setCategory(need.category);
                              }
                            }
                          }}
                          className={cn(
                            "w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer active:scale-[0.99]",
                            isSelected
                              ? "bg-[#111111] text-white dark:bg-white dark:text-[#111111] border-[#111111] dark:border-white shadow-xs"
                              : "bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border-zinc-200/80 dark:border-white/10 text-zinc-900 dark:text-white"
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate">
                              {stripEmojis(need.caption)}
                            </p>
                            <span
                              className={cn(
                                "text-[11px] font-medium block mt-0.5",
                                isSelected ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-500 dark:text-zinc-400"
                              )}
                            >
                              Humiling: {need.author?.name || "Pamilya"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            {need.amount && (
                              <span className="text-xs font-black tabular-nums">
                                {formatPHP(need.amount)}
                              </span>
                            )}
                            <div
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                isSelected
                                  ? "bg-white/20 dark:bg-black/10 text-white dark:text-[#111111]"
                                  : "bg-zinc-200 dark:bg-white/10 text-zinc-500 dark:text-zinc-400"
                              )}
                            >
                              {isSelected ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : <Plus className="w-3.5 h-3.5" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. CAPTION / NOTES TEXTAREA */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Mensahe o Detalye
                </span>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={themeConfig.placeholder}
                  className="w-full h-24 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/10 text-sm font-medium text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none leading-relaxed"
                />
              </div>

              {/* 6. COMPACT MEDIA DOCK (Photos & Voice Notes) */}
              <div className="flex flex-col gap-2.5 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Kalakip (Attachments)
                </span>

                {/* Media Buttons Row */}
                <div className="flex items-center gap-2">
                  {/* Photo Attachment Trigger */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoSelect(e.target.files?.[0])}
                    className="sr-only"
                  />
                  {!photoPreview && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2.5 px-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/10 flex items-center justify-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-all active:scale-95 cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-zinc-500" />
                      <span>Maglakip ng Litrato / Resibo</span>
                    </button>
                  )}

                  {/* Audio Recording Trigger */}
                  {!audioUrl && (
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={cn(
                        "py-2.5 px-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-95 cursor-pointer",
                        photoPreview ? "w-full" : "flex-1",
                        isRecording
                          ? "bg-rose-500 text-white border-rose-600 animate-pulse"
                          : "bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300"
                      )}
                    >
                      <Mic className={cn("w-4 h-4", isRecording ? "text-white" : "text-zinc-500")} />
                      <span>
                        {isRecording
                          ? `Recording (${recordingSeconds}s) - Tap to Stop`
                          : "Sabi Mo (Voice)"}
                      </span>
                    </button>
                  )}
                </div>

                {/* Attached Photo Preview Chip */}
                {photoPreview && photoFile && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-white/10"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreview}
                        alt="Attached preview"
                        className="w-10 h-10 rounded-lg object-cover border border-black/10 dark:border-white/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-zinc-950 dark:text-white truncate block">
                          {photoFile.name}
                        </span>
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">
                          {formatBytes(photoFile.size)} · Handa nang i-post
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                      aria-label="Remove photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                {/* Attached Audio Player Chip */}
                {audioUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-white/10"
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={toggleAudioPlayback}
                        className="w-8 h-8 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                      >
                        {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                      </button>
                      <div>
                        <span className="text-xs font-bold text-zinc-950 dark:text-white block">
                          Voice Note ({recordingSeconds}s)
                        </span>
                        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 block">
                          {isPlayingAudio ? "Pinatutugtog..." : "Nai-record na"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveAudio}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                      aria-label="Remove audio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </div>

              {/* 7. SUBMIT BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || (!content.trim() && !amount)}
                  className={cn(
                    "w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm transition-all duration-300 active:scale-[0.98] cursor-pointer",
                    loading || (!content.trim() && !amount)
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold cursor-not-allowed shadow-none"
                      : themeConfig.submitButton
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Ipinopost sa pamilya...</span>
                    </>
                  ) : (
                    <span>{themeConfig.submitLabel}</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
