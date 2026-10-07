import Link from "next/link";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <main className="min-h-screen bg-bg text-fg lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel (desktop only) */}
      <aside className="relative hidden overflow-hidden border-r border-line p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 20% 15%, rgba(232,176,75,0.22), transparent 70%), radial-gradient(50% 45% at 85% 90%, rgba(120,90,200,0.28), transparent 70%)",
          }}
        />
        <Link
          href="/"
          className="relative text-2xl font-black tracking-tight"
        >
          Fery<span className="text-accent">.</span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-5xl font-black leading-[1.05] tracking-tight">
            Long links,
            <br />
            made <span className="text-accent">short.</span>
          </h2>
          <p className="mt-4 text-muted">
            Create, track and manage your short links in one place.
          </p>

          <div className="mt-10 rounded-2xl border border-line bg-panel/70 p-5 backdrop-blur">
            <p className="truncate font-mono text-xs text-muted">
              https://example.com/blog/2026/a-very-long-article-title?utm_source=newsletter
            </p>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="my-2 h-4 w-4 text-muted"
              aria-hidden="true"
            >
              <path d="M12 5v14M6 13l6 6 6-6" />
            </svg>
            <p className="font-mono text-lg text-accent">fery/x7Kd2</p>
          </div>
        </div>

        <div />
      </aside>

      {/* Form side */}
      <section className="flex min-h-screen items-center justify-center px-6 py-12 lg:min-h-0">
        <div className="w-full max-w-[400px]">
          <Link
            href="/"
            className="mb-10 block text-2xl font-black tracking-tight lg:hidden"
          >
            Fery<span className="text-accent">.</span>
          </Link>

          <h1 className="text-3xl font-black tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}

          <div className="mt-8">{children}</div>

          {footer && (
            <p className="mt-6 text-center text-sm text-muted">{footer}</p>
          )}
        </div>
      </section>
    </main>
  );
}