"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

export default function AuthPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();

  const [step, setStep] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn("password", { email, password, flow: step });
      router.push("/");
    } catch (err) {
      console.error(err);
      setError(
        step === "signIn"
          ? "Invalid email or password."
          : "Could not create account. Email might be in use.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative text-[#111111] dark:text-[#FBFBFA] justify-center px-8 pb-10">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-[#111111] dark:text-[#FBFBFA]">Salo</h1>
          <p className="text-[#52525B] dark:text-[#A1A1AA] text-sm font-medium">
            {step === "signIn"
              ? "Welcome back to your household"
              : "Create a household account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="bg-white dark:bg-[#0A0A0A] rounded-[20px] border border-[#EAEAEA] dark:border-[#333333] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden flex flex-col relative">
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#F8F9FA] dark:from-[#222222] to-transparent pointer-events-none" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 px-5 bg-transparent focus:outline-none text-sm border-b border-[#EAEAEA] dark:border-[#333333] placeholder:text-[#A1A1AA] text-[#111111] dark:text-[#FBFBFA] relative z-10"
              placeholder="Email"
              required
            />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 px-5 bg-transparent focus:outline-none text-sm placeholder:text-[#A1A1AA] text-[#111111] dark:text-[#FBFBFA] relative z-10"
              placeholder="Password"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-[#FFF3F3] dark:bg-[#2A1111] text-[#E03E3E] dark:text-[#F87171] text-sm font-medium rounded-xl border border-[#FEE2E2] dark:border-[#4B1C1C]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 mt-2 bg-[#111111] dark:bg-[#FBFBFA] text-white dark:text-[#111111] font-semibold text-sm rounded-[18px] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading
              ? "Please wait..."
              : step === "signIn"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-[#787774] dark:text-[#A1A1AA]">
            {step === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              onClick={() => {
                setStep(step === "signIn" ? "signUp" : "signIn");
                setError("");
              }}
              className="font-bold text-[#111111] dark:text-[#FBFBFA] transition-all hover:opacity-80"
            >
              {step === "signIn" ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
      </div>
  );
}
