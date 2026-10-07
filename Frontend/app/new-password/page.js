"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import AuthShell from "@/components/auth/AuthShell";
import { Field, PrimaryButton, ErrorNote, InfoNote } from "@/components/auth/ui";

const RESET_TOKEN_KEY = "fery_reset_token";

export default function NewPassword() {
  const router = useRouter();
  const [resetToken, setResetToken] = useState(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);

  // No token means they skipped the code step
  useEffect(() => {
    const token = sessionStorage.getItem(RESET_TOKEN_KEY);
    if (!token) {
      router.replace("/forgot-password");
      return;
    }
    setResetToken(token);
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword: password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        if (/start again/i.test(data.error || "")) {
          sessionStorage.removeItem(RESET_TOKEN_KEY);
          setExpired(true);
        }
        setLoading(false);
        return;
      }

      sessionStorage.removeItem(RESET_TOKEN_KEY);
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("Couldn't reach the server. Is it running?");
      setLoading(false);
    }
  }

  if (!resetToken) return null;

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Pick something at least 8 characters long."
      footer={
        <Link href="/login" className="text-accent hover:underline">
          Back to log in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field
          id="new-password"
          label="New password"
          icon="lock"
          type="password"
          required
          autoFocus
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Field
          id="confirm-password"
          label="Confirm password"
          icon="lock"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Repeat your new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <ErrorNote>{error}</ErrorNote>
        {expired && (
          <p className="text-sm text-muted">
            <Link href="/forgot-password" className="text-accent hover:underline">
              Start over
            </Link>
          </p>
        )}
        {done && <InfoNote>Password updated. Taking you to log in…</InfoNote>}

        <PrimaryButton
          loading={loading}
          loadingText="Updating…"
          disabled={done || expired}
        >
          Update password
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}