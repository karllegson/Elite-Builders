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
    <section className="section bg-site-surface">
      <div className="site-container">
        <div className="mx-auto max-w-lg rounded-3xl border border-solid border-site-line bg-white p-8 sm:p-10">
          <p className="eyebrow">Protected</p>
          <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">{title}</h1>
          <p className="mt-3 text-site-text">This post is password protected.</p>
          <form className="mt-7 grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
            <label className="grid gap-2">
              <span className="field-label">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="field"
                autoComplete="current-password"
              />
            </label>
            {error ? (
              <p className="text-sm text-brand-red" role="alert">
                {error}
              </p>
            ) : null}
            <button type="submit" className="btn btn-primary w-full">
              View Post
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
