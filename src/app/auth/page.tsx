"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export default function AuthPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();

  const [step, setStep] = useState<"signIn" | "signUp">("signIn");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Custom Design-Engineer Validation
    const errs: { name?: string; email?: string; password?: string } = {};
    const trimmedEmail = email.trim();

    if (step === "signUp" && !name.trim()) {
      errs.name = "Please enter your name or family nickname.";
    }

    if (!trimmedEmail) {
      errs.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = "Please enter a valid email address.";
    }

    if (!password) {
      errs.password = "Please enter your password.";
    } else if (step === "signUp" && password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const signInParams: Record<string, string> = {
        email: trimmedEmail,
        password,
        flow: step,
      };

      if (step === "signUp" && name.trim()) {
        signInParams.name = name.trim();
      }

      await signIn("password", signInParams);

      // New accounts go to pairing setup; existing users go directly home
      if (step === "signUp") {
        router.push("/pairing");
      } else {
        router.push("/");
      }
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

  const activeErrorMessage = fieldErrors.name || fieldErrors.email || fieldErrors.password || error;

  return (
    <div className="w-full h-full flex flex-col relative text-[#111111] dark:text-[#FBFBFA] justify-center px-8 pb-10">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-[#111111] dark:text-[#FBFBFA]">Salo</h1>
          <p className="text-[#52525B] dark:text-[#A1A1AA] text-sm font-medium">
            {step === "signIn"
              ? "Welcome back to your household"
              : "Join your family's table on Salo"}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className={cn(
            "bg-white dark:bg-[#0A0A0A] rounded-[20px] border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden flex flex-col relative transition-all duration-300",
            activeErrorMessage
              ? "border-rose-400/50 dark:border-rose-800/60 ring-1 ring-rose-500/20"
              : "border-[#EAEAEA] dark:border-[#333333]"
          )}>
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#F8F9FA] dark:from-[#222222] to-transparent pointer-events-none" />

            {/* Name Field (Sign Up Only) */}
            {step === "signUp" && (
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className={cn(
                  "w-full h-14 px-5 bg-transparent focus:outline-none text-sm border-b placeholder:text-[#A1A1AA] text-[#111111] dark:text-[#FBFBFA] relative z-10 transition-colors animate-in fade-in slide-in-from-top-2 duration-200",
                  fieldErrors.name
                    ? "border-rose-200 dark:border-rose-900/40 placeholder:text-rose-300"
                    : "border-[#EAEAEA] dark:border-[#333333]"
                )}
                placeholder="Pangalan (e.g. Nanay Maria, Tatay Jun)"
                autoComplete="name"
              />
            )}

            {/* Email Field */}
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className={cn(
                "w-full h-14 px-5 bg-transparent focus:outline-none text-sm border-b placeholder:text-[#A1A1AA] text-[#111111] dark:text-[#FBFBFA] relative z-10 transition-colors",
                fieldErrors.email
                  ? "border-rose-200 dark:border-rose-900/40 placeholder:text-rose-300"
                  : "border-[#EAEAEA] dark:border-[#333333]"
              )}
              placeholder="Email"
              autoComplete="email"
            />

            {/* Password Field */}
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              className="w-full h-14 px-5 bg-transparent focus:outline-none text-sm placeholder:text-[#A1A1AA] text-[#111111] dark:text-[#FBFBFA] relative z-10"
              placeholder={step === "signUp" ? "Password (min. 6 characters)" : "Password"}
              autoComplete={step === "signIn" ? "current-password" : "new-password"}
            />
          </div>

          {/* Design-Engineer Inline Validation Notice */}
          {activeErrorMessage && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-rose-500/[0.08] dark:bg-rose-500/[0.12] text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl border border-rose-500/20 transition-all duration-300 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{activeErrorMessage}</span>
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
                setFieldErrors({});
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
