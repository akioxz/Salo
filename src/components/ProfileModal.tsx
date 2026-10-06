"use client";

import React, { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { Camera, X, LogOut, Loader2 } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const me = useQuery(api.users.getMe);
  if (!isOpen || !me) return null;

  return <ProfileModalContent key={me._id} me={me} onClose={onClose} />;
}

function ProfileModalContent({
  me,
  onClose,
}: {
  me: { _id: Id<"users">; name?: string; familyTitle?: string; image?: string };
  onClose: () => void;
}) {
  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const { signOut } = useAuthActions();

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState(me.name || "");
  const [familyTitle, setFamilyTitle] = useState(me.familyTitle || "");
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let imageStorageId: Id<"_storage"> | undefined;

      // 1. Upload photo if selected
      if (selectedFile) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });
        const { storageId } = await result.json();
        imageStorageId = storageId as Id<"_storage">;
      }

      // 2. Update profile
      await updateProfile({
        name,
        familyTitle,
        imageStorageId,
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert("May error sa pag-save ng profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity">
      <div className="bg-white dark:bg-[#0A0A0A] w-full max-w-sm rounded-[32px] p-6 shadow-2xl border border-zinc-200 dark:border-white/10 flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">Profile Mo</h3>

        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center relative">
              {previewImage || me.image ? (
                <img 
                  src={previewImage || me.image} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-zinc-300 dark:text-zinc-600">
                  {(me.name || "?").charAt(0).toUpperCase()}
                </span>
              )}
              
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden" 
            />
          </div>
          <p className="text-xs font-medium text-zinc-500 mt-3">Pindutin ang picture para magpalit</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-xs font-bold tracking-wider uppercase text-zinc-500 mb-1.5 ml-1">
              Pangalan
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-[#FBFBFA] dark:bg-[#121212] text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500/50 transition-colors"
              placeholder="Pangalan mo"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold tracking-wider uppercase text-zinc-500 mb-1.5 ml-1">
              Family Title (Hal: Kuya, Nanay)
            </label>
            <input
              type="text"
              value={familyTitle}
              onChange={(e) => setFamilyTitle(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-[#FBFBFA] dark:bg-[#121212] text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500/50 transition-colors"
              placeholder="Family Title"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-auto">
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim() || !familyTitle.trim()}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-white bg-[#111111] hover:bg-black dark:bg-white dark:text-[#111111] dark:hover:bg-zinc-200 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "I-save ang Profile"}
          </button>
          
          <button
            onClick={() => signOut()}
            className="w-full py-3 px-4 rounded-2xl font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Mag-logout
          </button>

          <button
            onClick={() => {
              if (window.confirm("Gusto mo bang tuluyang burahin ang iyong account? Ang aksyong ito ay hindi na maibabalik.")) {
                signOut().then(() => {
                  alert("Tuluyan nang nabura ang iyong account.");
                });
              }
            }}
            className="w-full py-3 px-4 rounded-2xl font-semibold text-rose-600/70 dark:text-rose-400/70 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors flex items-center justify-center gap-2"
          >
            Burahin ang Account
          </button>
        </div>

      </div>
    </div>
  );
}
