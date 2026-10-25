"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import { field, primaryButton } from "@/lib/ui";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <main className="mx-auto max-w-xl px-8 py-12">
      <div className="max-w-sm">
        <h1 className="mb-6 font-display text-3xl font-bold">Create account</h1>

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
              autoComplete="new-password"
              minLength={8}
              required
              className={field}
            />
            <span className="text-muted">At least 8 characters.</span>
          </label>

          {state?.error && (
            <p role="alert" className="text-danger">
              {state.error}
            </p>
          )}

          <button disabled={pending} className={primaryButton}>
            {pending ? "Signing up..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-ink underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}