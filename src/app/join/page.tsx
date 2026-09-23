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

  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();

  const preview = useQuery(api.households.getByInviteCode, { inviteCode });
  const joinHousehold = useMutation(api.households.join);

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    if (!isAuthenticated && !trimmedName) {
      setError("Pakilagay ang iyong pangalan o palayaw sa pamilya.");
      return;
    }

    setLoading(true);

    try {
      // If not authenticated yet (e.g. Nanay opening via Messenger), create seamless session
      if (!isAuthenticated) {
        await signIn("anonymous", { name: trimmedName });
      }

      await joinHousehold({
        inviteCode,
        name: trimmedName || undefined,
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
          onClick={() => router.push("/auth")}
          className="px-6 py-3 rounded-xl bg-[#111111] dark:bg-[#FBFBFA] text-white dark:text-[#111111] text-sm font-bold shadow-sm"
        >
          Pumunta sa Login
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
          Kumpleto na ang 2 miyembro sa tahanang ito. Kung nais gumawa ng sariling tahanan, pumunta sa login.
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
        ) : (
          <form onSubmit={handleJoin} noValidate className="relative z-10 flex flex-col gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2"
              >
                Ano ang itatawag namin sa &apos;yo?
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Hal. Nanay Maria, Ate Sarah, Kuya Jun"
                className={cn(
                  "w-full h-14 px-4 rounded-xl border bg-[#FBFBFA] dark:bg-[#121212] text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none transition-all",
                  error
                    ? "border-rose-400 dark:border-rose-900 ring-1 ring-rose-500/20"
                    : "border-zinc-200 dark:border-zinc-800 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
                )}
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/[0.08] dark:bg-rose-500/[0.12] text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl border border-rose-500/20 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
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

            <p className="text-[11px] text-zinc-400 text-center mt-2 leading-relaxed">
              Walang password na kailangan. Naka-save ang iyong tahanan sa device na ito.
            </p>
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
