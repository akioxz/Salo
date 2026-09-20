"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

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
          : "Could not create account. Email might be in use."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 min-h-screen flex justify-center">
      {/* Mobile Phone-like Container for desktop, full width on mobile */}
      <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-md md:border-x md:border-zinc-200 dark:md:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative flex flex-col justify-center min-h-screen px-8">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tight mb-2">Salo</h1>
          <p className="text-zinc-500 text-sm">
            {step === "signIn"
              ? "Welcome back to your household"
              : "Create an account for your household"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#111] text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-shadow"
              placeholder="juan@example.com"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#111] text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-shadow"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 mt-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
          >
            {loading ? "Please wait..." : step === "signIn" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-zinc-500">
            {step === "signIn" ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => {
                setStep(step === "signIn" ? "signUp" : "signIn");
                setError("");
              }}
              className="ml-2 font-bold text-black dark:text-white hover:underline transition-all"
            >
              {step === "signIn" ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
