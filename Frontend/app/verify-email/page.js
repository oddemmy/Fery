"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { setToken } from "@/lib/auth";
import AuthShell from "@/components/auth/AuthShell";
import CodeInput from "@/components/auth/CodeInput";
import { PrimaryButton, ErrorNote, InfoNote } from "@/components/auth/ui";

const RESEND_SECONDS = 60;

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";

  const [code, setCode] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const submitting = useRef(false);

  // No email in the URL means they landed here directly
  useEffect(() => {
    if (!email) router.replace("/signup");
  }, [email, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function verify(value) {
    if (submitting.current) return;
    submitting.current = true;
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const res = await fetch(`${API_BASE}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: value }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid code.");
        setCode("");
        setResetKey((k) => k + 1);
        setLoading(false);
        submitting.current = false;
        return;
      }

      setToken(data.token);
      router.push("/");
    } catch {
      setError("Couldn't reach the server. Is it running?");
      setLoading(false);
      submitting.current = false;
    }
  }

  async function resend() {
    if (cooldown > 0) return;
    setError("");
    setInfo("");
    try {
      await fetch(`${API_BASE}/auth/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setCooldown(RESEND_SECONDS);
      setCode("");
      setResetKey((k) => k + 1);
      setInfo("A new code is on its way.");
    } catch {
      setError("Couldn't reach the server. Is it running?");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (code.length === 6) verify(code);
  }

  return (
    <AuthShell
      title="Check your email"
      subtitle={
        <>
          We sent a 6-digit code to{" "}
          <span className="font-medium text-fg">{email}</span>. It expires in 15
          minutes.
        </>
      }
      footer={
        <>
          Wrong email?{" "}
          <Link href="/signup" className="text-accent hover:underline">
            Go back
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <CodeInput
          key={resetKey}
          onChange={setCode}
          onComplete={verify}
          disabled={loading}
        />

        <ErrorNote>{error}</ErrorNote>
        <InfoNote>{info}</InfoNote>

        <PrimaryButton
          loading={loading}
          loadingText="Verifying…"
          disabled={code.length !== 6}
        >
          Verify email
        </PrimaryButton>

        <p className="text-center text-sm text-muted">
          Didn&apos;t get it?{" "}
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  );
}