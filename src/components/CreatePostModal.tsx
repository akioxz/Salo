"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PhotoUploadField } from "./post/PhotoUploadField";
import { AudioRecorder } from "./post/AudioRecorder";
import { cn } from "@/lib/cn";

export default function CreatePostModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [type, setType] = useState<"expense" | "need" | "padala">("need");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("General");
  const [content, setContent] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [linkedNeedId, setLinkedNeedId] = useState<string>("");
  
  const [loading, setLoading] = useState(false);

  const createPost = useMutation(api.posts.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const posts = useQuery(api.posts.list);

  const openNeeds = (posts || []).filter((p) => p.type === "need" && !p.isCovered);

  const resetForm = () => {
    setContent("");
    setAmount("");
    setCategory("General");
    setPhotoFile(null);
    setAudioBlob(null);
    setLinkedNeedId("");
    setType("need");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      let photoStorageId: string | undefined;
      let audioStorageId: string | undefined;

      if (photoFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": photoFile.type },
          body: photoFile,
        });

        if (!result.ok) throw new Error("Failed to upload photo");
        const { storageId } = await result.json();
        photoStorageId = storageId;
      }

      if (audioBlob) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": audioBlob.type },
          body: audioBlob,
        });

        if (!result.ok) throw new Error("Failed to upload audio");
        const { storageId } = await result.json();
        audioStorageId = storageId;
      }

      await createPost({
        type,
        category: type === "padala" ? "Remittance" : category,
        caption: content.trim(),
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
      console.error("Failed to create post:", err);
      alert("Failed to post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const placeholderText = {
    expense: "Ano ang binayaran or binili ninyo?",
    need: "Ano ang kailangan bilhin o bayaran?",
    padala: "Nagpadala ka ba? Ilagay ang detalye!",
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-[#0f1115] dark:ethereal-glass border dark:border-white/5 w-full max-w-md rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200 ease-out">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Create Post</h2>
              <button
                onClick={resetForm}
                className="w-8 h-8 bg-zinc-100/50 dark:bg-white/10 hover:bg-zinc-100 dark:hover:bg-white/20 text-zinc-500 dark:text-zinc-400 rounded-full flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              {/* Type Selector */}
              <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-xl">
                {(["need", "expense", "padala"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      "relative flex-1 py-1.5 text-sm font-medium rounded-lg capitalize transition-all spring-bounce duration-400",
                      type === t 
                        ? "bg-white dark:bg-[#1a1d24] shadow-sm text-zinc-900 dark:text-zinc-50 scale-[1.02]" 
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 active:scale-95"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Grouped Form Inputs (iOS Style) */}
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-zinc-200 dark:border-white/5 overflow-hidden flex flex-col">
                <div className="flex border-b border-zinc-200 dark:border-white/5">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount (₱)"
                    className="w-1/2 p-4 bg-transparent focus:outline-none text-sm border-r border-zinc-200 dark:border-white/5 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  />
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Category"
                    className="w-1/2 p-4 bg-transparent focus:outline-none text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 disabled:opacity-50"
                    disabled={type === "padala"}
                  />
                </div>

                {type === "expense" && openNeeds.length > 0 && (
                  <div className="border-b border-zinc-200 dark:border-white/5">
                    <select
                      value={linkedNeedId}
                      onChange={(e) => setLinkedNeedId(e.target.value)}
                      className="w-full p-4 bg-transparent focus:outline-none text-sm appearance-none text-zinc-500 dark:text-zinc-400"
                    >
                      <option value="">Cover an open need? (Optional)</option>
                      {openNeeds.map(need => (
                        <option key={need._id} value={need._id}>
                          {need.caption} {need.amount ? `(₱${need.amount})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={placeholderText[type]}
                  className="w-full h-24 p-4 bg-transparent focus:outline-none text-sm resize-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-3">
                <PhotoUploadField onChange={setPhotoFile} />
                <AudioRecorder 
                  onAudioReady={setAudioBlob} 
                  onClear={() => setAudioBlob(null)} 
                />
              </div>

              <div className="mt-2">
                <button
                  type="submit"
                  disabled={loading || !content.trim()}
                  className="w-full h-12 flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all spring-bounce active:scale-[0.96] disabled:bg-amber-500/20 dark:disabled:bg-amber-500/10 disabled:text-amber-900/40 dark:disabled:text-amber-500/40 disabled:shadow-none shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                >
                  {loading ? "Posting..." : "Post to Feed"}
                </button>
              </div>
            </form>
          </div>
    </div>
  );
}
