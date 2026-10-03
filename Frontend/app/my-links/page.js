"use client";

import { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";
import { getToken, getCurrentUser, clearToken } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import CopyButton from "@/components/CopyButton";

export default function MyLinks() {
  const [status, setStatus] = useState("loading"); // loading | done | error | guest
  const [links, setLinks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      setStatus("guest");
      return;
    }

    const token = getToken();

    fetch(`${API_BASE}/me/links`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Couldn't load your links.");
        }
        setLinks(data);
        setStatus("done");
      })
      .catch((err) => {
        setError(err.message || "Couldn't reach the server.");
        setStatus("error");
      });
  }, []);

  function handleLogout() {
    clearToken();
    window.location.href = "/";
  }

  return (
    <div className="sm:flex min-h-screen bg-bg text-fg">
      <Sidebar active="my-links" />

      <main className="flex-1">
        <div className="max-w-[720px] px-6 sm:px-12 pt-16 pb-16">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-sans font-black text-4xl tracking-tight">
              My links
            </h1>
            {status === "done" && (
              <button
                onClick={handleLogout}
                className="text-sm text-muted hover:text-accent transition-colors"
              >
                Log out
              </button>
            )}
          </div>

          {status === "loading" && (
            <p className="text-muted text-sm">Loading…</p>
          )}

          {status === "guest" && (
            <p className="text-muted text-sm">
              <a href="/login" className="text-accent hover:underline">
                Log in
              </a>{" "}
              to see the links you've created.
            </p>
          )}

          {status === "error" && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {status === "done" && links.length === 0 && (
            <p className="text-muted text-sm">
              You haven't shortened any links yet.{" "}
              <a href="/" className="text-accent hover:underline">
                Make your first one
              </a>
              .
            </p>
          )}

          {status === "done" && links.length > 0 && (
            <ul className="flex flex-col divide-y divide-line border-t border-b border-line">
              {links.map((link) => {
                const linkUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${link.short_code}`;
                return (
                  <li key={link.id} className="py-5">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <p className="font-mono text-accent text-base break-all">
                        {linkUrl}
                      </p>
                      <CopyButton text={linkUrl} />
                    </div>
                    <p className="text-sm text-muted break-all mb-1">
                      Destination — {link.url}
                    </p>
                    <p className="text-sm text-muted">
                      Opened {link.access_count ?? 0}{" "}
                      {link.access_count === 1 ? "time" : "times"} · created{" "}
                      {new Date(link.created_at).toLocaleDateString()}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}