"use client";

import { useState } from "react";

const paths = {
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M3 3l18 18" />
      <path d="M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 4.1-.9M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </>
  ),
};

function Icon({ name, className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

// Requires an `id` prop so the label is linked to the input
export function Field({ id, label, labelRight, icon, type = "text", ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-xs font-medium uppercase tracking-[0.18em] text-muted"
        >
          {label}
        </label>
        {labelRight}
      </div>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
            <Icon name={icon} />
          </span>
        )}
        <input
          id={id}
          type={isPassword && show ? "text" : type}
          className={`w-full rounded-xl border border-line bg-panel/60 py-3 text-sm text-fg outline-none transition placeholder:text-muted/50 focus:border-accent focus:ring-2 focus:ring-accent/20 ${
            icon ? "pl-10" : "pl-4"
          } ${isPassword ? "pr-11" : "pr-4"}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-fg"
          >
            <Icon name={show ? "eyeOff" : "eye"} />
          </button>
        )}
      </div>
    </div>
  );
}

export function PrimaryButton({ loading, loadingText, children, ...props }) {
  return (
    <button
      type="submit"
      disabled={loading || props.disabled}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-bg shadow-lg shadow-accent/10 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="3"
            opacity="0.25"
          />
          <path
            d="M21 12a9 9 0 0 0-9-9"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}
      {loading ? loadingText : children}
    </button>
  );
}

export function ErrorNote({ children }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-300"
    >
      {children}
    </p>
  );
}

export function InfoNote({ children }) {
  if (!children) return null;
  return (
    <p className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
      {children}
    </p>
  );
}