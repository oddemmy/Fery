"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, clearToken } from "@/lib/auth";

function Mark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="13" width="13" height="7" rx="3.5" className="fill-accent" />
      <rect x="9" y="4" width="13" height="7" rx="3.5" className="fill-fg" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="12" r="3" />
      <line x1="9" y1="12" x2="15" y2="12" />
    </svg>
  );
}

function IconBookmark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="13" x2="20" y2="13" />
      <line x1="4" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}

export default function Sidebar({ active }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  function handleLogout() {
    clearToken();
    window.location.href = "/";
  }

  return (
    <>
      {/* Mobile top bar */}
      <header className="sm:hidden relative z-20 border-b border-line flex items-center justify-between px-5 py-4 bg-bg">
        <a href="/" className="flex items-center gap-2">
          <Mark />
          <span className="font-sans font-black text-lg tracking-tight">FERY</span>
        </a>
        <div className="flex items-center gap-4">
          {user && (
            <a
              href="/my-links"
              title={user.email}
              className="w-7 h-7 rounded-full bg-accent text-bg flex items-center justify-center font-semibold text-xs shrink-0"
            >
              {user.email?.[0]?.toUpperCase()}
            </a>
          )}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="text-fg"
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </header>

      {/* Mobile dropdown nav panel */}
      {menuOpen && (
        <>
          <div
            className="sm:hidden fixed inset-0 top-[57px] bg-black/50 z-10"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="sm:hidden fixed top-[57px] left-0 right-0 z-10 bg-panel border-b border-line px-5 py-4 flex flex-col gap-1">
            <a
              href="/"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 text-sm rounded-sm transition-colors ${
                active === "home" ? "bg-bg text-accent" : "text-fg/80"
              }`}
            >
              <IconLink /> Shorten
            </a>
            <a
              href="/my-links"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 text-sm rounded-sm transition-colors ${
                active === "my-links" ? "bg-bg text-accent" : "text-fg/80"
              }`}
            >
              <IconBookmark /> My links
            </a>

            <div className="border-t border-line mt-2 pt-4">
              {user ? (
                <div className="flex items-center justify-between px-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-accent text-bg flex items-center justify-center font-semibold text-sm shrink-0">
                      {user.email?.[0]?.toUpperCase()}
                    </div>
                    <p className="text-sm text-fg truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-muted hover:text-accent transition-colors shrink-0"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-3">
                  <a href="/login" className="text-sm text-fg/80">
                    Log in
                  </a>
                  <a
                    href="/signup"
                    className="text-sm bg-accent text-bg px-3 py-2 text-center font-semibold rounded-sm"
                  >
                    Sign up
                  </a>
                </div>
              )}
            </div>
          </nav>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden sm:flex sm:flex-col sm:w-60 sm:shrink-0 sm:min-h-screen border-r border-line">
        <div className="flex items-center justify-between px-6 py-6">
          <a href="/" className="flex items-center gap-2">
            <Mark />
            <span className="font-sans font-black text-xl tracking-tight">FERY</span>
          </a>
          {user && (
            <button
              onClick={handleLogout}
              title="Log out"
              className="text-muted hover:text-accent transition-colors"
            >
              <IconLogout />
            </button>
          )}
        </div>

        <nav className="flex flex-col gap-1 px-4">
          <a
            href="/"
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-sm transition-colors ${
              active === "home"
                ? "bg-panel text-accent"
                : "text-muted hover:text-fg hover:bg-panel"
            }`}
          >
            <IconLink /> Shorten
          </a>
          <a
            href="/my-links"
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-sm transition-colors ${
              active === "my-links"
                ? "bg-panel text-accent"
                : "text-muted hover:text-fg hover:bg-panel"
            }`}
          >
            <IconBookmark /> My links
          </a>
        </nav>

        <div className="mt-auto px-6 py-6 border-t border-line">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent text-bg flex items-center justify-center font-semibold text-sm shrink-0">
                {user.email?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-fg truncate">{user.email}</p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-muted hover:text-accent transition-colors"
                >
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <a href="/login" className="text-sm text-fg/80 hover:text-accent transition-colors">
                Log in
              </a>
              <a
                href="/signup"
                className="text-sm bg-accent text-bg px-3 py-2 text-center font-semibold hover:bg-fg transition-colors rounded-sm"
              >
                Sign up
              </a>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}