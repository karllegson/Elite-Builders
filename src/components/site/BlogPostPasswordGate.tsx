"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { verifyPostPasswordAction } from "@/app/admin/(shell)/posts/actions";

type PasswordProtectedPostProps = {
  slug: string;
  title: string;
  children: ReactNode;
};

export function PasswordProtectedPost({
  slug,
  title,
  children,
}: PasswordProtectedPostProps) {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await verifyPostPasswordAction(slug, password);

    if (result.ok) {
      setIsUnlocked(true);
      setError("");
      return;
    }

    setError("Incorrect password.");
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <section className="bg-gray-50">
      <div className="site-container flex max-w-xl flex-col gap-4 py-24">
        <h1 className="text-3xl font-extrabold text-brand-navy">{title}</h1>
        <p className="text-gray-600">This post is password protected.</p>
        <form className="flex flex-col gap-3" onSubmit={(event) => void handleSubmit(event)}>
          <label className="flex flex-col gap-1 text-sm font-semibold text-site-text-dark">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 font-normal"
              autoComplete="current-password"
            />
          </label>
          {error ? (
            <p className="text-sm text-brand-red" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="w-fit rounded-md bg-brand-red px-5 py-2.5 font-bold text-white hover:bg-brand-red-dark"
          >
            View Post
          </button>
        </form>
      </div>
    </section>
  );
}
