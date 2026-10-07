"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { setToken } from "@/lib/auth";
import AuthShell from "@/components/auth/AuthShell";
import { Field, PrimaryButton, ErrorNote } from "@/components/auth/ui";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      // Correct password, but the email hasn't been verified yet:
      // send a fresh code and take them to the verify screen.
      if (res.status === 403 && data.code === "EMAIL_NOT_VERIFIED") {
        const target = data.email || email;
        await fetch(`${API_BASE}/auth/resend-code`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: target }),
        }).catch(() => {});
        router.push(`/verify-email?email=${encodeURIComponent(target)}`);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Invalid credentials.");
        setLoading(false);
        return;
      }

      setToken(data.token);
      router.push("/");
    } catch {
      setError("Couldn't reach the server. Is it running?");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to manage your short links."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-accent hover:underline">
            Sign up
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

        <Field
          id="password"
          label="Password"
          icon="lock"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          labelRight={
            <Link
              href="/forgot-password"
              className="text-xs text-accent hover:underline"
            >
              Forgot password?
            </Link>
          }
        />

        <ErrorNote>{error}</ErrorNote>

        <PrimaryButton loading={loading} loadingText="Logging in…">
          Log in
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}