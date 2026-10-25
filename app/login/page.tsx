"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { field, primaryButton } from "@/lib/ui";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <main className="mx-auto max-w-xl px-8 py-12">
      <div className="max-w-sm">
        <h1 className="mb-6 font-display text-3xl font-bold">Log in</h1>

        <form action={action} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Email
            <input name="email" type="email" autoComplete="email" required className={field} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={field}
            />
          </label>

          {state?.error && (
            <p role="alert" className="text-danger">
              {state.error}
            </p>
          )}

          <button disabled={pending} className={primaryButton}>
            {pending ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted">
          No account yet?{" "}
          <Link href="/signup" className="text-ink underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}