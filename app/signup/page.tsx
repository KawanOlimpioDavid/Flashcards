"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
const inputClass =
  "rounded border border-gray-400 bg-white p-2 text-black placeholder-gray-500 dark:border-gray-600 dark:bg-neutral-900 dark:text-white dark:placeholder-gray-400";

  export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <main className="mx-auto max-w-sm p-8">
      <h1 className="mb-6 text-2xl font-bold">Create account</h1>
      <form action={action} className="flex flex-col gap-4">
        <input name="email" type="email" placeholder="Email" required className="rounded border p-2 text-black" className={inputClass}/>
        <input name="password" type="password" placeholder="Password (min. 8 characters)" required className="rounded border p-2 text-black" className={inputClass}/>
        {state?.error && <p className="text-red-500">{state.error}</p>}
        <button disabled={pending} className="rounded bg-blue-600 p-2 text-white disabled:opacity-50">
          {pending ? "Creating..." : "Sign up"}
        </button>
      </form>
    </main>
  );
}