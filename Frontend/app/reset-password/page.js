"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE } from "@/lib/api";
import AuthShell from "@/components/auth/AuthShell";
import CodeInput from "@/components/auth/CodeInput";
import { Field, PrimaryButton, ErrorNote, InfoNote } from "@/components/auth/ui";

const RESEND_SECONDS = 60;

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (!email) router.replace("/forgot-password");
  }, [email, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (code.length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
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
        body: JSON.stringify({ email, code, newPassword: password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("Couldn't reach the server. Is it running?");
      setLoading(false);
    }
  }

  async function resend() {
    if (cooldown > 0) return;
    setError("");
    setInfo("");
    try {
      await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setCooldown(RESEND_SECONDS);
      setInfo("A new code is on its way.");
    } catch {
      setError("Couldn't reach the server. Is it running?");
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle={
        <>
          Enter the code we sent to{" "}
          <span className="font-medium text-fg">{email}</span> and choose a new
          password. The code expires in 15 minutes.
        </>
      }
      footer={
        <Link href="/login" className="text-accent hover:underline">
          Back to log in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <CodeInput onChange={setCode} disabled={loading || done} />

        <Field
          id="new-password"
          label="New password"
          icon="lock"
          type="password"
          required
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
        <InfoNote>{info}</InfoNote>
        {done && <InfoNote>Password updated. Taking you to log in…</InfoNote>}

        <PrimaryButton
          loading={loading}
          loadingText="Updating…"
          disabled={done}
        >
          Update password
        </PrimaryButton>

        <p className="text-center text-sm text-muted">
          Didn&apos;t get a code?{" "}
          {cooldown > 0 ? (
            <span>Resend in {cooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={resend}
              className="text-accent hover:underline"
            >
              Resend code
            </button>
          )}
        </p>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}