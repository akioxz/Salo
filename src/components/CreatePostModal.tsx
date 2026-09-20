"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PhotoUploadField } from "./post/PhotoUploadField";

export default function CreatePostModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const createPost = useMutation(api.posts.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      // The backend expects type, category, and caption
      await createPost({ 
        type: "need", 
        category: "General", 
        caption: content.trim() 
      });
      setContent("");
      setPhotoFile(null);
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to create post:", err);
      alert("Failed to post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 md:absolute md:bottom-24 md:right-6 w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40"
        aria-label="Create Post"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm p-4">
          <div 
            className="bg-white dark:bg-[#111] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300 ease-out"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Create Post</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 bg-zinc-100/50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 rounded-full flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening at home?"
                className="w-full h-32 p-4 bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-lg transition-shadow placeholder:text-zinc-400"
                autoFocus
              />
              
              <div className="mt-4">
                <PhotoUploadField onChange={setPhotoFile} />
              </div>
              
              <div className="mt-4 flex justify-end items-center">
                <button
                  type="submit"
                  disabled={loading || !content.trim()}
                  className="px-6 h-12 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-sm active:scale-[0.98]"
                >
                  {loading ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
