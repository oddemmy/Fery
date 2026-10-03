"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid credentials.");
        setStatus("error");
        return;
      }

      setToken(data.token);
      router.push("/");
    } catch (err) {
      setError("Couldn't reach the server. Is it running?");
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-bg text-fg flex items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        <h1 className="font-sans font-black text-3xl tracking-tight mb-8">
          Log in
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted block mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b-2 border-line bg-transparent py-2 text-fg focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted block mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b-2 border-line bg-transparent py-2 text-fg focus:border-accent transition-colors"
            />
          </div>

          {status === "error" && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-2 bg-accent text-bg px-6 py-3 text-sm font-semibold tracking-wide hover:bg-fg transition-colors disabled:opacity-50"
          >
            {status === "loading" ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted">
          Don't have an account?{" "}
          <a href="/signup" className="text-accent hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </main>
  );
}