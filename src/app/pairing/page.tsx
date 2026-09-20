"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";

type FlowState = "choose" | "create" | "join" | "showCode";

export default function PairingPage() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  
  const createHousehold = useMutation(api.households.create);
  const joinHousehold = useMutation(api.households.join);

  const [step, setStep] = useState<FlowState>("choose");
  const [role, setRole] = useState<"family" | "ofw">("family");
  const [inviteCode, setInviteCode] = useState("");
  
  // State for generated code
  const [generatedCode, setGeneratedCode] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await createHousehold({ role });
      setGeneratedCode(result.inviteCode);
      setStep("showCode");
    } catch (err: unknown) {
      console.error(err);
      setError((err as Error).message || "Failed to create household. You might already belong to one.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    
    setError("");
    setLoading(true);
    try {
      await joinHousehold({ inviteCode: inviteCode.trim() });
      router.push("/");
    } catch (err: unknown) {
      console.error(err);
      setError((err as Error).message || "Invalid or expired invite code.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    alert("Code copied to clipboard!");
  };

  return (
    <div className="bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 min-h-screen flex justify-center">
      {/* Mobile Phone-like Container for desktop, full width on mobile */}
      <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-md md:border-x md:border-zinc-200 dark:md:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative flex flex-col justify-center min-h-screen px-8 py-12">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black tracking-tight mb-2">Connect</h1>
          <p className="text-zinc-500 text-sm">
            {step === "choose" && "Link up with your partner"}
            {step === "create" && "Create a new household"}
            {step === "join" && "Join an existing household"}
            {step === "showCode" && "Your invite code"}
          </p>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg border border-red-200 dark:border-red-900/50">
            {error}
          </div>
        )}

        {/* STEP 1: CHOOSE PATH */}
        {step === "choose" && (
          <div className="space-y-4">
            <button
              onClick={() => setStep("create")}
              className="w-full h-16 bg-white dark:bg-[#111] border-2 border-zinc-200 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-500 rounded-2xl flex flex-col items-center justify-center transition-colors shadow-sm"
            >
              <span className="font-bold text-lg">Create a Household</span>
              <span className="text-xs text-zinc-500">I want to invite someone</span>
            </button>
            
            <button
              onClick={() => setStep("join")}
              className="w-full h-16 bg-white dark:bg-[#111] border-2 border-zinc-200 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-500 rounded-2xl flex flex-col items-center justify-center transition-colors shadow-sm"
            >
              <span className="font-bold text-lg">Join a Household</span>
              <span className="text-xs text-zinc-500">I have an invite code</span>
            </button>
          </div>
        )}

        {/* STEP 2A: CREATE HOUSEHOLD */}
        {step === "create" && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 text-center">
                What is your role?
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setRole("family")}
                  className={`flex-1 h-14 rounded-xl font-bold border-2 transition-colors ${
                    role === "family"
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300"
                  }`}
                >
                  Family (PH)
                </button>
                <button
                  onClick={() => setRole("ofw")}
                  className={`flex-1 h-14 rounded-xl font-bold border-2 transition-colors ${
                    role === "ofw"
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300"
                  }`}
                >
                  OFW
                </button>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg rounded-xl transition-colors disabled:opacity-50 shadow-sm active:scale-[0.98]"
            >
              {loading ? "Generating..." : "Generate Invite Code"}
            </button>

            <button
              onClick={() => setStep("choose")}
              className="w-full h-14 bg-transparent text-zinc-500 font-bold rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              Back
            </button>
          </div>
        )}

        {/* STEP 2B: JOIN HOUSEHOLD */}
        {step === "join" && (
          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label
                htmlFor="code"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1"
              >
                Invite Code
              </label>
              <input
                id="code"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full h-14 px-4 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#111] text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-shadow text-center uppercase"
                placeholder="Paste code here"
                required
              />
              <p className="text-xs text-zinc-500 mt-2 text-center">
                Ask your partner to generate a code for you.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !inviteCode.trim()}
              className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg rounded-xl transition-colors disabled:opacity-50 shadow-sm active:scale-[0.98]"
            >
              {loading ? "Joining..." : "Join"}
            </button>

            <button
              type="button"
              onClick={() => setStep("choose")}
              className="w-full h-14 bg-transparent text-zinc-500 font-bold rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              Back
            </button>
          </form>
        )}

        {/* STEP 3: SHOW GENERATED CODE */}
        {step === "showCode" && (
          <div className="space-y-6 text-center">
            <div className="p-6 bg-zinc-50 dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                Send this code to your partner
              </p>
              <p className="text-2xl font-mono font-black tracking-widest break-all select-all text-amber-600 dark:text-amber-400">
                {generatedCode}
              </p>
            </div>

            <button
              onClick={copyToClipboard}
              className="w-full h-14 bg-white dark:bg-[#1a1a1a] border-2 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 font-bold text-lg rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
              Copy Code
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg rounded-xl transition-colors shadow-sm active:scale-[0.98]"
            >
              Go to Feed
            </button>
            
            <p className="text-xs text-zinc-500">
              Code expires in 48 hours. Only one person can join.
            </p>
          </div>
        )}
        
        {/* Absolute Logout button for emergencies/resetting state */}
        <button
          onClick={() => signOut()}
          className="absolute bottom-6 left-0 right-0 mx-auto text-xs text-zinc-400 hover:text-red-500 transition-colors w-fit"
        >
          Sign out
        </button>

      </div>
    </div>
  );
}
