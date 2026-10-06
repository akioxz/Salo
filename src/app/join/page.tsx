"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import { Users, HeartHandshake, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";

function JoinHouseholdContent() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("code") || "";
  const router = useRouter();

  const { signIn, signOut } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();

  const preview = useQuery(api.households.getByInviteCode, { inviteCode });
  const joinHousehold = useMutation(api.households.join);
  const updateProfile = useMutation(api.users.updateProfile);

  const [name, setName] = useState("");
  const [familyTitle, setFamilyTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { redirectTo: `/join?code=${inviteCode}` });
    } catch (err) {
      console.error(err);
      setError("Nabigo ang pag-login sa Google.");
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !familyTitle.trim()) {
      setError("Pakikumpleto ang iyong Pangalan at Papel sa Pamilya.");
      return;
    }

    setLoading(true);

    try {
      await updateProfile({ name: name.trim(), familyTitle: familyTitle.trim() });
      await joinHousehold({
        inviteCode,
        name: name.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: unknown) {
      console.error(err);
      setError((err as Error).message || "Hindi makasali sa tahanan. Maaaring paso na ang link.");
      setLoading(false);
    }
  };

  // 1. Loading State
  if (preview === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse mb-4" />
        <p className="text-sm text-zinc-500 font-medium">Hinahanap ang inyong tahanan...</p>
      </div>
    );
  }

  // 2. Invalid or Expired Code State
  if (!preview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 flex items-center justify-center mb-4 border border-rose-200/50 dark:border-rose-900/50">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[#111111] dark:text-[#FBFBFA] mb-2">
          Paso o Hindi Wasto ang Link
        </h1>
        <p className="text-sm text-zinc-500 max-w-sm mb-6 leading-relaxed">
          Maaaring nagamit na ang link o lumipas na ang 48 oras. Humingi ng bagong invite link sa iyong kapamilya sa Messenger.
        </p>
        <button
          onClick={() => router.push("/welcome")}
          className="px-6 py-3 rounded-xl bg-[#111111] dark:bg-[#FBFBFA] text-white dark:text-[#111111] text-sm font-bold shadow-sm"
        >
          Pumunta sa Simula
        </button>
      </div>
    );
  }

  // 3. Full Household State
  if (preview.isFull) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 flex items-center justify-center mb-4 border border-amber-200/50 dark:border-amber-900/50">
          <Users className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[#111111] dark:text-[#FBFBFA] mb-2">
          Puno na ang Tahanang Ito
        </h1>
        <p className="text-sm text-zinc-500 max-w-sm mb-6 leading-relaxed">
          Kumpleto na ang 2 miyembro sa tahanang ito. Kung nais gumawa ng sariling tahanan, pumunta sa simula.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 rounded-xl bg-[#111111] dark:bg-[#FBFBFA] text-white dark:text-[#111111] text-sm font-bold shadow-sm"
        >
          Bumalik sa Simula
        </button>
      </div>
    );
  }

  // 4. Valid Invite Form (Zero-Password / Messenger-Ready)
  return (
    <div className="w-full max-w-md mx-auto flex flex-col justify-center min-h-[80vh] px-6 py-8">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/[0.08] dark:bg-emerald-500/[0.12] text-emerald-600 dark:text-emerald-400 mb-4 border border-emerald-500/20 shadow-sm">
          <HeartHandshake className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#111111] dark:text-[#FBFBFA] mb-2">
          Salo
        </h1>
        <p className="text-sm text-zinc-500 max-w-xs mx-auto">
          Inimbitahan ka ni <span className="font-bold text-zinc-900 dark:text-zinc-100">{preview.inviterName}</span> sumalo sa inyong tahanan.
        </p>
      </div>

      {/* Main Join Card */}
      <div className="bg-white dark:bg-[#0A0A0A] rounded-[24px] border border-[#EAEAEA] dark:border-[#333333] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-[#F8F9FA] dark:from-[#1A1A1A] to-transparent pointer-events-none" />

        {success ? (
          <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              Kasalo ka na!
            </h2>
            <p className="text-xs text-zinc-500">Pumapasok na sa inyong hapag-kainan...</p>
          </div>
        ) : !isAuthenticated ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <button
              onClick={handleGoogleLogin}
              className="w-full p-4.5 rounded-2xl bg-[#111111] dark:bg-[#FBFBFA] text-white dark:text-[#111111] border border-transparent hover:bg-black/90 dark:hover:bg-white/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center gap-3 active:scale-[0.98] h-14"
            >
              <svg className="w-5 h-5 bg-white rounded-full p-[2px]" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="font-bold text-sm">Mag-login gamit ang Google</span>
            </button>

            <button
              onClick={() => signIn("anonymous")}
              className="w-full p-4.5 rounded-2xl bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/90 text-zinc-900 dark:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-600 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center gap-2 active:scale-[0.98] h-14"
            >
              <span className="font-semibold text-sm">Subukan bilang Guest (Dry Run)</span>
            </button>

            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
              Kailangan mong mag-login upang makasalo.
            </p>
          </div>
        ) : (
          <form onSubmit={handleJoin} noValidate className="relative z-10 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 text-center mb-1">
                Kumpletuhin ang iyong Profile
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError("");
                  }}
                  className={cn(
                    "w-1/2 h-14 px-4 rounded-xl border bg-[#FBFBFA] dark:bg-[#121212] text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none transition-all",
                    error ? "border-rose-400 dark:border-rose-900 ring-1 ring-rose-500/20" : "border-zinc-200 dark:border-zinc-800 focus:border-zinc-500/50"
                  )}
                  placeholder="Pangalan (Marco)"
                  required
                />
                <input
                  type="text"
                  value={familyTitle}
                  onChange={(e) => {
                    setFamilyTitle(e.target.value);
                    if (error) setError("");
                  }}
                  className={cn(
                    "w-1/2 h-14 px-4 rounded-xl border bg-[#FBFBFA] dark:bg-[#121212] text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none transition-all",
                    error ? "border-rose-400 dark:border-rose-900 ring-1 ring-rose-500/20" : "border-zinc-200 dark:border-zinc-800 focus:border-zinc-500/50"
                  )}
                  placeholder="Role (Tatay)"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/[0.08] dark:bg-rose-500/[0.12] text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl border border-rose-500/20 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim() || !familyTitle.trim()}
              className="w-full h-14 mt-2 bg-[#111111] dark:bg-[#FBFBFA] text-white dark:text-[#111111] font-bold text-sm rounded-xl transition-all duration-300 hover:bg-black/85 dark:hover:bg-white/90 active:scale-[0.98] disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                "Pumapasok sa Tahanan..."
              ) : (
                <>
                  <span>Sumalo sa Tahanan</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => signOut()}
              className="w-full mt-2 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              Maling account? Mag-logout
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <div className="bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="text-sm text-zinc-500">Kinakarga...</div>
      }>
        <JoinHouseholdContent />
      </Suspense>
    </div>
  );
}
