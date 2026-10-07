"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import AuthShell from "@/components/auth/AuthShell";
import { Field, PrimaryButton, ErrorNote } from "@/components/auth/ui";

function strength(pw) {
  if (pw.length < 8) return 0;
  let s = 1;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0-4
}

const strengthLabels = ["Too short", "Weak", "Okay", "Good", "Strong"];

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const score = strength(password);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      // A code has been emailed. They must verify before they can log in.
      router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch {
      setError("Couldn't reach the server. Is it running?");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start shortening and tracking links in seconds."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Log in
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

        <div>
          <Field
            id="password"
            label="Password"
            icon="lock"
            type="password"
            required
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password && (
            <div className="mt-3">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i < score ? "bg-accent" : "bg-line"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-xs text-muted">
                {strengthLabels[score]}
              </p>
            </div>
          )}
        </div>

        <ErrorNote>{error}</ErrorNote>

        <PrimaryButton loading={loading} loadingText="Creating account…">
          Create account
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}