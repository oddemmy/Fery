"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/api";

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
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    setResult(null);
    setCopied(false);

    try {
      const res = await fetch(`${API_BASE}/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  async function handleCopy() {
    await navigator.clipboard.writeText(shortLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="min-h-screen bg-bg text-fg">
      <header className="border-b border-line">
        <div className="max-w-[720px] mx-auto px-6 py-5 flex items-center justify-between">
          <span className="font-sans font-black text-2xl tracking-tight">
            FERY
          </span>
          <span className="font-mono text-xs text-muted hidden sm:block">
            links, shortened
          </span>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent/10 blur-3xl" />

        <div className="relative max-w-[720px] mx-auto px-6 pt-20 pb-16">
          <h1 className="font-sans font-black text-6xl sm:text-7xl leading-[1.02] tracking-tight mb-5">
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

          {status === "error" && (
            <p className="mt-6 text-sm text-red-400">{error}</p>
          )}

          {status === "done" && result && (
            <TicketStub
              shortLink={shortLink}
              originalUrl={result.url}
              accessCount={result.access_count}
              onCopy={handleCopy}
              copied={copied}
            />
          )}
        </div>
      </section>

      <section className="border-t border-line">
        <div className="max-w-[720px] mx-auto px-6 py-16 grid sm:grid-cols-3 gap-10">
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
        <div className="max-w-[720px] mx-auto px-6 py-12">
          <span className="font-sans font-black text-xl tracking-tight">
            FERY
          </span>
          <p className="mt-3 text-sm text-muted max-w-[32ch]">
            A small, fast way to turn a long link into a short one.
          </p>
        </div>

        <div className="border-t border-line">
          <div className="max-w-[720px] mx-auto px-6 py-5 text-xs text-muted">
            © {new Date().getFullYear()} Fery. A portfolio project, built
            for learning.
          </div>
        </div>
      </footer>
    </main>
  );
}

function TicketStub({ shortLink, originalUrl, accessCount, onCopy, copied }) {
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
          <button
            onClick={onCopy}
            className="shrink-0 text-xs font-medium border border-line text-fg px-3 py-2 hover:border-accent hover:text-accent transition-colors"
          >
            {copied ? "Copied" : "Copy"}
          </button>
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