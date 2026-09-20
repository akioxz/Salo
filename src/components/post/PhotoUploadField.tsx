"use client";

/**
 * Visual-only upload field. Not wired to Convex storage — it fakes the
 * "compressing…" step with a timeout so the UI can be reviewed on its
 * own. Swap the marked block for your real compress-then-upload call
 * when you wire this into CreatePostModal.
 */

import { useCallback, useRef, useState } from "react";
import { ImagePlus, X, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatBytes } from "@/lib/format";

interface PhotoUploadFieldProps {
  onChange?: (file: File | null) => void;
  maxSizeMb?: number;
}

type Status = "idle" | "compressing" | "ready" | "error";

export function PhotoUploadField({
  onChange,
  maxSizeMb = 8,
}: PhotoUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFile = useCallback(
    (candidate: File | undefined) => {
      if (!candidate) return;

      if (!candidate.type.startsWith("image/")) {
        setError("That file isn't a photo. Try a JPG or PNG.");
        setStatus("error");
        return;
      }
      if (candidate.size > maxSizeMb * 1024 * 1024) {
        setError(`That photo is a bit large. Keep it under ${maxSizeMb}MB.`);
        setStatus("error");
        return;
      }

      setError(null);
      setFile(candidate);
      setPreviewUrl(URL.createObjectURL(candidate));
      setStatus("compressing");
      onChange?.(candidate);

      // --- placeholder for the real client-side compression step ---
      window.setTimeout(() => setStatus("ready"), 900);
      // ---------------------------------------------------------------
    },
    [maxSizeMb, onChange]
  );

  function handleRemove() {
    setPreviewUrl(null);
    setFile(null);
    setStatus("idle");
    setError(null);
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  if (previewUrl && file) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-white/10 dark:bg-zinc-800">
        <img
          src={previewUrl}
          alt="Selected photo preview"
          className="aspect-[4/3] w-full object-cover"
        />

        <button
          type="button"
          onClick={handleRemove}
          aria-label="Remove photo"
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-all duration-200 hover:bg-black/65 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 border-t border-zinc-200 bg-white/80 px-3 py-2 text-xs text-zinc-600 dark:border-white/10 dark:bg-zinc-900/80 dark:text-zinc-400">
          {status === "compressing" && (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
              <span>Compressing</span>
            </>
          )}
          {status === "ready" && (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span>Ready to post</span>
              <span className="text-zinc-400 dark:text-zinc-500">
                {formatBytes(file.size)}
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-6 text-center transition-all duration-200 active:scale-[0.99]",
          dragActive
            ? "border-amber-400 bg-amber-500/[0.06] dark:bg-amber-400/[0.06]"
            : "border-zinc-300 hover:border-zinc-400 dark:border-white/15 dark:hover:border-white/25"
        )}
      >
        <ImagePlus className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
        <span className="text-sm text-zinc-600 dark:text-zinc-300">
          Add a photo
        </span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          Tap to choose, or drag one here
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="sr-only"
      />

      {error && (
        <p role="alert" className="text-xs text-amber-700 dark:text-amber-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default PhotoUploadField;
