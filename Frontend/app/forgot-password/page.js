"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import AuthShell from "@/components/auth/AuthShell";
import { Field, PrimaryButton, ErrorNote } from "@/components/auth/ui";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      // The server gives the same answer whether or not the account exists,
      // so we always move on to the reset screen.
      router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    } catch {
      setError("Couldn't reach the server. Is it running?");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a code to reset it."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Back to log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field
          id="email"
          label="Email"
          icon="mail"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <ErrorNote>{error}</ErrorNote>

        <PrimaryButton loading={loading} loadingText="Sending code…">
          Send reset code
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}