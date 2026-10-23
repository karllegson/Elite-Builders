"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/dashboard/actions";

export default function DashboardLoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="db-login-form">
      <label className="db-field">
        <span>Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          autoFocus
          required
        />
      </label>
      {state.error ? <p className="db-error">{state.error}</p> : null}
      <button type="submit" className="db-btn db-btn--primary" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
