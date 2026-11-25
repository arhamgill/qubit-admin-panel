import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { LogoMark, Wordmark } from "@/components/layout/logo";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col px-4 py-8 sm:px-6">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <div className="mb-10 flex items-center gap-2.5 text-foreground">
          <LogoMark />
          <Wordmark />
        </div>

        <p className="eyebrow mb-3 inline-flex items-center gap-2.5 text-ink-2">
          <span className="text-accent-text">00</span>
          <span className="h-px w-6 bg-line-strong" aria-hidden />
          Sign in
        </p>
        <h1 className="text-[2.25rem] leading-[1.05] font-semibold tracking-[-0.045em] text-foreground">
          Welcome back
        </h1>
        <p className="mt-2.5 mb-8 text-[15px] text-ink-2">Sign in to manage your workspace.</p>

        {/* LoginForm reads ?next= from the URL, which requires a Suspense boundary. */}
        <Suspense fallback={<div className="h-80 rounded-2xl bg-surface ring-1 ring-line" />}>
          <LoginForm />
        </Suspense>
      </div>

      <p className="eyebrow mx-auto mt-10 text-center">Mock authentication · demo data only</p>
    </main>
  );
}
