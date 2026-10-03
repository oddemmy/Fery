"use client";

import { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";
import { getToken, getCurrentUser } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import CopyButton from "@/components/CopyButton";

const STEPS = [
  {
    n: "01",
    title: "Paste a link",
    body: "Drop any long URL into the box below.",
  },
  {
    n: "02",
    title: "Get a short one",
    body: "Fery generates a unique 6-character code instantly.",
  },
  {
    n: "03",
    title: "Share it anywhere",
    body: "Visitors are redirected straight to the original page, and every visit is counted.",
  },
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [lookupInput, setLookupInput] = useState("");
  const [lookupStatus, setLookupStatus] = useState("idle"); // idle | loading | done | error
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState("");

  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    setResult(null);

    try {
      const token = getToken();
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/shorten`, {
        method: "POST",
        headers,
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setStatus("error");
        return;
      }

      setResult(data);
      setStatus("done");
    } catch (err) {
      setError("Couldn't reach the server. Is it running?");
      setStatus("error");
    }
  }

  const shortLink = result
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/${result.short_code}`
    : "";

  async function handleLookup(e) {
    e.preventDefault();
    setLookupStatus("loading");
    setLookupError("");
    setLookupResult(null);

    const trimmed = lookupInput.trim();
    const code = trimmed.split("/").filter(Boolean).pop();

    if (!code) {
      setLookupError("Paste a short code or short link first.");
      setLookupStatus("error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/shorten/${code}/stats`);
      const data = await res.json();

      if (!res.ok) {
        setLookupError(data.error || "That short link doesn't exist.");
        setLookupStatus("error");
        return;
      }

      setLookupResult(data);
      setLookupStatus("done");
    } catch (err) {
      setLookupError("Couldn't reach the server. Is it running?");
      setLookupStatus("error");
    }
  }

  return (
    <div className="sm:flex min-h-screen bg-bg text-fg">
      <Sidebar active="home" />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent/10 blur-3xl" />

          <div className="relative max-w-[640px] px-6 sm:px-12 pt-16 pb-16">
            <h1 className="font-sans font-black text-5xl sm:text-6xl leading-[1.02] tracking-tight mb-5">
              Make it <span className="text-accent">short</span>.
            </h1>
            <p className="text-muted text-lg mb-10 max-w-[48ch]">
              Paste a long URL. Fery gives you back a compact link that
              redirects straight to it, and tracks how many times it's been
              opened.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/some/very/long/path"
                className="w-full border-b-2 border-line bg-transparent py-3 text-lg text-fg placeholder:text-muted/50 focus:border-accent transition-colors"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="self-start bg-accent text-bg px-7 py-3 text-sm font-semibold tracking-wide hover:bg-fg transition-colors disabled:opacity-50"
              >
                {status === "loading" ? "Shortening…" : "Shorten it"}
              </button>
            </form>

            {!user && (
              <p className="mt-4 text-sm text-muted">
                <a href="/signup" className="text-accent hover:underline">
                  Create an account
                </a>{" "}
                to keep track of every link you make.
              </p>
            )}

            {status === "error" && (
              <p className="mt-6 text-sm text-red-400">{error}</p>
            )}

            {status === "done" && result && (
              <TicketStub
                shortLink={shortLink}
                originalUrl={result.url}
                accessCount={result.access_count}
              />
            )}
          </div>
        </section>

        <section className="border-t border-line">
          <div className="max-w-[640px] px-6 sm:px-12 py-14">
            <h2 className="font-sans font-black text-2xl tracking-tight mb-2">
              Already have a link?
            </h2>
            <p className="text-muted text-sm mb-6 max-w-[48ch]">
              Paste a short code or link below to check its destination and
              how many times it's been opened.
            </p>

            <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                value={lookupInput}
                onChange={(e) => setLookupInput(e.target.value)}
                placeholder="iG1Otu or https://tryfery.vercel.app/iG1Otu"
                className="flex-1 border-b-2 border-line bg-transparent py-2 text-base text-fg placeholder:text-muted/50 focus:border-accent transition-colors"
              />
              <button
                type="submit"
                disabled={lookupStatus === "loading"}
                className="self-start sm:self-auto bg-transparent border border-line text-fg px-5 py-2 text-sm font-medium hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
              >
                {lookupStatus === "loading" ? "Checking…" : "Check"}
              </button>
            </form>

            {lookupStatus === "error" && (
              <p className="mt-4 text-sm text-red-400">{lookupError}</p>
            )}

            {lookupStatus === "done" && lookupResult && (
              <div className="mt-6 border border-line rounded-sm px-6 py-5">
                <p className="font-mono text-accent text-sm mb-2">
                  {lookupResult.short_code}
                </p>
                <p className="text-sm text-muted break-all mb-1">
                  Destination — {lookupResult.url}
                </p>
                <p className="text-sm text-muted">
                  Opened {lookupResult.access_count ?? 0}{" "}
                  {lookupResult.access_count === 1 ? "time" : "times"} so far
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="border-t border-line">
          <div className="max-w-[640px] px-6 sm:px-12 py-14 grid sm:grid-cols-3 gap-10">
            {STEPS.map((step) => (
              <div key={step.n}>
                <p className="font-mono text-accent text-sm mb-2">{step.n}</p>
                <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                <p className="text-muted text-sm leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-line">
          <div className="max-w-[640px] px-6 sm:px-12 py-6 text-xs text-muted">
            © {new Date().getFullYear()} Fery. An open-source portfolio
            project, built for learning.
          </div>
        </footer>
      </main>
    </div>
  );
}

function TicketStub({ shortLink, originalUrl, accessCount }) {
  return (
    <div className="mt-12 relative">
      <div className="bg-panel border border-line rounded-sm px-7 py-6 relative overflow-hidden">
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-bg" />
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-bg" />

        <p className="text-xs uppercase tracking-[0.2em] text-muted mb-3">
          Your short link
        </p>

        <div className="border-t border-dashed border-line pt-4 flex items-center justify-between gap-4">
          <a
            href={shortLink}
            className="font-mono text-xl text-accent break-all"
          >
            {shortLink}
          </a>
          <CopyButton text={shortLink} />
        </div>

        <p className="mt-5 text-sm text-muted break-all">
          Destination — {originalUrl}
        </p>
        <p className="mt-2 text-sm text-muted">
          Opened {accessCount ?? 0} {accessCount === 1 ? "time" : "times"} so far
        </p>
      </div>
    </div>
  );
}