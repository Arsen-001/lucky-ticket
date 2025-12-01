"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  // If already authorized, go to home
  useEffect(() => {
    const isAuthorized =
      typeof window !== "undefined" &&
      window.localStorage.getItem("authorized") === "true";
    if (isAuthorized) {
      router.replace("/");
      return;
    }
    setChecking(false);
  }, [router]);

  const handleLogin = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("authorized", "true");
    }
    router.replace("/");
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="text-zinc-700 dark:text-zinc-300">Checking…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-6">
      <div className="w-full max-w-md rounded-2xl border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-zinc-900 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold mb-2 text-zinc-900 dark:text-zinc-100">
          Welcome
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          This demo uses client-side storage to simulate authorization.
        </p>
        <button
          onClick={handleLogin}
          className="w-full h-11 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
        >
          Log in
        </button>
      </div>
    </div>
  );
}
