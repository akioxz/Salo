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
    <div className="bg-background text-zinc-900 dark:text-zinc-100 min-h-screen flex justify-center">
      {/* Mobile Phone-like Container for desktop, full width on mobile */}
      <div className="bg-background w-full max-w-md md:border-x md:border-zinc-200 dark:md:border-white/5 relative flex flex-col justify-center min-h-screen px-8">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-zinc-50">Salo</h1>
          <p className="text-zinc-500 text-sm">
            {step === "signIn"
              ? "Welcome back to your household"
              : "Create a household account"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-[#0f1115] rounded-2xl border border-zinc-200 dark:border-white/5 dark:shadow-inner dark:ethereal-glass overflow-hidden flex flex-col">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 px-4 bg-transparent focus:outline-none text-base border-b border-zinc-200 dark:border-white/5 placeholder:text-zinc-400"
              placeholder="Email"
              required
            />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 px-4 bg-transparent focus:outline-none text-base placeholder:text-zinc-400"
              placeholder="Password"
              required
            />
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 mt-6 bg-amber-500 hover:bg-amber-400 text-black font-bold text-base rounded-2xl transition-all spring-bounce disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-[0.96]"
          >
            {loading
              ? "Please wait..."
              : step === "signIn"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-zinc-500">
            {step === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              onClick={() => {
                setStep(step === "signIn" ? "signUp" : "signIn");
                setError("");
              }}
              className="font-medium text-amber-600 dark:text-amber-500 hover:underline transition-all"
            >
              {step === "signIn" ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
