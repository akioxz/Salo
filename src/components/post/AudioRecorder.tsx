"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/cn";

interface AudioRecorderProps {
  onAudioReady: (blob: Blob) => void;
  onClear: () => void;
}

export function AudioRecorder({ onAudioReady, onClear }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onAudioReady(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
      alert("Microphone access is required to record a voice note.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks to release the mic
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleClear = () => {
    setAudioUrl(null);
    onClear();
  };

  return (
    <div className="flex items-center gap-3 w-full bg-zinc-50 dark:bg-white/5 p-3 rounded-2xl border border-zinc-200 dark:border-white/5">
      {audioUrl ? (
        <>
          <audio src={audioUrl} controls className="h-8 flex-1 max-w-[200px]" />
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-medium text-red-500 hover:text-red-600 px-2 py-1 bg-red-50 dark:bg-red-500/10 rounded-full"
          >
            Remove
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            onPointerDown={(e) => {
              // Prevent default so it doesn't fire click on touch devices
              e.preventDefault();
              startRecording();
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              stopRecording();
            }}
            onPointerLeave={stopRecording}
            className={cn(
              "w-12 h-12 flex items-center justify-center rounded-full transition-all touch-none",
              isRecording 
                ? "bg-red-500 text-white scale-110 animate-pulse shadow-lg shadow-red-500/20" 
                : "bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-white/20"
            )}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </button>
          <div className="flex-1">
            <p className={cn("text-sm font-medium", isRecording ? "text-red-500" : "text-zinc-600 dark:text-zinc-400")}>
              {isRecording ? "Recording..." : "Hold to record 'Sabi Mo'"}
            </p>
            <p className="text-[11px] text-zinc-500">
              Attach a voice note to your post.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
