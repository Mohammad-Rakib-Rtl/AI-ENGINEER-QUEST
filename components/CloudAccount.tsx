"use client";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Cloud, LogIn, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabase";
export default function CloudAccount({
  user,
  status,
  error,
  conflict,
  retrySync,
  reloadCloud,
}: {
  user: User | null;
  status: string;
  error: string;
  conflict: boolean;
  retrySync: () => void;
  reloadCloud: () => void;
}) {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function login(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setPassword("");
    } catch (cause) {
      setMessage(
        cause instanceof Error ? cause.message : "Sign-in failed. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="cloud-account">
      <div className="cloud-title">
        <span className="cloud-icon">
          <Cloud size={23} />
        </span>
        <div>
          <h3>Your workspace, wherever you go</h3>
          <p>Supabase account & cloud saving</p>
        </div>
        <span className="account-badge">
          <ShieldCheck size={14} /> Private to you
        </span>
      </div>
      {!supabase ? (
        <p>
          Add your Supabase environment variables and restart the app to enable
          cloud saving.
        </p>
      ) : user ? (
        <>
          <div className="signed-in">
            <div>
              <strong>{user.email}</strong>
              <p role="status">{status}</p>
            </div>
            <button
              className="secondary"
              disabled={busy}
              onClick={async () => {
                if (
                  !confirm(
                    "Sign out? Export a backup first if you have unsynced changes.",
                  )
                )
                  return;
                setBusy(true);
                if (!supabase) {
                  setBusy(false);
                  return;
                }
                const { error } = await supabase.auth.signOut();
                if (error) setMessage(error.message);
                setBusy(false);
              }}
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>
          {error && (
            <p className="cloud-error" role="alert">
              {error}
            </p>
          )}
          <div className="cloud-actions">
            <button className="secondary" disabled={busy} onClick={retrySync}>
              <RefreshCw size={15} /> Retry connection
            </button>
            {conflict && (
              <button
                className="secondary"
                onClick={() => {
                  if (
                    confirm(
                      "Load the cloud version and discard this local draft? Export a backup first.",
                    )
                  )
                    reloadCloud();
                }}
              >
                Load cloud version
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <p>
            Your local workspace stays available when signed out. Sign in to use
            your separate cloud workspace. To move local data, export a backup
            before signing in, then import it below.
          </p>
          <form className="login-form" onSubmit={login}>
            <label>
              Email
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your account password"
              />
            </label>
            <button className="primary" disabled={busy} type="submit">
              <LogIn size={16} />
              {busy ? "Signing in…" : "Sign in to Supabase"}
            </button>
          </form>
          <p className="setup-hint">
            First time? Run the database migration, then create your personal
            user in Supabase → Authentication → Users. See the setup guide in
            this project.
          </p>
        </>
      )}
      {message && (
        <p className="cloud-error" role="alert">
          {message}
        </p>
      )}
    </section>
  );
}
