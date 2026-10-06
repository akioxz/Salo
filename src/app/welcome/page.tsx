"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import {
  Share2,
  Copy,
  Check,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Home,
  Medal,
  AlertCircle,
  PlusCircle,
  Users,
  HeartHandshake,
} from "lucide-react";
import { cn } from "@/lib/cn";

type FlowState = "choose" | "create" | "join" | "showCode";

export default function WelcomePage() {
  const router = useRouter();
  const { signIn, signOut } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();

  const myHousehold = useQuery(api.households.getMine);
  const createHousehold = useMutation(api.households.create);
  const joinHousehold = useMutation(api.households.join);

  const updateProfile = useMutation(api.users.updateProfile);

  const [step, setStep] = useState<FlowState>("choose");
  const [role, setRole] = useState<"family" | "ofw">("family");

  // Redirect to home if user already has a household
  useEffect(() => {
    if (isAuthenticated && myHousehold) {
      router.push("/");
    }
  }, [isAuthenticated, myHousehold, router]);
  
  // Registration fields
  const [name, setName] = useState("");
  const [familyTitle, setFamilyTitle] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await signIn("google");
    } catch (err) {
      console.error(err);
      setError("Nabigo ang pag-login sa Google. Subukan muli.");
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || !familyTitle.trim()) {
      setError("Kumpletuhin ang Pangalan at Role sa pamilya.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await updateProfile({ name: name.trim(), familyTitle: familyTitle.trim() });
      const result = await createHousehold({ role });
      setGeneratedCode(result.inviteCode);
      setStep("showCode");
      setLoading(false);
    } catch (err: unknown) {
      console.error(err);
      setError("May naganap na error sa paggawa ng tahanan.");
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim() || !name.trim() || !familyTitle.trim()) {
      setError("Kumpletuhin ang lahat ng impormasyon at ang invite code.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await updateProfile({ name: name.trim(), familyTitle: familyTitle.trim() });
      await joinHousehold({ inviteCode: inviteCode.trim() });
      router.push("/");
    } catch (err: unknown) {
      console.error(err);
      setError("Hindi wasto ang code o may error na naganap.");
      setLoading(false);
    }
  };

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/join?code=${generatedCode}`
      : `/join?code=${generatedCode}`;

  const shareText = `Salo tayo sa budget at kwento ng ating pamilya! Pindutin mo 'to para makasalo ka agad:\n${inviteUrl}`;

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Salo - Tahanan ng Pamilya",
          text: shareText,
        });
        return;
      } catch {
        // Fallback
      }
    }
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 min-h-screen flex justify-center selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
      <div className="bg-white dark:bg-[#0A0A0A] w-full max-w-md md:border-x md:border-zinc-200/80 dark:md:border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative flex flex-col justify-center min-h-screen px-7 py-12">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-[#161616] border border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-center text-zinc-800 dark:text-zinc-200 mx-auto mb-3 shadow-xs">
            <HeartHandshake className="w-6 h-6 stroke-[1.75]" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-1.5">
            Salo
          </h1>

          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm max-w-xs mx-auto leading-relaxed">
            {step === "choose" && "Pag-ugnayin ang inyong tahanan"}
            {step === "create" && "Simulan ang inyong tahanan"}
            {step === "join" && "Sumalo sa inyong tahanan"}
            {step === "showCode" && "Family Invite Link"}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-3.5 mb-6 bg-rose-500/[0.08] dark:bg-rose-500/[0.12] text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl border border-rose-500/20 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {!isAuthenticated ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <button
              onClick={handleGoogleLogin}
              className="w-full p-4.5 rounded-2xl bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-400 dark:hover:border-zinc-600 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center gap-3 active:scale-[0.98] h-14"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Mag-login gamit ang Google</span>
            </button>

            <button
              onClick={() => signIn("apple").catch(() => setError("Apple Sign-In requires production configuration."))}
              className="w-full p-4.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black border border-transparent shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center gap-3 active:scale-[0.98] h-14"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.68-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-.8 1.49.12 2.65.65 3.5 1.55-2.46 1.3-2.09 4.32.15 5.41-.61 1.77-1.45 3.25-2.23 4.01z" />
                <path d="M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.02 4.46-3.74 4.25z" />
              </svg>
              <span className="font-semibold text-sm">Mag-login gamit ang Apple</span>
            </button>

            <button
              onClick={() => signIn("anonymous")}
              className="w-full p-4.5 rounded-2xl bg-[#111111] dark:bg-[#FBFBFA] text-white dark:text-[#111111] border border-transparent hover:bg-black/90 dark:hover:bg-white/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center gap-2 active:scale-[0.98] h-14"
            >
              <span className="font-bold text-sm">Subukan bilang Guest (Dry Run)</span>
            </button>

            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
              Kailangan mag-login bago makagawa o makasali sa tahanan.
            </p>
          </div>
        ) : (
          <>
            {step === "choose" && (
              <div className="space-y-3.5">
                <button
                  onClick={() => setStep("create")}
                  className="w-full p-4.5 rounded-2xl bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-400 dark:hover:border-zinc-600 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-between text-left group active:scale-[0.98]"
                >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-[#1A1A1A] border border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-center text-zinc-900 dark:text-zinc-100 group-hover:scale-105 transition-transform duration-300">
                  <PlusCircle className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    Gumawa ng Tahanan
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Ako ang unang magsisimula at mag-iimbita
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:translate-x-0.5 transition-all duration-300" />
            </button>

            <button
              onClick={() => setStep("join")}
              className="w-full p-4.5 rounded-2xl bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-400 dark:hover:border-zinc-600 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-between text-left group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-[#1A1A1A] border border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-center text-zinc-900 dark:text-zinc-100 group-hover:scale-105 transition-transform duration-300">
                  <Users className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    Sumalo sa Tahanan
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    May natanggap akong invite link o code
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:translate-x-0.5 transition-all duration-300" />
            </button>

            <button
              onClick={() => signOut()}
              className="w-full mt-2 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              Maling account? Mag-logout
            </button>
          </div>
        )}

        {step === "create" && (
          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 text-center">
                Ano ang iyong gampanin?
              </label>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => setRole("family")}
                  className={cn(
                    "p-4 rounded-2xl border text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] relative flex flex-col justify-between h-20 active:scale-[0.98]",
                    role === "family"
                      ? "border-zinc-900 dark:border-white bg-zinc-900/[0.03] dark:bg-white/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-zinc-900/10 dark:ring-white/20"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121212] hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-500",
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <Home
                      className={cn(
                        "w-5 h-5 stroke-[1.75]",
                        role === "family"
                          ? "text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-400 dark:text-zinc-500",
                      )}
                    />
                    {role === "family" && (
                      <span className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-white" />
                    )}
                  </div>
                  <div>
                    <span
                      className={cn(
                        "font-bold text-sm block",
                        role === "family"
                          ? "text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-600 dark:text-zinc-400",
                      )}
                    >
                      Family
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("ofw")}
                  className={cn(
                    "p-4 rounded-2xl border text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] relative flex flex-col justify-between h-20 active:scale-[0.98]",
                    role === "ofw"
                      ? "border-zinc-900 dark:border-white bg-zinc-900/[0.03] dark:bg-white/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-zinc-900/10 dark:ring-white/20"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121212] hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-500",
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <Medal
                      className={cn(
                        "w-5 h-5 stroke-[1.75]",
                        role === "ofw"
                          ? "text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-400 dark:text-zinc-500",
                      )}
                    />
                    {role === "ofw" && (
                      <span className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-white" />
                    )}
                  </div>
                  <div>
                    <span
                      className={cn(
                        "font-bold text-sm block",
                        role === "ofw"
                          ? "text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-600 dark:text-zinc-400",
                      )}
                    >
                      OFW
                    </span>
                  </div>
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-1/2 h-14 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121212] text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-4 focus:ring-zinc-500/10 transition-all duration-300"
                    placeholder="Pangalan"
                    required
                  />
                  <input
                    type="text"
                    value={familyTitle}
                    onChange={(e) => setFamilyTitle(e.target.value)}
                    className="w-1/2 h-14 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121212] text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-4 focus:ring-zinc-500/10 transition-all duration-300"
                    placeholder="Role (Nanay, Ate)"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={loading || !name.trim() || !familyTitle.trim()}
              className={cn(
                "w-full h-14 font-bold text-sm rounded-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center gap-2",
                !name.trim() || !familyTitle.trim() || loading
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 border border-zinc-200/80 dark:border-zinc-800/80 cursor-not-allowed"
                  : "bg-[#111111] hover:bg-black dark:bg-[#FBFBFA] dark:hover:bg-white text-white dark:text-[#111111] active:scale-[0.98] shadow-sm cursor-pointer"
              )}
            >
              {loading ? (
                "Inihahanda ang Tahanan..."
              ) : (
                <>
                  <span>Gumawa ng Invite Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              onClick={() => setStep("choose")}
              className="w-full h-11 bg-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Bumalik</span>
            </button>
          </div>
        )}

        {step === "join" && (
          <form onSubmit={handleJoin} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="code"
                className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2 text-center"
              >
                Invite Code
              </label>
              <input
                id="code"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full h-14 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-[#121212] text-zinc-900 dark:text-zinc-100 text-base font-mono tracking-widest text-center uppercase placeholder:text-zinc-400 placeholder:normal-case placeholder:font-sans placeholder:tracking-normal focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-4 focus:ring-zinc-500/10 transition-all duration-300 mb-4"
                placeholder="I-paste ang code dito"
                required
              />

              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-1/2 h-14 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121212] text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-4 focus:ring-zinc-500/10 transition-all duration-300"
                    placeholder="Pangalan"
                    required
                  />
                  <input
                    type="text"
                    value={familyTitle}
                    onChange={(e) => setFamilyTitle(e.target.value)}
                    className="w-1/2 h-14 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121212] text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-4 focus:ring-zinc-500/10 transition-all duration-300"
                    placeholder="Role (Nanay, Ate)"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !inviteCode.trim() || !name.trim() || !familyTitle.trim()}
              className={cn(
                "w-full h-14 font-bold text-sm rounded-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center gap-2",
                !inviteCode.trim() || !name.trim() || !familyTitle.trim() || loading
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 border border-zinc-200/80 dark:border-zinc-800/80 cursor-not-allowed"
                  : "bg-[#111111] hover:bg-black dark:bg-[#FBFBFA] dark:hover:bg-white text-white dark:text-[#111111] active:scale-[0.98] shadow-sm cursor-pointer",
              )}
            >
              {loading ? (
                "Sumasalo sa Tahanan..."
              ) : (
                <>
                  <span>Sumalo sa Tahanan</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep("choose")}
              className="w-full h-11 bg-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Bumalik</span>
            </button>
          </form>
        )}

        {step === "showCode" && (
          <div className="space-y-5 text-center animate-in fade-in duration-300">
            <div className="p-6 bg-[#FBFBFA] dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl relative overflow-hidden text-left shadow-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/[0.08] dark:bg-emerald-500/[0.12] text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/20">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Family Invite Link</span>
              </div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                Ipadala kay Misis o Kapamilya
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
                I-share ito sa Messenger, WhatsApp, o Viber. Walang password na kailangan para makasalo sa inyong tahanan.
              </p>

              <div className="flex items-center justify-between gap-2 p-2.5 bg-white dark:bg-[#1A1A1A] border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 truncate select-all px-1">
                  {inviteUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  aria-label="Copy invite link"
                  className="shrink-0 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4.5 h-4.5" />
              <span>I-share sa Messenger / WhatsApp</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full h-12 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 font-semibold text-xs rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-2 text-zinc-700 dark:text-zinc-300 active:scale-[0.99] cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">Na-kopyang Link!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Kopyahin ang Link</span>
                </>
              )}
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full h-11 bg-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Dumiretso sa Hapag-kainan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
